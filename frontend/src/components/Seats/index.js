import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

// import TooltipPercentage from '../TooltipPercentage';
import WinnerBarDist from '../WinnerBarDist';
import { SmartBadge } from '../PartyBadge'

import { intMap } from '../../utils/intmap.js'

import styles from './Seats.module.css';
import { standardiseParty } from 'utils/partyclass';

const partyCategory = (party, forecast) => {
    const sp = standardiseParty(party).toLowerCase();
    if (sp === 'grn') return -2;
    if (sp === 'alp') return -1;
    if (sp === 'kap') return 1;
    if (sp === 'lnp') return 2;
    if (sp === 'onp') return 3;
    if (sp === 'uap') return 3;
    return 0;
}

const SeatRow = props => {
    const seatName = props.forecast.seatNames[props.index];
    const incumbentIndex = props.forecast.seatIncumbents[props.index];
    const incumbentAbbr = intMap(props.forecast.partyAbbr, incumbentIndex);
    const margin = Math.abs(props.forecast.seatMargins[props.index]);

    const freqs = JSON.parse(JSON.stringify(props.forecast.seatPartyWinFrequencies[props.index]));
    freqs.sort((a, b) => {
        const aName = intMap(props.forecast.partyAbbr, a[0]);
        const bName = intMap(props.forecast.partyAbbr, b[0]);
        return partyCategory(aName) - partyCategory(bName);
    });

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
                           freqSet={freqs}
            />
        </ListGroup.Item>
    );
}

const Seats = props => {
    const indexedSeats = props.forecast.seatPartyWinFrequencies.map((a, index) => [index, a]);
    const findMax = pair => pair[1].reduce((p, c) => p > c[1] ? p : c[1], 0);
    const indexedCompetitiveness = indexedSeats.map(a => [a[0], findMax(a)]);
    indexedCompetitiveness.sort((a, b) => a[1] - b[1]);
    const sortedIndices = indexedCompetitiveness.map(a => a[0]);

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.seatsTitle}>
                <strong>Seats</strong>
            </Card.Header>
            <Card.Body className={styles.seatTotalsBody}>
                {
                    sortedIndices.map(index =>
                        <SeatRow forecast={props.forecast} index={index} key={index} />
                    )
                }
            </Card.Body>
        </Card>
    );
}

export default Seats;