import React, { useState }  from 'react';
import { Link } from 'react-router-dom';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../TooltipPercentage';
import ProbStatement from '../ProbStatement';
import ProbBarDist from '../ProbBarDist';
import WinnerBarDist from '../WinnerBarDist';
import { SmartBadge } from '../PartyBadge';

import { intMap } from '../../utils/intmap.js';
import { getSeatUrl } from '../../utils/seaturls.js';

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
    const detailsLink = "/seat/"
                        + props.election + "/"
                        + props.mode + "/"
                        + getSeatUrl(seatName);

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
                <Link to={detailsLink}>
                    <span className={styles.seatsLink}>
                        <strong>&#11177;</strong>full detail
                    </span>
                </Link>
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

const SeatFpSection = props => {
    const seatName = props.forecast.seatNames[props.index];
    // create deep copy of the fp probability bands
    const fpFreqs = JSON.parse(JSON.stringify(props.forecast.seatFpBands[props.index]));
    const sortedFreqs = fpFreqs
        .filter(e => e[1][7] >= 1 || e[1][10] >= 20 || e[1][12] >= 30)
        .sort((el1, el2) => el2[1][7] - el1[1][7]);
    const maxFpTotal = Math.max(...sortedFreqs.map(el => Math.max(...el[1])));
    const someExcluded = sortedFreqs.length < fpFreqs.length;
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading} key={props.index}>

                <strong>First preference projection</strong> for {seatName}
            </ListGroup.Item>
            {
                sortedFreqs.map((freqSet, index) =>
                    <SeatFpRow forecast={props.forecast}
                                freqSet={freqSet}
                                maxVoteTotal={maxFpTotal}
                                minVoteTotal={0}
                                key={index}
                    />
                )
            }
            {someExcluded &&
                <ListGroup.Item className={styles.seatsNote} key={props.index}>
                    Some parties with low projected first preferences not shown
                </ListGroup.Item>
            }
        </>
    )
}

const SeatFpRow = props => {
    const partyAbbr = intMap(props.forecast.partyAbbr, props.freqSet[0]);
    const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatsSubitem}>
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

const SeatTcpSection = props => {
    const seatName = props.forecast.seatNames[props.index];
    const tcpFreqs = JSON.parse(JSON.stringify(props.forecast.seatTcpBands[props.index]));
    const sortedTcpFreqs = tcpFreqs
        .map((e, i) => e.concat(props.forecast.seatTcpScenarios[props.index][i][1]))
        .filter(e => e[2] > 0.1)
        .sort((e1, e2) => e2[2] - e1[2]);
    const someExcluded = sortedTcpFreqs.length < tcpFreqs.length;
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading} key={props.index}>
                <strong>Two-candidate preferred scenarios</strong> for {seatName}
            </ListGroup.Item>
            {
                sortedTcpFreqs.map((freqSet, index) =>
                    <SeatTcpRowPair forecast={props.forecast}
                                    freqSet={freqSet}
                                    key={index}
                    />
                )
            }
            {someExcluded &&
                <ListGroup.Item className={styles.seatsNote} key={props.index}>
                    Some scenarios projected to occur rarely not shown
                </ListGroup.Item>
            }
        </>
    )
}

const SeatTcpRowPair = props => {
    const freqSet0 = [props.freqSet[0][0], props.freqSet[1]];
    const freqSet1 = [props.freqSet[0][1], props.freqSet[1].map(a => 100 - a).reverse()];
    const maxVoteTotal = Math.max(Math.max(...freqSet0[1]), Math.max(...freqSet1[1]));
    const minVoteTotal = Math.min(Math.min(...freqSet0[1]), Math.min(...freqSet1[1]));

    const partyAbbr0 = intMap(props.forecast.partyAbbr, freqSet0[0]);
    const partyAbbr1 = intMap(props.forecast.partyAbbr, freqSet1[0]);
    return (
        <>
            <ListGroup.Item className={styles.seatsTcpScenarioHeading} key={props.index}>
                <SmartBadge party={partyAbbr0} />
                { } vs { }
                <SmartBadge party={partyAbbr1} />
                { } - probability this scenario occurs: { }
                <strong><TooltipPercentage value={props.freqSet[2] * 100} /></strong>
            </ListGroup.Item>
            <SeatFpRow forecast={props.forecast}
                    freqSet={freqSet0}
                    minVoteTotal={minVoteTotal}
                    maxVoteTotal={maxVoteTotal}
            />
            <SeatFpRow forecast={props.forecast}
                    freqSet={freqSet1}
                    minVoteTotal={minVoteTotal}
                    maxVoteTotal={maxVoteTotal}
            />
        </>
    );
}

const SeatWinsSection = props => {
    const seatName = props.forecast.seatNames[props.index];

    const freqs = JSON.parse(JSON.stringify(props.forecast.seatPartyWinFrequencies[props.index]));
    const sortedFreqs = freqs
        .filter(a => a[1] >= 1 || a[0] === 0 || a[0] === 1)
        .sort((a, b) => b[1] - a[1]);
    const anyOtherWinPc = sortedFreqs.reduce((p, c) => p - c[1], 100);
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading} key={props.index}>
                <strong>Win Probabilities</strong> for {seatName}
            </ListGroup.Item>
            <ListGroup.Item className={styles.seatsMore} key={props.index+1000}>
                {
                    sortedFreqs.map(
                        (a, index) => {
                            let text = "Independent";
                            const party = a[0];
                            if (party === -3) text = "An emerging party";
                            if (party === -2) text = "An emerging independent";
                            return (
                                <>
                                    <div className={styles.seatsWinStatement} key={index}>
                                        <ProbStatement forecast={props.forecast}
                                                    party={a[0]}
                                                    prob={a[1]}
                                                    text={text}
                                                    outcome={"win " + seatName}
                                                    key={index}
                                        />
                                    </div>
                                </>
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

const SeatMore = props => {
    return (
        <>
            <SeatWinsSection forecast={props.forecast} index={props.index} key={props.index} />
            <SeatFpSection forecast={props.forecast} index={props.index} key={props.index} />
            <SeatTcpSection forecast={props.forecast} index={props.index} key={props.index} />
        </>
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
                Seats
            </Card.Header>
            <Card.Body className={styles.seatTotalsBody}>
                {
                    sortedIndices.map(index =>
                        <SeatRow forecast={props.forecast}
                                 election={props.election}
                                 mode={props.mode}
                                 index={index}
                                 key={index} />
                    )
                }
            </Card.Body>
        </Card>
    );
}

export default Seats;