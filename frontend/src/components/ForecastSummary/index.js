import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

import TooltipPercentage from '../TooltipPercentage'
import { SmartBadge } from '../PartyBadge'

import { parseDateData } from '../../utils/date.js'
import { intMap } from '../../utils/intmap.js'
import { lightBgClass, standardiseParty } from '../../utils/partyclass.js'

import styles from './ForecastSummary.module.css';

const OverallWinGovernmentRow = props => {
    const party = parseInt(props.partyIndex)
    const partyAbbr = standardiseParty(party, props.forecast);
    const text = props.text !== undefined && party < 0 ? props.text : undefined;
    const bgClasses = `${styles['formationOfGovernmentTopItem']} ${lightBgClass(partyAbbr)}`;
    return (
        <ListGroup.Item className={bgClasses}>
            <SmartBadge party={partyAbbr} text={text} /> forms government:&nbsp;
            <strong><TooltipPercentage value={intMap(props.forecast.overallWinPc, party)} /></strong>
        </ListGroup.Item>
    )
}

const ForecastSummaryVisible = props => {
    console.log(props.forecast.partyAbbr);
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
                    <OverallWinGovernmentRow partyIndex="0" forecast={props.forecast} />
                    <OverallWinGovernmentRow partyIndex="1" forecast={props.forecast} />
                    <OverallWinGovernmentRow partyIndex="-1" forecast={props.forecast} text="Any other party" />
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