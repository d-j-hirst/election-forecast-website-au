from forecast_api.models import Election, Forecast

from django.shortcuts import get_list_or_404
from django.http import Http404
from rest_framework.response import Response
from rest_framework.permissions import BasePermission

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
    mode_val = modes[mode]
    election = Election.objects.get(code=code)
    forecast = (election
                .forecast_set
                .filter(mode=mode_val)
                .order_by('-date')
                .first())
    if forecast.id == cached_id:
        return Response({"new": False})
    response = {"report": forecast.report,
                "label": forecast.label,
                "mode": forecast.mode,
                "date": forecast.date,
                "flags": forecast.flags,
                "id": forecast.id,
                "new": True}
    return Response(response)


def serve_forecast_archive_list(code):
    try:
        election = Election.objects.get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    forecasts = election.forecast_set.order_by('-date')
    if forecasts is None:
        raise Http404('No forecasts for this election!')
    responses = [{"id": forecast.id, 
                  "mode": forecast.mode,
                  "date": forecast.date, 
                  "label": forecast.label,
                  "flags": forecast.flags
                 } for forecast in forecasts]
    full_response = [election.name, responses]
    return Response(full_response)


def serve_forecast_archive(code, id):
    try:
        election = Election.objects.get(code=code)
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
    try:
        election = Election.objects.get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    if mode == Forecast.Mode.REGULAR_FORECAST:
        series = election.timeseries_fc
        version = election.timeseries_fc_version
    elif mode == Forecast.Mode.NOWCAST:
        series = election.timeseries_nc
        version = election.timeseries_nc_version
    elif mode == Forecast.Mode.LIVE_FORECAST:
        series = election.timeseries_lf
        version = election.timeseries_lf_version
    else:
        raise Http404('Invalid mode')
    if version == cached_version:
        return Response({"new": False})
    response = {"timeseries": series,
                "code": code,
                "mode": mode,
                "version": version,
                "new": True}
    return Response(response)