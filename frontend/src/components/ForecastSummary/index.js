import React from 'react';
import styles from './ForecastSummary.module.css';

const ForecastSummaryVisible = props => (
    // This makes sure the component does not display until a forecast is actually loaded
   props.forecast.overallWinPercent !== undefined &&
   <div className={styles.summary}>
       {props.forecast.name}
       <br/>
       Last updated: {props.forecast.date}
       <br/>
       Updated because of: {props.forecast.description}
       <br/>
       ALP win percent: {props.forecast.overallWinPercent === undefined ? '' : Number((props.forecast.overallWinPercent.alp)).toFixed(1)}
       <br/>
       LNP win percent: {props.forecast.overallWinPercent === undefined ? '' : Number((props.forecast.overallWinPercent.lnp)).toFixed(1)}
       <br/>
       OTH win percent: {props.forecast.overallWinPercent === undefined ? '' : Number((props.forecast.overallWinPercent.oth)).toFixed(1)}
   </div>
);

const ForecastSummaryLoading = () => (
   <div className={styles.summary}>
       Loading forecast
   </div>
)

const ForecastSummary = props => {
     // This makes sure the component does not display until a forecast is actually loaded
    if (props.forecast.overallWinPercent !== undefined) {
        return <ForecastSummaryVisible forecast={props.forecast}  />
    } else {
        return <ForecastSummaryLoading />
    }
}

export default ForecastSummary;