from django.http.request import HttpRequest
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from auth_api.mixins import ApiErrorsMixin, ApiAuthMixin

from forecast_api.serve import serve_forecast, \
                               serve_forecast_archive_list, \
                               serve_forecast_archive, \
                               serve_election_timeseries, \
                               serve_election_results
from forecast_api.submit import submit_report, \
                                submit_timeseries_update, \
                                submit_results_update, \
                                submit_review, \
                                SubmitForecastPermission


class SubmitReportResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&SubmitForecastPermission]
    def post(self, request: HttpRequest):
        return submit_report(request)


class SubmitTimeseriesUpdateResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&SubmitForecastPermission]
    def post(self, request: HttpRequest):
        return submit_timeseries_update(request)


class SubmitResultsUpdateResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&SubmitForecastPermission]
    def post(self, request: HttpRequest):
        return submit_results_update(request)


class SubmitReviewResponse(ApiAuthMixin, ApiErrorsMixin, APIView):
    permission_classes = [IsAuthenticated&SubmitForecastPermission]
    def post(self, request: HttpRequest):
        return submit_review(request)


class ElectionSummaryResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, code, mode, cached_id=-1):
        return serve_forecast(code, mode, cached_id)


class ElectionArchiveListResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, code):
        return serve_forecast_archive_list(code)


class ElectionArchiveResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, code, id):
        return serve_forecast_archive(code, id)


class ElectionTimeseriesResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, code, mode, cached_version=-1):
        return serve_election_timeseries(code, mode, cached_version)


class ElectionResultsResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, code, cached_version=-1):
        return serve_election_results(code, cached_version)