import React, { useState }  from 'react';

import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';

import ProbStatement from '../../General/ProbStatement';

import { jsonMap } from '../../../utils/jsonmap.js';
import { deepCopy } from '../../../utils/deepcopy.js';
import InfoIcon from '../../General/InfoIcon';

import styles from '../Seats/Seats.module.css';

const WinsExplainer = props => {

    return (
        <Alert variant="info" className={styles.alert}>
            <p>
                These are the probabilities that the forecast model gives to each party and independents
                to win the seat of {props.seatName}.
            </p>
        </Alert>
    )
}

const SeatWinsSection = props => {

    const [showExplainer, setShowExplainer] = useState(false);

    const seatName = props.forecast.seatNames[props.index];

    const freqs = deepCopy(props.forecast.seatPartyWinFrequencies[props.index]);

    const filterfunc = props.abbreviated ?
        a => a[1] >= 1 || a[0] === 0 || a[0] === 1 :
        a => a[1] > 0;
    
    const sortedFreqs = freqs
        .filter(filterfunc)
        .sort((a, b) => b[1] - a[1]);
    const anyOtherWinPc = sortedFreqs.reduce((p, c) => p - c[1], 100);
    const namedIndependentExists = sortedFreqs.filter(a => jsonMap(props.forecast.partyAbbr, a[0]) === "IND").length > 1;
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading}>
                <strong>Win Probabilities</strong> for {seatName}
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
            </ListGroup.Item>
            {
                    showExplainer && <WinsExplainer seatName={seatName} />
            }
            <ListGroup.Item className={styles.seatsMore}>
                {
                    sortedFreqs.map(
                        (a, index) => {
                            let text = "Independent";
                            const party = a[0];
                            if (party === -3) text = "An emerging party";
                            if (party === -2) text = namedIndependentExists ? "Any other independent" : "Any independent";
                            const name = ("seatCandidateNames" in props.forecast ?
                                (
                                    jsonMap(props.forecast.seatCandidateNames[props.index], party, null)
                                )
                                : null
                            );
                            return (
                                <React.Fragment key={`a${index}`}>
                                    <div className={styles.seatsWinStatement}>
                                        <ProbStatement forecast={props.forecast}
                                                    party={a[0]}
                                                    candidateName={name}
                                                    prob={a[1]}
                                                    text={text}
                                                    outcome={"win " + seatName}
                                        />
                                    </div>
                                </React.Fragment>
                            )
                        }
                    )
                }
                {anyOtherWinPc > 0 &&
                    <div className={styles.seatsWinStatement}>
                        <ProbStatement forecast={props.forecast}
                                    party={"oth"}
                                    prob={anyOtherWinPc}
                                    text={"Any other candidate"}
                                    outcome={"win " + seatName}
                        />
                    </div>
                }
            </ListGroup.Item>
        </>
    )
}

export default SeatWinsSection;