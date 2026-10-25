"""Dispatch server endpoints before the public React application's deep links."""
from django.contrib import admin
from django.urls import include, path, re_path

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth-api/', include(('auth_api.urls', 'auth-api'))),
    path('forecast-api/', include(('forecast_api.urls', 'forecast-api'))),
    path('commentary-api/', include(('commentary_api.urls', 'commentary-api'))),
    # Unmatched API URLs are errors, not successful HTML pages. Keep this after
    # the registered endpoints and before the public frontend fallback.
    re_path(r'^(?:auth-api|forecast-api|commentary-api)(?:/.*)?$', views.api_not_found),
    re_path(r'^(?P<path>.*)/$', views.catchall),
    path('', views.catchall),
]
