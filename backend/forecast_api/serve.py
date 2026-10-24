from forecast_api.models import Election, Forecast
from forecast_api.history import MODE_FIELDS

from django.http import Http404
from rest_framework.response import Response
from rest_framework.permissions import BasePermission

from forecast_api.cache_utils import (
    get_cached_response,
    response_cache_key,
    set_cached_response,
)

modes = {
    'regular': Forecast.Mode.REGULAR_FORECAST,
    'live': Forecast.Mode.LIVE_FORECAST,
    'nowcast': Forecast.Mode.NOWCAST,
}

class ViewForecastPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        if request.user.has_perm('users.view_forecasts'):
            return True

        return False


def first(iterable, condition = lambda x: True):
    return next(x for x in iterable if condition(x))


# Assuming mapped_list is a list of two-element list items, returns the value
# of the second element for the first item whose first element matches "val".
def find_mapped(mapped_list, val):
    return first(mapped_list, lambda x: x[0] == val)[1]


# Public reads may overlap a publication, but must never cache a body under a
# revision observed from another snapshot. Retry a bounded number of times.
MAX_PUBLICATION_READ_ATTEMPTS = 3


def _election_head(code, *fields):
    try:
        return Election.objects.values('id', *fields).get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist') from None


def _report_revision_matches(code, head):
    return Election.objects.filter(
        pk=head['id'], code=code, report_revision=head['report_revision'],
    ).exists()


def _publication_busy():
    # Sustained publication must not create an unbounded loop or cache a mixed
    # snapshot. The caller can retry this transient response later.
    return Response(
        {'detail': 'Election data changed while being read. Please retry.'},
        status=503, headers={'Retry-After': '1'},
    )


def _forecast_response(body, cached_id):
    # Retain the existing public ID-based conditional protocol. The database
    # revision validates this server body, not the content of a browser's copy.
    if body['id'] == cached_id:
        return Response({'new': False})
    return Response(body)


def serve_forecast(code, mode, cached_id):
    if mode not in modes:
        raise Http404('Invalid mode')
    mode_val = modes[mode]

    for _ in range(MAX_PUBLICATION_READ_ATTEMPTS):
        # Check database authority even on warm reads; no election JSON is
        # needed to scope the report or identify its published cache entry.
        head = _election_head(code, 'report_revision')
        key = response_cache_key(code, head['id'], f'summary:{mode_val}', head['report_revision'])
        body = get_cached_response(key)
        if body is not None:
            return _forecast_response(body, cached_id)

        body = (
            Forecast.objects.filter(election_id=head['id'], mode=mode_val)
            .order_by('-date')
            .values('report', 'label', 'mode', 'date', 'flags', 'id')
            .first()
        )
        # The report and Election revision came from separate queries. Check
        # after materialization, including an absent report, before caching it.
        if not _report_revision_matches(code, head):
            continue
        if body is None:
            raise Http404('Election does not have a forecast for this mode.')
        body['new'] = True
        set_cached_response(key, body)
        return _forecast_response(body, cached_id)
    return _publication_busy()


def serve_forecast_archive_list(code):
    for _ in range(MAX_PUBLICATION_READ_ATTEMPTS):
        # The name and archive metadata share the report publication revision.
        head = _election_head(code, 'name', 'report_revision')
        key = response_cache_key(code, head['id'], 'archives', head['report_revision'])
        body = get_cached_response(key)
        if body is not None:
            return Response(body)

        forecasts = list(
            Forecast.objects.filter(election_id=head['id']).order_by('-date')
            .values('id', 'mode', 'date', 'label', 'flags')
        )
        if not _report_revision_matches(code, head):
            continue
        body = [head['name'], forecasts]
        set_cached_response(key, body)
        return Response(body)
    return _publication_busy()


def serve_forecast_archive(code, id):
    # Archive ownership needs the election identity, not its history/results.
    try:
        election = Election.objects.only('id').get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    try:
        forecast = election.forecast_set.get(id=id)
    except Forecast.DoesNotExist:
        raise Http404('Forecast does not exist')
    response = {'report': forecast.report,
                'mode': forecast.mode,
                'label': forecast.label,
                'date': forecast.date,
                'flags': forecast.flags,
                'id': forecast.id}
    return Response(response)


def _serve_election_data(code, data_field, version_field, cached_version, mode=None):
    # History and results store each body beside its version. Their shared read
    # protocol avoids decoding any blob on warm or unchanged-version requests.
    response_field = 'timeseries' if mode is not None else 'results'
    for _ in range(MAX_PUBLICATION_READ_ATTEMPTS):
        head = _election_head(code, version_field)
        version = head[version_field]
        if version == cached_version:
            return Response({'new': False})
        key = response_cache_key(code, head['id'], data_field, version)
        body = get_cached_response(key)
        if body is not None:
            return Response(body)

        # Constrain the payload query to the captured identity AND version. A
        # changed/deleted election restarts the head lookup instead of attaching
        # an older version to newer JSON (or vice versa).
        row = Election.objects.filter(
            pk=head['id'], code=code, **{version_field: version},
        ).values(data_field, version_field).first()
        if row is None:
            continue
        body = {
            response_field: row[data_field],
            'code': code, 'version': version, 'new': True,
        }
        if mode is not None:
            body['mode'] = mode
        set_cached_response(key, body)
        return Response(body)
    return _publication_busy()


def serve_election_timeseries(code, mode, cached_version):
    if mode not in modes:
        raise Http404('Invalid mode')
    series_field, version_field = MODE_FIELDS[modes[mode]]
    return _serve_election_data(code, series_field, version_field, cached_version, mode)


def serve_election_results(code, cached_version):
    return _serve_election_data(code, 'results', 'results_version', cached_version)
