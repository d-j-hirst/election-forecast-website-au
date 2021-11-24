from django.contrib.auth.mixins import PermissionRequiredMixin
from django.views import generic
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class IndexView(PermissionRequiredMixin, generic.TemplateView):
    permission_required = 'forecast_display.view_forecast'
    template_name = 'forecast_display/index.html'


class EditingTestView(PermissionRequiredMixin, generic.TemplateView):
    permission_required = 'forecast_display.add_forecast'
    template_name = 'forecast_display/editing_test.html'


class ApiTestResponse(APIView):
    def get(self, request, format=None):
        message = "Here is a message from the backend server! Changed it a bit."
        return Response(message)


class ProtectedTestResponse(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        message = "This message is protected and should only be available with an appropriate access token."
        return Response(message)