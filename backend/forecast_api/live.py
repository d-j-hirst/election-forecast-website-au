"""Version-one live publication endpoints, independent of the historical uploader."""
import hashlib
import json
import re
from datetime import date, datetime
from decimal import InvalidOperation
from functools import lru_cache
from ipaddress import ip_address
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.db import transaction
from django.db.models import F, Min, Q
from django.http import Http404
from django.http.request import split_domain_port
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.cache import get_conditional_response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_api.mixins import ApiAuthMixin
from forecast_api.live_data import (
    compact_updates, election_history_point, has_counted_votes, pack, recover_movements, replay_history, seat_points, seat_series, unpack, write_seat_points,
)
from forecast_api.models import LivePublication, LiveRun
from forecast_api.submit import SubmitForecastPermission


def require(condition, message):
    if not condition:
        raise ValidationError(message)


def instant(value):
    timestamp = datetime.fromisoformat(value)
    require(timestamp.utcoffset() is not None, 'Expected an offset-aware time.')
    return timestamp


def validate_registration(data):
    keys = {'run_id', 'kind', 'display_name', 'version', 'election', 'election_date',
            'timezone', 'visibility'}
    require(isinstance(data, dict) and set(data) == keys, 'Invalid registration fields.')
    require(type(data['version']) is int and data['version'] == 1, 'Unsupported version.')
    require(all(isinstance(data[key], str) and data[key] for key in keys - {'version'}),
            'Invalid registration values.')
    require(re.fullmatch('[a-z0-9][a-z0-9-]{0,254}', data['run_id']) and
            re.fullmatch('[0-9]{4}[a-z]{1,28}', data['election']), 'Invalid run or election code.')
    require(data['kind'] in ('replay', 'live') and data['visibility'] in ('public', 'private'),
            'Invalid kind or visibility.')
    try:
        ZoneInfo(data['timezone'])
        date.fromisoformat(data['election_date'])
    except (ValueError, ZoneInfoNotFoundError):
        raise ValidationError('Invalid election date or timezone.') from None


class Capabilities(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response(dict(schema_version=1, replay_isolation=True,
                             idempotent_submission=True, monotonic_latest=True))


class RegisterRun(ApiAuthMixin, APIView):
    permission_classes = [IsAuthenticated & SubmitForecastPermission]

    def post(self, request):
        data = request.data
        validate_registration(data)
        run, _ = LiveRun.objects.get_or_create(run_id=data['run_id'],
            defaults={'election': data['election'], 'registration': data})
        if data != run.registration:
            return Response({'detail': 'Registration conflicts with existing run.'}, status=409)
        return Response({'run_id': run.pk})


class DuplicateObservation(Exception):
    """The same feed observation already has a forecast ID in this run."""


def store_publication(run, identity, digest, body):
    forecast, report = body['forecast'], body['report']
    origin = identity == 'origin'
    require(body['frozen'] is True and type(body['schema_version']) is int and body['schema_version'] == 1,
            'Expected a frozen version-one publication.')
    require(body['run'] == run.registration and forecast['forecast_id'] == identity and
            forecast['origin'] is origin and report['termCode'] == run.election and
            report.get('reportMode', 'LF') == 'LF', 'Publication identity mismatch.')
    require(all(isinstance(body.get(key), dict) for key in
                ('comparisons', 'commentary', 'commentary_evidence', 'commentary_requests')),
            'Invalid publication sections.')
    require(all(key in forecast for key in ('simulation', 'input_revision', 'input_fingerprint',
                'source_fingerprint', 'model_revision', 'iterations', 'source_timezone', 'source_time',
                'delivered_at', 'completed_at')), 'Incomplete forecast metadata.')
    require(type(forecast['iterations']) is int and forecast['iterations'] > 0,
            'Invalid iteration count.')
    instant(body['released_at'])
    # Older numerical handoffs use offset-free UTC delivery/completion times.
    # Those clocks are informational. Only the source observation orders history.
    for key in ('delivered_at', 'completed_at'):
        datetime.fromisoformat(forecast[key])
    source = None
    if origin:
        # Origins do not contribute chart points, but their seat data must be
        # usable when a comparison references the pre-count report.
        list(seat_points(report))
    else:
        source = instant(forecast['source_time'])
        # A lost client acknowledgement normally retries the original ID.
        # Guard against a restarted publisher assigning a second ID as well.
        # Older uploads can lack a fingerprint, and different observations
        # can share a clock time. Only positive identification is conclusive.
        fingerprint = forecast['source_fingerprint']
        if isinstance(fingerprint, str) and fingerprint:
            for prior_id, updates in run.livepublication_set.filter(source_time=source).values_list('forecast_id', 'updates'):
                if unpack(updates)['forecast'].get('source_fingerprint') == fingerprint:
                    raise DuplicateObservation(prior_id)
    record = LivePublication.objects.create(run=run, forecast_id=identity, digest=digest,
        source_time=source, report=pack(report), updates=pack(compact_updates(body)),
        history_point=None if origin else election_history_point(report))
    if not origin:
        write_seat_points(run, identity, report)
        latest = run.livepublication_set.filter(pk=run.latest_id).values_list('source_time', 'forecast_id').first()
        if not latest or (source, identity) > latest:
            run.latest = record
    run.revision += 1
    # Accepting a new publication reopens a completed replay, even if it
    # belongs earlier in counting. An identical retry never reaches here.
    run.replay_completed_at = None
    run.save(update_fields=['latest', 'revision', 'replay_completed_at'])
    return record


class PublishForecast(ApiAuthMixin, APIView):
    permission_classes = [IsAuthenticated & SubmitForecastPermission]

    def post(self, request, run_id, identity):
        # A full election can exceed the site's ordinary request-body limit.
        # Read this authenticated upload with its own bound before decoding JSON.
        limit = getattr(settings, 'LIVE_FORECAST_MAX_UPLOAD_BYTES', 64 * 1024 * 1024)
        raw = request.read(limit + 1)
        if len(raw) > limit:
            return Response({'detail': 'Forecast exceeds the live upload size limit.'}, status=413)
        digest = hashlib.sha256(raw).hexdigest()
        require(re.fullmatch(r'origin|f[0-9]{8}', identity)
                and request.headers.get('Idempotency-Key') == run_id + '/' + identity
                and request.headers.get('X-Content-SHA256') == digest, 'Invalid identity or digest.')
        with transaction.atomic():
            # Acquire the writer lock before reading the head, including on SQLite.
            if not LiveRun.objects.filter(pk=run_id).update(revision=F('revision')):
                raise Http404
            run = LiveRun.objects.get(pk=run_id)
            record = LivePublication.objects.filter(run=run, forecast_id=identity).defer('report', 'updates').first()
            if record and record.digest != digest:
                return Response({'detail': 'Publication identity already used.'}, status=409)
            if record is None:
                try:
                    body = json.loads(raw.decode('utf-8'))
                    record = store_publication(run, identity, digest, body)
                except DuplicateObservation as duplicate:
                    return Response({'detail': 'This feed observation already has a forecast in this run.',
                                     'existing_forecast_id': duplicate.args[0]}, status=409)
                except (ValueError, KeyError, IndexError, TypeError, AttributeError, InvalidOperation, OverflowError):
                    raise ValidationError('Malformed live publication.') from None
            head = run.livepublication_set.filter(pk=run.latest_id).values('forecast_id', 'source_time').first() or {}
            return Response({'run_id': run_id, 'forecast_id': identity, 'sha256': digest,
                             'published_at': record.published_at, 'latest_forecast_id': head.get('forecast_id'),
                             'latest_source_time': head.get('source_time')})


class CompleteReplay(ApiAuthMixin, APIView):
    permission_classes = [IsAuthenticated & SubmitForecastPermission]

    @transaction.atomic
    def post(self, request, run_id):
        # The newest forecast alone cannot confirm that an earlier or quiet
        # snapshot arrived. Compare the immutable package IDs and checksums
        # under the same writer lock used to accept uploads for this run.
        body = request.data
        require(isinstance(body, dict) and isinstance(body.get('election'), str)
                and isinstance(body.get('publications'), dict), 'Expected election and publication manifest.')
        expected = body['publications']
        require(any(key != 'origin' for key in expected) and all(
            re.fullmatch(r'origin|f[0-9]{8}', key) and isinstance(sha, str) and re.fullmatch('[a-f0-9]{64}', sha)
            for key, sha in expected.items()), 'Expected snapshot identities and SHA-256 digests.')
        runs = LiveRun.objects.filter(pk=run_id, election=body['election'], registration__kind='replay')
        if not runs.update(revision=F('revision')):
            raise Http404
        run = runs.get()
        stored = dict(run.livepublication_set.values_list('forecast_id', 'digest'))
        if stored != expected:
            missing = len(expected.keys() - stored.keys())
            extra = len(stored.keys() - expected.keys())
            changed = sum(expected[k] != stored[k] for k in expected.keys() & stored.keys())
            return Response({'detail': f'Publication mismatch: {missing} missing on server, '
                                       f'{extra} extra on server, {changed} different checksums.'}, status=409)
        if run.replay_completed_at is None:
            run.replay_completed_at = timezone.now()
            run.save(update_fields=['replay_completed_at'])
        return Response({'run_id': run.pk, 'replay_complete': True, 'completed_at': run.replay_completed_at,
                         'snapshot_count': len(stored) - int('origin' in stored)})


def public_window(updates, name):
    commentary = updates.get('commentary', {}).get(name) or {}
    if not isinstance(commentary, dict):
        commentary = {}
    # Keep request/account diagnostics in the stored package. Only expose fields
    # used to render current or legacy commentary.
    visible = {key: commentary[key] for key in ('status', 'reason', 'source', 'format', 'kind',
               'text', 'entities', 'metrics', 'metric_contexts', 'seat_call_changes') if key in commentary}
    # Legacy prose cites compact evidence by ID within its own request. A
    # retained daily report must resolve these against its original publication.
    prose = commentary.get('text') or {}
    developments = (prose.get('developments') or []) if isinstance(prose, dict) else []
    cited = {eid for entry in developments if isinstance(entry, dict)
             for eid in (entry.get('evidence_ids') or []) if isinstance(eid, str)}
    request_key = updates.get('commentary_requests', {}).get(name)
    visible['evidence'] = {item['id']: {key: item[key] for key in ('kind', 'seat', 'record') if key in item}
        for item in updates.get('commentary_evidence', {}).get(request_key, []) if item.get('id') in cited}
    return {'comparison': updates['comparisons'][name], 'commentary': visible}


def retained_window(run, reference):
    """Resolve the frozen source even if it was still being prepared at release."""
    if not reference or not reference.get('source_forecast_id'):
        return reference, None
    source = run.livepublication_set.filter(forecast_id=reference['source_forecast_id']).only(
        'updates', 'source_time').first()
    if source is None:
        return {**reference, 'pending': True}, None
    previous = unpack(source.updates)
    groups = previous['comparisons']
    window = reference.get('source_window')
    if not window:
        # The producer can freeze the source identity before its window exists.
        # Election night has a since-start report; subsequent days use today.
        window = 'today'
        if window not in groups and reference.get('report_date') == run.registration['election_date']:
            window = 'since_start'
    if window not in groups:
        return {**reference, 'reason': 'The referenced forecast has no daily comparison.'}, None
    resolved = {**reference, 'available': groups[window]['available'],
                'source_window': window, 'source_time': source.source_time}
    if resolved['available']:
        resolved.pop('reason', None)
    return resolved, public_window(previous, window)


def publication_body(run, record):
    if record is None:
        return {}
    updates = unpack(record.updates)
    report = unpack(record.report)
    windows = {name: public_window(updates, name) for name in updates['comparisons']}
    yesterday, daily = retained_window(run, updates.get('retained_reports', {}).get('yesterday'))
    if daily is not None:
        windows['yesterday'] = daily
    # Upgrade older compact windows on read. Periods that share a reference
    # also share its report within this request, including the frozen daily window.
    reports = {record.forecast_id: report}

    def report_for(identity):
        if identity not in reports:
            blob = run.livepublication_set.filter(forecast_id=identity).values_list('report', flat=True).first()
            reports[identity] = unpack(blob) if blob else None
        return reports[identity]

    for name, entry in windows.items():
        comparison = entry['comparison']
        if comparison['available'] and 'win_change_totals' not in comparison:
            end = report_for(yesterday['source_forecast_id']) if name == 'yesterday' and daily else report
            comparison.update(recover_movements(report_for(comparison.get('reference_forecast_id')),
                                               end, comparison['win_changes']))
    return {'forecast_id': record.forecast_id, 'source_time': record.source_time,
            'report': report, 'windows': windows, 'yesterday': yesterday,
            'schedule': updates.get('reporting_schedule', {})}


def public_replays(code):
    return LiveRun.objects.filter(election=code, registration__kind='replay',
                                  registration__visibility='public', latest__isnull=False)


@lru_cache(maxsize=32)
def replay_start_snapshot(run_version):
    """Find the first votes, or the first delivery while all are empty. Cache by
    run, revision and creation of its first publication so late arrivals and
    replacement series are picked up without a database write on a page visit."""
    run_id, _, _ = run_version
    timeline = LivePublication.objects.filter(
        run_id=run_id, source_time__isnull=False).order_by('source_time', 'forecast_id')
    first = None
    rows = timeline.values_list('pk', 'forecast_id', 'history_point__has_counted_votes')
    for pk, forecast_id, counted in rows.iterator(chunk_size=32):
        first = first or forecast_id
        if counted is None:
            # Replays published before the count flag still contain the original
            # FP and TCP totals. Only inspect reports up to the first votes.
            counted = has_counted_votes(unpack(LivePublication.objects.values_list(
                'report', flat=True).get(pk=pk)))
        if counted:
            return forecast_id
    return first


def replay_choice(code):
    if code not in settings.PUBLIC_REPLAY_ELECTIONS:
        return {}
    # Order series by their first published count. Finishing an older replay
    # later should not displace a newer series in the Modes bar.
    latest = public_replays(code).annotate(started=Min(
        'livepublication__published_at', filter=Q(livepublication__source_time__isnull=False)
    )).order_by('-started', '-run_id').values_list('run_id', 'revision', 'started').first()
    if latest is None:
        return {}
    return {'latest_public_replay': latest[0], 'replay_start_snapshot': replay_start_snapshot(latest)}


class ReadRun(APIView):
    # Loopback rehearsal access can include private runs and diagnostic labels.
    # Public replay reads have a separate election opt-in and visibility check.
    authentication_classes = []
    permission_classes = []

    @transaction.atomic
    def get(self, request, code, part, run_id=None):
        local = self.is_local_rehearsal(request)
        snapshot = request.query_params.get('snapshot')
        if snapshot is not None and run_id is None:
            raise Http404
        choices = replay_choice(code) if run_id is None and part == 'head' else {}
        if run_id is not None:
            if local:
                eligible = LiveRun.objects.filter(election=code, registration__kind='replay')
            elif code in settings.PUBLIC_REPLAY_ELECTIONS:
                eligible = public_replays(code)
            else:
                raise Http404
            run = get_object_or_404(eligible, pk=run_id)
        else:
            # The official page doesn't use replay-completion state. Keep
            # serving existing live reports while that replay migration rolls out.
            run = LiveRun.objects.defer('replay_completed_at').filter(
                election=code, official=True, registration__kind='live', registration__visibility='public').first()
            if run is None:
                if part == 'head':
                    return Response({'legacy': True, **choices}, headers={'Cache-Control': 'no-store'})
                raise Http404
        data = {'run': run.registration, 'revision': run.revision, **choices}
        if part == 'head' and run_id is None:
            data['counting_started'] = bool(run.latest_id) and LivePublication.objects.filter(
                pk=run.latest_id, history_point__has_counted_votes=True).exists()
        if run_id is not None:
            data['replay_complete'] = run.replay_completed_at is not None
        # Use the same chronology that selects the live head, including its
        # tie-break for two forecasts at the same observation time. The origin
        # is a comparison baseline and has no feed observation of its own.
        timeline = run.livepublication_set.exclude(source_time=None).order_by('source_time', 'forecast_id')
        if snapshot is not None:
            selected = get_object_or_404(timeline.only('forecast_id', 'source_time') if part != 'latest'
                                         else timeline, forecast_id=snapshot)
            through = timeline.filter(Q(source_time__lt=selected.source_time) |
                                      Q(source_time=selected.source_time, forecast_id__lte=snapshot))
        else:
            through = timeline
        headers = {'Cache-Control': 'private, no-store'}
        if (run_id is not None and run.replay_completed_at is not None and
                part in ('latest', 'replay-history') and request.accepted_renderer.format == 'json' and
                (part == 'latest' or snapshot is None)):
            # Tabs may share the browser's copy of a finished replay. Recheck access
            # and the run on every read, before unpacking reports or building charts.
            # The URL distinguishes seats, snapshots and incremental history queries.
            # Bump the representation version when changing the replay JSON format.
            version = json.dumps(['replay-json-2', local, request.get_full_path(), run.revision,
                                  run.replay_completed_at.isoformat()])
            etag = 'W/"' + hashlib.sha256(version.encode()).hexdigest() + '"'
            headers = {'Cache-Control': 'private, no-cache', 'ETag': etag, 'Vary': 'Accept-Encoding'}
            conditional = get_conditional_response(request, etag=etag)
            if conditional is not None:
                for key, value in headers.items():
                    conditional[key] = value
                return conditional
        if part == 'latest':
            record = selected if snapshot is not None else run.latest
            data.update(publication_body(run, record))
            data['local_diagnostics'] = local
            if run_id is not None and record is not None:
                ids = list(timeline.values_list('forecast_id', flat=True))
                index = ids.index(record.forecast_id)
                data['replay_navigation'] = {
                    'previous': ids[index - 1] if index else None,
                    'next': ids[index + 1] if index + 1 < len(ids) else None,
                    'first': ids[0], 'position': index + 1, 'total': len(ids)}
        elif part == 'replay-history' and run_id is not None and snapshot is None:
            query = request.query_params
            data.update(replay_history(run, timeline, query.get('seat'), query.get('after'), query.get('revision')))
        elif part == 'seat-history':
            data['points'] = seat_series(run, request.query_params.get('seat', ''), through)
        elif part == 'history':
            data['points'] = list(through.values_list('source_time', 'history_point'))
        elif part != 'head':
            raise Http404
        return Response(data, headers=headers)

    @staticmethod
    def is_local_rehearsal(request):
        if not settings.LOCAL_REPLAY_ENABLED:
            return False
        try:
            return (ip_address(request.META.get('REMOTE_ADDR', '')).is_loopback and
                    split_domain_port(request.get_host())[0] in ('localhost', '127.0.0.1', '[::1]'))
        except ValueError:
            return False

