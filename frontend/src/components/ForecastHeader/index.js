import React from 'react';

import { parseDateStringAsUTC } from '../../utils/date.js'

import styles from './ForecastHeader.module.css';

const ForecastHeader = props => {
    return (
        <>
            <div className={styles.forecastTitle}>
                {props.forecast.electionName} - {props.mode === "nowcast" ? "Nowcast" : "Regular Forecast"}
            </div>
            <div className={styles.forecastUpdateInfo}>
                Last updated at&nbsp;
                {parseDateStringAsUTC(props.forecast.reportDate)}
                {" "}because&nbsp;of:&nbsp;
                {props.forecast.reportLabel}
            </div>
        </>
    );
}

export default ForecastHeader;