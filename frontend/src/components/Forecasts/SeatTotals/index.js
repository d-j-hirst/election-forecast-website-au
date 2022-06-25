import React, { useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import ProbBarDist from '../../General/ProbBarDist';
import { SmartBadge } from '../../General/PartyBadge'
import InfoIcon from '../../General/InfoIcon'
import TooltipWrapper from '../../General/TooltipWrapper';

import { jsonMap } from '../../../utils/jsonmap.js'

import styles from './SeatTotals.module.css';

const SeatsRow = props => {
    let partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
    const partyName = jsonMap(props.forecast.partyName, props.freqSet[0]);
    let result = props.result;
    if (partyName === "Emerging Ind") {
        partyAbbr = "IndX";
        result = undefined;
    }
    if (partyName === "Emerging Party") {
        partyAbbr = "EOth";
        result = undefined;
    }
    const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatTotalsItem}>
            <div className={styles.rowLeftSection}>
                <div className={styles.rowParty}><SmartBadge party={partyAbbr} /></div>
                <div className={styles.rowNumber}><TooltipWrapper tooltipText="5th percentile">{props.freqSet[1][4]}</TooltipWrapper></div>
                <div className={styles.rowDash}> - </div>
                <div className={styles.rowNumber}><TooltipWrapper tooltipText="Median"><strong>{props.freqSet[1][7]}</strong></TooltipWrapper></div>
                <div className={styles.rowDash}> - </div>
                <div className={styles.rowNumber}><TooltipWrapper tooltipText="95th percentile">{props.freqSet[1][10]}</TooltipWrapper></div>
            </div>
            <ProbBarDist freqSet={props.freqSet}
                         thresholds={thresholds}
                         partyAbbr={partyAbbr}
                         minVoteTotal={props.minVoteTotal}
                         maxVoteTotal={props.maxVoteTotal}
                         thresholdLevels={props.forecast.voteTotalThresholds}
                         pluralNoun="seat totals"
                         result={result}
                         valType="integer"
                         adjust={true}
                         width={Math.min(props.windowWidth - 70, 350)}
            />
        </ListGroup.Item>
    );
}

const SeatsRowSet = props => {
    let freqs = props.forecast.seatCountFrequencies.sort((el1, el2) => {
        return el2[1][7] - el1[1][7];
    });
    freqs = freqs.filter(a => a[1][a[1].length-1] > 0);
    console.log(freqs);
    const results = props.results === undefined ? undefined :
        freqs.map(freq => props.results.overall.seats[jsonMap(props.forecast.partyAbbr, freq[0])]);
    const maxVoteTotal = Math.max(...freqs.map(el => Math.max(...el[1])));
    return (
        <>
            {freqs.map((freqSet, index) => 
                <SeatsRow forecast={props.forecast}
                          freqSet={freqSet}
                          key={index}
                          maxVoteTotal={maxVoteTotal}
                          minVoteTotal={0}
                          result={results[index]}
                          windowWidth={props.windowWidth}
                />)}
        </>
    )
}

const MainExplainer = props => {
    return (
        <Alert variant="info" className={styles.alert}>
        <p>
            This part of the simulation report covers
            the <strong> number of seats </strong> that
            significant political parties are projected to win. These
            estimates are based on simulations of how the projected vote totals (above)
            are most likely to translate into overall seat numbers in the parliament.
        </p>
            <hr/>
            <p>
                The numbers show the range from the
                <TooltipWrapper tooltipText="5% chance of the number of seats being below this, 95% chance of the number of seats being above this">
                    <strong> 5th percentile </strong>
                </TooltipWrapper>
                to the
                <TooltipWrapper tooltipText="95% chance of the number of seats being below this, 5% chance of the number of seats being above this">
                    <strong> 95th percentile </strong></TooltipWrapper>
                with the outer numbers and the
                <TooltipWrapper tooltipText="50% chance of the number of seats being below this, 50% chance of thenumber of seats being above this">
                    <strong> median </strong>
                </TooltipWrapper> in bold in between them. Numbers outside this range are possible but quite unlikely.
            </p>
            <hr/>
            <p>
                Coloured bars are also shown for a visual representation of the range of possible numbers of seats.
                The dark shaded bars show the more likely ranges with the lighter bars being progressively more
                unlikely. Hover over or tap on the bars for the exact numbers they represent.
            </p>
            <hr/>
            <p>
                Further explanation for some categories below:
            </p>
            <ul>
                <li><SmartBadge party="ind" /> covers independents that are already known - either they are incumbents, achieved a significant vote at the previous election, or have a significant campaign and public presence.</li>
                <li><SmartBadge party="IndX" /> covers potential <i>emerging independents</i> that do not yet have a significant presence but may achieve one before the election.</li>
                <li><SmartBadge party="EOth" /> covers potential <i>emerging parties</i> that either do not yet exist or are not appearing in public polls yet.</li>
            </ul>
        </Alert>
    )
}

const MajorityRow = props => {
    const majoritySize = (() => {
        if (props.election === "2022fed") return 76;
        if (props.election === "2022sa") return 24;
        if (props.election === "2022vic") return 45;
    })();

    return (
        <ListGroup.Item className={styles.seatTotalsNote}>
            Seats required for a majority: <strong>{majoritySize}</strong>
        </ListGroup.Item>
    )
}

const SeatTotals = props => {
    const [showExplainer, setShowExplainer] = useState(false);

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.seatTotalsTitle}>
                <strong>
                    Seat Totals
                    &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
                </strong>
            </Card.Header>
            <Card.Body className={styles.seatTotalsBody}>
                <ListGroup className={styles.seatTotalsList}>
                    {
                        showExplainer && <MainExplainer />
                    }
                    <MajorityRow election={props.election} />
                    <StandardErrorBoundary>
                        <SeatsRowSet forecast={props.forecast} results={props.results} windowWidth={props.windowWidth} />
                    </StandardErrorBoundary>
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default SeatTotals;