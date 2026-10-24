from forecast_api.models import Election, Forecast
from forecast_api.history import MODE_FIELDS

from django.shortcuts import get_list_or_404
from django.http import Http404
from rest_framework.response import Response
from rest_framework.permissions import BasePermission

from django.core.cache import cache

from typing import Any

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


def serve_forecast(code, mode, cached_id):
    if mode not in modes:
        raise Http404('Invalid mode')

    # Handle possible cached responses
    cache_int_id_key = f'forecast_recent_id_{modes[mode]}_{code}'
    cached_int_id = cache.get(cache_int_id_key)
    if cached_int_id == cached_id:
        return Response({"new": False})
    cache_response_key = f'forecast_recent_resp_{modes[mode]}_{code}'
    cached_response = cache.get(cache_response_key)
    if cached_response is not None:
        print('returning cached response (forecast)')
        return Response(cached_response)
    
    # This lookup only scopes the report; election history/results can be large
    # and are not part of a latest-forecast response.
    mode_val = modes[mode]
    try:
        election = Election.objects.only('id').get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    forecast = (election
                .forecast_set
                .filter(mode=mode_val)
                .order_by('-date')
                .first())
    if forecast is None:
        raise Http404("Election does not have a forecast for this mode.")
    if forecast.id == cached_id:
        return Response({"new": False})
    response = {"report": forecast.report,
                "label": forecast.label,
                "mode": forecast.mode,
                "date": forecast.date,
                "flags": forecast.flags,
                "id": forecast.id,
                "new": True}

    # Set cache so that we can use it subsequently
    cache.set(cache_int_id_key, forecast.id)
    cache.set(cache_response_key, response)

    return Response(response)


def serve_forecast_archive_list(code):
    # Handle possible cached responses
    cache_response_key = f'forecast_archives_resp_{code}'
    cached_response = cache.get(cache_response_key)
    if cached_response is not None:
        return Response(cached_response)

    try:
        election = Election.objects.only('id', 'name').get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    forecasts = list(
        election.forecast_set
        .order_by('-date')
        .values('id', 'mode', 'date', 'label', 'flags')
    )
    full_response = [election.name, forecasts]

    # Set cache so that we can use it subsequently
    cache.set(cache_response_key, full_response)
    return Response(full_response)


def serve_forecast_archive(code, id):
    # Archive ownership needs the election identity, not its history/results.
    try:
        election = Election.objects.only('id').get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    try:
        forecast = (election
                    .forecast_set
                    .get(id=id))
    except Forecast.DoesNotExist:
        raise Http404('Forecast does not exist')
    response = {"report": forecast.report,
                "mode": forecast.mode,
                "label": forecast.label,
                "date": forecast.date,
                "flags": forecast.flags,
                "id": forecast.id}
    return Response(response)


def serve_election_timeseries(code, mode, cached_version):
    if mode not in modes:
        raise Http404('Invalid mode')

    # Handle possible cached responses
    cache_int_id_key = f'timeseries_recent_id_{modes[mode]}_{code}'
    cached_int_id = cache.get(cache_int_id_key)
    if cached_int_id == cached_version:
        return Response({"new": False})
    cache_response_key = f'timeseries_recent_resp_{modes[mode]}_{code}'
    cached_response = cache.get(cache_response_key)
    if cached_response is not None:
        return Response(cached_response)
    
    # Read the requested series and its version together. Other modes and
    # results are unrelated to this response and must not be decoded here.
    series_field, version_field = MODE_FIELDS[modes[mode]]
    try:
        election = Election.objects.only(series_field, version_field).get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    version = getattr(election, version_field)
    if version == cached_version:
        return Response({"new": False})
    series = getattr(election, series_field)
    response = {"timeseries": series,
                "code": code,
                "mode": mode,
                "version": version,
                "new": True}

    # Set cache so that we can use it subsequently
    cache.set(cache_int_id_key, version)
    cache.set(cache_response_key, response)
    return Response(response)


def serve_election_results(code, cached_version):

    # Handle possible cached responses
    cache_int_id_key = f'results_recent_id_{code}'
    cached_int_id = cache.get(cache_int_id_key)
    if cached_int_id == cached_version:
        return Response({"new": False})
    cache_response_key = f'results_recent_resp_{code}'
    cached_response = cache.get(cache_response_key)
    if cached_response is not None:
        return Response(cached_response)

    # Keep results and their version from one row read, without loading any
    # forecast histories on a results cache miss.
    try:
        election = Election.objects.only('results', 'results_version').get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    results = election.results
    version = election.results_version
    if version == cached_version:
        return Response({"new": False})
    response = {"results": results,
                "code": code,
                "version": version,
                "new": True}

    # Set cache so that we can use it subsequently
    cache.set(cache_int_id_key, version)
    cache.set(cache_response_key, response)
    return Response(response)
