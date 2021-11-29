from django.urls import path

from . import views

app_name = 'forecast_api'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('editing_test', views.EditingTestView.as_view(), name='editing-test'),
    path('public', views.ApiTestResponse.as_view(), name='api-test'),  # type: ignore
    path('protected', views.ProtectedTestResponse.as_view(), name='protected-test'),  # type: ignore
    path('restricted', views.RestrictedTestResponse.as_view(), name='restricted-test')  # type: ignore
]