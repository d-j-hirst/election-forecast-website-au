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


def update_timeseries(election: Election):
    forecasts = Forecast.objects.filter(election=election, mode='FC')
    series = [
        {
            'date': str(a.date),
            'majorityWinPc': a.report['majorityWinPc'],
            'minorityWinPc': a.report['minorityWinPc'],
            'mostSeatsWinPc': a.report['mostSeatsWinPc'],
            'overallWinPc': a.report['overallWinPc'],
            'tppFrequencies': a.report['tppFrequencies'],
            'fpFrequencies': a.report['fpFrequencies'],
            'seatCountFrequencies': a.report['seatCountFrequencies'],
            'seatPartyWinFrequencies': a.report['seatPartyWinFrequencies'],
        }
        for a in forecasts
    ]
    print(series)
    election.time_series = series
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
    return Response("Forecast report successfully submitted.")


def submit_timeseries_update(request: HttpRequest):
    data_json = request.body.decode()
    data = json.loads(data_json)
    code = data['termCode']
    election = get_object_or_404(Election, code=code)
    update_timeseries(election)
    return Response("Election timeseries successfully updated.")