import React from 'react';

import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

import TooltipPercentage from '../TooltipPercentage'

import styles from './ForecastSummary.module.css';

const ForecastSummaryVisible = props => {
    return (
        <>
            <div className={styles.forecastTitle}>
                {props.forecast.name} - {props.mode === "nowcast" ? "Nowcast" : "Regular Forecast"}
            </div>
            <div className={styles.forecastUpdateInfo}>
                Last updated at&nbsp;
                {props.forecast.date}
                &nbsp;because of:&nbsp;
                {props.forecast.description}
            </div>
            <Card className={styles.summary}>
                <Card.Header className={styles.formationOfGovernmentTitle}>
                    <strong>Formation Of Government</strong>
                </Card.Header>
                <Card.Body className={styles.formationOfGovernmentBody}>
                <ListGroup className={styles.formationOfGovernmentTopList}>
                    <ListGroup.Item className={styles.formationOfGovernmentTopItem}>
                        <Badge bg="danger">ALP</Badge> forms government:&nbsp;
                        <TooltipPercentage value={props.forecast.overallWinPercent.alp} />
                    </ListGroup.Item>
                    <ListGroup.Item className={styles.formationOfGovernmentTopItem}>
                        <Badge bg="primary">LNP</Badge> forms government:&nbsp;
                        <TooltipPercentage value={props.forecast.overallWinPercent.lnp} />
                    </ListGroup.Item>
                    <ListGroup.Item className={styles.formationOfGovernmentTopItem}>
                        Any other party forms government:&nbsp;<TooltipPercentage value={props.forecast.overallWinPercent.oth} />
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
    if (props.forecast.overallWinPercent !== undefined) {
        return <ForecastSummaryVisible forecast={props.forecast} mode={props.mode}  />
    } else {
        return <ForecastSummaryLoading />
    }
}

export default ForecastSummary;