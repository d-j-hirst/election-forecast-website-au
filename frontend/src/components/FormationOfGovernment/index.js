import React, { useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import ProbStatement from '../ProbStatement'
import GovernmentFormationChart from '../GovernmentFormationChart'
import InfoIcon from '../InfoIcon'
import { SmartBadge } from '../PartyBadge'

import { jsonMap } from '../../utils/jsonmap.js'
import { lightBgClass, xLightBgClass, xxLightBgClass, xxxLightBgClass, standardiseParty } from '../../utils/partyclass.js'

import styles from './FormationOfGovernment.module.css';

const MajorityWinGovernmentRow = props => {
    const party = parseInt(props.partyIndex)
    const partyAbbr = standardiseParty(party, props.forecast);
    const prob = jsonMap(props.forecast.majorityWinPc, party);
    const bgClasses = `${styles['formationOfGovernmentSubItem']} ${xLightBgClass(partyAbbr)}`;
    return (
        <ListGroup.Item className={bgClasses}>
            &nbsp;&bull;&nbsp;
            <ProbStatement forecast={props.forecast}
                                     party={party}
                                     prob={prob}
                                     text={props.text}
                                     outcome={"have a majority"}
            />
        </ListGroup.Item>
    )
};

const MinorityWinGovernmentRow = props => {
    const party = parseInt(props.partyIndex)
    const partyAbbr = standardiseParty(party, props.forecast);
    const prob = jsonMap(props.forecast.minorityWinPc, party);
    const bgClasses = `${styles['formationOfGovernmentSubItem']} ${xxLightBgClass(partyAbbr)}`;
    const minorityTooltipText = "Parties expected to support this major party in a minority government. " + 
        "The Greens are expected to support the ALP; One Nation, United Australia Party and Katter's Australian Party " +
        "are expected to support the LNP; and Centre Alliance and all independents are considered to not support either " +
        "major party by default.";
    return (
        <ListGroup.Item className={bgClasses}>
            &nbsp;&bull;&nbsp;
            <ProbStatement forecast={props.forecast}
                           party={party}
                           prob={prob}
                           text={props.text}
                           outcome={"have a clear path to minority government"}
                           tooltipText={minorityTooltipText} />
        </ListGroup.Item>
    )
};

const MostSeatsRow = props => {
    const party = parseInt(props.partyIndex)
    const partyAbbr = standardiseParty(party, props.forecast);
    const prob = jsonMap(props.forecast.mostSeatsWinPc, party);
    const bgClasses = `${styles['formationOfGovernmentSubItem']} ${xxxLightBgClass(partyAbbr)}`;
    const hungTooltipText = "While the term hung parliament is often used to indicate any parliament where no " +
        "party can form a majority, here it is used in a narrower sense to count only those situations where " +
        "neither major party would be expected to form a minority government with the support of minor parties " +
        "aligned with it.";
    return (
        <ListGroup.Item className={bgClasses}>
            &nbsp;&bull;&nbsp;
            <ProbStatement forecast={props.forecast}
                           party={party}
                           prob={prob}
                           text={props.text}
                           outcome={"have most seats in a hung parliament"}
                           tooltipText={hungTooltipText} />
        </ListGroup.Item>
    )
};

const TiesRow = props => {
    let prob = 100;
    for (const el of props.forecast.majorityWinPc) {
        prob -= el[1];
    }
    for (const el of props.forecast.minorityWinPc) {
        prob -= el[1];
    }
    for (const el of props.forecast.mostSeatsWinPc) {
        prob -= el[1];
    }
    const bgClasses = `${styles['formationOfGovernmentSubItem']} ${xxxLightBgClass("OTH")}`;
    return (
        <ListGroup.Item className={bgClasses}>
            &nbsp;&bull;&nbsp;
            <ProbStatement forecast={props.forecast} party={null} prob={prob} outcome={"leading parties with the same number of seats"} />
        </ListGroup.Item>
    )
};

const OverallWinGovernmentRow = props => {
    const party = parseInt(props.partyIndex)
    const probMajority = jsonMap(props.forecast.majorityWinPc, party);
    const probMinority = jsonMap(props.forecast.minorityWinPc, party);
    let prob = probMajority + probMinority;
    if (party === -1) {
        prob = 0;
        for (const el of props.forecast.majorityWinPc) {
            if (el[0] === 0 || el[0] === 1) continue;
            prob += el[1];
        }
    }
    const partyAbbr = standardiseParty(party, props.forecast);
    const bgClasses = `${styles['formationOfGovernmentTopItem']} ${lightBgClass(partyAbbr)}`;
    return (
        <ListGroup.Item className={bgClasses}>
            <div className={styles.majorRowArranger}>
                <div className={styles.formationOfGovernmentDescription}>
                    <ProbStatement forecast={props.forecast} party={party} prob={prob} text={props.text} outcome={"have a clear path to government"} />
                </div>
                {
                    props.detailHandler !== undefined &&
                    <Button onClick={props.detailHandler} className={styles.formationOfGovernmentExpand}>
                        {props.expanded ? " Hide detail" : " Show detail"}
                        <small>
                            {props.expanded ? " ▲" : " ▼"}
                        </small>
                    </Button>
                }
            </div>
        </ListGroup.Item>
    )
};

const MajorPartyCollapsibleRows = props => {
    const [ showDetail, setShowDetail] = useState(false);

    const detailHandler = () => setShowDetail(!showDetail);

    return (
    <>
        <OverallWinGovernmentRow partyIndex={props.partyIndex} forecast={props.forecast} detailHandler={detailHandler} expanded={showDetail} />
        {
            showDetail && 
            <>
                <MajorityWinGovernmentRow partyIndex={props.partyIndex} forecast={props.forecast} />
                <MinorityWinGovernmentRow partyIndex={props.partyIndex} forecast={props.forecast} />
            </>
        }
    </>
    )
};

const HungParliamentMainRow = props => {
    let prob = 100;
    for (const el of props.forecast.majorityWinPc) {
        prob -= el[1];
    }
    for (const el of props.forecast.minorityWinPc) {
        prob -= el[1];
    }
    const bgClasses = `${styles['formationOfGovernmentTopItem']} ${lightBgClass("OTH")}`;
    return (
        <ListGroup.Item className={bgClasses}>
            <div className={styles.majorRowArranger}>
                <div className={styles.formationOfGovernmentDescription}>
                    <ProbStatement forecast={props.forecast} party={null} prob={prob} text={props.text} outcome={"no clear winner in the parliament"} />
                </div>
                {
                    props.detailHandler !== undefined &&
                    <Button onClick={props.detailHandler} className={styles.formationOfGovernmentExpand}>
                        {props.expanded ? " Hide detail" : " Show detail"}
                        <small>
                            {props.expanded ? " ▲" : " ▼"}
                        </small>
                    </Button>
                }
            </div>
        </ListGroup.Item>
    )
};

const HungParliamentCollapsibleRows = props => {
    const [ showDetail, setShowDetail] = useState(false);

    const detailHandler = () => setShowDetail(!showDetail);

    const parties = [];
    for (const el of props.forecast.mostSeatsWinPc) {
        parties.push(el[0]);
    }

    parties.sort((a, b) => jsonMap(props.forecast.mostSeatsWinPc, b) - jsonMap(props.forecast.mostSeatsWinPc, a));

    return (
    <>
        <HungParliamentMainRow forecast={props.forecast} detailHandler={detailHandler} expanded={showDetail} />
        {
            showDetail && 
            [...parties].map((el, index) => {
                let rows = [];
                if (jsonMap(props.forecast.majorityWinPc, el, undefined) !== undefined) {
                    rows.push(<MostSeatsRow partyIndex={el} forecast={props.forecast} key={index} />)
                }
                return rows;
            })
        }
        {
            showDetail && 
            <TiesRow forecast={props.forecast} detailHandler={detailHandler} expanded={showDetail} />
        }
    </>
    )
};

const OthersCollapsibleRows = props => {
    const [ showDetail, setShowDetail] = useState(false);

    const minorParties = [];
    for (const el of props.forecast.majorityWinPc) {
        if (el[0] === 0 || el[0] === 1) continue;
        minorParties.push(el[0]);
    }

    minorParties.sort((a, b) => jsonMap(props.forecast.majorityWinPc, b) - jsonMap(props.forecast.majorityWinPc, a));

    let detailHandler = () => setShowDetail(!showDetail);

    // Signal that no expansion should be allowed if there are no detail rows to show
    if (!minorParties.length) detailHandler = undefined;

    console.log(detailHandler);

    return (<>
        <OverallWinGovernmentRow partyIndex="-1" forecast={props.forecast} detailHandler={detailHandler} expanded={showDetail} text="Any other party" />
        {
            showDetail && 
            minorParties.map((el, index) => {
                let rows = [];
                if (jsonMap(props.forecast.majorityWinPc, el, undefined) !== undefined) {
                    rows.push(<MajorityWinGovernmentRow partyIndex={el} forecast={props.forecast} key={index} />)
                }
                return rows;
            })
        }
    </>)
};

const Explainer = props => {
    return (
        <Alert variant="info" className={styles.alert}>
            <p>
                This section describe the forecast model's calculated chances for parties to be
                in a position to <b>form government</b> by getting either a&nbsp;
                <a href="https://en.wikipedia.org/wiki/Majority_government">majority</a>
                &nbsp;themselves, or winning&nbsp;
                <a href="https://en.wikipedia.org/wiki/Minority_government">minority government</a>  
                &nbsp;with the confidence of minor parties, in parliament.
            </p>
            <hr />
            <p>
                Simulated results are grouped here into four categories, with the chance of each shown as a percentage:
                <ul>
                    <li>one for <i>each major party</i> (Labor/ALP and the Liberal/National Coalition)
                    being in a position to form government</li>
                    <li>one for <i>some other party</i> being in a position to form government (this is usually highly unlikely)</li>
                    <li>one for <i>no party</i> being in a such a position</li>
                </ul>
                 Click on the information icons (<InfoIcon />) for each
                section below for more on that particular category.
            </p>
        </Alert>
    )
}

{/*
    <hr />
    <p>
        It is currently assumed on this site that, between the two major parties, the Greens will support
        Labor, and that Katter's Australia Party, One Nation
        and the United Australia Party will support the Liberal/National Coalition. 
        For the time being, the Centre Alliance and any independents are not considered
        to support either major party (even if an independent has announced they will support one).
    </p>
    <p>
        Simulation results are counted as an overall win for a major party if they either have a majority
        or have a path to minority government with the parties as described above. Click on "Show detail"
        next to a party name to see the chances of majority vs. this kind of minority government.
    </p>
    <p>
        There is also a very rare chance that some other party may form a majority, the total chance is shown
        under "Any other party ...". To show the chance of each individual party, click on "Show detail"
        for that section. We do not make any assumptions that any party would support any minor party, so
        no minority figures are given.
    </p>
    <hr />
    <p>
        The chances that neither party has the numbers to win government (with the parties assumed to support them)
        are listed as "no clear winner in the parliament". In this case, some government will still eventually
        be formed, but this site does not want to speculate about who independents and certain minor parties
        might support, so they are grouped together in this section.
    </p>
    <p>
        The chances of each site 
    </p>
*/}

const FormationOfGovernment = props => {
    const [showExplainer, setShowExplainer] = useState(false);

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.formationOfGovernmentTitle}>
                <strong>
                    Formation Of government
                    &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
                </strong>
            </Card.Header>
            <Card.Body className={styles.formationOfGovernmentBody}>
                <ListGroup className={styles.formationOfGovernmentTopList}>
                    {
                        showExplainer && <Explainer />
                    }
                    <MajorPartyCollapsibleRows partyIndex="0" forecast={props.forecast} />
                    <MajorPartyCollapsibleRows partyIndex="1" forecast={props.forecast} />
                    <OthersCollapsibleRows forecast={props.forecast} />
                    <HungParliamentCollapsibleRows forecast={props.forecast} />
                </ListGroup>
                <GovernmentFormationChart forecast={props.forecast} />
            </Card.Body>
        </Card>
    );
}

export default FormationOfGovernment;