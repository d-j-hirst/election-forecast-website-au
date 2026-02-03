import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';

import SeatVoteRow from '../SeatVoteRow';

import InfoIcon from '../../General/InfoIcon';
import TooltipWrapper from '../../General/TooltipWrapper';

import {jsonMap} from '../../../utils/jsonmap.js';
import {deepCopy} from '../../../utils/deepcopy.js';

import styles from '../Seats/Seats.module.css';

const FpExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section show the
        <strong> share of the first preference vote </strong> that significant
        political parties are projected to get. Parties&apos; possible vote
        shares are represented as text percentages and using bars to represent
        more and less likely ranges for the vote.
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
        </TooltipWrapper>{' '}
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

const SeatFpSection = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  const seatName = props.forecast.seatNames[props.index];
  // create deep copy of the fp probability bands
  const fpFreqs = deepCopy(props.forecast.seatFpBands[props.index]);
  let sortedFreqs = fpFreqs
    .filter(
      e =>
        e[1][7] >= 1 || e[1][10] >= 20 || e[1][12] >= 30 || !props.abbreviated
    )
    .sort((el1, el2) => el2[1][7] - el1[1][7]);
  const maxFpTotal = Math.max(...sortedFreqs.map(el => Math.max(...el[1])));
  const someExcluded = sortedFreqs.length < fpFreqs.length;

  const hideMajorParties =
    props.mode === 'live' && props.election !== '2019nsw';

  sortedFreqs = sortedFreqs.filter(
    e => !hideMajorParties || e[0] < 0 || e[0] > 1
  );

  const candidateNames = sortedFreqs.map(e =>
    'seatCandidateNames' in props.forecast
      ? props.forecast.seatCandidateNames.length > 0
        ? jsonMap(props.forecast.seatCandidateNames[props.index], e[0], null)
        : ''
      : null
  );

  const matchToResults = freq =>
    props.result.fp[
      freq[0] === -2 ? 'IND*' : jsonMap(props.forecast.partyAbbr, freq[0])
    ];

  const results =
    props.result === null ? null : sortedFreqs.map(matchToResults);

  const forceXInd =
    ((seatName === 'Finniss' ||
      seatName === 'Hammond' ||
      seatName === 'Flinders' ||
      seatName === 'Frome') &&
      props.election === '2022sa') ||
    (seatName == 'Narracan' && props.election == '2022vic');

  return (
    <>
      <ListGroup.Item className={styles.seatsSubheading}>
        <strong>First preference projection</strong> for {seatName}
        &nbsp;
        <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
      </ListGroup.Item>
      {showExplainer && <FpExplainer seatName={seatName} />}
      {hideMajorParties && (
        <ListGroup.Item className={styles.seatsNote}>
          First preferences hidden for major parties as the estimates are
          indirect and likely to be inaccurate
        </ListGroup.Item>
      )}
      {sortedFreqs.map((freqSet, index) => (
        <SeatVoteRow
          candidateName={candidateNames[index]}
          forceXInd={forceXInd}
          forecast={props.forecast}
          freqSet={freqSet}
          maxVoteTotal={maxFpTotal}
          minVoteTotal={0}
          key={`fp${seatName}a${index}`}
          index={`fp${seatName}a${index}`}
          seatName={seatName}
          result={results === null ? null : results[index]}
          windowWidth={props.windowWidth}
        />
      ))}
      {someExcluded && (
        <ListGroup.Item className={styles.seatsNote}>
          This list is abbreviated to this seat&apos;s more popular parties.
          Click &quot;full detail&quot; above to see others.
        </ListGroup.Item>
      )}
    </>
  );
};
SeatFpSection.propTypes = {
  mode: PropTypes.string.isRequired,
  election: PropTypes.string.isRequired,
  forecast: PropTypes.object.isRequired,
  result: PropTypes.object,
  index: PropTypes.number.isRequired,
  windowWidth: PropTypes.number.isRequired,
  abbreviated: PropTypes.bool,
};

export default SeatFpSection;
