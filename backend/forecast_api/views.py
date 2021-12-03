from django.contrib.auth.mixins import PermissionRequiredMixin
from django.views import generic
from django.http import HttpResponse
from django.http.request import HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated

from auth_api.mixins import ApiErrorsMixin, ApiAuthMixin, PublicApiMixin

from forecast_api.models import Election


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
        code = request.body.decode()
        Election.objects.get_or_create(defaults={'code': code})
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