import React, { useState } from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';

import TooltipPercentage from '../TooltipPercentage';
import ProbStatement from '../ProbStatement';
import ProbBarDist from '../ProbBarDist';
import WinnerBarDist from '../WinnerBarDist';
import { SmartBadge } from '../PartyBadge';
import InfoIcon from '../InfoIcon'
import TooltipWrapper from '../TooltipWrapper';

import { jsonMap } from '../../utils/jsonmap.js';
import { deepCopy } from '../../utils/deepcopy.js';

import styles from './SeatDetailBody.module.css';
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

const SeatSummary = props => {

    const incumbentIndex = props.forecast.seatIncumbents[props.index];
    const incumbentAbbr = jsonMap(props.forecast.partyAbbr, incumbentIndex);
    const margin = props.forecast.seatMargins[props.index];

    const freqs = deepCopy(props.forecast.seatPartyWinFrequencies[props.index]);
    freqs.sort((a, b) => {
        const aName = jsonMap(props.forecast.partyAbbr, a[0]);
        const bName = jsonMap(props.forecast.partyAbbr, b[0]);
        return partyCategory(aName) - partyCategory(bName);
    });

    // const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatsItem}>
            <div className={styles.seatsTopLeft}>
                Held by <SmartBadge party={incumbentAbbr} /> with margin {Number(margin).toFixed(1)}%
                <br/>
            </div>
            <WinnerBarDist forecast={props.forecast}
                           freqSet={freqs}
            />
        </ListGroup.Item>
    );
}

const FpExplainer = props => {
    return (
        <Alert variant="info" className={styles.alert}>
        <p>
            This section show the <strong> share of the first preference vote </strong> that
            political parties are projected to get. Parties' possible vote shares are represented as text percentages and
            using bars to represent more and less likely ranges for the vote.
        </p>
        <hr/>
        <p>
            The numbers show the range from the
            <TooltipWrapper tooltipText="5% chance of the vote share being below this, 95% chance of the vote share being above this">
                <strong> 5th percentile </strong>
            </TooltipWrapper>
            to the
            <TooltipWrapper tooltipText="95% chance of the vote share being below this, 5% chance of the vote share being above this">
                <strong> 95th percentile </strong></TooltipWrapper>
            with the outer numbers and the
            <TooltipWrapper tooltipText="50% chance of the vote share being below this, 50% chance of the vote share being above this">
                <strong> median </strong>
            </TooltipWrapper> in bold in between them. Numbers outside this range are possible but quite unlikely.
        </p>
        <hr/>
        <p>
            Coloured bars are also shown for a visual representation of the range of possible vote shares.
            The dark shaded bars show the more likely ranges with the lighter bars being progressively more
            unlikely. Hover over or tap on the bars for the exact numbers they represent.
        </p>
        </Alert>
    )
}

const SeatFpSection = props => {
    const [showExplainer, setShowExplainer] = useState(false);

    const seatName = props.forecast.seatNames[props.index];
    // create deep copy of the fp probability bands
    const fpFreqs = deepCopy(props.forecast.seatFpBands[props.index]);
    const sortedFreqs = fpFreqs
        .sort((el1, el2) => el2[1][7] - el1[1][7]);
    const maxFpTotal = Math.max(...sortedFreqs.map(el => Math.max(...el[1])));
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading} key={props.index}>
                <strong>First preference projection</strong> for {seatName}
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
            </ListGroup.Item>
            {
                showExplainer && <FpExplainer seatName={seatName} />
            }
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
        </>
    )
}

const SeatFpRow = props => {
    let partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
    if (props.freqSet[0] === -2) partyAbbr = "IndX";
    if (props.freqSet[0] === -3) partyAbbr = "EOth";
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

const TcpExplainer = props => {
    return (
        <Alert variant="warning" className={styles.alert}>
        <p>
            This section show the <strong> share of the two-candidate preferred (TCP) vote </strong> that
            political parties are projected to get, arranged into different
            pairs of parties that might make up the final TCP after distribution of preferences.
        </p>
        <hr/>
        <p>
            Note that the reports for each TCP pair only include results for the simulations where
            the that pair actually made the final TCP.
            <strong> This means that the results need to
                be interpreted with caution, and, in particular, conclusions should not be drawn by comparing
                different TCP pairs to each 
            other. </strong>
            For a more thorough explanation with examples, see this FAQ.
        </p>
        <hr/>
        <p>
            Parties' possible TCP vote shares are shown as text percentages and
            coloured bars to represent more and less likely ranges for the vote.
        </p>
        <hr/>
        <p>
            The numbers show the range from the
            <TooltipWrapper tooltipText="5% chance of the vote share being below this, 95% chance of the vote share being above this">
                <strong> 5th percentile </strong>
            </TooltipWrapper>
            to the
            <TooltipWrapper tooltipText="95% chance of the vote share being below this, 5% chance of the vote share being above this">
                <strong> 95th percentile </strong></TooltipWrapper>
            with the outer numbers and the
            <TooltipWrapper tooltipText="50% chance of the vote share being below this, 50% chance of the vote share being above this">
                <strong> median </strong>
            </TooltipWrapper> in bold in between them. Numbers outside this range are possible but quite unlikely.
        </p>
        <hr/>
        <p>
            Coloured bars are also shown for a visual representation of the range of possible vote shares.
            The dark shaded bars show the more likely ranges with the lighter bars being progressively more
            unlikely. Hover over or tap on the bars for the exact numbers they represent.
        </p>
        </Alert>
    )
}

const SeatTcpSection = props => {
    const [showExplainer, setShowExplainer] = useState(false);

    const seatName = props.forecast.seatNames[props.index];
    const tcpFreqs = deepCopy(props.forecast.seatTcpBands[props.index]);
    const sortedTcpFreqs = tcpFreqs
        .map((e, i) => e.concat(props.forecast.seatTcpScenarios[props.index][i][1]))
        .sort((e1, e2) => e2[2] - e1[2]);
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading} key={props.index}>
                <strong>Two-candidate preferred scenarios</strong> for {seatName}
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
            </ListGroup.Item>
            {
                showExplainer && <TcpExplainer seatName={seatName} />
            }
            {
                sortedTcpFreqs.map((freqSet, index) =>
                    <SeatTcpRowPair forecast={props.forecast}
                                    freqSet={freqSet}
                                    key={index}
                    />
                )
            }
        </>
    )
}

const SeatTcpRowPair = props => {
    const freqSet0 = [props.freqSet[0][0], props.freqSet[1]];
    const freqSet1 = [props.freqSet[0][1], props.freqSet[1].map(a => 100 - a).reverse()];
    const maxVoteTotal = Math.max(Math.max(...freqSet0[1]), Math.max(...freqSet1[1]));
    const minVoteTotal = Math.min(Math.min(...freqSet0[1]), Math.min(...freqSet1[1]));

    let partyAbbr0 = jsonMap(props.forecast.partyAbbr, freqSet0[0]);
    if (freqSet0[0] === -2) partyAbbr0 = "IndX";
    if (freqSet0[0] === -3) partyAbbr0 = "EOth";
    let partyAbbr1 = jsonMap(props.forecast.partyAbbr, freqSet1[0]);
    if (freqSet1[0] === -2) partyAbbr1 = "IndX";
    if (freqSet1[0] === -3) partyAbbr1 = "EOth";
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
    const sortedFreqs = freqs
      .sort((a, b) => b[1] - a[1]);
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading} key={props.index}>
                <strong>Win Probabilities</strong> for {seatName}
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
            </ListGroup.Item>
            {
                showExplainer && <WinsExplainer seatName={seatName} />
            }
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
            </ListGroup.Item>
        </>
    )
}

const MainExplainer = props => {
    return (
        <Alert variant="info" className={styles.alert}>
            <p>
                This section lists the <strong>full simulated results</strong> for the seat of {props.seatName}.
            </p>
            <hr />
            <p>
                The coloured bar just below indicates the modelled probabilities for parties to
                win the seat. Tap or mouse over the colours to see the party name and percentage chance of winning.
            </p>
            <hr />
            <p>
                In general, for seat results, the most robust seat figures are those for the major parties, 
                as there are much more data on major-major contests for the model to work with. Results for
                seats where a minor party or independent is prominent should be approached with some caution;
                good local knowledge is likely to be more accurate than the model in such seats.
            </p>
        </Alert>
    )
}

const SeatDetailBody = props => {
    const [showExplainer, setShowExplainer] = useState(false);

    const seatName = props.forecast.seatNames[props.index];

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.seatsTitle}>
                Seat details for {seatName}
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
            </Card.Header>
            <Card.Body className={styles.seatTotalsBody}>
                {
                    showExplainer && <MainExplainer seatName={seatName} />
                }
                <SeatSummary forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
                <SeatWinsSection forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
                <SeatFpSection forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
                <SeatTcpSection forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
            </Card.Body>
        </Card>
    );
}

export default SeatDetailBody;