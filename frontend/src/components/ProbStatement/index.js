import React from 'react';

import TooltipPercentage from '../TooltipPercentage'
import TooltipWrapper from '../TooltipWrapper'
import { getIsPhrase, getWillPhrase, getProbPhrase } from '../../utils/phrases.js'
import { SmartBadge } from '../PartyBadge'
import { standardiseParty } from '../../utils/partyclass.js'

const interpretOth = (code, text) => code === undefined || code.toLowerCase() === 'oth' || code.toLowerCase() === 'ind' ? text : code;

const ProbStatement = props => {
    const partyAbbr = standardiseParty(props.party, props.forecast);
    let text = props.text !== undefined && partyAbbr === "oth" ? props.text : undefined;
    const probPhrase = getProbPhrase(props.prob);
    const struc = probPhrase[1];
    text = interpretOth(text, 'An emerging party');
    if (struc && text !== undefined) text = text.toLowerCase();
    return (
        <>
            {struc ? "It is " : ""}
            <strong>{struc ? probPhrase[0] : ""}</strong>
            {struc ? " that " : ""}
            <SmartBadge party={partyAbbr} text={text} tooltipText={text} />
            {struc ? "" : " " + getIsPhrase(props.forecast) + " "}
            <strong>{struc ? "" : probPhrase[0]}</strong>
            {struc ? "" : " to"}
            {struc ? " " + getWillPhrase(props.forecast) : ""}
            {props.tooltipText === undefined && " " + props.outcome} 
            {props.tooltipText !== undefined && 
                <TooltipWrapper tooltipText={props.tooltipText}>
                    {" " + props.outcome}
                </TooltipWrapper>
            }
            {" "}
            (
            <strong><TooltipPercentage value={props.prob} /></strong>)
        </>
    )
};

export default ProbStatement;