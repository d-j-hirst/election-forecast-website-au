import React from 'react';
import PropTypes from 'prop-types';

import TooltipPercentage from '../TooltipPercentage';
import TooltipWrapper from '../TooltipWrapper';
import {
  getIsPhrase,
  getWillPhrase,
  getProbPhrase,
} from '../../../utils/phrases.js';
import {SmartBadge} from '../PartyBadge';
import {standardiseParty} from '../../../utils/partyclass.js';

const interpretOth = (code, text) =>
  code === undefined ||
  code.toLowerCase() === 'oth' ||
  code.toLowerCase() === 'ind' ||
  code.toLowerCase() === 'indx' ||
  code.toLowerCase() === 'eoth'
    ? text
    : code;

const ProbStatement = props => {
  const probPhrase = getProbPhrase(props.prob);
  const struc = probPhrase[1];
  const noParty = props.party === null;
  let text = '';
  let partyAbbr = '';
  if (!noParty) {
    partyAbbr = standardiseParty(props.party, props.forecast);
    if (
      props.useLiberals &&
      props.forecast.coalitionSeatCountFrequencies &&
      partyAbbr === 'lnp'
    )
      partyAbbr = 'lib';
    if (props.party === -2) partyAbbr = 'indx';
    if (props.party === -3) partyAbbr = 'eoth';
    text = interpretOth(props.text, 'An emerging party');
    if (struc && text !== undefined) text = text.toLowerCase();
  }

  return (
    <>
      {struc || noParty ? 'It is ' : ''}
      <strong>{struc || noParty ? probPhrase[0] : ''}</strong>
      {struc || noParty ? ' that ' : ''}
      {noParty ? 'there ' : ''}
      {!noParty && (
        <SmartBadge
          party={partyAbbr}
          text={text}
          termCode={props.forecast.termCode}
        />
      )}
      {props.candidateName && ' (' + props.candidateName + ')'}
      {struc || noParty ? '' : ' ' + getIsPhrase(props.forecast) + ' '}
      <strong>{struc || noParty ? '' : probPhrase[0]}</strong>
      {struc || noParty ? '' : ' to'}
      {struc || noParty ? ' ' + getWillPhrase(props.forecast) : ''}
      {noParty ? ' be ' : ''}
      {props.tooltipText === undefined && ' ' + props.outcome}
      {props.tooltipText !== undefined && (
        <TooltipWrapper tooltipText={props.tooltipText}>
          {' ' + props.outcome}
        </TooltipWrapper>
      )}{' '}
      (
      <strong>
        <TooltipPercentage value={props.prob} />
      </strong>
      )
    </>
  );
};
ProbStatement.propTypes = {
  candidateName: PropTypes.string,
  forecast: PropTypes.object.isRequired,
  outcome: PropTypes.string,
  party: PropTypes.any,
  prob: PropTypes.number.isRequired,
  text: PropTypes.string,
  tooltipText: PropTypes.string,
  useLiberals: PropTypes.bool,
};

export default ProbStatement;
