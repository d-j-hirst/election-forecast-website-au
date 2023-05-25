import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {HashLink as Link} from 'react-router-hash-link';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';

import SeatWinsSection from '../SeatWins';
import SeatTcpSection from '../SeatTcp';
import SeatFpSection from '../SeatFp';
import SeatTcpSwingFactors from '../SwingFactors';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import WinnerBarDist from '../../General/WinnerBarDist';
import {SmartBadge} from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';

import {jsonMap} from '../../../utils/jsonmap.js';
import {deepCopy} from '../../../utils/deepcopy.js';
import {useWarning} from '../../../utils/seatwarnings.js';

import styles from '../Seats/Seats.module.css';
import {standardiseParty} from 'utils/partyclass';

const partyCategory = (party, forecast) => {
  const sp = standardiseParty(party).toLowerCase();
  if (sp === 'grn') return -2;
  if (sp === 'alp') return -1;
  if (sp === 'kap') return 1;
  if (sp === 'lnp') return 2;
  if (sp === 'on') return 3;
  if (sp === 'uap') return 3;
  return 0;
};

const ReturnToMain = props => {
  const linkUrl =
    '' +
    (props.archive !== undefined
      ? `/archive/${props.election}/${props.archive}#seats`
      : `/forecast/${props.election}/${props.mode}#seats`);

  return (
    <ListGroup.Item className={styles.returnToMain}>
      <Link to={linkUrl}>
        <div>
          <strong>&#187;</strong>back to seat list
        </div>
      </Link>
    </ListGroup.Item>
  );
};
ReturnToMain.propTypes = {
  archive: PropTypes.number,
  election: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};

const SeatSummary = props => {
  const incumbentIndex = props.forecast.seatIncumbents[props.index];
  const incumbentAbbr = jsonMap(props.forecast.partyAbbr, incumbentIndex);
  const margin = props.forecast.seatMargins[props.index];

  const freqs = deepCopy(props.forecast.seatPartyWinFrequencies[props.index]);
  freqs.sort((a, b) => {
    const aName = jsonMap(props.forecast.partyAbbr, a[0]);
    const bName = jsonMap(props.forecast.partyAbbr, b[0]);
    return partyCategory(aName) - partyCategory(bName);
  });

  const winner =
    props.result !== null ? Object.keys(props.result.tcp)[0] : null;

  // const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
  return (
    <ListGroup.Item className={styles.seatsItem}>
      <div className={styles.seatsTopLeft}>
        Held by <SmartBadge party={incumbentAbbr} /> with margin{' '}
        {Number(margin).toFixed(1)}%
      </div>
      <WinnerBarDist
        forecast={props.forecast}
        freqSet={freqs}
        index={props.index}
        result={winner}
        width={Math.min(props.windowWidth - 70, 300)}
      />
    </ListGroup.Item>
  );
};
SeatSummary.propTypes = {
  forecast: PropTypes.object.isRequired,
  result: PropTypes.object,
  index: PropTypes.number.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

const MainExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section lists the <strong>full simulated results</strong> for the
        seat of {props.seatName}.
      </p>
      <hr />
      <p>
        The coloured bar just below indicates the modelled probabilities for
        parties to win the seat. Tap or mouse over the colours to see the party
        name and percentage chance of winning.
      </p>
      <hr />
      <p>
        In general, for seat results, the most robust seat figures are those for
        the major parties, as there are much more data on major-major contests
        for the model to work with. Results for seats where a minor party or
        independent is prominent should be approached with some caution; good
        local knowledge is likely to be more accurate than the model in such
        seats.
      </p>
    </Alert>
  );
};
MainExplainer.propTypes = {
  seatName: PropTypes.string.isRequired,
};

const SeatDetailBody = props => {
  const [showExplainer, setShowExplainer] = useState(false);

  const seatName = props.forecast.seatNames[props.index];
  const result = props.results !== null ? props.results.seats[seatName] : null;

  return (
    <Card className={styles.summary}>
      <Card.Header className={styles.seatsTitle}>
        Seat details for {seatName}
        &nbsp;
        <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
      </Card.Header>
      <Card.Body className={styles.seatsBody}>
        {showExplainer && <MainExplainer seatName={seatName} />}
        {useWarning(props.election, seatName) && (
          <Alert variant="warning" className={styles.alert}>
            <p>
              <InfoIcon inactive={true} warning={true} /> This seat has unusual
              circumstances which make it particularly difficult to model. Treat
              this projection with extra caution.
            </p>
          </Alert>
        )}
        <ListGroup className={styles.seatsList}>
          <StandardErrorBoundary>
            <ReturnToMain
              archive={props.archive}
              election={props.election}
              mode={props.mode}
            />
          </StandardErrorBoundary>
          <StandardErrorBoundary>
            <SeatSummary
              forecast={props.forecast}
              election={props.election}
              mode={props.mode}
              result={result}
              index={props.index}
              windowWidth={props.windowWidth}
            />
          </StandardErrorBoundary>
          <StandardErrorBoundary>
            <SeatWinsSection
              forecast={props.forecast}
              election={props.election}
              mode={props.mode}
              index={props.index}
            />
          </StandardErrorBoundary>
          {(props.mode !== 'live' || props.election !== '2022sa"') && (
            <StandardErrorBoundary>
              <SeatFpSection
                forecast={props.forecast}
                election={props.election}
                mode={props.mode}
                index={props.index}
                result={result}
                windowWidth={props.windowWidth}
              />
            </StandardErrorBoundary>
          )}
          <StandardErrorBoundary>
            <SeatTcpSection
              forecast={props.forecast}
              election={props.election}
              mode={props.mode}
              index={props.index}
              result={result}
              windowWidth={props.windowWidth}
            />
          </StandardErrorBoundary>
          {props.mode !== 'live' &&
            props.forecast.hasOwnProperty('seatSwingFactors') && (
              <StandardErrorBoundary>
                <SeatTcpSwingFactors
                  forecast={props.forecast}
                  election={props.election}
                  index={props.index}
                  windowWidth={props.windowWidth}
                  mode={props.mode}
                  abbreviated={true}
                />
              </StandardErrorBoundary>
            )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
SeatDetailBody.propTypes = {
  forecast: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  election: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  results: PropTypes.object,
  archive: PropTypes.number,
  windowWidth: PropTypes.number,
};

export default SeatDetailBody;
