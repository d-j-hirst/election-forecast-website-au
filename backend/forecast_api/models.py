from django.db import models
from datetime import datetime
from django.utils.translation import gettext_lazy as _

class Election(models.Model):
    # Shorthand code for the election
    # This will be used for querying and the URL
    code = models.CharField(max_length=10, unique=True)

    # Descriptive name of the election
    name = models.CharField(max_length=100)

    timeseries_fc = models.JSONField(default=str)

    timeseries_fc_version = models.IntegerField(default=0)

    timeseries_nc = models.JSONField(default=str)

    timeseries_nc_version = models.IntegerField(default=0)

    timeseries_lf = models.JSONField(default=str)

    timeseries_lf_version = models.IntegerField(default=0)

    results = models.JSONField(default=str)

    results_version = models.IntegerField(default=0)
    
    def __str__(self):
        return self.code + " - " + self.name

    
class Forecast(models.Model):
    # Election that this is forecasting
    election = models.ForeignKey(Election, on_delete=models.CASCADE, null=True)

    date = models.DateTimeField()

    class Mode(models.TextChoices):
        REGULAR_FORECAST = 'FC', _('Regular Forecast')
        NOWCAST = 'NC', _('Nowcast')
        LIVE_FORECAST = 'LF', _('Live Forecast')

    mode = models.CharField(
        max_length=2,
        choices=Mode.choices,
        default=Mode.REGULAR_FORECAST
    )

    label = models.CharField(
        max_length=256,
        default=""
    )

    flags = models.TextField(
        max_length=256,
        default="",
        blank=True
    )

    report = models.JSONField(default=str)

    def get_mode(self) -> Mode:
        return Forecast.Mode[self.mode]
    
    def __str__(self):
        return (self.label + " - " + self.election.name + " - " + 
                self.mode + " - " + str(self.date).split('+')[0])