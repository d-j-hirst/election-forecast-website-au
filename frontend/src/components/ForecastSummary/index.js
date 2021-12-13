import React from 'react';
import styles from './ForecastSummary.module.css';

const ForecastSummary = (props) => (
     // This makes sure the component does not display until a forecast is actually loaded
    props.forecast.overallWinPercent !== undefined &&
    <div className={styles.summary}>
        {props.forecast.name}
        <br/>
        Last updated: {props.forecast.date}
        <br/>
        Updated because of: {props.forecast.description}
        <br/>
        ALP win percent: {props.forecast.overallWinPercent === undefined ? '' : Number((props.forecast.overallWinPercent.alp).toFixed(2))}
        <br/>
        LNP win percent: {props.forecast.overallWinPercent === undefined ? '' : Number((props.forecast.overallWinPercent.lnp).toFixed(2))}
        <br/>
        OTH win percent: {props.forecast.overallWinPercent === undefined ? '' : Number((props.forecast.overallWinPercent.oth).toFixed(2))}
    </div>
    
);

export default ForecastSummary;