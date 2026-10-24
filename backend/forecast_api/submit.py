from datetime import datetime, timezone
import json

from django.core.cache import cache
from django.db import transaction
from django.http.request import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils.timezone import is_naive, make_aware
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from forecast_api.history import (
    MODE_FIELDS,
    history_model_fields,
    rebuild_history,
    upsert_history_point,
)
from forecast_api.models import Election, Forecast
from forecast_api.results import update_results
from forecast_api.review import perform_review


class SubmitForecastPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        if request.user.has_perm('users.submit_forecasts'):
            return True

        return False


REPORT_MODE_TO_FORECAST_MODE = {
    # Report JSON is consumed directly by the frontend, which calls a regular
    # forecast RF. Forecast.mode and history/cache keys use the older FC code.
    'RF': Forecast.Mode.REGULAR_FORECAST,
    'NC': Forecast.Mode.NOWCAST,
    'LF': Forecast.Mode.LIVE_FORECAST,
}


def _forecast_mode(report_mode: str) -> str:
    try:
        return REPORT_MODE_TO_FORECAST_MODE[report_mode]
    except KeyError:
        # Do not accept FC here: persisting reportMode=FC would produce report
        # JSON which the frontend cannot classify or display correctly.
        raise ValueError('reportMode must be RF, NC, or LF.') from None


def _parse_report_date(value: str):
    # Python 3.8's fromisoformat does not accept the otherwise-standard Z form.
    normalized = value[:-1] + '+00:00' if value.endswith('Z') else value
    report_date = datetime.fromisoformat(normalized)
    if is_naive(report_date):
        report_date = make_aware(report_date)
    return report_date.astimezone(timezone.utc)


def submit_report(request: HttpRequest):
    data = json.loads(request.body.decode())
    code = data['termCode']
    name = data['electionName']
    label = data['reportLabel']
    flags = data.get('flags', '')
    date = _parse_report_date(data['reportDate'])
    mode = _forecast_mode(data['reportMode'])

    # Keep the full report and its derived history point mutually consistent.
    with transaction.atomic():
        # only('id') avoids fetching all history blobs on the lookup path while
        # get_or_create retains its race-safe handling of a new election code.
        election, _ = Election.objects.only('id').get_or_create(
            code=code,
            defaults={'name': name},
        )
        series_field, version_field = MODE_FIELDS[mode]
        election = (
            Election.objects
            .select_for_update()
            .only('id', 'code', 'name', series_field, version_field)
            .get(pk=election.pk)
        )
        if name and election.name != name:
            election.name = name
            election.save(update_fields=['name'])

        # Keep this write inside the election lock: it gives every normal writer
        # one lock order and makes report/history consistency easier to reason
        # about. SQLite serializes writes; row-locking databases serialize here.
        forecast_lookup = Forecast.objects.filter(
            election=election,
            date=date,
            mode=mode,
        )
        updated = forecast_lookup.update(
            label=label,
            report=data,
            flags=flags,
        )
        if not updated:
            # The election lock (or SQLite's write serialization) is the normal
            # collision control. The unique index intentionally fails loudly if
            # an out-of-protocol writer races this create; retrying an integrity
            # error correctly would require backend-specific transaction logic.
            Forecast.objects.create(
                election=election,
                date=date,
                mode=mode,
                label=label,
                report=data,
                flags=flags,
            )
        upsert_history_point(
            election,
            mode,
            date,
            label,
            data,
        )
        # Publish reports/metadata even when a flags-only or identical upload
        # leaves the derived history unchanged. No post-commit cache work is
        # needed for readers to discover the newly committed body.
        election.advance_report_revision()

    return Response('Forecast report successfully submitted.')


def submit_timeseries_update(request: HttpRequest):
    data = json.loads(request.body.decode())
    code = data['termCode']
    requested_mode = data.get('mode', 'all')
    if requested_mode == 'all':
        modes = list(MODE_FIELDS)
    elif requested_mode in MODE_FIELDS:
        modes = [requested_mode]
    else:
        raise ValueError('mode must be FC, NC, LF, or all.')

    # This remains the authoritative reconciliation endpoint; routine uploads
    # only update their own point and never trigger a full reconstruction.
    with transaction.atomic():
        locked_fields = history_model_fields(modes)
        election = get_object_or_404(
            Election.objects.select_for_update().only(*locked_fields),
            code=code,
        )
        rebuilt = rebuild_history(election, modes)
        # Reconstruction also publishes manual report/name edits. Advance even
        # when the derived point values happen to match the previous series.
        election.advance_report_revision()

    return Response({'code': code, 'rebuilt': rebuilt})


def submit_results_update(request: HttpRequest):
    data = json.loads(request.body.decode())
    code = data['termCode']
    pre_fill = data['preFill'] if 'preFill' in data else None
    election = get_object_or_404(Election.objects.only('id', 'code'), code=code)
    update_results(election, pre_fill)
    return Response('Election results successfully updated.')


def submit_review(request: HttpRequest):
    data = json.loads(request.body.decode())
    code = data['termCode']
    election = get_object_or_404(Election, code=code)
    forecasts = (
        election.forecast_set
        .filter(mode='FC')
        .order_by('-date')
    )
    response = perform_review(election, forecasts)
    return Response(response)


def reset_cache():
    cache.clear()
    return Response('Successfully reset cache.')
