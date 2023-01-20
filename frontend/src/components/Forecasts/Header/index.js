import React from 'react';
import PropTypes from 'prop-types';

import {parseDateStringAsUTC} from '../../../utils/date.js';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';

import styles from './ForecastHeader.module.css';

const ForecastHeader = props => {
  const modeNames = {
    regular: 'General Forecast',
    nowcast: 'Nowcast',
    live: 'Live Forecast',
  };
  return (
    <StandardErrorBoundary>
      <div className={styles.forecastTitle}>
        {props.forecast.electionName} - {modeNames[props.mode]}
        {props.archive === true ? <strong>{' - Archive'}</strong> : ''}
      </div>
      <div className={styles.forecastUpdateInfo}>
        {props.archive === true ? 'Produced at ' : 'Last updated at '}
        {parseDateStringAsUTC(props.forecast.reportDate)} because&nbsp;of:&nbsp;
        {props.archive === true && (
          <strong>{props.forecast.reportLabel}</strong>
        )}
        {props.archive !== true && <>{props.forecast.reportLabel}</>}
      </div>
    </StandardErrorBoundary>
  );
};
ForecastHeader.propTypes = {
  forecast: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  archive: PropTypes.bool,
};

export default ForecastHeader;
