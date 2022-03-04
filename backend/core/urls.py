"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path
from forecast_api import views
from commentary_api import views

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth-api/', include(('auth_api.urls', 'auth-api'))),
    path('forecast-api/', include(('forecast_api.urls', 'forecast-api'))),
    path('commentary-api/', include(('commentary_api.urls', 'commentary-api'))),
    re_path(r'^(?P<path>.*)/$', views.catchall),
    path('', views.catchall),
]
