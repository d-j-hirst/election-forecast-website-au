import React from 'react';
import PropTypes from 'prop-types';

import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../../General/TooltipPercentage';
import ProbBarDist from '../../General/ProbBarDist';
import {SmartBadge} from '../../General/PartyBadge';

import {jsonMap} from '../../../utils/jsonmap.js';
import {isOutlook} from '../../../utils/outlook.js';

import styles from '../Seats/Seats.module.css';

const SeatVoteRow = props => {
  let partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
  if (props.freqSet[0] === -2) partyAbbr = 'IndX';
  if (props.freqSet[0] === -3) partyAbbr = 'EOth';
  if (props.forecast.coalitionSeatCountFrequencies && partyAbbr === 'LNP')
    partyAbbr = 'LIB';
  const result =
    props.freqSet[0] >= -1 || props.forceXInd ? props.result : null;

  const thresholds = [
    [0, 2, 0],
    [2, 4, 1],
    [4, 6, 2],
    [6, 8, 3],
    [8, 10, 4],
    [10, 12, 5],
    [12, 14, 6],
  ];

  let candidateName = props.candidateName;
  if (candidateName === 'Renee McLennan') candidateName = 'Renée McLennan';

  const outerStyle =
    isOutlook(props.forecast.termCode) && props.forecast.reportMode === 'RF'
      ? styles.rowPercentageStrong
      : styles.rowPercentage;
  const innerStyle =
    isOutlook(props.forecast.termCode) && props.forecast.reportMode === 'RF'
      ? styles.rowPercentageDeemphasised
      : styles.rowPercentageStrong;

  return (
    <ListGroup.Item className={styles.seatsSubitem}>
      <div className={styles.rowLeftSection}>
        <div className={styles.rowParty}>
          <SmartBadge party={partyAbbr} termCode={props.forecast.termCode} />
        </div>
        <div className={styles.candidateName}>
          {props.candidateName && ' (' + props.candidateName + ') '}
        </div>
        <div className={outerStyle}>
          {' '}
          <TooltipPercentage
            value={props.freqSet[1][4]}
            label="5th percentile"
          />
        </div>
        <div className={styles.rowDash}> - </div>
        <div className={innerStyle}>
          <TooltipPercentage value={props.freqSet[1][7]} label="Median" />
        </div>
        <div className={styles.rowDash}> - </div>
        <div className={outerStyle}>
          <TooltipPercentage
            value={props.freqSet[1][10]}
            label="95th percentile"
          />
        </div>
      </div>
      <div className={styles.altCandidateName}>
        {props.candidateName && ' (' + props.candidateName + ') '}
      </div>
      <ProbBarDist
        freqSet={props.freqSet}
        thresholds={thresholds}
        partyAbbr={partyAbbr}
        minVoteTotal={props.minVoteTotal}
        maxVoteTotal={props.maxVoteTotal}
        thresholdLevels={props.forecast.voteTotalThresholds}
        pluralNoun="vote totals"
        result={result}
        valType="percentage"
        width={Math.min(props.windowWidth - 70, 450)}
      />
    </ListGroup.Item>
  );
};
SeatVoteRow.propTypes = {
  freqSet: PropTypes.array.isRequired,
  forceXInd: PropTypes.bool,
  forecast: PropTypes.object.isRequired,
  result: PropTypes.number,
  candidateName: PropTypes.string,
  minVoteTotal: PropTypes.number.isRequired,
  maxVoteTotal: PropTypes.number.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

export default SeatVoteRow;
