import React from 'react';

import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

import TooltipPercentage from '../TooltipPercentage'

import { parseDateData } from '../../utils/date.js'
import { intMap } from '../../utils/intmap.js'

import styles from './ForecastSummary.module.css';

const ForecastSummaryVisible = props => {
    console.log(props.forecast.overallWinPc);
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
            <Card className={styles.summary}>
                <Card.Header className={styles.formationOfGovernmentTitle}>
                    <strong>Formation Of Government</strong>
                </Card.Header>
                <Card.Body className={styles.formationOfGovernmentBody}>
                <ListGroup className={styles.formationOfGovernmentTopList}>
                    <ListGroup.Item className={styles.formationOfGovernmentTopItem}>
                        <Badge bg="danger">ALP</Badge> forms government:&nbsp;
                        <TooltipPercentage value={intMap(props.forecast.overallWinPc, 0)} />
                    </ListGroup.Item>
                    <ListGroup.Item className={styles.formationOfGovernmentTopItem}>
                        <Badge bg="primary">LNP</Badge> forms government:&nbsp;
                        <TooltipPercentage value={intMap(props.forecast.overallWinPc, 1)} />
                    </ListGroup.Item>
                    <ListGroup.Item className={styles.formationOfGovernmentTopItem}>
                        Any other party forms government:&nbsp;<TooltipPercentage value={intMap(props.forecast.overallWinPc, -1)} />
                    </ListGroup.Item>
                </ListGroup>
                </Card.Body>
            </Card>
        </>
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
    if (props.forecastValid) {
        return <ForecastSummaryVisible forecast={props.forecast} mode={props.mode}  />
    } else {
        return <ForecastSummaryLoading />
    }
}

export default ForecastSummary;