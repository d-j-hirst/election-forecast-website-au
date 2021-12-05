from django.urls import path

from . import views

app_name = 'forecast_api'
urlpatterns = [
    path('public', views.ApiTestResponse.as_view(), name='api-test'),  # type: ignore
    path('submit-report', views.SubmitReportResponse.as_view(), name='submit-report'),  # type: ignore
    path('protected', views.ProtectedTestResponse.as_view(), name='protected-test'),  # type: ignore
    path('restricted', views.RestrictedTestResponse.as_view(), name='restricted-test'),  # type: ignore
    path('election-summary/<str:code>', views.ElectionSummaryResponse.as_view(), name='election-summary')  # type: ignore
]