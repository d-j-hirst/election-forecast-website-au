import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

// import TooltipPercentage from '../TooltipPercentage';
import WinnerBarDist from '../WinnerBarDist';
import { SmartBadge } from '../PartyBadge'

import { intMap } from '../../utils/intmap.js'

import styles from './Seats.module.css';

const SeatRow = props => {
    const seatName = props.forecast.seatNames[props.index];
    const incumbentIndex = props.forecast.seatIncumbents[props.index];
    const incumbentAbbr = intMap(props.forecast.partyAbbr, incumbentIndex);
    const margin = Math.abs(props.forecast.seatMargins[props.index]);

    // const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatsItem}>
            <div>
                <strong>{seatName}</strong><br /><small>held by&nbsp;
                <SmartBadge party={incumbentAbbr} />
                &nbsp;({Number(margin).toFixed(1)}%)
                </small>
            </div>
            <WinnerBarDist forecast={props.forecast}
                           freqSet={props.forecast.seatPartyWinFrequencies[props.index]}
            />
        </ListGroup.Item>
    );
}

const Seats = props => {
    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.seatsTitle}>
                <strong>Seats</strong>
            </Card.Header>
            <Card.Body className={styles.seatTotalsBody}>
                {
                    props.forecast.seatNames.map((_, index) =>
                        <SeatRow forecast={props.forecast} index={index} key={index} />
                    )
                }
            </Card.Body>
        </Card>
    );
}

export default Seats;