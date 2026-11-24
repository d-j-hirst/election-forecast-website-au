import hashlib
import json

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from forecast_api.live_data import compact_booths, movements, pack, seat_series
from forecast_api.models import LiveRun, LivePublication, Forecast, SeatHistoryBlock


@override_settings(SECURE_SSL_REDIRECT=False, LOCAL_REPLAY_ENABLED=True)
class PublicationTests(TestCase):
    def setUp(self):
        self.api = APIClient(HTTP_HOST='localhost')
        self.user = get_user_model().objects.create_superuser('operator@example.test', None)
        self.api.force_authenticate(self.user)
        self.base = '/forecast-api/live/v1'
        self.run = dict(version=1, run_id='demo', kind='replay', election='2026sa',
                        display_name='Test replay', timezone='Australia/Adelaide',
                        visibility='private', election_date='2026-03-21')
        self.assertEqual(self.api.post(self.base+'/runs', self.run, format='json').status_code, 200)

    def send(self, identity, time=None, run=None, **extra):
        run = run or self.run
        body = dict(run=run, schema_version=1, frozen=True, released_at='2026-11-01T02:00:00Z',
                    forecast=dict(forecast_id=identity, source_time=time, origin=identity=='origin',
                                  simulation='test', input_revision='1', input_fingerprint='test',
                                  source_fingerprint=None, model_revision='1', iterations=1000,
                                  source_timezone='Australia/Adelaide', delivered_at='2026-11-01T01:59:00Z',
                                  completed_at='2026-11-01T02:00:00Z'),
                    report=dict(termCode=run['election'], seatNames=['Sample'], seatPartyWinFrequencies=[[[0, 72.314]]]),
                    comparisons={}, commentary={}, commentary_requests={}, commentary_evidence={})
        body.update(extra)
        raw = json.dumps(body).encode()
        return self.api.post(self.base+'/runs/'+run['run_id']+'/forecasts/'+identity, raw,
                content_type='application/json', HTTP_IDEMPOTENCY_KEY=run['run_id']+'/'+identity,
                HTTP_X_CONTENT_SHA256=hashlib.sha256(raw).hexdigest())

    def test_immutable_publications_and_late_rebuild(self):
        self.assertEqual(self.send('origin').data['latest_forecast_id'], None)
        first = self.send('f00000033','2026-03-21T20:00:00+11:00')
        self.assertEqual(first.status_code, 200)
        late = self.send('f00000001','2026-03-21T08:59:59Z')
        self.assertEqual(late.data['latest_forecast_id'], 'f00000033')
        same_time = self.send('f00000034','2026-03-21T09:00:00Z')
        self.assertEqual(same_time.data['latest_forecast_id'], 'f00000034')
        repeat = self.send('f00000033','2026-03-21T20:00:00+11:00')
        self.assertEqual(repeat.data['published_at'], first.data['published_at'])
        self.assertEqual(repeat.data['latest_forecast_id'], 'f00000034')
        self.assertEqual(self.send('f00000033','2026-03-21T12:20:00Z').status_code, 409)
        self.assertEqual(self.api.post(self.base+'/runs',dict(self.run,visibility='public'),format='json').status_code,409)
        run = LiveRun.objects.get()
        self.assertEqual((run.revision, LivePublication.objects.count(), Forecast.objects.count()), (4,4,0))
        before = list(SeatHistoryBlock.objects.order_by('block').values_list('points', flat=True))
        call_command('rebuild_live_seat_history','demo')
        self.assertEqual(before, list(SeatHistoryBlock.objects.order_by('block').values_list('points', flat=True)))
        self.assertEqual(seat_series(run,'Sample')[-1][1][0][2],7231)

    def test_seat_vote_intervals_rank_each_update_and_backfill_win_only_blocks(self):
        # Deliberately change both the percentile layout and pair orientation.
        # The named candidate's vote share must keep the same meaning throughout.
        pairs = [[1, 0], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]]
        report = dict(termCode='2026sa', seatNames=['Sample'], seatPartyWinFrequencies=[[[0, 78]]],
                      seatCandidateNames=[[[0, 'Ada'], [1, 'Bill']]], probabilityBands=[50, 95, 5],
                      seatFpBands=[[[0, [29.34, 31.76, 21.01]], [2, [0, 0, 0]]]],
                      seatTcpBands=[[[pair, [37.12, 45.04, 30.21]] for pair in pairs]])
        def publish(sequence, frequencies):
            data = dict(report, seatTcpScenarios=[list(zip(pairs, frequencies))])
            return self.send(f'f{sequence:08}', f'2026-03-21T09:00:0{sequence}Z', report=data)

        self.assertEqual(publish(3, [.4, .2, .2, .1, .09, .001, .0010000000474974513]).status_code, 200)
        self.assertEqual(publish(1, [.0010001, .001, .0010000000474974513, 0, 0, 0, 0]).status_code, 200)
        self.assertEqual(publish(2, [0, .4, .2, .2, .1, .09, 0]).status_code, 200)
        run = LiveRun.objects.get()
        series = seat_series(run, 'Sample')
        self.assertEqual(series[0][2], [[[0, 'Ada'], [210, 293, 318]], [[2, None], [0, 0, 0]]])
        self.assertEqual(series[0][3], [[[[0, 'Ada'], [1, 'Bill']], [550, 629, 698]]])
        self.assertEqual([[pair[1][0] for pair, _ in point[3]] for point in series],
                         [[1], [2, 3, 4, 5], [1, 2, 3, 4]])
        SeatHistoryBlock.objects.update(points=pack({'1': series[0][1]}))
        self.assertEqual(seat_series(run, 'Sample')[0][1:], [series[0][1], [], []])
        call_command('rebuild_live_seat_history', run.pk)
        self.assertEqual(seat_series(run, 'Sample'), series)

    def test_isolation_and_replay_visibility(self):
        reader = APIClient(HTTP_HOST='localhost')
        official = dict(self.run,run_id='official',kind='live',visibility='public')
        self.api.post(self.base+'/runs',official,format='json')
        LiveRun.objects.filter(pk='official').update(official=True)
        self.send('f00000001','2026-03-21T09:00:00Z',run=official)
        self.send('f00000002','2026-03-21T09:01:00Z')

        replay = self.base + '/replays/2026sa/demo/'
        for part in ('head', 'latest', 'history', 'seat-history?seat=Sample'):
            with self.subTest(part=part):
                url = replay + part
                self.assertEqual(reader.get(url).status_code, 200)
                self.assertEqual(reader.get(url, REMOTE_ADDR='192.0.2.5').status_code, 404)
                self.assertEqual(reader.get(url, HTTP_HOST='testserver').status_code, 404)
                with override_settings(LOCAL_REPLAY_ENABLED=False):
                    self.assertEqual(reader.get(url).status_code, 404)

        self.assertEqual(reader.get(self.base+'/official/2026sa/latest').data['forecast_id'],'f00000001')
        self.assertTrue(reader.get(self.base+'/official/2026sa/latest').data['local_diagnostics'])
        self.assertFalse(reader.get(self.base+'/official/2026sa/latest', HTTP_HOST='testserver').data['local_diagnostics'])
        self.assertFalse(reader.get(self.base+'/official/2026sa/latest', REMOTE_ADDR='192.0.2.5').data['local_diagnostics'])
        with override_settings(LOCAL_REPLAY_ENABLED=False):
            self.assertFalse(reader.get(self.base+'/official/2026sa/latest').data['local_diagnostics'])
        self.assertEqual(reader.get(replay+'latest').data['forecast_id'],'f00000002')
        self.assertEqual(reader.get(self.base+'/replays/2022vic/demo/head').status_code,404)

    def test_replay_steps_use_observation_order_and_limit_both_histories(self):
        self.send('origin')
        for number, minute in [(8, 1), (2, 0), (5, 1)]:
            report = dict(termCode='2026sa', seatNames=['Sample'], seatPartyWinFrequencies=[[[0, number]]])
            self.send(f'f{number:08}', f'2026-03-21T09:0{minute}:00Z', report=report,
                      comparisons={'previous': {'available': False, 'reason': str(number)}})
        base = self.base + '/replays/2026sa/demo/'
        select = '?snapshot=f00000005'
        page = self.api.get(base + 'latest' + select).data
        self.assertEqual(page['report']['seatPartyWinFrequencies'][0][0][1], 5)
        self.assertEqual(page['windows']['previous']['comparison']['reason'], '5')
        self.assertEqual(page['replay_navigation'], dict(first='f00000002', previous='f00000002',
                                                         next='f00000008', position=2, total=3))
        self.assertIsNone(self.api.get(base + 'latest?snapshot=f00000002').data['replay_navigation']['previous'])
        self.assertIsNone(self.api.get(base + 'latest').data['replay_navigation']['next'])
        for path in ('history' + select, 'seat-history' + select + '&seat=Sample'):
            self.assertEqual(len(self.api.get(base + path).data['points']), 2)
        self.assertEqual(self.api.get(base + 'latest?snapshot=f00000003').status_code, 404)
        self.assertEqual(self.api.get(base + 'latest' + select, REMOTE_ADDR='192.0.2.5').status_code, 404)
        self.assertEqual(self.api.get(self.base + '/official/2026sa/head' + select).status_code, 404)

    def test_calls_warnings_and_preference_history_reach_the_public_views(self):
        url = self.base + '/replays/2026sa/demo/'
        calls = [dict(action='called', party='0', seats=['Sample'], others=0)]
        groups = dict(today=dict(available=True, win_changes=[], seat_call_changes=calls))
        report = dict(termCode='2026sa', seatNames=['Sample'], seatPartyWinFrequencies=[[[0, 100]]],
            partyAbbr=[[0, 'ALP'], [1, 'LIB'], [2, 'ON']], seatCalls={'Sample': {'party': '0', 'since': 'f00000001'}},
            possibleBoothErrors={'Sample': [dict(booth='Hall', confidencePercent=80.0, level='medium')]},
            voteTotalThresholds=[0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5, 99.9],
            statewidePreferenceFlows=[dict(sourceParty=0, destinationParty=1, otherFinalist=2, percentiles=[60]*15)])
        sent = self.send('f00000001', '2026-03-21T11:00:00Z', report=report, comparisons=groups,
                         commentary={'today': {'status': 'unavailable', 'seat_call_changes': calls}})
        self.assertEqual(sent.status_code, 200)
        latest = self.api.get(url+'latest').data
        for key in ('seatCalls', 'possibleBoothErrors'):
            self.assertEqual(latest['report'][key], report[key])
        for key in ('commentary', 'comparison'):
            self.assertEqual(latest['windows']['today'][key]['seat_call_changes'], calls)
        original = self.api.get(url+'history').data['points'][0][1]
        LivePublication.objects.filter(forecast_id='f00000001').update(history_point={})
        call_command('rebuild_live_seat_history', 'demo')
        point = self.api.get(url+'history').data['points'][0][1]
        self.assertEqual(original, point)
        for key in ('statewidePreferenceFlows', 'partyAbbr', 'voteTotalThresholds'):
            self.assertEqual(point[key], report[key])
        self.send('f00000002', '2026-03-22T11:00:00Z', retained_reports={'yesterday': {
            'available': True, 'source_forecast_id': 'f00000001', 'source_window': 'today'}})
        yesterday = self.api.get(url+'latest').data['windows']['yesterday']
        self.assertEqual(yesterday['commentary']['seat_call_changes'], calls)

    def test_reference_arriving_after_latest(self):
        ref = dict(available=True, source_forecast_id='f00000001', source_window='today')
        self.send('f00000002','2026-03-22T10:00:00Z',retained_reports={'yesterday':ref})
        url = self.base+'/replays/2026sa/demo/latest'
        self.assertTrue(self.api.get(url).data['yesterday']['pending'])
        self.send('f00000001','2026-03-21T11:00:00Z',
                  comparisons={'today':{'available':False,'reason':'No baseline'}})
        latest = self.api.get(url).data
        self.assertEqual(latest['forecast_id'],'f00000002')
        self.assertEqual(latest['windows']['yesterday']['comparison']['reason'],'No baseline')

    def test_reject_invalid_rows_atomically(self):
        bad = {'termCode':'2026sa','seatNames':['Seat'],'seatPartyWinFrequencies':[[[0,101]]]}
        self.assertEqual(self.send('f00000001','2026-03-22T10:00:00Z',report=bad).status_code,400)
        self.assertFalse(LivePublication.objects.exists())
        self.assertEqual(LiveRun.objects.get().revision,0)

    def test_frozen_daily_source_still_being_prepared(self):
        self.send('f00000002', '2026-03-22T10:00:00Z', retained_reports={'yesterday': {
            'available': False, 'source_forecast_id': 'f00000001', 'report_date': '2026-03-21'}})
        url = self.base + '/replays/2026sa/demo/latest'
        self.assertTrue(self.api.get(url).data['yesterday']['pending'])
        self.send('f00000001', '2026-03-21T11:00:00Z', comparisons={'since_start': {
            'available': True, 'win_changes': [], 'reference_forecast_id': 'origin'}})
        data = self.api.get(url).data
        self.assertEqual(data['yesterday']['source_window'], 'since_start')
        self.assertTrue(data['windows']['yesterday']['comparison']['available'])

    def test_wire_digest_and_submit_permission(self):
        reader = APIClient(HTTP_HOST='localhost')
        registration = dict(self.run, run_id='other')
        self.assertIn(reader.post(self.base+'/runs', registration, format='json').status_code, (401,403))
        reader.force_authenticate(get_user_model().objects.create_user('viewer@example.test'))
        self.assertEqual(reader.post(self.base+'/runs', registration, format='json').status_code,403)
        self.assertEqual(reader.get(self.base+'/capabilities').data['schema_version'],1)
        raw = b'{ }'
        url = self.base + '/runs/demo/forecasts/origin'
        result = self.api.post(url, raw, content_type='application/json',
                               HTTP_IDEMPOTENCY_KEY='demo/origin',
                               HTTP_X_CONTENT_SHA256=hashlib.sha256(b'{}').hexdigest())
        self.assertEqual(result.status_code,400)
        self.assertEqual(LiveRun.objects.get().revision,0)

    def test_probability_and_booth_boundaries(self):
        def move(s,b,a,p=0):
            return dict(seat=s, party_id=p, before=b, after=a)
        rows = [move('A', 90, 90.5), move('A', 99, 99.2, 1), move('A', 0.8, 1, 2),
                move('A', 98.7, 99, 3), move('A', 1, 1.2, 4), move('A', 0.8, 0.99, 5),
                move('Quiet', 45, 45.1, 1), move('Quiet', 56, 55.9), move('Still', 0, 0)]
        result = movements(rows)
        self.assertEqual(result['win_changes'], [rows[i] for i in (0, 1, 2, 7)])
        self.assertEqual(result['win_change_totals'], {'A': 1.59, 'Quiet': 0.2})
        units = [{'kind':k,'affected_votes':n} for k,n in [('new',1),('updated',20),('updated',21)]]
        self.assertEqual(compact_booths({'available':True,'retained_events':units})['events'],[units[0],units[2]])

    def test_older_compact_window_recovers_endpoint_movements_when_reference_arrives(self):
        before = dict(termCode='2026sa', seatNames=['Sample'],
                      seatPartyWinFrequencies=[[[0, 70], [1, 29.2], [2, .8]]])
        after = dict(before, seatPartyWinFrequencies=[[[0, 71], [1, 28.4], [2, .6]]],
                     seatCandidateNames=[[[2, 'Candidate']]], partyAbbr=[[2, 'GRN']])
        end_id, start_id = 'f00000002', 'f00000001'
        saved = {'seat': 'Sample', 'party_id': '0', 'before': 70, 'after': 71, 'change_pp': 1,
                 'minimum_within_window': 69.2, 'maximum_within_window': 72.1}
        self.send(end_id, '2026-03-21T10:00:00Z', report=after)
        LivePublication.objects.filter(forecast_id=end_id).update(updates=pack({'comparisons': {
            'previous': {'available': True, 'reference_forecast_id': start_id, 'win_changes': [saved]}}}))

        def comparison():
            url = self.base + '/replays/2026sa/demo/latest'
            return self.api.get(url).data['windows']['previous']['comparison']

        self.assertEqual(comparison()['win_change_totals'], {'Sample': 1.0})
        self.send(start_id, '2026-03-21T09:00:00Z', report=before)
        restored = comparison()
        self.assertEqual(restored['win_change_totals'], {'Sample': 2.0})
        rows = restored['win_changes']
        self.assertEqual([row['party_id'] for row in rows], ['0', '1', '2'])
        self.assertEqual(rows[0]['minimum_within_window'], 69.2)
        self.assertEqual(rows[2]['identity'], {'name': 'Candidate', 'party': 'GRN'})

