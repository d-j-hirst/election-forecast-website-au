import React from 'react';

import styles from './ForecastHeader.module.css';

import { parseDateData } from '../../utils/date.js'

const ForecastHeader = props => {
    return (
        <>
            <div className={styles.forecastTitle}>
                {props.forecast.electionName} - {props.mode === "nowcast" ? "Nowcast" : "Regular Forecast"}
            </div>
            <div className={styles.forecastUpdateInfo}>
                Last updated at&nbsp;
                {parseDateData(props.forecast.reportDate)}
                &nbsp;because of:&nbsp;
                {props.forecast.reportLabel}
            </div>
        </>
    );
}

export default ForecastHeader;