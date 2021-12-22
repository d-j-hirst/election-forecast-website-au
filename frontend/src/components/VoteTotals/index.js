import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../TooltipPercentage'
// import TooltipText from '../TooltipText'
import { SmartBadge } from '../PartyBadge'

import { intMap } from '../../utils/intmap.js'
import { bgClass, midBgClass, lightBgClass, xLightBgClass, xxLightBgClass, xxxLightBgClass } from '../../utils/partyclass.js'

import styles from './VoteTotals.module.css';

const VoteTotals = props => {
    const freqs = props.forecast.fpFrequencies.sort((el1, el2) => {
        return el2[1][7] - el1[1][7];
    });
    const maxVoteTotal = Math.max(...freqs.map(el => Math.max(...el[1])));
    console.log(freqs.map(el => Math.max(...el[1])));
    console.log(maxVoteTotal);
    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.voteTotalsTitle}>
                <strong>Vote Totals</strong>
            </Card.Header>
            <Card.Body className={styles.voteTotalsBody}>
                <ListGroup className={styles.voteTotalsTopList}>
                    <ListGroup.Item className={styles.voteTotalsSubHeading}>
                        First preference votes
                    </ListGroup.Item>
                    {freqs.map(el => {
                        let rows = [];
                        let partyAbbr = intMap(props.forecast.partyAbbr, el[0]);
                        const thresholds = [[0,1,0],[1,4,1],[4,6,2],[6,8,3],[8,10,4],[10,13,5],[13,14,6]];
                        const midPoint = Math.floor(thresholds.length / 2);
                        const classes = [[0, bgClass(partyAbbr)],
                                         [1, midBgClass(partyAbbr)],
                                         [2, lightBgClass(partyAbbr)],
                                         [3, xLightBgClass(partyAbbr)],
                                         [4, xxLightBgClass(partyAbbr)],
                                         [5, xxxLightBgClass(partyAbbr)]];
                        const chartWidth = 300;
                        const scalingFactor = chartWidth / (maxVoteTotal);
                        const voteDistStyle = {
                            width: chartWidth.toString() + 'px',
                            position: 'relative',
                            height: '10px',
                            padding: '8px 0px'
                        };
                        
                        rows.push(
                            <ListGroup.Item className={styles.voteTotalsItem}>
                                <SmartBadge party={partyAbbr} /> - <strong><TooltipPercentage value={el[1][4]} /></strong>
                                {" - "}{<strong><TooltipPercentage value={el[1][7]} /></strong>}
                                {" - "}{<strong><TooltipPercentage value={el[1][10]} /></strong>}
                                <div style={voteDistStyle}>
                                    {thresholds.map(th => {
                                        const leftVal = Math.floor(el[1][th[0]] * scalingFactor).toString() + 'px';
                                        const widthVal = Math.floor((el[1][th[1]] - el[1][th[0]]) * scalingFactor + 1).toString() + 'px';
                                        const thisStyle = {
                                            height: '10px',
                                            width: widthVal,
                                            left: leftVal,
                                            position: 'absolute'
                                        }
                                        const distanceFromMid = Math.abs(th[2] - midPoint);
                                        console.log(classes);
                                        console.log(th[2]);
                                        console.log(midPoint);
                                        console.log(distanceFromMid);
                                        console.log(intMap(classes, distanceFromMid));
                                        const barClass = intMap(classes, distanceFromMid);
                                        return <div style={thisStyle} className={barClass}/>
                                    })}
                                </div>
                            </ListGroup.Item>
                        );
                        return rows;
                    })}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default VoteTotals;