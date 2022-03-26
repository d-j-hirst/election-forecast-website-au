from django.urls import path

from . import views

app_name = 'forecast_api'
urlpatterns = [
    path('submit-report',
         views.SubmitReportResponse.as_view(),  # type: ignore
         name='submit-report'),
    path('submit-timeseries-update',
         views.SubmitTimeseriesUpdateResponse.as_view(),  # type: ignore
         name='submit-timeseries-update'),
    path('election-summary/<str:code>/<str:mode>',
         views.ElectionSummaryResponse.as_view(),  # type: ignore
         name='election-summary'),
    path('election-summary/<str:code>/<str:mode>/<int:cached_id>',
         views.ElectionSummaryResponse.as_view(),  # type: ignore
         name='election-summary'),
    path('election-archives/<str:code>',
         views.ElectionArchiveListResponse.as_view(),  # type: ignore
         name='archive-list'),
    path('election-archive/<str:code>/<int:id>/',
         views.ElectionArchiveResponse.as_view(),  # type: ignore
         name='archive')
]