import React, { useState } from 'react';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import ProbStatement from '../ProbStatement'
import GovernmentFormationChart from '../GovernmentFormationChart'

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

const FormationOfGovernment = props => {
    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.formationOfGovernmentTitle}>
                <strong>Formation Of Government</strong>
            </Card.Header>
            <Card.Body className={styles.formationOfGovernmentBody}>
                <ListGroup className={styles.formationOfGovernmentTopList}>
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