import React from 'react';

import TooltipPercentage from '../TooltipPercentage'
import TooltipText from '../TooltipText'
import { getIsPhrase, getProbPhrase } from '../../utils/phrases.js'
import { SmartBadge } from '../PartyBadge'
import { standardiseParty } from '../../utils/partyclass.js'

const interpretOth = (code, text) => code === undefined || code.toLowerCase() === 'oth' ? text : code;

const ProbStatement = props => {
    console.log(props.party)
    const partyAbbr = standardiseParty(props.party, props.forecast);
    console.log(partyAbbr)
    let text = props.text !== undefined && props.party < 0 ? props.text : undefined;
    const probPhrase = getProbPhrase(props.prob);
    const struc = probPhrase[1];
    if (struc && text !== undefined) text = text.toLowerCase();
    return (
        <>
            {struc ? "It " + getIsPhrase(props.forecast) + " " : ""}
            <strong>{struc ? probPhrase[0] : ""}</strong>
            {struc ? " for " : ""}
            <SmartBadge party={partyAbbr} text={interpretOth(text, 'An emerging party')} />
            {struc ? "" : " " + getIsPhrase(props.forecast) + " "}
            <strong>{struc ? "" : probPhrase[0]}</strong>
            {props.tooltipText === undefined && " " + props.outcome} 
            {props.tooltipText !== undefined && 
                <TooltipText mainText={" " + props.outcome} tooltipText={props.tooltipText}/>
            }
            {" "}
            (
            <strong><TooltipPercentage value={props.prob} /></strong>)
        </>
    )
};

export default ProbStatement;