from django.contrib import admin

from forecast_api.models import Election, Forecast

admin.site.register(Election)
admin.site.register(Forecast)