"""Compact read models for an immutable automated publication."""
import json
import math
import struct
import zlib
from decimal import Decimal

from forecast_api.models import SeatHistoryBlock


def pack(value):
    return zlib.compress(json.dumps(value, ensure_ascii=False, allow_nan=False,
                                    separators=(',', ':')).encode())


def unpack(blob):
    return json.loads(zlib.decompress(blob))


def movements(rows):
    # Rank seats using all candidate movements, then retain the qualifying rows
    # and the largest movement in each seat for quiet periods.
    by_seat = {}
    for row in rows:
        before, after = (Decimal(str(row[key])) for key in ('before', 'after'))
        if not all(x.is_finite() and 0 <= x <= 100 for x in (before, after)):
            raise ValueError('Invalid win probability.')
        change = abs(after - before)
        if change:
            extreme = min(before, after) < 1 or max(before, after) > 99
            threshold = Decimal('0.2') if extreme else Decimal('0.5')
            by_seat.setdefault(row['seat'], []).append((change, int(row['party_id']), change >= threshold, row))

    kept = []
    totals = {}
    for seat, candidates in by_seat.items():
        candidates.sort(key=lambda item: (-item[0], item[1]))
        totals[seat] = float(sum(candidate[0] for candidate in candidates))
        kept.append(candidates[0][3])
        kept.extend(row for _, _, qualifies, row in candidates[1:] if qualifies)
    return {'win_changes': kept, 'win_change_totals': totals}


def seat_win_snapshot(report):
    names = report.get('seatCandidateNames') or []
    parties = dict(report.get('partyAbbr') or [])
    seats = {}
    for index, (seat, frequencies) in enumerate(zip(report['seatNames'], report['seatPartyWinFrequencies'])):
        candidates = dict(names[index] or []) if index < len(names) else {}
        seats[seat] = {str(party): (probability, {'name': candidates.get(party), 'party': parties.get(party)})
                       for party, probability in (frequencies or [])}
    return seats


def recover_movements(before, after, retained):
    # Earlier compact windows discarded some endpoint movements. Rebuild those
    # from the original reports while keeping any already published extrema.
    if not before or not after:
        return movements(retained)
    previous, current = seat_win_snapshot(before), seat_win_snapshot(after)
    saved = {(row['seat'], str(row['party_id'])): row for row in retained}
    rows = []
    for seat in previous.keys() & current.keys():
        old, new = previous[seat], current[seat]
        for party in old.keys() | new.keys():
            start, old_id = old.get(party, (0, None))
            end, new_id = new.get(party, (0, None))
            row = saved.get((seat, party))
            if row is None:
                row = {'seat': seat, 'party_id': party, 'before': start, 'after': end,
                       'change_pp': end - start, 'identity_changed': old_id != new_id}
            rows.append({**row, 'identity': row.get('identity') or new_id or old_id})
    return movements(rows)


def compact_booths(booths):
    if not booths.get('available'):
        return {'available': False, 'reason': booths.get('reason', 'Booth data unavailable.')}
    if 'retained_events' in booths:
        return {'available': True, 'events': [unit for unit in booths['retained_events']
                if unit['kind'] == 'new' or unit['affected_votes'] > 20]}
    # Previously released packages only identify the first few units per seat.
    # Omitted revisions were selected under the producer's original threshold.
    events = []
    omitted = {}
    for seat, groups in (booths.get('by_seat') or {'': booths}).items():
        for kind in ('new', 'updated'):
            group = groups.get(kind, {})
            events.extend(unit for unit in group.get('shown', [])
                          if kind == 'new' or unit['affected_votes'] > 20)
            if group.get('other_count'):
                omitted.setdefault(seat, {})[kind] = group['other_count']
    return {'available': True, 'events': events, 'shortlist_omitted': omitted}


def has_counted_votes(report):
    progress = report.get('countProgress') or {}
    return any((progress.get(field) or 0) > 0 for field in ('fp_votes', 'tcp_votes'))


def election_history_point(report):
    """Keep the statewide chart quantities from one publication. An older
    report can lack preference estimates. When they exist, retain the parties
    and percentile scale needed to interpret this particular observation."""
    point = {key: report[key] for key in (
        'majorityWinPc', 'minorityWinPc', 'mostSeatsWinPc', 'overallWinPc', 'tppFrequencies',
        'fpFrequencies', 'seatCountFrequencies', 'coalitionFpFrequencies',
        'coalitionSeatCountFrequencies', 'voteTotalThresholds') if key in report}
    # The polling forecast can link to the live count as soon as results arrive.
    # Keep this small flag with the chart data so a navigation request never
    # needs to decompress a complete forecast just to check for votes.
    point['has_counted_votes'] = has_counted_votes(report)
    if report.get('statewidePreferenceFlows'):
        point['statewidePreferenceFlows'] = report['statewidePreferenceFlows']
        point['partyAbbr'] = report.get('partyAbbr', [])
    return point


def compact_updates(body):
    result = {key: body[key] for key in ('forecast', 'released_at', 'commentary',
              'commentary_requests', 'commentary_evidence', 'retained_reports',
              'reporting_schedule') if key in body}
    result['comparisons'] = {}
    for name, window in body['comparisons'].items():
        kept = {key: window[key] for key in ('available', 'reason', 'reference_forecast_id',
                'reference_source_time', 'actual_seconds', 'requested_seconds', 'report_date',
                'reporting_timezone', 'requested_reference_time', 'input_revision_changed',
                'statewide', 'count_activity', 'commentary_decision', 'seat_call_changes', 'noteworthy_booth_warnings') if key in window}
        if window['available']:
            kept.update(movements(window['win_changes']))
            kept['booth_changes'] = compact_booths(window.get('booth_changes', {}))
        result['comparisons'][name] = kept
    return result


# The exporter divides two C++ floats. A scenario occurring in exactly 1 of
# 1,000 simulations arrives as 0.0010000000474974513 in JSON.
TCP_FREQUENCY_CUTOFF = struct.unpack('f', struct.pack('f', 0.001))[0]


def share_interval(values, indices):
    """Keep the central 90% and median as integer tenths of a percentage point."""
    if not indices or not isinstance(values, list) or max(indices) >= len(values):
        return None
    bounds = [values[i] for i in indices]
    if any(not isinstance(x, (float, int)) or not math.isfinite(x) for x in bounds):
        return None
    low, median, high = bounds
    if 0 <= low <= median <= high <= 100:
        return [round(x * 10) for x in bounds]
    return None


def seat_vote_history(report, index, labels, indices):
    def rows(field):
        seats = report.get(field) or []
        return seats[index] if index < len(seats) and seats[index] else []

    fp = []
    for party, values in rows('seatFpBands'):
        interval = share_interval(values, indices)
        if interval is not None:
            fp.append([[party, labels.get(party)], interval])
    fp.sort(key=lambda entry: (-entry[1][1], entry[0][0]))

    # Rank by unrounded scenario frequency at this observation only. A pair
    # dropping below the cutoff or outside the first four leaves a chart gap.
    ranked = sorted(((-frequency, tuple(sorted(pair))) for pair, frequency in rows('seatTcpScenarios')
                     if TCP_FREQUENCY_CUTOFF < frequency <= 1))
    bands = {tuple(sorted(pair)): (pair, values) for pair, values in rows('seatTcpBands')}
    tcp = []
    for _, pair in ranked[:4]:
        if pair not in bands:
            continue
        reported_pair, values = bands[pair]
        interval = share_interval(values, indices)
        if interval is None:
            continue
        # The report gives the first listed candidate's share. Use a stable
        # orientation across forecasts, including when the exporter reverses it.
        if reported_pair[0] != pair[0]:
            interval = [1000 - value for value in reversed(interval)]
        tcp.append([[[p, labels.get(p)] for p in pair], interval])
    return {'fp': fp, 'tcp': tcp}


def seat_points(report):
    names, wins = report['seatNames'], report['seatPartyWinFrequencies']
    if not isinstance(names, list) or len(names) != len(wins) or len(set(names)) != len(names):
        raise ValueError('Seat names and probability rows must correspond.')
    candidates = report.get('seatCandidateNames') or []
    levels = report.get('probabilityBands', report.get('voteTotalThresholds')) or []
    quantiles = (5, 50, 95)
    indices = [levels.index(q) for q in quantiles] if all(q in levels for q in quantiles) else []
    # Include the label at the time of calculation: a replacement candidate starts
    # a distinct chart line even when their party uses the same simulation index.
    for index, seat in enumerate(names):
        if not isinstance(seat, str) or not seat or len(seat) > 160:
            raise ValueError('Invalid seat name.')
        labels = dict(candidates[index]) if index < len(candidates) else {}
        row = []
        for party, probability in wins[index]:
            if not math.isfinite(probability) or not 0 <= probability <= 100:
                raise ValueError('Invalid seat win probability.')
            row.append([int(party), labels.get(party), round(probability * 100)])
        yield seat, {'wins': row, **seat_vote_history(report, index, labels, indices)}


def write_seat_points(run, forecast_id, report):
    """Writer holds the run lock. A late arrival replaces only its own block entry."""
    sequence = int(forecast_id[1:])
    number = sequence // 32
    existing = {row.seat: row for row in SeatHistoryBlock.objects.filter(run=run, block=number)}
    inserts, updates = [], []
    for seat, values in seat_points(report):
        row = existing.get(seat)
        points = unpack(row.points) if row else {}
        points[str(sequence)] = values
        blob = pack(dict(sorted(points.items(), key=lambda pair: int(pair[0]))))
        if row:
            row.points = blob
            updates.append(row)
        else:
            inserts.append(SeatHistoryBlock(run=run, block=number, seat=seat, points=blob))
    SeatHistoryBlock.objects.bulk_create(inserts)
    SeatHistoryBlock.objects.bulk_update(updates, ['points'])


def seat_series(run, seat, timeline=None, blocks_needed=None):
    blocks = SeatHistoryBlock.objects.filter(run=run, seat=seat).values_list('points', flat=True)
    if blocks_needed is not None:
        blocks = blocks.filter(block__in=blocks_needed)
    points = {}
    for blob in blocks:
        points.update(unpack(blob))
    if timeline is None:
        timeline = run.livepublication_set.exclude(source_time=None).order_by('source_time', 'forecast_id')
    series = []
    for identity, time in timeline.values_list('forecast_id', 'source_time'):
        point = points.get(str(int(identity[1:])), [])
        # Older blocks contain just win probabilities. Preserve the original
        # first two response fields and leave vote shares absent until rebuilt.
        if isinstance(point, list):
            series.append([time, point, [], []])
        else:
            series.append([time, point['wins'], point['fp'], point['tcp']])
    return series


def replay_history(run, timeline, seat, after, revision):
    """Sync one chart. Upload order identifies additions; observation order
    determines where to display them, including late and equal-time returns."""
    entries = list(timeline.values_list('pk', 'forecast_id'))
    by_id = {identity: pk for pk, identity in entries}
    # Each upload advances the revision once. A rebuild also advances it but
    # can revise existing points, so a gap unexplained by uploads needs a new
    # baseline. An origin arriving late can cause a harmless full refresh.
    since = by_id.get(after)
    added = [identity for pk, identity in entries if since is not None and pk > since]
    incremental = since is not None and str(run.revision - len(added)) == revision
    updates = timeline.filter(pk__gt=since) if incremental else timeline
    ids = added if incremental else list(by_id)
    if seat is None:
        points = list(updates.values_list('source_time', 'history_point'))
    else:
        blocks = {int(identity[1:]) // 32 for identity in added} if incremental else None
        points = seat_series(run, seat, updates, blocks)
    return {'ids': list(by_id), 'updates': list(zip(ids, points)), 'incremental': incremental,
            'cursor': max(entries)[1] if entries else None}

