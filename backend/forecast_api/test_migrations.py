"""Check the additive publication revision against pre-existing synthetic data."""
from datetime import datetime, timezone

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase


class ReportRevisionMigrationTests(TransactionTestCase):
    def test_upgrade_preserves_large_existing_elections_and_reports(self):
        previous = [('forecast_api', '0016_forecast_unique_timepoint')]
        current = [('forecast_api', '0017_election_report_revision')]
        executor = MigrationExecutor(connection)
        executor.migrate(previous)
        # Restore the current schema even if an assertion in the rehearsal fails.
        self.addCleanup(lambda: MigrationExecutor(connection).migrate(current))
        apps = executor.loader.project_state(previous).apps
        OldElection = apps.get_model('forecast_api', 'Election')
        OldForecast = apps.get_model('forecast_api', 'Forecast')
        large_series = [{'date': f'fixture-{i}', 'values': list(range(100))} for i in range(1500)]
        election = OldElection.objects.create(
            code='testfed', name='Existing election',
            timeseries_fc=large_series, timeseries_fc_version=12,
            timeseries_nc=large_series, timeseries_nc_version=34,
            timeseries_lf=large_series, timeseries_lf_version=56,
            results={'code': 'testfed', 'overall': {'tpp': 51}}, results_version=7,
        )
        empty = OldElection.objects.create(code='empty', name='Empty election')
        report = OldForecast.objects.create(
            election=election, mode='FC', date=datetime(2026, 8, 13, tzinfo=timezone.utc),
            label='Existing report', flags='existing', report={'synthetic': [1, 2, 3]},
        )
        before = list(OldElection.objects.order_by('id').values())
        forecast_before = OldForecast.objects.values().get(pk=report.pk)

        executor = MigrationExecutor(connection)
        executor.migrate(current)

        apps = executor.loader.project_state(current).apps
        NewElection = apps.get_model('forecast_api', 'Election')
        NewForecast = apps.get_model('forecast_api', 'Forecast')
        after = list(NewElection.objects.order_by('id').values())
        for row in after:
            self.assertEqual(row.pop('report_revision'), 0)
        self.assertEqual(after, before)
        self.assertEqual(NewForecast.objects.values().get(pk=report.pk), forecast_before)
        self.assertEqual(NewElection.objects.get(pk=empty.pk).timeseries_fc, '')
        self.assertEqual(NewElection.objects.create(code='new', name='New election').report_revision, 0)
