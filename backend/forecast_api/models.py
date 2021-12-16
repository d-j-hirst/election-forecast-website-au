from django.db import models
from datetime import datetime
from django.utils.translation import gettext_lazy as _

class Election(models.Model):
    # Shorthand code for the election
    # This will be used for querying and the URL
    code = models.CharField(max_length=10, unique=True)

    # Descriptive name of the election
    name = models.CharField(max_length=100)

    
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

    def get_mode(self) -> Mode:
        return Forecast.Mode[self.mode]

    report = models.JSONField(default=str)

    # Brief description of what new data is in this forecast
    # Only include the one or two most important features
    description = models.CharField(max_length=100, default='')

    alp_overall_win_pc = models.FloatField(default=50)
    lnp_overall_win_pc = models.FloatField(default=50)
    oth_overall_win_pc = models.FloatField(default=0)