from django.urls import path
from django.views.generic.base import TemplateView

from . import views

app_name = 'forecast_display'
urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('editing_test', views.EditingTestView.as_view(), name='editing-test'),
    path('api_test', views.ApiTestResponse.as_view(), name='api-test'),
    path('protected', views.ProtectedTestResponse.as_view(), name='protected-test')
]