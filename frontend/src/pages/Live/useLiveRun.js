import {useEffect, useState} from 'react';
import {getDirect} from 'utils/sdk';
import {prepareForecastReport} from 'utils/report_manager';

// Each mounted route owns one request loop. A head check is cheap enough to
// continue while showing a legacy live page awaiting official run selection.
export default function useLiveRun(base, seatSlug, findSeat) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    let version;
    const read = async path => {
      const response = await getDirect(base + '/' + path, {
        signal: controller.signal,
      });
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
        const head = await read('head');
        const next = head.legacy
          ? 'legacy'
          : head.run.run_id + '/' + head.revision;
        if (next !== version) {
          let publication = head;
          if (!head.legacy) {
            publication = await read('latest');
            if (publication.report) {
              const name =
                seatSlug && findSeat(publication.report.seatNames, seatSlug);
              const history = name
                ? 'seat-history?seat=' + encodeURIComponent(name)
                : 'history';
              const series = await read(history);
              // An upload or admin selection between reads must not mix two views.
              if (
                series.run.run_id !== publication.run.run_id ||
                series.revision !== publication.revision
              )
                return;
              publication.points = series.points;
              prepareForecastReport(publication.report);
            }
          }
          if (!controller.signal.aborted) setData(publication);
          version = publication.legacy
            ? 'legacy'
            : publication.run.run_id + '/' + publication.revision;
        }
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
    refresh();
    const timer = setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [base, seatSlug, findSeat]);
  return {data, error};
}
