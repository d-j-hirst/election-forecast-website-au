import React, { useState }  from 'react';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { HashLink as Link } from 'react-router-hash-link';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import TooltipPercentage from '../../General/TooltipPercentage';
import ProbStatement from '../../General/ProbStatement';
import ProbBarDist from '../../General/ProbBarDist';
import WinnerBarDist from '../../General/WinnerBarDist';
import { SmartBadge } from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';
import TooltipWrapper from '../../General/TooltipWrapper';

import { jsonMap } from '../../../utils/jsonmap.js';
import { deepCopy } from '../../../utils/deepcopy.js';
import { getSeatUrl } from '../../../utils/seaturls.js';

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
    const incumbentAbbr = jsonMap(props.forecast.partyAbbr, incumbentIndex);
    const margin = props.forecast.seatMargins[props.index];

    const freqs = deepCopy(props.forecast.seatPartyWinFrequencies[props.index]);
    freqs.sort((a, b) => {
        const aName = jsonMap(props.forecast.partyAbbr, a[0]);
        const bName = jsonMap(props.forecast.partyAbbr, b[0]);
        return partyCategory(aName) - partyCategory(bName);
    });
    const detailsLink = (props.archiveId !== undefined ?
        `/archive/${props.election}/${props.archiveId}/seat/${getSeatUrl(seatName)}` :
        `/seat/${props.election}/${props.mode}/${getSeatUrl(seatName)}`);

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
                        <strong>&#187;</strong>full detail
                    </span>
                </Link>
            </div>
            <WinnerBarDist forecast={props.forecast}
                           freqSet={freqs}
                           width={Math.min(props.windowWidth - 70, 320)}
            />
        </ListGroup.Item>
        {
            showMore &&
            <SeatMore index={props.index} forecast={props.forecast} windowWidth={props.windowWidth} />
        }
        </>
    );
}

const FpExplainer = props => {
    return (
        <Alert variant="info" className={styles.alert}>
        <p>
            This section show the <strong> share of the first preference vote </strong> that
            significant political parties are projected to get. Parties' possible vote shares are represented as text percentages and
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
        .filter(e => e[1][7] >= 1 || e[1][10] >= 20 || e[1][12] >= 30)
        .sort((el1, el2) => el2[1][7] - el1[1][7]);
    const maxFpTotal = Math.max(...sortedFreqs.map(el => Math.max(...el[1])));
    const someExcluded = sortedFreqs.length < fpFreqs.length;
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading}>
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
                                key={`fp${seatName}a${index}`}
                                index={`fp${seatName}a${index}`}
                                windowWidth={props.windowWidth}
                    />
                )
            }
            {someExcluded &&
                <ListGroup.Item className={styles.seatsNote}>
                    This list is abbreviated to this seat's more popular parties. Click "full detail" above to see others.
                </ListGroup.Item>
            }
        </>
    )
}

const SeatFpRow = props => {
    const partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
    const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatsSubitem}>
            <div className={styles.rowLeftSection}>
                <div className={styles.rowParty}><SmartBadge party={partyAbbr} /></div>
                <div className={styles.rowPercentage}> <TooltipPercentage value={props.freqSet[1][4]} label="5th percentile" /></div>
                <div className={styles.rowDash}> - </div>
                <div className={styles.rowPercentage}>{<strong><TooltipPercentage value={props.freqSet[1][7]} label="Median" /></strong>}</div>
                <div className={styles.rowDash}> - </div>
                <div className={styles.rowPercentage}><TooltipPercentage value={props.freqSet[1][10]} label="95th percentile" /></div>
            </div>
            <ProbBarDist freqSet={props.freqSet}
                         thresholds={thresholds}
                         partyAbbr={partyAbbr}
                         minVoteTotal={props.minVoteTotal}
                         maxVoteTotal={props.maxVoteTotal}
                         thresholdLevels={props.forecast.voteTotalThresholds}
                         pluralNoun="vote totals"
                         valType="percentage"
                         width={Math.min(props.windowWidth - 70, 450)}
            />
        </ListGroup.Item>
    );
}

const TcpExplainer = props => {
    return (
        <Alert variant="warning" className={styles.alert}>
        <p>
            This section show the <strong> share of the two-candidate preferred (TCP) vote </strong> that
            significant political parties are projected to get, arranged into different
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
            For a more thorough explanation with examples, 
            see <Link to={"/guide#tcp-scenarios"}> this section of the forecast guide</Link>.
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
        .filter(e => e[2] > 0.1)
        .sort((e1, e2) => e2[2] - e1[2]);
    const someExcluded = sortedTcpFreqs.length < tcpFreqs.length;
    return (
        <>
            <ListGroup.Item className={styles.seatsSubheading}>
                <strong>Two-candidate preferred scenarios</strong> for {seatName}
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} warning={true} />
            </ListGroup.Item>
            {
                showExplainer && <TcpExplainer />
            }
            {
                sortedTcpFreqs.map((freqSet, index) =>
                    <SeatTcpRowPair forecast={props.forecast}
                                    freqSet={freqSet}
                                    key={`tcp${seatName}a${index}`}
                                    windowWidth={props.windowWidth}
                    />
                )
            }
            {someExcluded &&
                <ListGroup.Item className={styles.seatsNote}>
                    This list is abbreviated to the most likely scenarios. Click "full detail" above to see others.
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

    let partyAbbr0 = jsonMap(props.forecast.partyAbbr, freqSet0[0]);
    if (freqSet0[0] === -2) partyAbbr0 = "IndX";
    if (freqSet0[0] === -3) partyAbbr0 = "EOth";
    let partyAbbr1 = jsonMap(props.forecast.partyAbbr, freqSet1[0]);
    if (freqSet1[0] === -2) partyAbbr1 = "IndX";
    if (freqSet1[0] === -3) partyAbbr1 = "EOth";
    return (
        <>
            <ListGroup.Item className={styles.seatsTcpScenarioHeading}>
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
                    windowWidth={props.windowWidth}
            />
            <SeatFpRow forecast={props.forecast}
                    freqSet={freqSet1}
                    minVoteTotal={minVoteTotal}
                    maxVoteTotal={maxVoteTotal}
                    windowWidth={props.windowWidth}
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
        .filter(a => a[1] >= 1 || a[0] === 0 || a[0] === 1)
        .sort((a, b) => b[1] - a[1]);
    const anyOtherWinPc = sortedFreqs.reduce((p, c) => p - c[1], 100);
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
                            if (party === -2) text = "An emerging independent";
                            return (
                                <React.Fragment key={`a${index}`}>
                                    <div className={styles.seatsWinStatement}>
                                        <ProbStatement forecast={props.forecast}
                                                    party={a[0]}
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

const SeatMore = props => {
    return (
        <>
            <SeatWinsSection forecast={props.forecast} index={props.index} />
            <SeatFpSection forecast={props.forecast} index={props.index} windowWidth={props.windowWidth} />
            <SeatTcpSection forecast={props.forecast} index={props.index} windowWidth={props.windowWidth} />
        </>
    )
}

const MainExplainer = props => {
    const marginTooltip = "How much of the total two-candidate-preferred vote the incumbent can lose" +
        " before they lose the seat. For example, in a seat with 10000 voters and a margin of 3%," +
        " the incumbent has 5300 votes and can lose the seat if they lose 300 votes."

    return (
        <Alert variant="info" className={styles.alert}>
            <p>
                This section lists the simulated results for each seat in this election.
                Each row shows the seat name, incumbent party and the 
                <TooltipWrapper tooltipText={marginTooltip}>
                    <strong> margin </strong>
                </TooltipWrapper> of the incumbent. Seats are shown in order of their competitiveness,
                with the least certain results highest on the page.
            </p>
            <hr />
            <p>
                The coloured bar to the right of each row indicates the modelled probabilities for parties to
                win the seat. Tap or mouse over the colours to see the party name and percentage chance of winning.
            </p>
            <hr />
            <p>
                Click on "more" or "full detail" to show more information about the model's forecast for each
                seat. "More" will display an abbreviated set of results inline on this page, while "full detail" will
                show everything there is to see on a separate page.
            </p>
            <hr />
            <p>
                The most robust seat figures here are those for the major parties, as there are much more
                data on major-major contests for the model to work with. Results for seats where a minor party
                or independent is prominent should be approached with some caution; good local knowledge is likely to
                be more accurate than the model in such seats.
            </p>
        </Alert>
    )
}

const Seats = props => {
    const [showExplainer, setShowExplainer] = useState(false);

    const indexedSeats = props.forecast.seatPartyWinFrequencies.map((a, index) => [index, a]);
    const findMax = pair => pair[1].reduce((p, c) => p > c[1] ? p : c[1], 0);
    const indexedCompetitiveness = indexedSeats.map(a => [a[0], findMax(a)]);
    indexedCompetitiveness.sort((a, b) => a[1] - b[1]);
    const sortedIndices = indexedCompetitiveness.map(a => a[0]);

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.seatsTitle}>
                Seats
                &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
            </Card.Header>
            <Card.Body className={styles.seatsBody}>
                {
                    showExplainer && <MainExplainer />
                }
                <StandardErrorBoundary>
                    <ListGroup className={styles.seatsList}>
                        {
                            sortedIndices.map(index =>
                                <SeatRow forecast={props.forecast}
                                        election={props.election}
                                        mode={props.mode}
                                        index={index}
                                        key={props.forecast.seatNames[index]}
                                        windowWidth={props.windowWidth}
                                        archiveId={props.archiveId} />
                            )
                        }
                    </ListGroup>
                </StandardErrorBoundary>
            </Card.Body>
        </Card>
    );
}

export default Seats;