import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../TooltipPercentage';
import ProbBarDist from '../ProbBarDist';
import VoteTrendChart from '../VoteTrendChart';
import { SmartBadge } from '../PartyBadge'

import { jsonMap } from '../../utils/jsonmap.js'

import styles from './VoteTotals.module.css';

const VoteShareRow = props => {
    let partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
    const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.voteTotalsItem}>
            <SmartBadge party={partyAbbr} /> - <TooltipPercentage value={props.freqSet[1][4]} />
            {" - "}{<strong><TooltipPercentage value={props.freqSet[1][7]} /></strong>}
            {" - "}{<TooltipPercentage value={props.freqSet[1][10]} />}
            <ProbBarDist freqSet={props.freqSet}
                         thresholds={thresholds}
                         partyAbbr={partyAbbr}
                         minVoteTotal={props.minVoteTotal}
                         maxVoteTotal={props.maxVoteTotal}
                         thresholdLevels={props.forecast.voteTotalThresholds}
                         pluralNoun="vote totals"
                         valType="percentage"
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
            {freqs.map((freqSet, index) => 
                <VoteShareRow forecast={props.forecast}
                              freqSet={freqSet}
                              maxVoteTotal={maxVoteTotal}
                              minVoteTotal={0}
                              key={index}
                />)}
        </ListGroup>
    )
}

const TppRowSet = props => {
    const partyFreqs = [[0, props.forecast.tppFrequencies]];
    partyFreqs.push([1, partyFreqs[0][1].map(freq => 100 - freq).reverse()]);
    const maxVoteTotal = Math.max(Math.max(...partyFreqs[0][1]), Math.max(...partyFreqs[1][1]));
    const minVoteTotal = Math.min(Math.min(...partyFreqs[0][1]), Math.min(...partyFreqs[1][1]));
    const firstHigher = partyFreqs[0][1][7] > partyFreqs[1][1][7];
    return (
        <ListGroup className={styles.voteTotalsTopList}>
            <ListGroup.Item className={styles.voteTotalsSubHeading}>
                Two-party-preferred votes
            </ListGroup.Item>
            <VoteShareRow forecast={props.forecast}
                          freqSet={partyFreqs[firstHigher ? 0 : 1]}
                          maxVoteTotal={maxVoteTotal}
                          minVoteTotal={minVoteTotal} />
            <VoteShareRow forecast={props.forecast}
                          freqSet={partyFreqs[firstHigher ? 1 : 0]}
                          maxVoteTotal={maxVoteTotal}
                          minVoteTotal={minVoteTotal} />
        </ListGroup>
    )
}

const VoteTrendChartSet = props => {
    return (<>
        <ListGroup.Item className={styles.voteTotalsSubHeading}>
            Estimated past voting trend
        </ListGroup.Item>
        <VoteTrendChart forecast={props.forecast} />
    </>)
}

const VoteTotals = props => {
    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.voteTotalsTitle}>
                <strong>Vote Totals</strong>
            </Card.Header>
            <Card.Body className={styles.voteTotalsBody}>
                <TppRowSet forecast={props.forecast} />
                <FpRowSet forecast={props.forecast} />
                <VoteTrendChartSet forecast={props.forecast} />
            </Card.Body>
        </Card>
    );
}

export default VoteTotals;