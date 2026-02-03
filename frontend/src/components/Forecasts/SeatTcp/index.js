import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import {HashLink as Link} from 'react-router-hash-link';
import ListGroup from 'react-bootstrap/ListGroup';

import SeatVoteRow from '../SeatVoteRow';

import TooltipPercentage from '../../General/TooltipPercentage';
import {SmartBadge} from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';
import TooltipWrapper from '../../General/TooltipWrapper';

import {deepCopy} from '../../../utils/deepcopy.js';
import {jsonMap} from '../../../utils/jsonmap.js';
import {seatInRegion} from '../../../utils/seatregion.js';

import styles from '../Seats/Seats.module.css';

const TcpExplainer = props => {
  return (
    <Alert variant="warning" className={styles.alert}>
      <p>
        This section show the
        <strong> share of the two-candidate preferred (TCP) vote </strong> that
        significant political parties are projected to get, arranged into
        different pairs of parties that might make up the final TCP after
        distribution of preferences.
      </p>
      <hr />
      <p>
        Note that the reports for each TCP pair only include results for the
        simulations where the that pair actually made the final TCP.{' '}
        <strong>
          This means that the results need to be interpreted with caution, and,
          in particular, conclusions should not be drawn by comparing different
          TCP pairs to each other.
        </strong>{' '}
        For a more thorough explanation with examples, see{' '}
        <Link to={'/guide#tcp-scenarios'}>
          {' '}
          this section of the forecast guide
        </Link>
        .
      </p>
      <hr />
      <p>
        Parties&apos; possible TCP vote shares are shown as text percentages and
        coloured bars to represent more and less likely ranges for the vote.
      </p>
      <hr />
      <p>
        The numbers show the range from the
        <TooltipWrapper tooltipText="5% chance of the vote share being below this, 95% chance of the vote share being above this">
          <strong> 5th percentile </strong>
        </TooltipWrapper>
        to the
        <TooltipWrapper tooltipText="95% chance of the vote share being below this, 5% chance of the vote share being above this">
          <strong> 95th percentile </strong>
        </TooltipWrapper>
        with the outer numbers and the
        <TooltipWrapper tooltipText="50% chance of the vote share being below this, 50% chance of the vote share being above this">
          <strong> median </strong>
        </TooltipWrapper>
        in bold in between them. Numbers outside this range are possible but
        quite unlikely.
      </p>
      <hr />
      <p>
        Coloured bars are also shown for a visual representation of the range of
        possible vote shares. The dark shaded bars show the more likely ranges
        with the lighter bars being progressively more unlikely. Hover over or
        tap on the bars for the exact numbers they represent.
      </p>
    </Alert>
  );
};

const SeatTcpRowPair = props => {
  const freqSet0 = [props.freqSet[0][0], props.freqSet[1]];
  const freqSet1 = [
    props.freqSet[0][1],
    props.freqSet[1].map(a => 100 - a).reverse(),
  ];
  const maxVoteTotal = Math.max(
    Math.max(...freqSet0[1]),
    Math.max(...freqSet1[1])
  );
  const minVoteTotal = Math.min(
    Math.min(...freqSet0[1]),
    Math.min(...freqSet1[1])
  );

  let partyAbbr0 = jsonMap(props.forecast.partyAbbr, freqSet0[0]);
  if (freqSet0[0] === -2) partyAbbr0 = 'IndX';
  if (freqSet0[0] === -3) partyAbbr0 = 'EOth';
  let partyAbbr1 = jsonMap(props.forecast.partyAbbr, freqSet1[0]);
  if (freqSet1[0] === -2) partyAbbr1 = 'IndX';
  if (freqSet1[0] === -3) partyAbbr1 = 'EOth';

  if (props.forecast.coalitionSeatCountFrequencies) {
    if (
      props.forecast.termCode.slice(4) !== 'fed' ||
      !seatInRegion(props.seatName, 'qld')
    ) {
      if (partyAbbr0 === 'LNP') partyAbbr0 = 'LIB';
      if (partyAbbr1 === 'LNP') partyAbbr1 = 'LIB';
    } else {
      if (partyAbbr0 === 'LNP') partyAbbr0 = 'LNPx';
      if (partyAbbr1 === 'LNP') partyAbbr1 = 'LNPx';
    }
  }

  const cand0Name =
    'seatCandidateNames' in props.forecast
      ? props.forecast.seatCandidateNames.length > 0
        ? jsonMap(
            props.forecast.seatCandidateNames[props.index],
            freqSet0[0],
            null
          )
        : ''
      : null;

  const cand1Name =
    'seatCandidateNames' in props.forecast
      ? props.forecast.seatCandidateNames.length > 0
        ? jsonMap(
            props.forecast.seatCandidateNames[props.index],
            freqSet1[0],
            null
          )
        : ''
      : null;

  return (
    <>
      <ListGroup.Item className={styles.seatsTcpScenarioHeading}>
        <SmartBadge party={partyAbbr0} termCode={props.forecast.termCode} /> vs{' '}
        <SmartBadge party={partyAbbr1} termCode={props.forecast.termCode} /> -{' '}
        occurs in{' '}
        <strong>
          <TooltipPercentage value={props.freqSet[2] * 100} />
        </strong>{' '}
        of simulations
      </ListGroup.Item>
      <SeatVoteRow
        candidateName={cand0Name}
        forceXInd={props.forceXInd}
        forecast={props.forecast}
        freqSet={freqSet0}
        result={props.result}
        minVoteTotal={minVoteTotal}
        maxVoteTotal={maxVoteTotal}
        seatName={props.seatName}
        windowWidth={props.windowWidth}
      />
      <SeatVoteRow
        candidateName={cand1Name}
        forceXInd={props.forceXInd}
        forecast={props.forecast}
        freqSet={freqSet1}
        result={props.result !== null ? 100 - props.result : null}
        minVoteTotal={minVoteTotal}
        maxVoteTotal={maxVoteTotal}
        seatName={props.seatName}
        windowWidth={props.windowWidth}
      />
    </>
  );
};
SeatTcpRowPair.propTypes = {
  forceXInd: PropTypes.bool.isRequired,
  forecast: PropTypes.object.isRequired,
  freqSet: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  result: PropTypes.number,
  seatName: PropTypes.string,
  windowWidth: PropTypes.number.isRequired,
};

const SeatTcpSection = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  const hideTcps =
    props.forecast.seatHideTcps !== undefined
      ? props.forecast.seatHideTcps[props.index] === 1
      : false;
  const seatName = props.forecast.seatNames[props.index];
  const tcpFreqs = deepCopy(props.forecast.seatTcpBands[props.index]);
  const tcp = props.result === null ? null : props.result.tcp;
  const abbr = a =>
    a === -2 ? 'IND*' : a === -3 ? 'OTH' : jsonMap(props.forecast.partyAbbr, a);
  const tcpMatch = (t, a) =>
    t === null
      ? false
      : Object.hasOwn(t, abbr(a[0])) && Object.hasOwn(t, abbr(a[1]));
  const sortedTcpFreqs = tcpFreqs
    .map((e, i) => e.concat(props.forecast.seatTcpScenarios[props.index][i][1]))
    .filter(e => e[2] > 0.1 || !props.abbreviated || tcpMatch(tcp, e[0]))
    .sort((e1, e2) => e2[2] - e1[2]);
  const someExcluded = sortedTcpFreqs.length < tcpFreqs.length;

  const results =
    props.result === null
      ? null
      : sortedTcpFreqs.map(a =>
          tcpMatch(tcp, a[0]) ? tcp[abbr(a[0][0])] : null
        );

  const forcedInds = [
    ['2022sa', 'Finniss'],
    ['2022sa', 'Flinders'],
    ['2022vic', 'Narracan'],
    ['2023nsw', 'Tamworth'],
    ['2023nsw', 'Shellharbour'],
    ['2023nsw', 'Cessnock'],
  ];

  const pair = [props.election, seatName];
  const forceXInd = forcedInds
    .map(a => JSON.stringify(a))
    .includes(JSON.stringify([props.election, seatName]));

  return (
    <>
      {!hideTcps && (
        <>
          <ListGroup.Item className={styles.seatsSubheading}>
            <strong>Two-candidate preferred scenarios</strong> for {seatName}
            &nbsp;
            <InfoIcon
              onClick={() => setShowExplainer(!showExplainer)}
              warning={true}
            />
          </ListGroup.Item>
          {showExplainer && <TcpExplainer />}
          {sortedTcpFreqs.map((freqSet, index) => (
            <SeatTcpRowPair
              forceXInd={forceXInd}
              forecast={props.forecast}
              freqSet={freqSet}
              index={props.index}
              key={`tcp${seatName}a${index}`}
              seatName={seatName}
              result={results !== null ? results[index] : null}
              windowWidth={props.windowWidth}
            />
          ))}
          {someExcluded && (
            <ListGroup.Item className={styles.seatsNote}>
              This list is abbreviated to the most likely scenarios. Click
              &quot;full detail&quot; above to see others.
            </ListGroup.Item>
          )}
        </>
      )}
      {hideTcps && (
        <>
          <ListGroup.Item className={styles.seatsNote}>
            TCP projections are hidden for this seat as they are likely to be
            inaccurate. A manual override has been applied to the win chance
            based on human analysis.
          </ListGroup.Item>
        </>
      )}
    </>
  );
};
SeatTcpSection.propTypes = {
  forecast: PropTypes.object.isRequired,
  result: PropTypes.object,
  election: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  abbreviated: PropTypes.bool,
};

export default SeatTcpSection;
