import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

// import TooltipPercentage from '../TooltipPercentage';
import ProbBarDist from '../ProbBarDist';
import { SmartBadge } from '../PartyBadge'

import { jsonMap } from '../../utils/jsonmap.js'

import styles from './SeatTotals.module.css';

const SeatsRow = props => {
    let partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
    const partyName = jsonMap(props.forecast.partyName, props.freqSet[0]);
    if (partyName === "Emerging Ind") {
        partyAbbr = "IndX";
    }
    if (partyName === "Emerging Party") {
        partyAbbr = "EOth";
    }
    const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatTotalsItem}>
            <SmartBadge party={partyAbbr} /> - {props.freqSet[1][4]}
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
    let freqs = props.forecast.seatCountFrequencies.sort((el1, el2) => {
        return el2[1][7] - el1[1][7];
    });
    freqs = freqs.filter(a => a[1][a[1].length-1] > 0);
    console.log(freqs);
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