import {useEffect, useState} from 'react';
import {getDirect} from 'utils/sdk';
import {prepareForecastReport} from 'utils/report_manager';

// Each mounted route owns one request loop. A head check is cheap enough to
// continue while showing a legacy live page awaiting official run selection.
export default function useLiveRun(
  base,
  seatSlug,
  findSeat,
  snapshot,
  replayHistories
) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    let version;
    const read = async path => {
      const selection =
        snapshot && path !== 'head' && !path.startsWith('replay-history')
          ? (path.includes('?') ? '&' : '?') +
            'snapshot=' +
            encodeURIComponent(snapshot)
          : '';
      const officialHead = !replayHistories && path === 'head';
      const response = await getDirect(base + '/' + path + selection, {
        signal: controller.signal,
        allowLegacyHtml: officialHead,
        headers: {Accept: 'application/json'},
      });
      if (
        officialHead &&
        (response.legacyApiMissing || [404, 405].includes(response.status))
      )
        return {legacy: true};
      if (!response.ok)
        throw new Error(
          response.status === 404
            ? 'This forecast run is unavailable.'
            : 'Update unavailable. Retrying automatically.'
        );
      return response.data;
    };
    const refresh = async () => {
      if (busy || document.hidden) return;
      busy = true;
      try {
        // Opening a replay snapshot already requires its report. Subsequent
        // checks on a growing run use the inexpensive revision endpoint.
        const openingReplay = replayHistories && version === undefined;
        const head = await read(openingReplay ? 'latest' : 'head');
        let complete = head.replay_complete;
        const next = head.legacy
          ? 'legacy'
          : head.run.run_id + '/' + head.revision;
        if (next !== version) {
          let publication = head;
          if (!head.legacy) {
            if (!openingReplay) publication = await read('latest');
            complete = publication.replay_complete;
            if (publication.report) {
              prepareForecastReport(publication.report);
              const name =
                seatSlug && findSeat(publication.report.seatNames, seatSlug);
              if (replayHistories && publication.replay_navigation) {
                // On first opening a replay the whole chart series can take
                // longer than the report. Show the report as soon as it arrives.
                // When stepping, keep the existing controls until the next view is ready.
                if (
                  !controller.signal.aborted &&
                  !replayHistories.has(name || null)
                ) {
                  setData(current => current ?? {...publication, points: []});
                }
                const history = await replayPoints(
                  publication,
                  name,
                  replayHistories,
                  read,
                  controller.signal
                );
                if (!history) return;
                publication.points = history.points;
                publication.replayTimeline = history.timeline;
              } else {
                const history = name
                  ? 'seat-history?seat=' + encodeURIComponent(name)
                  : 'history';
                const series = await read(history);
                // An upload or admin selection between reads must not mix two views.
                if (
                  series.run?.run_id !== publication.run.run_id ||
                  series.revision !== publication.revision
                )
                  return;
                publication.points = series.points;
              }
            }
          }
          if (!controller.signal.aborted) setData(publication);
          version = publication.legacy
            ? 'legacy'
            : publication.run.run_id + '/' + publication.revision;
        } else if (!controller.signal.aborted && complete) {
          // The operator can finish the run after this snapshot has loaded.
          // Only its status changed; the report and history remain current.
          setData(current => ({...current, replay_complete: true}));
        }
        if (replayHistories && complete && !controller.signal.aborted)
          stopWatching();
        if (!controller.signal.aborted) setError('');
      } catch (e) {
        if (!controller.signal.aborted) {
          if (e.message === 'This forecast run is unavailable.') {
            version = undefined;
            setData(null);
          }
          setError(e.message);
        }
      } finally {
        busy = false;
      }
    };
    const timer = setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    function stopWatching() {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    }
    refresh();
    return () => {
      controller.abort();
      stopWatching();
    };
  }, [base, seatSlug, findSeat, snapshot, replayHistories]);
  return {data, error};
}

// Only the prefix ending at the selected forecast reaches the chart. Using
// the ordered forecast IDs keeps two captures at the same instant distinct.
async function replayPoints(publication, seat, histories, read, signal) {
  const key = seat || null;
  let series = histories.get(key);
  if (series?.revision !== publication.revision) {
    const query = new URLSearchParams();
    if (seat) query.set('seat', seat);
    if (series?.cursor) {
      query.set('after', series.cursor);
      query.set('revision', series.revision);
    }
    const suffix = query.toString();
    const batch = await read('replay-history' + (suffix ? '?' + suffix : ''));
    if (
      signal.aborted ||
      batch.run.run_id !== publication.run.run_id ||
      batch.revision !== publication.revision
    )
      return null;
    const byId = batch.incremental ? new Map(series.byId) : new Map();
    for (const [id, point] of batch.updates) byId.set(id, point);
    // The slider can preview every published time using this same download.
    // Only the chart values through the selected snapshot go to the charts.
    const timeline = batch.ids.map(id => ({id, time: byId.get(id)[0]}));
    series = {
      timeline,
      points: batch.ids.map(id => byId.get(id)),
      byId,
      revision: batch.revision,
      cursor: batch.cursor,
    };
    histories.set(key, series);
  }
  const end = publication.replay_navigation.position;
  if (series.timeline[end - 1]?.id !== publication.forecast_id) return null;
  return {points: series.points.slice(0, end), timeline: series.timeline};
}
