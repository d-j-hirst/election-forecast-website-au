import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

// import TooltipPercentage from '../TooltipPercentage';
import ProbBarDist from '../ProbBarDist';
import { SmartBadge } from '../PartyBadge'

import { jsonMap } from '../../utils/jsonmap.js'

import styles from './SeatTotals.module.css';

const SeatsRow = props => {
    const partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
    const partyName = jsonMap(props.forecast.partyName, props.freqSet[0]);
    let partyDesc = "";
    if (partyName === "Independent") partyDesc = "Established Independent - Independents who are either incumbents, gained significant vote previously or otherwise known to have a high profile";
    if (partyName === "Emerging Ind") partyDesc = "Emerging Independent - Independents who are not yet known to have a high profile";
    if (partyName === "Emerging Party") partyDesc = "Emerging Parties - Represents possible votes and wins by parties that may emerge, but are not yet getting significant results in polls";
    const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatTotalsItem}>
            <SmartBadge party={partyAbbr} tooltipText={partyDesc} /> - {props.freqSet[1][4]}
            {" - "}{<strong>{props.freqSet[1][7]}</strong>}
            {" - "}{props.freqSet[1][10]}
            <ProbBarDist freqSet={props.freqSet}
                         thresholds={thresholds}
                         partyAbbr={partyAbbr}
                         minVoteTotal={props.minVoteTotal}
                         maxVoteTotal={props.maxVoteTotal}
                         thresholdLevels={props.forecast.voteTotalThresholds}
                         pluralNoun="seat totals"
                         valType="integer"
                         adjust={true}
            />
        </ListGroup.Item>
    );
}

const SeatsRowSet = props => {
    const freqs = props.forecast.seatCountFrequencies.sort((el1, el2) => {
        return el2[1][7] - el1[1][7];
    });
    const maxVoteTotal = Math.max(...freqs.map(el => Math.max(...el[1])));
    return (
        <ListGroup className={styles.voteTotalsTopList}>
            {freqs.map((freqSet, index) => 
                <SeatsRow forecast={props.forecast}
                          freqSet={freqSet}
                          maxVoteTotal={maxVoteTotal}
                          minVoteTotal={0}
                          key={index}
                />)}
        </ListGroup>
    )
}

const SeatTotals = props => {
    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.seatTotalsTitle}>
                <strong>Seat Totals</strong>
            </Card.Header>
            <Card.Body className={styles.seatTotalsBody}>
                <SeatsRowSet forecast={props.forecast} />
            </Card.Body>
        </Card>
    );
}

export default SeatTotals;