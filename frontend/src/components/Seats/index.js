import React, { useState }  from 'react';

import Card from 'react-bootstrap/Card';
import Link from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

// import TooltipPercentage from '../TooltipPercentage';
import ProbStatement from '../ProbStatement'
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
    const [ showMore, setShowMore] = useState(false);

    const moreHandler = () => setShowMore(!showMore);

    const seatName = props.forecast.seatNames[props.index];
    const incumbentIndex = props.forecast.seatIncumbents[props.index];
    const incumbentAbbr = intMap(props.forecast.partyAbbr, incumbentIndex);
    const margin = props.forecast.seatMargins[props.index];

    const freqs = JSON.parse(JSON.stringify(props.forecast.seatPartyWinFrequencies[props.index]));
    freqs.sort((a, b) => {
        const aName = intMap(props.forecast.partyAbbr, a[0]);
        const bName = intMap(props.forecast.partyAbbr, b[0]);
        return partyCategory(aName) - partyCategory(bName);
    });

    // const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <>
        <ListGroup.Item className={styles.seatsItem}>
            <div className={styles.seatsTopLeft}>
                <strong>{seatName}</strong>
                {" - "}<SmartBadge party={incumbentAbbr} /> {Number(margin).toFixed(1)}%
                <br/>
                <span className={styles.seatsLink} onClick={moreHandler}> 
                    {!showMore &&
                        <>
                        &#9660;more
                        </>
                    }
                    {showMore &&
                        <>
                        &#9650;less
                        </>
                    }
                </span>{"  |  "}
                <span className={styles.seatsLink}><strong>&#11177;</strong>full detail</span>
            </div>
            <WinnerBarDist forecast={props.forecast}
                           freqSet={freqs}
            />
        </ListGroup.Item>
        {
            showMore && 
            <SeatMore index={props.index} forecast={props.forecast} />
        }
        </>
    );
}

const SeatMore = props => {
    const seatName = props.forecast.seatNames[props.index];
    
    const freqs = JSON.parse(JSON.stringify(props.forecast.seatPartyWinFrequencies[props.index]));
    freqs.sort((a, b) => {
        return b[1] - a[1];
    });

    // Before release:
    //  - unlikely parties (<1.0% chance and not a major) should be grouped together under "any other party"
    //    and their individual results moved to the full detail screen
    //  - Need primary vote prob-bar and more frequent tcp prob-bar (most frequent + anything above ~20%)
    return (
        <ListGroup.Item className={styles.seatsMore}>
            {
                freqs.map(
                    a => {
                        let text = "Independent";
                        const party = a[0];
                        if (party === -3) text = "An emerging party";
                        if (party === -2) text = "An emerging independent";
                        return (
                            <>
                                <div className={styles.seatsWinStatement}>
                                    <ProbStatement forecast={props.forecast}
                                                party={a[0]}
                                                prob={a[1]}
                                                text={text}
                                                outcome={"win " + seatName}
                                    />
                                </div>
                            </>
                        )
                    }
                )
            }
        </ListGroup.Item>
    )
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