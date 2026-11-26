import React from 'react';
import PropTypes from 'prop-types';

import {countTime, parseDateStringAsUTC} from '../../../utils/date.js';
import liveElectionName from 'utils/liveElectionName';
import formatCountPercentage from 'utils/formatCountPercentage';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';

import styles from './ForecastHeader.module.css';

const ForecastHeader = props => {
  const modeNames = {
    regular: 'General Forecast',
    nowcast: 'Nowcast',
    live: 'Live Forecast',
  };

  const progress = props.mode === 'live' ? props.forecast.countProgress : null;
  const total = progress?.expected_formal_votes;
  const fp = formatCountPercentage(progress?.fp_votes, total);
  const tcp = formatCountPercentage(progress?.tcp_votes, total);
  const counted = [fp && `FP ${fp}`, tcp && `TCP ${tcp}`]
    .filter(Boolean)
    .join(', ');
  return (
    <StandardErrorBoundary>
      <div className={styles.forecastTitle}>
        {props.replay
          ? liveElectionName(props.forecast)
          : props.forecast.electionName || props.forecast.termCode}{' '}
        - {props.replay ? 'Live Replay' : modeNames[props.mode]}
        {props.archive === true ? <strong>{' - Archive'}</strong> : ''}
      </div>
      <div className={styles.forecastUpdateInfo}>
        {props.sourceTime && (
          <>Count observation · {countTime(props.sourceTime, props.timeZone)}</>
        )}
        {!props.sourceTime && (
          <>
            {props.archive === true ? 'Produced at ' : 'Last updated at '}
            {parseDateStringAsUTC(props.forecast.reportDate)}{' '}
            because&nbsp;of:&nbsp;
            {props.archive === true && (
              <strong>{props.forecast.reportLabel}</strong>
            )}
            {props.archive !== true && <>{props.forecast.reportLabel}</>}
          </>
        )}
        {counted && <> · Count progress: {counted}</>}
        {props.replaySnapshotId && <> · Snapshot {props.replaySnapshotId}</>}
      </div>
    </StandardErrorBoundary>
  );
};
ForecastHeader.propTypes = {
  forecast: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  archive: PropTypes.bool,
  sourceTime: PropTypes.string,
  timeZone: PropTypes.string,
  replay: PropTypes.bool,
  replaySnapshotId: PropTypes.string,
};

export default ForecastHeader;
