import json
from datetime import datetime, timezone

from django.core.cache import cache
from django.db import IntegrityError
from django.test import RequestFactory, TransactionTestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate

from forecast_api.models import Election, Forecast
from forecast_api.history import HistoryCorruptionError
from forecast_api.serve import serve_forecast_archive_list
from forecast_api.submit import submit_report
from forecast_api.views import SubmitReportResponse, SubmitTimeseriesUpdateResponse
from users.models import User


TEST_CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'forecast-history-tests',
    },
}


def report_payload(
    report_date,
    mode='RF',
    label='Test report',
    majority=50,
):
    return {
        'termCode': 'testfed',
        'electionName': 'Test election',
        'reportLabel': label,
        'reportDate': report_date,
        'reportMode': mode,
        'flags': '',
        'majorityWinPc': [majority, 100 - majority],
        'minorityWinPc': [10, 10],
        'mostSeatsWinPc': [55, 45],
        'overallWinPc': [60, 40],
        'tppFrequencies': [48, 49, 50],
        'seatCountFrequencies': [[0, [70, 71, 72]]],
    }


@override_settings(CACHES=TEST_CACHES)
class ForecastHistoryTests(TransactionTestCase):
    def setUp(self):
        self.request_factory = RequestFactory()
        self.api_factory = APIRequestFactory()
        self.user = User.objects.create_superuser(
            email='history@example.com',
            password='password',
        )
        cache.clear()

    def submit(self, payload):
        request = self.request_factory.post(
            '/forecast-api/submit-report',
            data=json.dumps(payload),
            content_type='application/json',
        )
        return submit_report(request)

    def submit_through_view(self, payload):
        request = self.api_factory.post(
            '/forecast-api/submit-report',
            payload,
            format='json',
        )
        force_authenticate(request, user=self.user)
        return SubmitReportResponse.as_view()(request)

    def rebuild(self, payload):
        request = self.api_factory.post(
            '/forecast-api/submit-timeseries-update',
            payload,
            format='json',
        )
        force_authenticate(request, user=self.user)
        return SubmitTimeseriesUpdateResponse.as_view()(request)

    def test_incremental_submission_distinguishes_exact_same_day_times(self):
        later = report_payload(
            '2026-08-13T12:01:00',
            label='Later report',
        )
        earlier = report_payload(
            '2026-08-13T12:00:00',
            label='Earlier report',
        )

        self.submit(later)
        self.submit(earlier)

        election = Election.objects.get(code='testfed')
        self.assertEqual(Forecast.objects.count(), 2)
        self.assertEqual(
            list(Forecast.objects.values_list('mode', flat=True)),
            ['FC', 'FC'],
        )
        self.assertEqual(Forecast.objects.first().report['reportMode'], 'RF')
        self.assertEqual(
            [point['label'] for point in election.timeseries_fc],
            ['Earlier report', 'Later report'],
        )
        self.assertEqual(election.timeseries_fc_version, 2)
        self.assertEqual(election.timeseries_nc_version, 0)

    def test_exact_timepoint_resubmission_replaces_history_and_forecast(self):
        original = report_payload(
            '2026-08-13T12:00:00',
            label='Original',
        )
        replacement = report_payload(
            '2026-08-13T12:00:00',
            label='Corrected',
            majority=65,
        )

        self.submit(original)
        self.submit(replacement)

        election = Election.objects.get(code='testfed')
        forecast = Forecast.objects.get()
        self.assertEqual(Forecast.objects.count(), 1)
        self.assertEqual(len(election.timeseries_fc), 1)
        self.assertEqual(election.timeseries_fc[0]['label'], 'Corrected')
        self.assertEqual(election.timeseries_fc[0]['majorityWinPc'], [65, 35])
        self.assertEqual(forecast.label, 'Corrected')
        self.assertEqual(election.timeseries_fc_version, 2)

    def test_invalid_report_mode_returns_400_through_submission_view(self):
        payload = report_payload('2026-08-13T12:00:00', mode='FC')

        response = self.submit_through_view(payload)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Forecast.objects.count(), 0)

    def test_offset_date_is_canonical_and_stable_across_rebuild(self):
        payload = report_payload('2026-08-13T12:00:00+10:00')
        self.submit(payload)
        election = Election.objects.get(code='testfed')
        incremental_date = election.timeseries_fc[0]['date']

        response = self.rebuild({'termCode': 'testfed', 'mode': 'FC'})

        election.refresh_from_db()
        forecast = Forecast.objects.get()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(incremental_date, '2026-08-13 02:00:00+00:00')
        self.assertEqual(election.timeseries_fc[0]['date'], incremental_date)
        self.assertEqual(
            forecast.report['reportDate'],
            '2026-08-13T12:00:00+10:00',
        )

    def test_z_date_is_accepted_and_stored_in_canonical_utc_format(self):
        self.submit(report_payload('2026-08-13T12:00:00Z'))

        election = Election.objects.get(code='testfed')
        self.assertEqual(
            election.timeseries_fc[0]['date'],
            '2026-08-13 12:00:00+00:00',
        )

    def test_fractional_date_keeps_exact_identity_across_rebuild(self):
        payload = report_payload('2026-08-13T12:00:00.123456Z')
        self.submit(payload)
        self.submit(payload)

        election = Election.objects.get(code='testfed')
        incremental_date = election.timeseries_fc[0]['date']
        self.rebuild({'termCode': 'testfed', 'mode': 'FC'})

        election.refresh_from_db()
        self.assertEqual(Forecast.objects.count(), 1)
        self.assertEqual(len(election.timeseries_fc), 1)
        self.assertEqual(
            incremental_date,
            '2026-08-13 12:00:00.123456+00:00',
        )
        self.assertEqual(election.timeseries_fc[0]['date'], incremental_date)

    def test_history_version_does_not_change_when_summary_is_identical(self):
        payload = report_payload('2026-08-13T12:00:00')
        self.submit(payload)
        payload['flags'] = 'updated-non-history-field'
        cache.set('forecast_recent_resp_FC_testfed', 'stale')
        cache.set('timeseries_recent_resp_FC_testfed', 'preserve')

        self.submit(payload)

        election = Election.objects.get(code='testfed')
        self.assertEqual(election.timeseries_fc_version, 1)
        self.assertEqual(Forecast.objects.get().flags, 'updated-non-history-field')
        self.assertIsNone(cache.get('forecast_recent_resp_FC_testfed'))
        self.assertEqual(
            cache.get('timeseries_recent_resp_FC_testfed'),
            'preserve',
        )

    def test_submission_clears_only_affected_mode_caches(self):
        cache.set('forecast_recent_resp_FC_testfed', 'stale')
        cache.set('timeseries_recent_resp_FC_testfed', 'stale')
        cache.set('forecast_recent_resp_NC_testfed', 'preserve')
        cache.set('timeseries_recent_resp_NC_testfed', 'preserve')

        self.submit(report_payload('2026-08-13T12:00:00'))

        self.assertIsNone(cache.get('forecast_recent_resp_FC_testfed'))
        self.assertIsNone(cache.get('timeseries_recent_resp_FC_testfed'))
        self.assertEqual(
            cache.get('forecast_recent_resp_NC_testfed'),
            'preserve',
        )
        self.assertEqual(
            cache.get('timeseries_recent_resp_NC_testfed'),
            'preserve',
        )

    def test_optional_history_fields_default_to_empty_lists(self):
        self.submit(report_payload('2026-08-13T12:00:00'))

        point = Election.objects.get(code='testfed').timeseries_fc[0]
        self.assertEqual(point['fpFrequencies'], [])
        self.assertEqual(point['coalitionFpFrequencies'], [])
        self.assertEqual(point['coalitionSeatCountFrequencies'], [])

    def test_single_mode_rebuild_is_authoritative_and_isolated(self):
        self.submit(report_payload('2026-08-13T10:00:00', mode='RF'))
        self.submit(report_payload('2026-08-13T11:00:00', mode='NC'))
        election = Election.objects.get(code='testfed')
        election.timeseries_fc = [{'date': 'preserve-fc'}]
        election.timeseries_nc = [{'date': 'orphaned-nc'}]
        election.save(update_fields=['timeseries_fc', 'timeseries_nc'])
        old_fc_version = election.timeseries_fc_version
        old_nc_version = election.timeseries_nc_version
        cache.set('forecast_recent_resp_NC_testfed', 'stale')
        cache.set('timeseries_recent_resp_NC_testfed', 'stale')
        cache.set('forecast_archives_resp_testfed', 'stale')

        response = self.rebuild({'termCode': 'testfed', 'mode': 'NC'})

        election.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['rebuilt'], {'NC': 1})
        self.assertEqual(election.timeseries_fc, [{'date': 'preserve-fc'}])
        self.assertEqual(election.timeseries_fc_version, old_fc_version)
        self.assertEqual(len(election.timeseries_nc), 1)
        self.assertEqual(election.timeseries_nc[0]['label'], 'Test report')
        self.assertEqual(election.timeseries_nc_version, old_nc_version + 1)
        self.assertIsNone(cache.get('forecast_recent_resp_NC_testfed'))
        self.assertIsNone(cache.get('timeseries_recent_resp_NC_testfed'))
        self.assertIsNone(cache.get('forecast_archives_resp_testfed'))

    def test_rebuild_without_mode_rebuilds_all_modes(self):
        self.submit(report_payload('2026-08-13T10:00:00', mode='RF'))
        self.submit(report_payload('2026-08-13T11:00:00', mode='NC'))

        response = self.rebuild({'termCode': 'testfed'})

        self.assertEqual(
            response.data['rebuilt'],
            {'FC': 1, 'NC': 1, 'LF': 0},
        )

    def test_invalid_rebuild_mode_returns_400_without_changes(self):
        self.submit(report_payload('2026-08-13T10:00:00'))
        election = Election.objects.get(code='testfed')
        old_series = election.timeseries_fc
        old_version = election.timeseries_fc_version

        response = self.rebuild({'termCode': 'testfed', 'mode': 'invalid'})

        election.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertEqual(election.timeseries_fc, old_series)
        self.assertEqual(election.timeseries_fc_version, old_version)

    def test_individual_deletion_removes_exact_history_point(self):
        self.submit(report_payload('2026-08-13T10:00:00'))
        self.submit(report_payload('2026-08-13T11:00:00'))
        forecast = Forecast.objects.order_by('date').first()
        election = Election.objects.get(code='testfed')
        old_version = election.timeseries_fc_version
        cache.set('forecast_recent_resp_FC_testfed', 'stale')
        cache.set('timeseries_recent_resp_FC_testfed', 'stale')

        forecast.delete()

        election.refresh_from_db()
        self.assertEqual(len(election.timeseries_fc), 1)
        self.assertIn('11:00:00', election.timeseries_fc[0]['date'])
        self.assertEqual(election.timeseries_fc_version, old_version + 1)
        self.assertIsNone(cache.get('forecast_recent_resp_FC_testfed'))
        self.assertIsNone(cache.get('timeseries_recent_resp_FC_testfed'))

    def test_queryset_deletion_removes_each_history_point(self):
        self.submit(report_payload('2026-08-13T10:00:00'))
        self.submit(report_payload('2026-08-13T11:00:00'))

        Forecast.objects.all().delete()

        election = Election.objects.get(code='testfed')
        self.assertEqual(election.timeseries_fc, [])

    def test_election_cascade_deletion_succeeds(self):
        self.submit(report_payload('2026-08-13T10:00:00'))
        election = Election.objects.get(code='testfed')
        cache_keys = [
            'forecast_archives_resp_testfed',
            'results_recent_id_testfed',
            'results_recent_resp_testfed',
        ]
        for mode in ('FC', 'NC', 'LF'):
            cache_keys.extend([
                f'forecast_recent_id_{mode}_testfed',
                f'forecast_recent_resp_{mode}_testfed',
                f'timeseries_recent_id_{mode}_testfed',
                f'timeseries_recent_resp_{mode}_testfed',
            ])
        cache.set_many({key: 'stale' for key in cache_keys})

        election.delete()

        self.assertEqual(Election.objects.count(), 0)
        self.assertEqual(Forecast.objects.count(), 0)
        self.assertEqual(cache.get_many(cache_keys), {})

    def test_corrupt_existing_date_fails_loudly_and_rolls_back(self):
        Election.objects.create(
            code='testfed',
            name='Test election',
            timeseries_fc=[{'label': 'missing date'}],
        )

        with self.assertRaisesRegex(
            HistoryCorruptionError,
            'run a complete FC reconstruction',
        ):
            self.submit(report_payload('2026-08-13T12:00:00'))

        self.assertEqual(Forecast.objects.count(), 0)

    def test_rebuild_repairs_out_of_band_delete_and_clears_caches(self):
        self.submit(report_payload('2026-08-13T12:00:00'))
        Forecast.objects.all()._raw_delete(using='default')
        cache.set('forecast_recent_resp_FC_testfed', 'stale')
        cache.set('timeseries_recent_resp_FC_testfed', 'stale')
        cache.set('forecast_archives_resp_testfed', 'stale')

        response = self.rebuild({'termCode': 'testfed', 'mode': 'FC'})

        election = Election.objects.get(code='testfed')
        self.assertEqual(response.data['rebuilt'], {'FC': 0})
        self.assertEqual(election.timeseries_fc, [])
        self.assertIsNone(cache.get('forecast_recent_resp_FC_testfed'))
        self.assertIsNone(cache.get('timeseries_recent_resp_FC_testfed'))
        self.assertIsNone(cache.get('forecast_archives_resp_testfed'))

    def test_unique_constraint_rejects_duplicate_exact_timepoint(self):
        election = Election.objects.create(code='testfed', name='Test')
        date = datetime(2026, 8, 13, 12, tzinfo=timezone.utc)
        payload = report_payload('2026-08-13T12:00:00')
        Forecast.objects.create(
            election=election,
            date=date,
            mode='FC',
            report=payload,
        )

        with self.assertRaises(IntegrityError):
            Forecast.objects.create(
                election=election,
                date=date,
                mode='FC',
                report=payload,
            )

    def test_archive_list_does_not_select_report_payloads(self):
        self.submit(report_payload('2026-08-13T12:00:00'))
        cache.clear()

        with self.assertNumQueries(2) as context:
            response = serve_forecast_archive_list('testfed')

        forecast_query = context.captured_queries[1]['sql']
        self.assertNotIn('"report"', forecast_query)
        self.assertEqual(response.data[1][0]['label'], 'Test report')
