import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../TooltipPercentage';
import ProbBarDist from '../ProbBarDist';
import { SmartBadge } from '../PartyBadge'

import { intMap } from '../../utils/intmap.js'

import styles from './VoteTotals.module.css';

const FpRow = props => {
    let partyAbbr = intMap(props.forecast.partyAbbr, props.freqSet[0]);
    const thresholds = [[0,1,0],[1,4,1],[4,6,2],[6,8,3],[8,10,4],[10,13,5],[13,14,6]];
    return (
        <ListGroup.Item className={styles.voteTotalsItem}>
            <SmartBadge party={partyAbbr} /> - <strong><TooltipPercentage value={props.freqSet[1][4]} /></strong>
            {" - "}{<strong><TooltipPercentage value={props.freqSet[1][7]} /></strong>}
            {" - "}{<strong><TooltipPercentage value={props.freqSet[1][10]} /></strong>}
            <ProbBarDist freqSet={props.freqSet}
                         thresholds={thresholds}
                         partyAbbr={partyAbbr}
                         maxVoteTotal={props.maxVoteTotal}
            />
        </ListGroup.Item>
    );
}

const FpRowSet = props => {
    const freqs = props.forecast.fpFrequencies.sort((el1, el2) => {
        return el2[1][7] - el1[1][7];
    });
    const maxVoteTotal = Math.max(...freqs.map(el => Math.max(...el[1])));
    return (
        <ListGroup className={styles.voteTotalsTopList}>
            <ListGroup.Item className={styles.voteTotalsSubHeading}>
                First preference votes
            </ListGroup.Item>
            {freqs.map(freqSet => 
            <FpRow forecast={props.forecast} freqSet={freqSet} maxVoteTotal={maxVoteTotal} />)}
        </ListGroup>
    )
}

const VoteTotals = props => {
    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.voteTotalsTitle}>
                <strong>Vote Totals</strong>
            </Card.Header>
            <Card.Body className={styles.voteTotalsBody}>
                <FpRowSet forecast={props.forecast} />
            </Card.Body>
        </Card>
    );
}

export default VoteTotals;