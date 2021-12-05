from django.http import JsonResponse
from django.http.request import HttpRequest
from django.shortcuts import get_list_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated

from typing import Any

from auth_api.mixins import ApiErrorsMixin, ApiAuthMixin, PublicApiMixin

from forecast_api.models import Election, Forecast

from datetime import datetime


class ApiTestResponse(PublicApiMixin, ApiErrorsMixin, APIView):
    def get(self, request):
        message = "Here is a message from the backend server! Changed it a bit."
        return Response(message)


class ViewForecastPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.user.has_perm('users.view_forecasts'):
            return True
        
        return False


class SubmitForecastPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.user.has_perm('users.submit_forecasts'):
            return True
        
        return False


class SubmitReportResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&SubmitForecastPermission]
    def post(self, request: HttpRequest):
        data = request.body.decode().split('\n')
        code = data[0]
        name = data[1]
        date = datetime.fromisoformat(data[3])
        desc = data[2]
        election, created = Election.objects.get_or_create(defaults={'code': code})
        if len(name) > 0:  # should only replace the name if explicitly given
            election.name = name
        election.save()
        forecast, created = Forecast.objects.get_or_create(defaults={'election': election, 'date': date})
        forecast.description = desc
        forecast.save()
        message = "Forecast report successfully submitted."
        return Response(message)


class ProtectedTestResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        message = "This message is protected and should only be available with an appropriate access token."
        return Response(message)


class RestrictedTestResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&ViewForecastPermission]
    def get(self, request):
        message = "This message is restricted and should only be available with the view_forecast permission."
        return Response(message)


class ElectionSummaryResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&ViewForecastPermission]
    def get(self, request, code):
        info = {}
        election: Any = Election.objects.get(code=code)
        info['name'] = election.name
        forecast: Any = election.forecast_set.order_by('-date').first()
        info['date'] = str(forecast.date)
        info['description'] = forecast.description
        print(info)
        return Response(info)


class ElectionListResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&ViewForecastPermission]
    def get(self, request):
        print("Getting election list")
        elections: Any = get_list_or_404(Election)
        if elections is None:
            raise Exception('Could not find any matching elections!')
        responses = [(obj.code, obj.name) for obj in elections]
        return Response(responses)