from django.contrib.auth.mixins import PermissionRequiredMixin
from django.views import generic
from django.http.request import HttpRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated

from auth_api.mixins import ApiErrorsMixin, ApiAuthMixin, PublicApiMixin

class IndexView(PermissionRequiredMixin, generic.TemplateView):
    permission_required = 'forecast_api.view_forecast'
    template_name = 'forecast_api/index.html'


class EditingTestView(PermissionRequiredMixin, generic.TemplateView):
    permission_required = 'forecast_api.add_forecast'
    template_name = 'forecast_api/editing_test.html'


class ApiTestResponse(PublicApiMixin, ApiErrorsMixin, APIView):
    def get(self, request):
        message = "Here is a message from the backend server! Changed it a bit."
        return Response(message)


class ApiPostResponse(PublicApiMixin, ApiErrorsMixin, APIView):
    def post(self, request: HttpRequest):
        print(request.body.decode())
        message = "Here is a message from the backend server for a POST request!"
        return Response(message)


class ProtectedTestResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        message = "This message is protected and should only be available with an appropriate access token."
        return Response(message)


class ViewForecastPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.user.has_perm('users.view_forecasts'):
            return True
        
        return False


class RestrictedTestResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_required = 'forecast_api.view_forecast'
    permission_classes = [IsAuthenticated&ViewForecastPermission]
    def get(self, request):
        message = "This message is restricted and should only be available with the view_forecast permission."
        return Response(message)