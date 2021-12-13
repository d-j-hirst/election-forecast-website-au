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
    election: Any = Election.objects.get(code=code)
    info['name'] = election.name
    forecast: Any = (election
                        .forecast_set
                        .filter(mode=mode_val)
                        .order_by('-date')
                        .first())
    info['date'] = str(forecast.date).replace(' ', 'T')
    info['description'] = forecast.description
    info['alp_overall_win_pc'] = forecast.alp_overall_win_pc
    info['lnp_overall_win_pc'] = forecast.lnp_overall_win_pc
    info['oth_overall_win_pc'] = forecast.oth_overall_win_pc
    return Response(info)


def serve_forecast_list():
    elections: Any = get_list_or_404(Election)
    if elections is None:
        raise Exception('Could not find any matching elections!')
    responses = [(obj.code, obj.name) for obj in elections]
    return Response(responses)