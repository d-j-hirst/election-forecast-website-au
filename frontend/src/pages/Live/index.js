import React, {useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ForecastLayout, SeatDetails} from 'components';
import {seatPartyCode} from 'utils/coalition';
import {getSeatUrl} from 'utils/seaturls';
import liveElectionName from 'utils/liveElectionName';
import useLiveRun from './useLiveRun';
import UpdateSummary from './UpdateSummary';
import SeatHistory from './SeatHistory';
import ReplayNavigation from './ReplayNavigation';

const findSeat = (names, slug) => names.find(name => getSeatUrl(name) === slug);

function LivePage({code, runId, seat, replayHistories}) {
  const replay = !!runId;
  const location = useLocation();
  const navigate = useNavigate();
  const snapshot = replay
    ? new URLSearchParams(location.search).get('snapshot')
    : null;
  const base =
    'forecast-api/live/v1/' +
    (replay ? 'replays/' + code + '/' + runId : 'official/' + code);
  const {data, error} = useLiveRun(
    base,
    seat,
    findSeat,
    snapshot,
    replayHistories
  );
  const selection = snapshot ? '?snapshot=' + encodeURIComponent(snapshot) : '';
  const selectSnapshot = id => {
    const params = new URLSearchParams(location.search);
    if (id) params.set('snapshot', id);
    else params.delete('snapshot');
    navigate({
      pathname: location.pathname,
      search: params.toString(),
      hash: location.hash,
    });
  };
  const electionLink = replay
    ? '/' + code + '/replays/' + runId
    : '/forecast/' + code + '/live';
  const seatLink = name =>
    (replay ? electionLink + '/seat/' : '/seat/' + code + '/live/') +
    encodeURIComponent(getSeatUrl(name)) +
    selection;
  const seatName =
    data?.report && seat && findSeat(data.report.seatNames, seat);
  const electionName = liveElectionName(data?.report) || code;
  const modeTitle = replay ? 'Live Replay' : 'Live Forecast';
  const title = [seatName, electionName, modeTitle].filter(Boolean).join(' - ');
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
  if (replay && step && data.replayTimeline) {
    live.navigation = (
      <ReplayNavigation
        publication={data}
        snapshot={snapshot}
        selectSnapshot={selectSnapshot}
      />
    );
  } else if (replay && step) {
    live.navigation = <p role="status">Loading replay history…</p>;
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
  // A visit to a replay owns its statewide chart and the seats opened so far.
  // Preserve these across snapshot and seat links; release them on leaving.
  const replayHistories = useMemo(
    () => (code && runId ? new Map() : null),
    [code, runId]
  );
  // Route changes start a fresh reader so private or stale data cannot flash.
  return (
    <LivePage
      key={JSON.stringify([code, runId, seat])}
      code={code}
      runId={runId}
      replayHistories={replayHistories}
      seat={seat}
    />
  );
}

LivePage.propTypes = {
  replayHistories: PropTypes.instanceOf(Map),
  code: PropTypes.string.isRequired,
  runId: PropTypes.string,
  seat: PropTypes.string,
};
