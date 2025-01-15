import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import ProbBarDist from '../../General/ProbBarDist';
import {SmartBadge} from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';
import TooltipWrapper from '../../General/TooltipWrapper';

import {coalitionName} from '../../../utils/coalition.js';
import {jsonMap} from '../../../utils/jsonmap.js';

import styles from './SeatTotals.module.css';

const SeatsRow = props => {
  let partyAbbr =
    props.freqSet[0] === null
      ? 'LNP'
      : jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
  const partyName = jsonMap(props.forecast.partyName, props.freqSet[0]);
  let result = props.result;
  if (partyName === 'Emerging Ind') partyAbbr = 'IndX';
  if (partyName === 'Emerging Party') partyAbbr = 'EOth';
  if (props.freqSet[0] < -1) result = null;
  const thresholds = [
    [0, 2, 0],
    [2, 4, 1],
    [4, 6, 2],
    [6, 8, 3],
    [8, 10, 4],
    [10, 12, 5],
    [12, 14, 6],
  ];
  return (
    <ListGroup.Item className={styles.seatTotalsItem}>
      <div className={styles.rowLeftSection}>
        <div className={styles.rowParty}>
          <SmartBadge party={partyAbbr} termCode={props.forecast.termCode} />
        </div>
        <div className={styles.rowNumber}>
          <TooltipWrapper tooltipText="5th percentile">
            {props.freqSet[1][4]}
          </TooltipWrapper>
        </div>
        <div className={styles.rowDash}> - </div>
        <div className={styles.rowNumber}>
          <TooltipWrapper tooltipText="Median">
            <strong>{props.freqSet[1][7]}</strong>
          </TooltipWrapper>
        </div>
        <div className={styles.rowDash}> - </div>
        <div className={styles.rowNumber}>
          <TooltipWrapper tooltipText="95th percentile">
            {props.freqSet[1][10]}
          </TooltipWrapper>
        </div>
      </div>
      <ProbBarDist
        freqSet={props.freqSet}
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
};
SeatsRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  freqSet: PropTypes.array.isRequired,
  minVoteTotal: PropTypes.number.isRequired,
  maxVoteTotal: PropTypes.number.isRequired,
  result: PropTypes.number,
  windowWidth: PropTypes.number.isRequired,
};

const SeatsRowSet = props => {
  let freqs = props.forecast.seatCountFrequencies.sort((el1, el2) => {
    return el2[1][7] - el1[1][7];
  });
  freqs = freqs.filter(a => a[1][a[1].length - 1] > 0);
  if (
    props.useCoalition === true &&
    Object.hasOwn(props.forecast, 'coalitionSeatCountFrequencies') &&
    props.forecast.coalitionSeatCountFrequencies.length > 0
  ) {
    //
    freqs = freqs.filter(el => {
      const partyAbbr = jsonMap(props.forecast.partyAbbr, el[0]);
      return partyAbbr !== 'LIB' && partyAbbr !== 'NAT' && partyAbbr !== 'LNP';
    });
    freqs.push([null, props.forecast.coalitionSeatCountFrequencies]);
    freqs.sort((el1, el2) => {
      return el2[1][7] - el1[1][7];
    });
  }
  const results =
    props.results === null
      ? null
      : freqs.map(
          freq =>
            props.results.overall.seats[
              jsonMap(props.forecast.partyAbbr, freq[0])
            ]
        );
  const maxVoteTotal = Math.max(...freqs.map(el => Math.max(...el[1])));
  return (
    <>
      {freqs.map((freqSet, index) => (
        <SeatsRow
          forecast={props.forecast}
          freqSet={freqSet}
          key={index}
          maxVoteTotal={maxVoteTotal}
          minVoteTotal={0}
          result={props.results === null ? null : results[index]}
          windowWidth={props.windowWidth}
        />
      ))}
    </>
  );
};
SeatsRowSet.propTypes = {
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  useCoalition: PropTypes.bool,
  windowWidth: PropTypes.number.isRequired,
};

const MainExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This part of the simulation report covers the{' '}
        <strong> number of seats </strong> that significant political parties
        are projected to win. These estimates are based on simulations of how
        the projected vote totals (above) are most likely to translate into
        overall seat numbers in the parliament.
      </p>
      <hr />
      <p>
        The numbers show the range from the
        <TooltipWrapper tooltipText="5% chance of the number of seats being below this, 95% chance of the number of seats being above this">
          <strong> 5th percentile </strong>
        </TooltipWrapper>
        to the
        <TooltipWrapper tooltipText="95% chance of the number of seats being below this, 5% chance of the number of seats being above this">
          <strong> 95th percentile </strong>
        </TooltipWrapper>
        with the outer numbers and the
        <TooltipWrapper tooltipText="50% chance of the number of seats being below this, 50% chance of thenumber of seats being above this">
          <strong> median </strong>
        </TooltipWrapper>{' '}
        in bold in between them. Numbers outside this range are possible but
        quite unlikely.
      </p>
      <hr />
      <p>
        Coloured bars are also shown for a visual representation of the range of
        possible numbers of seats. The dark shaded bars show the more likely
        ranges with the lighter bars being progressively more unlikely. Hover
        over or tap on the bars for the exact numbers they represent.
      </p>
      <hr />
      <p>Further explanation for some categories below:</p>
      <ul>
        <li>
          <SmartBadge party="ind" /> covers independents, including potential
          independent candidates that have not yet announced their intention to
          run.
        </li>
        <li>
          <SmartBadge party="EOth" /> covers potential <i>emerging parties</i>{' '}
          that either do not yet exist or are not appearing in public polls yet.
        </li>
      </ul>
    </Alert>
  );
};

const MajorityRow = props => {
  const majoritySize = (() => {
    if (props.election === '2022fed') return 76;
    if (props.election === '2022sa') return 24;
    if (props.election === '2022vic') return 45;
    if (props.election === '2023nsw') return 47;
    if (props.election === '2024qld') return 47;
    if (props.election === '2025wa') return 30;
    if (props.election === '2025fed') return 76;
    if (props.election === '2026sa') return 24;
    if (props.election === '2026vic') return 45;
    if (props.election === '2027nsw') return 47;
  })();

  return (
    <ListGroup.Item className={styles.seatTotalsNote}>
      Seats required for a majority: <strong>{majoritySize}</strong>
    </ListGroup.Item>
  );
};
MajorityRow.propTypes = {
  election: PropTypes.string.isRequired,
};

const CoalitionRow = props => {
  return (
    <ListGroup.Item className={styles.seatTotalsNote}>
      <input type="checkbox" checked={props.value} onChange={props.onChange} />
      {'  '}Combine {coalitionName(props.termCode)} seat totals
    </ListGroup.Item>
  );
};
CoalitionRow.propTypes = {
  onChange: PropTypes.func.isRequired,
  termCode: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
};

const SeatTotals = props => {
  const canShowCoalition =
    Object.hasOwn(props.forecast, 'coalitionSeatCountFrequencies') &&
    props.forecast.coalitionSeatCountFrequencies.length > 0;
  const [showExplainer, setShowExplainer] = useState(false);
  const [showCoalition, setShowCoalition] = useState(
    canShowCoalition && props.forecast.termCode.slice(4) !== 'wa'
  );

  return (
    <Card className={styles.summary}>
      <Card.Header className={styles.seatTotalsTitle}>
        <strong>
          Seat Totals&nbsp;
          <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
        </strong>
      </Card.Header>
      <Card.Body className={styles.seatTotalsBody}>
        <ListGroup className={styles.seatTotalsList}>
          {showExplainer && <MainExplainer />}
          <MajorityRow election={props.election} />
          {canShowCoalition && (
            <CoalitionRow
              onChange={() => setShowCoalition(!showCoalition)}
              termCode={props.forecast.termCode}
              value={showCoalition}
            />
          )}
          <StandardErrorBoundary>
            <SeatsRowSet
              forecast={props.forecast}
              results={props.results}
              useCoalition={showCoalition}
              windowWidth={props.windowWidth}
            />
          </StandardErrorBoundary>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
SeatTotals.propTypes = {
  election: PropTypes.string.isRequired,
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  windowWidth: PropTypes.number.isRequired,
};

export default SeatTotals;
