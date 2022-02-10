from forecast_api.models import Election, Forecast

from django.shortcuts import get_list_or_404
from django.http import Http404
from rest_framework.response import Response
from rest_framework.permissions import BasePermission

from typing import Any


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


def serve_forecast(code, mode):
    modes = {
        'regular': Forecast.Mode.REGULAR_FORECAST,
        'live': Forecast.Mode.LIVE_FORECAST,
        'nowcast': Forecast.Mode.NOWCAST,
    }
    if mode not in modes:
        raise Http404
    info = {}
    mode_val = modes[mode]
    election = Election.objects.get(code=code)
    info['name'] = election.name
    forecast = (election
                .forecast_set
                .filter(mode=mode_val)
                .order_by('-date')
                .first())
    return Response(forecast.report)


def serve_forecast_list():
    elections: Any = get_list_or_404(Election)
    if elections is None:
        raise Exception('Could not find any matching elections!')
    responses = [(obj.code, obj.name) for obj in elections]
    return Response(responses)


def serve_forecast_archives(code):
    try:
        election = Election.objects.get(code=code)
    except Election.DoesNotExist:
        raise Http404('Election does not exist')
    forecasts = election.forecast_set.order_by('-date')
    if forecasts is None:
        raise Http404('No forecasts for this election!')
    responses = [(forecast.id, forecast.mode, forecast.date, 
                 forecast.report['reportLabel'])
                 for forecast in forecasts]
    return Response(responses)