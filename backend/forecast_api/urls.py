from django.urls import path

from . import views

app_name = 'forecast_api'
urlpatterns = [
    path('submit-report', views.SubmitReportResponse.as_view(), name='submit-report'),  # type: ignore
    path('election-summary/<str:code>/<str:mode>', views.ElectionSummaryResponse.as_view(), name='election-summary'),  # type: ignore
    path('election-list', views.ElectionListResponse.as_view(), name='election-list')  # type: ignore
]