from datetime import datetime, timezone

from django.core.cache import cache
from django.http import Http404
from django.test import TestCase, override_settings

from forecast_api.models import Election, Forecast
from forecast_api.serve import (
    serve_election_results,
    serve_election_timeseries,
    serve_forecast,
    serve_forecast_archive,
)


TEST_CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'forecast-serving-tests',
    },
}
ELECTION_BLOBS = ('timeseries_fc', 'timeseries_nc', 'timeseries_lf', 'results')


@override_settings(CACHES=TEST_CACHES)
class ForecastServingTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Distinct payloads expose mode/response mixups as well as accidental
        # full-election reads. No generated forecast or real database is needed.
        cls.election = Election.objects.create(
            code='testfed',
            name='Test election',
            timeseries_fc=[{'label': 'Regular history'}],
            timeseries_fc_version=2,
            timeseries_nc=[{'label': 'Nowcast history'}],
            timeseries_nc_version=3,
            timeseries_lf=[{'label': 'Live history'}],
            timeseries_lf_version=4,
            results={'overall': {'tpp': 51}},
            results_version=5,
        )
        cls.other_election = Election.objects.create(code='other', name='Other election')
        cls.forecasts = {}
        for mode in ('FC', 'NC', 'LF'):
            cls.forecasts[mode] = Forecast.objects.create(
                election=cls.election,
                date=datetime(2026, 10, 25, 12, tzinfo=timezone.utc),
                mode=mode,
                label=f'{mode} report',
                flags='test flag',
                report={'fixture': mode},
            )

    def setUp(self):
        cache.clear()

    def assert_no_unrelated_election_blobs(self, queries, allowed=()):
        # Query count alone cannot detect megabytes of unnecessary JSON. Check
        # every captured query so deferred field access cannot hide extra loads.
        for query in queries:
            for field in ELECTION_BLOBS:
                if field not in allowed:
                    self.assertNotIn(f'"{field}"', query['sql'])

    def test_latest_forecast_excludes_election_blobs_and_preserves_response(self):
        for route_mode, stored_mode in (
            ('regular', 'FC'), ('nowcast', 'NC'), ('live', 'LF'),
        ):
            with self.subTest(mode=route_mode):
                with self.assertNumQueries(2) as queries:
                    response = serve_forecast('testfed', route_mode, -1)
                self.assert_no_unrelated_election_blobs(queries.captured_queries)
                forecast = self.forecasts[stored_mode]
                self.assertEqual(response.data, {
                    'report': forecast.report,
                    'label': forecast.label,
                    'mode': stored_mode,
                    'date': forecast.date,
                    'flags': forecast.flags,
                    'id': forecast.id,
                    'new': True,
                })

    def test_archive_excludes_election_blobs_and_preserves_response(self):
        forecast = self.forecasts['NC']
        with self.assertNumQueries(2) as queries:
            response = serve_forecast_archive('testfed', forecast.id)
        self.assert_no_unrelated_election_blobs(queries.captured_queries)
        self.assertEqual(response.data, {
            'report': forecast.report,
            'mode': forecast.mode,
            'label': forecast.label,
            'date': forecast.date,
            'flags': forecast.flags,
            'id': forecast.id,
        })

    def test_history_selects_only_its_mode_and_version(self):
        for route_mode, field, version in (
            ('regular', 'timeseries_fc', 2),
            ('nowcast', 'timeseries_nc', 3),
            ('live', 'timeseries_lf', 4),
        ):
            with self.subTest(mode=route_mode):
                with self.assertNumQueries(1) as queries:
                    response = serve_election_timeseries('testfed', route_mode, -1)
                self.assert_no_unrelated_election_blobs(queries.captured_queries, (field,))
                self.assertEqual(response.data, {
                    'timeseries': getattr(self.election, field),
                    'code': 'testfed', 'mode': route_mode, 'version': version, 'new': True,
                })

    def test_results_excludes_histories_and_preserves_response(self):
        with self.assertNumQueries(1) as queries:
            response = serve_election_results('testfed', -1)
        self.assert_no_unrelated_election_blobs(queries.captured_queries, ('results',))
        self.assertEqual(response.data, {
            'results': self.election.results,
            'code': 'testfed', 'version': 5, 'new': True,
        })

    def test_unchanged_history_and_results_still_exclude_unrelated_blobs(self):
        # Cover the cold-cache conditional-read branch without changing the
        # existing public version protocol as part of the query projection fix.
        with self.assertNumQueries(1) as queries:
            response = serve_election_timeseries('testfed', 'nowcast', 3)
        self.assert_no_unrelated_election_blobs(queries.captured_queries, ('timeseries_nc',))
        self.assertEqual(response.data, {'new': False})
        with self.assertNumQueries(1) as queries:
            response = serve_election_results('testfed', 5)
        self.assert_no_unrelated_election_blobs(queries.captured_queries, ('results',))
        self.assertEqual(response.data, {'new': False})

    def test_unknown_election_returns_json_404_with_or_without_cached_id(self):
        for suffix in ('', f'/{self.forecasts["FC"].id}'):
            with self.subTest(suffix=suffix):
                response = self.client.get(
                    f'/forecast-api/election-summary/missing/regular{suffix}', secure=True,
                )
                self.assertEqual(response.status_code, 404)
                self.assertEqual(response.json(), {'detail': 'Election does not exist'})

    def test_deleted_election_returns_json_404_after_normal_invalidation(self):
        # Deletion invalidates populated caches only after commit. Execute the
        # callback inside this test transaction before exercising the real view.
        forecast_id = self.forecasts['FC'].id
        serve_forecast('testfed', 'regular', -1)
        with self.captureOnCommitCallbacks(execute=True):
            self.election.delete()
        for suffix in ('', f'/{forecast_id}'):
            with self.subTest(suffix=suffix):
                response = self.client.get(
                    f'/forecast-api/election-summary/testfed/regular{suffix}', secure=True,
                )
                self.assertEqual(response.status_code, 404)
                self.assertEqual(response.json(), {'detail': 'Election does not exist'})

    def test_missing_and_invalid_modes_keep_their_404_responses(self):
        for code, mode, detail in (
            ('other', 'regular', 'Election does not have a forecast for this mode.'),
            ('testfed', 'invalid', 'Invalid mode'),
        ):
            with self.subTest(code=code, mode=mode):
                response = self.client.get(
                    f'/forecast-api/election-summary/{code}/{mode}', secure=True,
                )
                self.assertEqual(response.status_code, 404)
                self.assertEqual(response.json(), {'detail': detail})

    def test_archive_stays_scoped_to_its_election(self):
        with self.assertRaises(Http404):
            serve_forecast_archive('other', self.forecasts['FC'].id)
