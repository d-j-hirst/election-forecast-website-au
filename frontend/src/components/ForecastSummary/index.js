import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

import TooltipPercentage from '../TooltipPercentage'
import TooltipText from '../TooltipText'
import { SmartBadge } from '../PartyBadge'

import { parseDateData } from '../../utils/date.js'
import { intMap } from '../../utils/intmap.js'
import { lightBgClass, xLightBgClass, xxLightBgClass, xxxLightBgClass, standardiseParty } from '../../utils/partyclass.js'

import styles from './ForecastSummary.module.css';

const interpretOth = (code, text) => code === undefined || code.toLowerCase() === 'OTH' ? text : code;

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

const MajorityWinGovernmentRow = props => {
    const party = parseInt(props.partyIndex)
    const partyAbbr = standardiseParty(party, props.forecast);
    const text = props.text !== undefined && party < 0 ? props.text : undefined;
    const bgClasses = `${styles['formationOfGovernmentSubItem']} ${xLightBgClass(partyAbbr)}`;
    return (
        <ListGroup.Item className={bgClasses}>
            &nbsp;&bull;&nbsp;<SmartBadge party={partyAbbr} text={interpretOth(text, 'Emerging party')} /> has a majority:&nbsp;
            <strong><TooltipPercentage value={intMap(props.forecast.majorityWinPc, party)} /></strong>
        </ListGroup.Item>
    )
}

const MinorityWinGovernmentRow = props => {
    const party = parseInt(props.partyIndex)
    const partyAbbr = standardiseParty(party, props.forecast);
    const text = props.text !== undefined && party < 0 ? props.text : undefined;
    const bgClasses = `${styles['formationOfGovernmentSubItem']} ${xxLightBgClass(partyAbbr)}`;
    const minorityTooltipText = "Parties expected to support this major party in a minority government. " + 
        "The Greens are expected to support the ALP; One Nation, United Australia Party and Katter's Australian Party " +
        "are expected to support the LNP; and Centre Alliance and all independents are considered to not support either " +
        "major party by default.";
    return (
        <ListGroup.Item className={bgClasses}>
            &nbsp;&bull;&nbsp;<SmartBadge party={partyAbbr} text={text} /> can form a&nbsp;<wbr />
            <TooltipText mainText="minority&nbsp;government" tooltipText={minorityTooltipText}/>:&nbsp;
            <strong><TooltipPercentage value={intMap(props.forecast.minorityWinPc, party)} /></strong>
        </ListGroup.Item>
    )
}

const MostSeatsRow = props => {
    const party = parseInt(props.partyIndex)
    const partyAbbr = standardiseParty(party, props.forecast);
    const text = props.text !== undefined && party < 0 ? props.text : undefined;
    const bgClasses = `${styles['formationOfGovernmentSubItem']} ${xxxLightBgClass(partyAbbr)}`;
    const hungTooltipText = "While the term hung parliament is often used to indicate any parliament where no " +
        "party can form a majority, here it is used in a narrower sense to count only those situations where " +
        "neither major party would be expected to form a minority government with the support of minor parties " +
        "aligned with it.";
    return (
        <ListGroup.Item className={bgClasses}>
            &nbsp;&bull;&nbsp;<SmartBadge party={partyAbbr} text={interpretOth(text, 'Emerging party')} /> has the most seats in a&nbsp;<wbr />
            <TooltipText mainText="hung&nbsp;parliament" tooltipText={hungTooltipText}/>:&nbsp;
            <strong><TooltipPercentage value={intMap(props.forecast.mostSeatsWinPc, party)} /></strong>
        </ListGroup.Item>
    )
}

const ForecastSummaryVisible = props => {
    const minorParties = new Set();
    for (const el of props.forecast.majorityWinPc) {
        if (el[0] === 0 || el[0] === 1) continue;
        minorParties.add(el[0]);
    }
    for (const el of props.forecast.mostSeatsWinPc) {
        if (el[0] === 0 || el[0] === 1) continue;
        minorParties.add(el[0]);
    }
    console.log(minorParties);
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
                    <MajorityWinGovernmentRow partyIndex="0" forecast={props.forecast} />
                    <MinorityWinGovernmentRow partyIndex="0" forecast={props.forecast} />
                    <MostSeatsRow partyIndex="0" forecast={props.forecast} />
                    <OverallWinGovernmentRow partyIndex="1" forecast={props.forecast} />
                    <MajorityWinGovernmentRow partyIndex="1" forecast={props.forecast} />
                    <MinorityWinGovernmentRow partyIndex="1" forecast={props.forecast} />
                    <MostSeatsRow partyIndex="1" forecast={props.forecast} />
                    <OverallWinGovernmentRow partyIndex="-1" forecast={props.forecast} text="Any other party" />
                    {
                        [...minorParties].map(el => {
                            let rows = [];
                            if (intMap(props.forecast.majorityWinPc, el, undefined) !== undefined) {
                                console.log(intMap(props.forecast.majorityWinPc, el, undefined));
                                rows.push(<MajorityWinGovernmentRow partyIndex={el} forecast={props.forecast} />)
                            }
                            if (intMap(props.forecast.mostSeatsWinPc, el, undefined) !== undefined) {
                                console.log(intMap(props.forecast.mostSeatsWinPc, el, undefined));
                                rows.push(<MostSeatsRow partyIndex={el} forecast={props.forecast} />)
                            }
                            return rows;
                        })
                    }
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