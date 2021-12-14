import React from 'react';

import Spinner from 'react-bootstrap/Spinner';

import TooltipPercentage from '../TooltipPercentage'

import styles from './ForecastSummary.module.css';

const ForecastSummaryVisible = props => {
    return (
        <div className={styles.summary}>
            {props.forecast.name}
            <br/>
            Last updated: {props.forecast.date}
            <br/>
            Updated because of: {props.forecast.description}
            <br/>
            ALP win percent: <TooltipPercentage value={props.forecast.overallWinPercent.alp} />
            <br/>
            LNP win percent: <TooltipPercentage value={props.forecast.overallWinPercent.lnp} />
            <br/>
            OTH win percent: <TooltipPercentage value={props.forecast.overallWinPercent.oth} />
        </div>
    );
}

const ForecastSummaryLoading = () => (
    <div className={styles.summary}>
        <Spinner animation="border" role="status" size="sm">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
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