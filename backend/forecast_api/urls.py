from django.urls import path

from . import views

app_name = 'forecast_api'
urlpatterns = [
    path('submit-report',
         views.SubmitReportResponse.as_view(),  # type: ignore
         name='submit-report'),
    path('election-summary/<str:code>/<str:mode>',
         views.ElectionSummaryResponse.as_view(),  # type: ignore
         name='election-summary'),
    path('election-list',
         views.ElectionListResponse.as_view(),  # type: ignore
         name='election-list'),
    path('election-archives/<str:code>',
         views.ElectionArchiveListResponse.as_view(),  # type: ignore
         name='archive-list'),
    path('election-archive/<str:code>/<int:id>/',
         views.ElectionArchiveResponse.as_view(),  # type: ignore
         name='archive')
]