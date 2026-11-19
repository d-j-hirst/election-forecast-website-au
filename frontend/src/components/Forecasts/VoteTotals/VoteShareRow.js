import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../../General/TooltipPercentage';
import ProbBarDist from '../../General/ProbBarDist';
import {SmartBadge} from '../../General/PartyBadge';
import {jsonMap} from 'utils/jsonmap';
import {isOutlook} from 'utils/outlook';

import styles from './VoteTotals.module.css';

const VoteShareRow = props => {
  let partyAbbr =
    props.partyAbbr ??
    (props.freqSet[0] === null
      ? 'LNP'
      : jsonMap(props.forecast.partyAbbr, props.freqSet[0]));
  if (
    !props.partyAbbr &&
    props.forecast.coalitionFpFrequencies?.length > 0 &&
    !props.showCoalition &&
    partyAbbr === 'LNP'
  ) {
    partyAbbr = 'LIB';
  }
  const thresholds = [
    [0, 2, 0],
    [2, 4, 1],
    [4, 6, 2],
    [6, 8, 3],
    [8, 10, 4],
    [10, 12, 5],
    [12, 14, 6],
  ];
  const innerStyle =
    isOutlook(props.forecast.termCode) && props.forecast.reportMode === 'RF'
      ? styles.rowPercentageDeemphasised
      : styles.rowPercentageStrong;
  const outerStyle =
    isOutlook(props.forecast.termCode) && props.forecast.reportMode === 'RF'
      ? styles.rowPercentageStrong
      : styles.rowPercentage;
  return (
    <ListGroup.Item className={styles.voteTotalsItem}>
      <div className={styles.rowLeftSection}>
        <div className={styles.rowParty}>
          <SmartBadge
            party={partyAbbr}
            text={props.partyAbbr}
            termCode={props.forecast.termCode}
          />
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
      <ProbBarDist
        freqSet={props.freqSet}
        thresholds={thresholds}
        partyAbbr={partyAbbr}
        minVoteTotal={props.minVoteTotal}
        maxVoteTotal={props.maxVoteTotal}
        thresholdLevels={props.forecast.voteTotalThresholds}
        pluralNoun={props.pluralNoun ?? 'vote totals'}
        result={props.result}
        valType="percentage"
        width={Math.min(props.windowWidth - 100, 420)}
      />
    </ListGroup.Item>
  );
};
VoteShareRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  freqSet: PropTypes.array.isRequired,
  result: PropTypes.number,
  showCoalition: PropTypes.bool,
  partyAbbr: PropTypes.string,
  pluralNoun: PropTypes.string,
  maxVoteTotal: PropTypes.number.isRequired,
  minVoteTotal: PropTypes.number.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

export default VoteShareRow;
