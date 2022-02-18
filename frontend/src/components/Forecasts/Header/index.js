import React from 'react';

import { parseDateStringAsUTC } from '../../../utils/date.js'

import styles from './ForecastHeader.module.css';

const ForecastHeader = props => {
    return (
        <>
            <div className={styles.forecastTitle}>
                {props.forecast.electionName} - {props.mode === "nowcast" ? "Nowcast" : "Regular Forecast"}
                {props.archive === true ? <strong>{" - Archive"}</strong> : ""}
            </div>
            <div className={styles.forecastUpdateInfo}>
                {props.archive === true ? "Produced at " : "Last updated at "}
                {parseDateStringAsUTC(props.forecast.reportDate)}
                {" "}because&nbsp;of:&nbsp;
                {props.archive === true && <strong>{props.forecast.reportLabel}</strong>}
                {props.archive !== true && <>{props.forecast.reportLabel}</>}
            </div>
        </>
    );
}

export default ForecastHeader;