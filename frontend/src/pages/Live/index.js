import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ForecastLayout, SeatDetails} from 'components';
import {seatPartyCode} from 'utils/coalition';
import {getSeatUrl} from 'utils/seaturls';
import useLiveRun from './useLiveRun';
import UpdateSummary from './UpdateSummary';
import SeatHistory from './SeatHistory';

const findSeat = (names, slug) => names.find(name => getSeatUrl(name) === slug);

function LivePage({code, runId, seat}) {
  const replay = !!runId;
  const location = useLocation();
  const navigate = useNavigate();
  const snapshot = replay ? new URLSearchParams(location.search).get('snapshot') : null;
  const base =
    'forecast-api/live/v1/' +
    (replay ? 'replays/' + code + '/' + runId : 'official/' + code);
  const {data, error} = useLiveRun(base, seat, findSeat, snapshot);
  const selection = snapshot ? '?snapshot=' + encodeURIComponent(snapshot) : '';
  const selectSnapshot = id => {
    const params = new URLSearchParams(location.search);
    if (id) params.set('snapshot', id);
    else params.delete('snapshot');
    navigate({pathname: location.pathname, search: params.toString(), hash: location.hash});
  };
  const electionLink = replay
    ? '/' + code + '/replays/' + runId
    : '/forecast/' + code + '/live';
  const seatLink = name =>
    (replay ? electionLink + '/seat/' : '/seat/' + code + '/live/') +
    encodeURIComponent(getSeatUrl(name)) + selection;
  const seatName =
    data?.report && seat && findSeat(data.report.seatNames, seat);
  const title = [
    seatName,
    data?.run?.display_name,
    replay ? 'Live replay' : 'Live forecast',
  ]
    .filter(Boolean)
    .join(' · ');
  useEffect(() => {
    if (!data?.legacy)
      document.title = title + ' | Australian Election Forecasts';
  }, [title, data?.legacy]);
  // The poller owns run-specific data and URLs. The existing layouts own
  // the forecast presentation, including the fallback to historical reports.
  const live = data?.legacy
    ? undefined
    : {publication: data, error, replay, seatLink};
  const step = data?.replay_navigation;
  if (replay && step) {
    const loading = Boolean(snapshot && snapshot !== data.forecast_id);
    live.navigation = (
      <nav aria-label="Replay snapshots" className="d-flex align-items-center flex-wrap gap-2 my-2">
        <button className="btn btn-outline-secondary btn-sm" disabled={loading || !step.previous}
          onClick={() => selectSnapshot(step.first)}>First</button>
        <button className="btn btn-outline-primary btn-sm" disabled={loading || !step.previous}
          onClick={() => selectSnapshot(step.previous)}>Back</button>
        <span aria-live="polite">Snapshot {step.position} of {step.total}</span>
        <button className="btn btn-outline-primary btn-sm" disabled={loading || !step.next}
          onClick={() => selectSnapshot(step.next)}>Forward</button>
        {snapshot && <button className="btn btn-link btn-sm" onClick={() => selectSnapshot(null)}>Follow latest</button>}
      </nav>
    );
  }
  if (seat) {
    if (live) {
      live.returnUrl = electionLink + selection + '#seats';
      if (seatName) {
        const parties = Object.fromEntries(
          (data.report.partyAbbr || []).map(([id, party]) => {
            const label = seatPartyCode(party, code, seatName);
            return [id, label === 'LNPx' ? 'LNP' : label];
          })
        );
        const seatIndex = data.report.seatNames.indexOf(seatName);
        live.history = (
          <SeatHistory
            points={data.points}
            parties={parties}
            zone={data.run.timezone}
            tcpScenarios={data.report.seatTcpScenarios?.[seatIndex]}
          />
        );
      }
    }
    return <SeatDetails code={code} seat={seat} mode="live" live={live} />;
  }
  if (live && data?.report) {
    live.summary = (
      <UpdateSummary key={data.run.run_id} data={data} seatLink={seatLink} />
    );
  }
  return (
    <ForecastLayout code={code} mode="live" isArchive={false} live={live} />
  );
}

export default function Live() {
  const {code, runId, seat} = useParams();
  // Route changes start a fresh reader so private or stale data cannot flash.
  return (
    <LivePage
      key={JSON.stringify([code, runId, seat])}
      code={code}
      runId={runId}
      seat={seat}
    />
  );
}

LivePage.propTypes = {
  code: PropTypes.string.isRequired,
  runId: PropTypes.string,
  seat: PropTypes.string,
};
