from django.db import models
from datetime import datetime
from django.utils.translation import gettext_lazy as _

class Election(models.Model):
    # Shorthand code for the election
    # This will be used for querying and the URL
    code = models.CharField(max_length=10, unique=True)

    # Descriptive name of the election
    name = models.CharField(max_length=100)

    # Publication of any report or archive metadata advances this in the same
    # transaction. Public readers use it to select immutable cached bodies.
    report_revision = models.PositiveBigIntegerField(default=0, editable=False)

    timeseries_fc = models.JSONField(default=str)

    timeseries_fc_version = models.IntegerField(default=0)

    timeseries_nc = models.JSONField(default=str)

    timeseries_nc_version = models.IntegerField(default=0)

    timeseries_lf = models.JSONField(default=str)

    timeseries_lf_version = models.IntegerField(default=0)

    results = models.JSONField(default=str)

    results_version = models.IntegerField(default=0)

    def advance_report_revision(self):
        # Call inside the source write's transaction, including reconstruction
        # after manual report/name edits. Never save an old in-memory counter.
        Election.objects.using(self._state.db).filter(pk=self.pk).update(
            report_revision=models.F('report_revision') + 1,
        )
    
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

    # Election history is derived from this report by submit_report, forecast
    # deletion signals, and the explicit reconstruction endpoint. Direct ORM or
    # admin edits must be followed by reconstruction to publish consistent
    # history and a new report revision. Clearing the cache alone is insufficient.
    report = models.JSONField(default=str)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['election', 'mode', 'date'],
                name='forecast_unique_election_mode_date',
            ),
        ]

    def get_mode(self) -> Mode:
        return Forecast.Mode[self.mode]
    
    def __str__(self):
        return (self.label + " - " + self.election.name + " - " + 
                self.mode + " - " + str(self.date).split('+')[0])
