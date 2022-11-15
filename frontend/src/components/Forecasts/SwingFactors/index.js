import React, { useState }  from 'react';

import Alert from 'react-bootstrap/Alert';
import { HashLink as Link } from 'react-router-hash-link';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../../General/TooltipPercentage';
import { SmartBadge } from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';
import TooltipWrapper from '../../General/TooltipWrapper';

import { jsonMap } from '../../../utils/jsonmap.js';
import { deepCopy } from '../../../utils/deepcopy.js';

import styles from '../Seats/Seats.module.css';

const SortedTcpSwingRow = props => {
    return (
        <ListGroup.Item className={styles.seatsSubitem}>
            <div styles="width: 100%;">
                <strong>
                    <TooltipPercentage value={Math.abs(props.swing)} />
                </strong>{' '}
                to <SmartBadge party={props.swing > 0 ? "alp" : "lnp"} />{' -'} {props.description} 
            </div>
        </ListGroup.Item>
    )
}

const SwingFactorsExplainer = props => {
    return (
        <Alert variant="info" className={styles.info}>
        <p>
            Paragraph 1
        </p>
        <hr/>
        <p>
            Paragraph 2
        </p>
        </Alert>
    )
}

const SeatTcpSwingFactors = props => {
    const [showExplainer, setShowExplainer] = useState(false);
    const seatName = props.forecast.seatNames[props.index];
    const sortedSwingFactors = props.forecast.seatSwingFactors[props.index]
        .map(a => a.split(';'))
        .map(a => [a[0], parseFloat(a[1])])
        .filter(a => Math.abs(a[1]) > 0.01)
        .sort((e1, e2) => Math.abs(e2[1]) - Math.abs(e1[1]));
        
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading}>
                <strong>Two-party-preferred swing factors</strong> for {seatName}
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} warning={false} />
            </ListGroup.Item>
            {
                showExplainer && <SwingFactorsExplainer />
            }

            {
                sortedSwingFactors.map(a =>
                    <SortedTcpSwingRow description={a[0]}
                                       swing={a[1]}
                                       key={a[0]}
                    />
                )
            }
            <ListGroup.Item className={styles.seatsNote}>
                Explanatory note
            </ListGroup.Item>
        </>
    )
}

export default SeatTcpSwingFactors;