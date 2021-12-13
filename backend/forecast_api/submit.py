from django.http.request import HttpRequest
from django.utils.timezone import make_aware
from datetime import datetime
from forecast_api.models import Election, Forecast
from rest_framework.response import Response
from rest_framework.permissions import BasePermission


class SubmitForecastPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.user.has_perm('users.submit_forecasts'):
            return True
        
        return False

def submit_report(request: HttpRequest):
    data = request.body.decode().split('\n')
    code = data[0]
    name = data[1]
    date = make_aware(datetime.fromisoformat(data[3]))
    mode = (Forecast.Mode.NOWCAST
            if data[4] == "NC"
            else (
                Forecast.Mode.LIVE_FORECAST
                if data[4] == "LF"
                else Forecast.Mode.REGULAR_FORECAST
            ))
    election, _ = Election.objects.get_or_create(code=code)
    if len(name) > 0:  # should only replace the name if explicitly given
        election.name = name
    election.save()
    forecast, _ = Forecast.objects.get_or_create(election=election,
                                                    date=date,
                                                    mode=mode)
    forecast.description = data[2]
    forecast.alp_overall_win_pc = float(data[5])
    forecast.lnp_overall_win_pc = float(data[6])
    forecast.oth_overall_win_pc = float(data[7])
    forecast.save()
    message = "Forecast report successfully submitted."
    return Response(message)