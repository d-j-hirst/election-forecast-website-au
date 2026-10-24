"""Publication and public reads using the real database cache, with synthetic data."""
import json
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from unittest.mock import patch

from django.core.cache import cache
from django.core.management import call_command
from django.db import connection, connections, transaction, OperationalError
from django.http import Http404
from django.test import RequestFactory, TransactionTestCase, override_settings
from django.test.utils import CaptureQueriesContext

from forecast_api import serve
from forecast_api.cache_utils import RESPONSE_CACHE_TTL
from forecast_api.models import Election, Forecast
from forecast_api.results import update_results
from forecast_api.serve import (
    serve_election_results,
    serve_election_timeseries,
    serve_forecast,
    serve_forecast_archive_list,
)
from forecast_api.submit import submit_report, submit_results_update, submit_timeseries_update
from forecast_api.test_history import report_payload


DATABASE_CACHE = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'test_forecast_response_cache',
        'TIMEOUT': None,
    },
}


@override_settings(CACHES=DATABASE_CACHE)
class PublicationCacheTests(TransactionTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # The unmanaged cache table lives only in Django's disposable test DB.
        call_command('createcachetable', verbosity=0)

    def setUp(self):
        cache.clear()
        self.factory = RequestFactory()
        network = patch('requests.sessions.Session.request', side_effect=AssertionError(
            'Publication tests must not fetch external results',
        ))
        network.start()
        self.addCleanup(network.stop)
        self.publish()

    def post(self, handler, data):
        return handler(self.factory.post('/', json.dumps(data), content_type='application/json'))

    def publish(self, date='2026-08-13T12:00:00', label='Original', **kwargs):
        return self.post(submit_report, report_payload(date, label=label, **kwargs))

    def publish_results(self, value):
        return self.post(submit_results_update, {
            'termCode': 'testfed',
            'preFill': {'code': 'testfed', 'overall': {'tpp': value}, 'seats': {}},
        })

    def rebuild(self):
        return self.post(submit_timeseries_update, {'termCode': 'testfed', 'mode': 'FC'})

    def reads(self):
        return {
            'summary': lambda: serve_forecast('testfed', 'regular', -1),
            'archives': lambda: serve_forecast_archive_list('testfed'),
            'history': lambda: serve_election_timeseries('testfed', 'regular', -1),
            'results': lambda: serve_election_results('testfed', -1),
        }

    def assert_late_reader_cannot_hide_publication(self, read, update, extract, expected):
        # Pause after the old body has been fully read/validated, commit the
        # writer, then allow the old cache write. No timing or sleeps are needed.
        cache.clear()
        original_set = cache.set
        published = False

        def publish_before_set(*args, **kwargs):
            nonlocal published
            if not published:
                published = True
                update()
            return original_set(*args, **kwargs)

        with patch.object(cache, 'set', side_effect=publish_before_set):
            read()
        self.assertTrue(published)
        self.assertEqual(extract(read().data), expected)

    def test_late_summary_cache_write_cannot_hide_new_report(self):
        self.assert_late_reader_cannot_hide_publication(
            lambda: serve_forecast('testfed', 'regular', -1),
            lambda: self.publish('2026-08-13T13:00:00', 'Published'),
            lambda body: body['label'], 'Published',
        )

    def test_late_history_cache_write_cannot_hide_new_point(self):
        self.assert_late_reader_cannot_hide_publication(
            lambda: serve_election_timeseries('testfed', 'regular', -1),
            lambda: self.publish('2026-08-13T13:00:00', 'Published'),
            lambda body: body['timeseries'][-1]['label'], 'Published',
        )

    def test_late_archive_cache_write_cannot_hide_new_entry(self):
        self.assert_late_reader_cannot_hide_publication(
            lambda: serve_forecast_archive_list('testfed'),
            lambda: self.publish('2026-08-13T13:00:00', 'Published'),
            lambda body: body[1][0]['label'], 'Published',
        )

    def test_late_results_cache_write_cannot_hide_new_results(self):
        self.publish_results(50)
        self.assert_late_reader_cannot_hide_publication(
            lambda: serve_election_results('testfed', -1),
            lambda: self.publish_results(55),
            lambda body: body['results']['overall']['tpp'], 55,
        )

    def test_publication_succeeds_without_cache_invalidation(self):
        serve_election_timeseries('testfed', 'regular', -1)
        with patch.object(cache, 'delete_many', side_effect=RuntimeError('Cache unavailable')):
            response = self.publish('2026-08-13T13:00:00', 'Published')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            serve_election_timeseries('testfed', 'regular', -1).data['timeseries'][-1]['label'],
            'Published',
        )

    def test_head_body_overlap_retries_for_every_cached_response(self):
        for index, (scope, read) in enumerate(self.reads().items()):
            with self.subTest(scope=scope):
                cache.clear()
                original_get = cache.get
                published = False
                label = f'Published {index}'

                def publish_after_head(*args, **kwargs):
                    nonlocal published
                    if not published:
                        published = True
                        if scope == 'results':
                            self.publish_results(55)
                        else:
                            self.publish('2026-08-13T13:00:00', label)
                    return original_get(*args, **kwargs)

                with patch.object(cache, 'get', side_effect=publish_after_head):
                    response = read()
                self.assertTrue(published)
                self.assertEqual(response.status_code, 200)
                if scope == 'results':
                    self.assertEqual(response.data['results']['overall']['tpp'], 55)
                elif scope == 'history':
                    self.assertEqual(response.data['timeseries'][-1]['label'], label)
                elif scope == 'archives':
                    self.assertEqual(response.data[1][0]['label'], label)
                else:
                    self.assertEqual(response.data['label'], label)
                self.assertEqual(read().data, response.data)

    def test_missing_mode_is_rechecked_before_returning_404(self):
        original_check = serve._report_revision_matches
        published = False

        def add_mode_before_check(code, head):
            nonlocal published
            if not published:
                published = True
                self.publish(mode='NC')
            return original_check(code, head)

        with patch.object(serve, '_report_revision_matches', side_effect=add_mode_before_check):
            response = serve_forecast('testfed', 'nowcast', -1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['mode'], 'NC')

    def test_repeated_changes_return_bounded_503_through_real_routes(self):
        paths = {
            'summary': '/forecast-api/election-summary/testfed/regular',
            'archives': '/forecast-api/election-archives/testfed',
            'history': '/forecast-api/election-timeseries/testfed/regular/',
            'results': '/forecast-api/election-results/testfed/',
        }
        for scope, path in paths.items():
            with self.subTest(scope=scope):
                calls = 0

                def update_during_every_read(key):
                    nonlocal calls
                    calls += 1
                    if scope == 'results':
                        self.publish_results(50 + calls)
                    else:
                        self.publish('2026-08-13T13:00:00', f'{scope} {calls}')
                    return None

                with patch.object(serve, 'get_cached_response', side_effect=update_during_every_read), \
                        patch.object(cache, 'set') as cache_set:
                    response = self.client.get(path, secure=True)
                self.assertEqual(response.status_code, 503)
                self.assertEqual(response['Retry-After'], '1')
                self.assertIn('Please retry', response.json()['detail'])
                self.assertEqual(calls, 3)
                cache_set.assert_not_called()

    def test_old_validators_cannot_hide_new_publications(self):
        old_id = serve_forecast('testfed', 'regular', -1).data['id']
        old_version = serve_election_timeseries('testfed', 'regular', -1).data['version']
        self.publish_results(50)
        old_results_version = serve_election_results('testfed', -1).data['version']
        self.publish('2026-08-13T13:00:00', 'Published')
        self.publish_results(55)
        # Obsolete cache entries are deliberately still present at rollout.
        cache.set_many({
            'forecast_recent_id_FC_testfed': old_id,
            'forecast_recent_resp_FC_testfed': {'label': 'obsolete'},
            'timeseries_recent_id_FC_testfed': old_version,
            'timeseries_recent_resp_FC_testfed': {'version': old_version},
            'results_recent_id_testfed': old_results_version,
            'results_recent_resp_testfed': {'version': old_results_version},
            'forecast_archives_resp_testfed': ['obsolete', []],
        })
        for clear in (False, True):
            with self.subTest(cold=clear):
                if clear:
                    cache.clear()
                self.assertEqual(serve_forecast('testfed', 'regular', old_id).data['label'], 'Published')
                self.assertGreater(
                    serve_election_timeseries('testfed', 'regular', old_version).data['version'],
                    old_version,
                )
                self.assertGreater(
                    serve_election_results('testfed', old_results_version).data['version'],
                    old_results_version,
                )
                self.assertEqual(serve_forecast_archive_list('testfed').data[1][0]['label'], 'Published')

    def test_same_id_conditional_contract_is_preserved(self):
        original_id = serve_forecast('testfed', 'regular', -1).data['id']
        self.publish(label='Correction')
        for cold in (True, False):
            if cold:
                cache.clear()
            self.assertEqual(serve_forecast('testfed', 'regular', original_id).data, {'new': False})
            self.assertEqual(serve_forecast('testfed', 'regular', -1).data['label'], 'Correction')

    def test_warm_reads_and_unchanged_versions_only_read_election_metadata(self):
        for scope, read in self.reads().items():
            with self.subTest(scope=scope):
                body = read().data
                with CaptureQueriesContext(connection) as queries:
                    self.assertEqual(read().data, body)
                source_queries = [q['sql'] for q in queries if '"forecast_api_' in q['sql']]
                self.assertEqual(len(source_queries), 1)
                for blob in ('timeseries_fc', 'timeseries_nc', 'timeseries_lf', 'results'):
                    self.assertNotIn(f'"{blob}"', source_queries[0])
        cache.clear()
        with self.assertNumQueries(1):
            self.assertEqual(serve_election_timeseries('testfed', 'regular', 1).data, {'new': False})
        with self.assertNumQueries(1):
            self.assertEqual(serve_election_results('testfed', 0).data, {'new': False})

    def test_cache_errors_fall_back_to_database_without_payload_logging(self):
        for operation in ('get', 'set'):
            with self.subTest(operation=operation):
                cache.clear()
                with patch.object(cache, operation, side_effect=RuntimeError('private payload')), \
                        self.assertLogs('forecast_api.cache_utils', level='WARNING') as logs:
                    response = serve_forecast('testfed', 'regular', -1)
                self.assertEqual(response.data['label'], 'Original')
                self.assertNotIn('private payload', '\n'.join(logs.output))
        cache.clear()
        with patch.object(cache, 'set', return_value=False), \
                self.assertLogs('forecast_api.cache_utils', level='WARNING'):
            self.assertEqual(serve_forecast_archive_list('testfed').status_code, 200)

    def test_authoritative_database_errors_are_not_suppressed(self):
        with patch.object(serve, '_election_head', side_effect=OperationalError('Database unavailable')):
            with self.assertRaises(OperationalError):
                serve_forecast('testfed', 'regular', -1)

    def test_body_cache_entries_expire_and_contain_their_own_validator(self):
        original_set = cache.set
        for scope, read in self.reads().items():
            with self.subTest(scope=scope), patch.object(cache, 'set', wraps=original_set) as store:
                cache.clear()
                body = read().data
                store.assert_called_once()
                key, stored_body = store.call_args.args
                self.assertTrue(key.startswith('forecast:v2:testfed:e'))
                self.assertEqual(store.call_args.kwargs['timeout'], RESPONSE_CACHE_TTL)
                self.assertEqual(RESPONSE_CACHE_TTL, 3600)
                self.assertEqual(stored_body, body)

    def test_all_publication_paths_work_with_unavailable_cache(self):
        with patch.object(cache, 'get', side_effect=RuntimeError('offline')) as get, \
                patch.object(cache, 'set', side_effect=RuntimeError('offline')) as store, \
                patch.object(cache, 'delete_many', side_effect=RuntimeError('offline')) as delete:
            self.assertEqual(self.publish('2026-08-13T13:00:00').status_code, 200)
            self.assertEqual(self.rebuild().status_code, 200)
            self.assertEqual(self.publish_results(55).status_code, 200)
            Forecast.objects.order_by('date').first().delete()
            get.assert_not_called()
            store.assert_not_called()
            delete.assert_not_called()

    def test_source_data_and_revisions_roll_back_together(self):
        operations = {
            'submit': lambda: self.publish('2026-08-13T13:00:00', 'Rolled back'),
            'rebuild': self.rebuild,
            'delete': lambda: Forecast.objects.all().delete(),
            'results': lambda: self.publish_results(55),
        }
        before = Election.objects.values().get(code='testfed')
        reports_before = list(Forecast.objects.values())
        bodies_before = {scope: read().data for scope, read in self.reads().items()}
        for name, operation in operations.items():
            with self.subTest(operation=name):
                with self.assertRaisesRegex(RuntimeError, 'roll back'):
                    with transaction.atomic():
                        operation()
                        raise RuntimeError('roll back')
                self.assertEqual(Election.objects.values().get(code='testfed'), before)
                self.assertEqual(list(Forecast.objects.values()), reports_before)
                for scope, read in self.reads().items():
                    self.assertEqual(read().data, bodies_before[scope])

    @override_settings(CACHES={'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'uncommitted-publication-tests',
    }})
    def test_uncommitted_response_cannot_poison_a_reused_revision(self):
        # Unlike DatabaseCache, a separate cache does not roll back with SQL.
        # Ensure a speculative read never exports that transaction's data.
        cache.clear()
        with self.assertRaisesRegex(RuntimeError, 'roll back'):
            with transaction.atomic(), patch.object(cache, 'set') as store:
                self.publish('2026-08-13T13:00:00', 'Uncommitted')
                self.assertEqual(serve_forecast('testfed', 'regular', -1).data['label'], 'Uncommitted')
                store.assert_not_called()
                raise RuntimeError('roll back')
        self.publish('2026-08-13T13:00:00', 'Committed')
        self.assertEqual(serve_forecast('testfed', 'regular', -1).data['label'], 'Committed')

    def test_stale_results_import_preserves_newer_report_and_result_revisions(self):
        stale = Election.objects.get(code='testfed')
        self.publish('2026-08-13T13:00:00', 'Published')
        self.publish_results(51)
        before = Election.objects.values().get(code='testfed')
        new_results = {'code': 'testfed', 'overall': {'tpp': 55}, 'seats': {}}

        update_results(stale, new_results)

        after = Election.objects.values().get(code='testfed')
        self.assertEqual(after.pop('results'), new_results)
        self.assertEqual(after.pop('results_version'), before.pop('results_version') + 1)
        before.pop('results')
        self.assertEqual(after, before)

    def test_results_import_does_not_recreate_deleted_election(self):
        stale = Election.objects.get(code='testfed')
        Election.objects.all().delete()
        with self.assertRaises(Http404):
            update_results(stale, {'code': 'testfed', 'overall': {}, 'seats': {}})
        self.assertFalse(Election.objects.exists())

    def test_identical_and_backdated_reports_still_advance_report_revision(self):
        self.publish()
        election = Election.objects.get(code='testfed')
        self.assertEqual(election.report_revision, 2)
        self.assertEqual(election.timeseries_fc_version, 1)
        serve_forecast_archive_list('testfed')
        self.publish('2026-08-13T11:00:00', 'Backdated')
        election.refresh_from_db()
        self.assertEqual(election.report_revision, 3)
        self.assertEqual(serve_forecast('testfed', 'regular', -1).data['label'], 'Original')
        self.assertEqual(len(serve_forecast_archive_list('testfed').data[1]), 2)

    def test_delete_advances_report_revision_when_history_point_is_already_missing(self):
        Election.objects.filter(code='testfed').update(timeseries_fc=[])
        Forecast.objects.all().delete()
        election = Election.objects.get(code='testfed')
        self.assertEqual(election.report_revision, 2)
        self.assertEqual(election.timeseries_fc_version, 1)
        self.assertEqual(serve_forecast_archive_list('testfed').data[1], [])

    def test_late_cache_writes_cannot_restore_deleted_forecasts(self):
        cases = (
            (lambda: serve_forecast('testfed', 'regular', -1), lambda body: body['label'], 'Original'),
            (lambda: serve_forecast_archive_list('testfed'), lambda body: len(body[1]), 1),
            (lambda: serve_election_timeseries('testfed', 'regular', -1), lambda body: len(body['timeseries']), 1),
        )
        for read, extract, expected in cases:
            self.publish('2026-08-13T13:00:00', 'Latest')
            self.assert_late_reader_cannot_hide_publication(
                read, lambda: Forecast.objects.filter(label='Latest').delete(), extract, expected,
            )

    def test_late_cache_writes_cannot_hide_reconstruction(self):
        cases = (
            (lambda: serve_forecast('testfed', 'regular', -1), lambda body: body['label']),
            (lambda: serve_forecast_archive_list('testfed'), lambda body: body[1][0]['label']),
            (lambda: serve_election_timeseries('testfed', 'regular', -1), lambda body: body['timeseries'][0]['label']),
        )
        for read, extract in cases:
            self.publish()

            def edit_and_rebuild():
                Forecast.objects.all().update(label='Reconstructed')
                self.rebuild()

            self.assert_late_reader_cannot_hide_publication(read, edit_and_rebuild, extract, 'Reconstructed')

    def test_deletion_during_late_cache_write_stays_missing(self):
        for scope in self.reads():
            with self.subTest(scope=scope):
                if not Election.objects.exists():
                    self.publish()
                read = self.reads()[scope]
                cache.clear()
                original_set = cache.set

                def delete_before_set(*args, **kwargs):
                    Election.objects.all().delete()
                    return original_set(*args, **kwargs)

                with patch.object(cache, 'set', side_effect=delete_before_set):
                    read()
                with self.assertRaises(Http404):
                    read()

    def test_late_readers_on_separate_database_connections(self):
        # Exercise actual independently committed reader/writer connections,
        # holding the reader only after its source queries have completed.
        for index, (scope, read) in enumerate(self.reads().items()):
            with self.subTest(scope=scope):
                cache.clear()
                ready, resume = Event(), Event()
                reader_connections = []
                original_store = serve.set_cached_response

                def paused_store(key, body):
                    reader_connections.append(id(connection.connection))
                    ready.set()
                    if not resume.wait(5):
                        raise AssertionError('Reader was not resumed')
                    original_store(key, body)

                def reader():
                    try:
                        return read()
                    finally:
                        connections.close_all()

                with patch.object(serve, 'set_cached_response', side_effect=paused_store), \
                        ThreadPoolExecutor(max_workers=1) as workers:
                    pending = workers.submit(reader)
                    try:
                        self.assertTrue(ready.wait(5), 'Reader did not reach cache publication')
                        if scope == 'results':
                            self.publish_results(55)
                        else:
                            self.publish('2026-08-13T13:00:00', f'Concurrent {index}')
                        self.assertNotEqual(reader_connections[0], id(connection.connection))
                    finally:
                        resume.set()
                    old_response = pending.result(timeout=5)
                current = read()
                self.assertEqual(current.status_code, 200)
                self.assertNotEqual(current.data, old_response.data)
                if scope == 'summary':
                    self.assertEqual(current.data['label'], f'Concurrent {index}')
                elif scope == 'archives':
                    self.assertEqual(current.data[1][0]['label'], f'Concurrent {index}')
                elif scope == 'history':
                    self.assertEqual(current.data['timeseries'][-1]['label'], f'Concurrent {index}')
                else:
                    self.assertEqual(current.data['results']['overall']['tpp'], 55)

    def test_name_changes_and_manual_reconstruction_publish_archive_metadata(self):
        serve_forecast_archive_list('testfed')
        payload = report_payload('2026-08-13T12:00:00', label='Original')
        payload['electionName'] = 'Published name'
        self.post(submit_report, payload)
        self.assertEqual(serve_forecast_archive_list('testfed').data[0], 'Published name')
        Election.objects.filter(code='testfed').update(name='Reconstructed name')
        self.rebuild()
        self.assertEqual(serve_forecast_archive_list('testfed').data[0], 'Reconstructed name')

    def test_recreated_election_uses_distinct_server_cache_identity(self):
        self.publish_results(50)
        old_election = Election.objects.get(code='testfed')
        for read in self.reads().values():
            read()
        old_election.delete()
        self.publish(label='Replacement')
        self.publish_results(55)
        self.assertEqual(serve_forecast('testfed', 'regular', -1).data['label'], 'Replacement')
        self.assertEqual(serve_forecast_archive_list('testfed').data[1][0]['label'], 'Replacement')
        self.assertEqual(
            serve_election_timeseries('testfed', 'regular', -1).data['timeseries'][0]['label'],
            'Replacement',
        )
        self.assertEqual(serve_election_results('testfed', -1).data['results']['overall']['tpp'], 55)
        # Server identity does not change the legacy bare-version client contract.
        self.assertEqual(serve_election_timeseries('testfed', 'regular', 1).data, {'new': False})
        self.assertEqual(serve_election_results('testfed', 1).data, {'new': False})
