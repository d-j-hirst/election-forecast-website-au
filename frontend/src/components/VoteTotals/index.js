import React, { useState } from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import GovernmentFormationChart from '../GovernmentFormationChart'
import TooltipPercentage from '../TooltipPercentage'
import TooltipText from '../TooltipText'
import { SmartBadge } from '../PartyBadge'

import { intMap } from '../../utils/intmap.js'
import { lightBgClass, xLightBgClass, xxLightBgClass, xxxLightBgClass, standardiseParty } from '../../utils/partyclass.js'

import styles from './VoteTotals.module.css';

const VoteTotals = props => {
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
                    {props.forecast.fpFrequencies.map(el => {
                        let rows = [];
                        const partyName = intMap(props.forecast.partyName, el[0])
                        rows.push(<ListGroup.Item className={styles.voteTotalsItem}>
                            {partyName} - <strong><TooltipPercentage value={el[1][3]} /></strong>
                            {" - "}{<strong><TooltipPercentage value={el[1][7]} /></strong>}
                            {" - "}{<strong><TooltipPercentage value={el[1][11]} /></strong>}
                        </ListGroup.Item>);
                        return rows;
                    })}
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default VoteTotals;