from django.http.request import HttpRequest
from django.utils.timezone import make_aware
from django.shortcuts import get_object_or_404
from datetime import datetime
from forecast_api.models import Election, Forecast
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
import json


class SubmitForecastPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.user.has_perm('users.submit_forecasts'):
            return True
        
        return False


def first(iterable, condition = lambda x: True):
    return next(x for x in iterable if condition(x))


def get_series_from_forecasts(forecasts):
    return [{
                'date': str(a.date),
                'label': str(a.label),
                'majorityWinPc': a.report['majorityWinPc'],
                'minorityWinPc': a.report['minorityWinPc'],
                'mostSeatsWinPc': a.report['mostSeatsWinPc'],
                'overallWinPc': a.report['overallWinPc'],
                'tppFrequencies': a.report['tppFrequencies'],
                'fpFrequencies': (a.report['fpFrequencies'] 
                    if 'fpFrequencies' in a.report else []) ,
                'seatCountFrequencies': a.report['seatCountFrequencies']
            } for a in forecasts]


def update_timeseries(election: Election):
    fc_forecasts = Forecast.objects.filter(election=election, mode='FC').order_by('-date')
    fc_series = get_series_from_forecasts(fc_forecasts)
    nc_forecasts = Forecast.objects.filter(election=election, mode='NC').order_by('-date')
    nc_series = get_series_from_forecasts(nc_forecasts)
    lf_forecasts = Forecast.objects.filter(election=election, mode='LF').order_by('-date')
    lf_series = get_series_from_forecasts(lf_forecasts)
    election.timeseries_fc = fc_series
    election.timeseries_fc_version += 1
    election.timeseries_nc = nc_series
    election.timeseries_nc_version += 1
    election.timeseries_lf = lf_series
    election.timeseries_lf_version += 1
    election.save()


# Assuming mapped_list is a list of two-element list items, returns the value
# of the second element for the first item whose first element matches "val".
def find_mapped(mapped_list, val):
    return first(mapped_list, lambda x: x[0] == val)[1]


def submit_report(request: HttpRequest):
    data_json = request.body.decode()
    data = json.loads(data_json)
    code = data['termCode']
    name = data['electionName']
    label = data['reportLabel']
    flags = data['flags'] if 'flags' in data else ''
    date = make_aware(datetime.fromisoformat(data['reportDate']))
    mode = (Forecast.Mode.NOWCAST
            if data['reportMode'] == "NC"
            else (
                Forecast.Mode.LIVE_FORECAST
                if data['reportMode'] == "LF"
                else Forecast.Mode.REGULAR_FORECAST
            ))
    election, _ = Election.objects.get_or_create(code=code)
    if len(name) > 0:  # should only replace the name if explicitly given
        election.name = name
    election.save()
    forecast, _ = Forecast.objects.get_or_create(election=election,
                                                 date=date,
                                                 mode=mode)
    forecast.label = label
    forecast.report = data
    forecast.flags = flags
    forecast.save()
    update_timeseries(election)
    return Response("Forecast report successfully submitted.")


def submit_timeseries_update(request: HttpRequest):
    data_json = request.body.decode()
    data = json.loads(data_json)
    code = data['termCode']
    election = get_object_or_404(Election, code=code)
    update_timeseries(election)
    return Response("Election timeseries successfully updated.")