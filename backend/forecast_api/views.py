from django.http.request import HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from typing import Any

from auth_api.mixins import ApiErrorsMixin, ApiAuthMixin, PublicApiMixin

from forecast_api.models import Election, Forecast

from forecast_api.serve import serve_forecast, \
                               serve_forecast_list, \
                               ViewForecastPermission
from forecast_api.submit import submit_report, SubmitForecastPermission


class SubmitReportResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&SubmitForecastPermission]
    def post(self, request: HttpRequest):
        return submit_report(request)


class ElectionSummaryResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&ViewForecastPermission]
    def get(self, request, code, mode):
        return serve_forecast(code, mode)


class ElectionListResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&ViewForecastPermission]
    def get(self, request):
        return serve_forecast_list()