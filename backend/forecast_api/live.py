"""Version-one live publication endpoints, independent of the historical uploader."""
import hashlib
import json
import re
from datetime import date, datetime
from decimal import InvalidOperation
from ipaddress import ip_address
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.db import transaction
from django.db.models import F, Q
from django.http import Http404
from django.http.request import split_domain_port
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_api.mixins import ApiAuthMixin
from forecast_api.live_data import (
    compact_updates, election_history_point, pack, recover_movements, seat_points, seat_series, unpack, write_seat_points,
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
    record = LivePublication.objects.create(run=run, forecast_id=identity, digest=digest,
        source_time=source, report=pack(report), updates=pack(compact_updates(body)),
        history_point=None if origin else election_history_point(report))
    if not origin:
        write_seat_points(run, identity, report)
        latest = run.livepublication_set.filter(pk=run.latest_id).values_list('source_time', 'forecast_id').first()
        if not latest or (source, identity) > latest:
            run.latest = record
    run.revision += 1
    run.save(update_fields=['latest', 'revision'])
    return record


class PublishForecast(ApiAuthMixin, APIView):
    permission_classes = [IsAuthenticated & SubmitForecastPermission]

    def post(self, request, run_id, identity):
        raw = request.body
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
                except (ValueError, KeyError, IndexError, TypeError, AttributeError, InvalidOperation, OverflowError):
                    raise ValidationError('Malformed live publication.') from None
            head = run.livepublication_set.filter(pk=run.latest_id).values('forecast_id', 'source_time').first() or {}
            return Response({'run_id': run_id, 'forecast_id': identity, 'sha256': digest,
                             'published_at': record.published_at, 'latest_forecast_id': head.get('forecast_id'),
                             'latest_source_time': head.get('source_time')})


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


class ReadRun(APIView):
    # Replays and diagnostic display share the development opt-in and loopback
    # checks, so hosted forecast pages only get the public presentation.
    authentication_classes = []
    permission_classes = []

    @transaction.atomic
    def get(self, request, code, part, run_id=None):
        local = self.is_local_rehearsal(request)
        snapshot = request.query_params.get('snapshot')
        if snapshot is not None and (not local or run_id is None):
            raise Http404
        if run_id is not None:
            if not local:
                raise Http404
            run = get_object_or_404(LiveRun, pk=run_id, election=code, registration__kind='replay')
        else:
            run = LiveRun.objects.filter(election=code, official=True, registration__kind='live',
                                         registration__visibility='public').first()
            if run is None:
                if part == 'head':
                    return Response({'legacy': True}, headers={'Cache-Control': 'no-store'})
                raise Http404
        data = {'run': run.registration, 'revision': run.revision}
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
        if part == 'latest':
            record = selected if snapshot is not None else run.latest
            data.update(publication_body(run, record))
            data['local_diagnostics'] = local
            if local and run_id is not None and record is not None:
                ids = list(timeline.values_list('forecast_id', flat=True))
                index = ids.index(record.forecast_id)
                data['replay_navigation'] = {
                    'previous': ids[index - 1] if index else None,
                    'next': ids[index + 1] if index + 1 < len(ids) else None,
                    'first': ids[0], 'position': index + 1, 'total': len(ids)}
        elif part == 'seat-history':
            data['points'] = seat_series(run, request.query_params.get('seat', ''), through)
        elif part == 'history':
            data['points'] = list(through.values_list('source_time', 'history_point'))
        elif part != 'head':
            raise Http404
        return Response(data, headers={'Cache-Control': 'private, no-store'})

    @staticmethod
    def is_local_rehearsal(request):
        if not settings.LOCAL_REPLAY_ENABLED:
            return False
        try:
            return (ip_address(request.META.get('REMOTE_ADDR', '')).is_loopback and
                    split_domain_port(request.get_host())[0] in ('localhost', '127.0.0.1', '[::1]'))
        except ValueError:
            return False

