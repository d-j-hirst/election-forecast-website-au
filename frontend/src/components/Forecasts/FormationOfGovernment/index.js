import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import {
  lightBgClass,
  xLightBgClass,
  xxLightBgClass,
  xxxLightBgClass,
  standardiseParty,
} from '../../../utils/partyclass.js';
import {jsonMap} from '../../../utils/jsonmap.js';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import ProbStatement from '../../General/ProbStatement';
import InfoIcon from '../../General/InfoIcon';
import GovernmentFormationChart from './GovernmentFormationChart';

import styles from './FormationOfGovernment.module.css';

const MajorityWinGovernmentRow = props => {
  const party = parseInt(props.partyIndex);
  const partyAbbr = standardiseParty(party, props.forecast);
  let prob = jsonMap(props.forecast.majorityWinPc, party);
  if (prob === undefined) prob = 0;
  const bgClasses = `${styles.formationOfGovernmentSubItem} ${xLightBgClass(
    partyAbbr
  )}`;
  return (
    <ListGroup.Item className={bgClasses}>
      &nbsp;&bull;&nbsp;
      <ProbStatement
        forecast={props.forecast}
        party={party}
        prob={prob}
        outcome={'have a majority'}
      />
    </ListGroup.Item>
  );
};
MajorityWinGovernmentRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  partyIndex: PropTypes.number.isRequired,
};

const MinorityWinGovernmentRow = props => {
  const party = parseInt(props.partyIndex);
  const partyAbbr = standardiseParty(party, props.forecast);
  let prob = jsonMap(props.forecast.minorityWinPc, party);
  if (prob === undefined) prob = 0;
  const bgClasses = `${styles.formationOfGovernmentSubItem} ${xxLightBgClass(
    partyAbbr
  )}`;
  const minorityTooltipText = {
    alp: 'In these scenarios, the Greens are expected to support the ALP.',
    lib:
      "In these scenarios, The Nationals, One Nation, United Australia Party and Katter's Australian Party " +
      'are expected to support the Liberal Party.',
    lnp:
      "In these scenarios, One Nation, United Australia Party and Katter's Australian Party " +
      'are expected to support the Coalition.',
  }[partyAbbr];
  return (
    <ListGroup.Item className={bgClasses}>
      &nbsp;&bull;&nbsp;
      <ProbStatement
        forecast={props.forecast}
        party={party}
        prob={prob}
        outcome={'have a clear path to minority government'}
        tooltipText={minorityTooltipText}
      />
    </ListGroup.Item>
  );
};
MinorityWinGovernmentRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  partyIndex: PropTypes.string.isRequired,
};

const MostSeatsRow = props => {
  const party = parseInt(props.partyIndex);
  const partyAbbr = standardiseParty(party, props.forecast);
  let prob = jsonMap(props.forecast.mostSeatsWinPc, party);
  if (prob === undefined) prob = 0;
  const bgClasses = `${styles.formationOfGovernmentSubItem} ${xxxLightBgClass(
    partyAbbr
  )}`;
  const hungTooltipText =
    'While "hung parliament" often refers to any parliament where no party holds a majority' +
    ', here it specifically means cases where neither major party is likely to form a' +
    ' minority government with support from aligned minor parties.';
  return (
    <ListGroup.Item className={bgClasses}>
      &nbsp;&bull;&nbsp;
      <ProbStatement
        forecast={props.forecast}
        party={party}
        prob={prob}
        outcome={'have most seats in a hung parliament'}
        tooltipText={hungTooltipText}
      />
    </ListGroup.Item>
  );
};
MostSeatsRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  partyIndex: PropTypes.number.isRequired,
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
  const bgClasses = `${styles.formationOfGovernmentSubItem} ${xxxLightBgClass(
    'OTH'
  )}`;
  return (
    <ListGroup.Item className={bgClasses}>
      &nbsp;&bull;&nbsp;
      <ProbStatement
        forecast={props.forecast}
        party={null}
        prob={prob}
        outcome={'leading parties with the same number of seats'}
      />
    </ListGroup.Item>
  );
};
TiesRow.propTypes = {
  forecast: PropTypes.object.isRequired,
};

const MajorPartyExplainer = props => {
  const partyName = props.partyIndex === 1 ? 'the Coalition' : 'Labor';
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This row shows the share of model simulations in which {partyName} will
        have a clear path to government, either with a{' '}
        <a href="https://en.wikipedia.org/wiki/Majority_government">majority</a>
        , or as a{' '}
        <a href="https://en.wikipedia.org/wiki/Minority_government">
          minority government
        </a>{' '}
        winning the support of{' '}
        <a href="https://en.wikipedia.org/wiki/Minor party">minor parties</a>{' '}
        widely expected to support them.
      </p>
      <hr />
      <p>
        Clicking on &quot;show detail&quot; shows these simulations broken down
        into majority or minority scenarios.
      </p>
      <hr />
      {props.partyIndex === 0 && (
        <p>
          This site considers the Greens to be the only party assumed to support
          Labor.
        </p>
      )}
      {props.partyIndex === 1 && (
        <p>
          This site considers One Nation, the United Australia Party and
          Katter&apos;s Australian Party as assumed to support the
          Liberal/National Coalition.
        </p>
      )}
    </Alert>
  );
};
MajorPartyExplainer.propTypes = {
  partyIndex: PropTypes.number.isRequired,
};

const OthersExplainer = props => {
  return (
    <Alert variant="warning" className={styles.alert}>
      <p>
        This row shows the share of model simulations in which some party other
        than the two traditional majors gains a majority. Note that:
      </p>
      <ul>
        <li>
          Such an outcome would be unprecedented in modern Australian history.
        </li>
        <li>
          The share of simulations in which such an event occurs is extrapolated
          from a small sample of historic results where third parties were still
          far from gaining a majority.
        </li>
      </ul>
      <p>
        As a result, while this section is included for the sake of
        completeness, <strong>it should not be taken too seriously</strong>.
      </p>
      <hr />
      <p>
        The closest parallels are probably Queensland 1998, where One Nation won
        22.7% of the first preference vote and 11 seats, and South Australia
        2018, when SA-BEST was briefly polling above both major parties but
        ended up not winning any seats in the actual election.
      </p>
      <hr />
      <p>
        Click on &quot;Show details&quot; above to show these simulations broken
        down into the different possible winning parties, including an
        &quot;emerging party&quot; option for parties that aren&apos;t prominent
        enough to be polled yet. (This website does not assume any parties to be
        supporting a minor party, so unlike for major parties there is no
        &quot;clear minority government&quot; figure shown.)
      </p>
    </Alert>
  );
};

const OverallWinGovernmentRow = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  const party = parseInt(props.partyIndex);
  let probMajority = jsonMap(props.forecast.majorityWinPc, party);
  let probMinority = jsonMap(props.forecast.minorityWinPc, party);
  if (probMajority === undefined) probMajority = 0;
  if (probMinority === undefined) probMinority = 0;
  let prob = probMajority + probMinority;
  if (party === -1) {
    prob = 0;
    for (const el of props.forecast.majorityWinPc) {
      if (el[0] === 0 || el[0] === 1) continue;
      prob += el[1];
    }
  }
  const partyAbbr = standardiseParty(party, props.forecast);
  const bgClasses = `${styles.formationOfGovernmentTopItem} ${lightBgClass(
    partyAbbr
  )}`;
  return (
    <>
      <ListGroup.Item className={bgClasses}>
        <div className={styles.majorRowArranger}>
          <div className={styles.formationOfGovernmentDescription}>
            <ProbStatement
              forecast={props.forecast}
              party={party}
              prob={prob}
              text={props.text}
              outcome={'have a clear path to government'}
            />
            &nbsp;
            <InfoIcon
              onClick={() => setShowExplainer(!showExplainer)}
              warning={party === -1}
            />
          </div>
          {props.detailHandler !== undefined && (
            <Button
              onClick={props.detailHandler}
              className={styles.formationOfGovernmentExpand}
            >
              {props.expanded ? ' Hide detail' : ' Show detail'}
              <small>{props.expanded ? ' ▲' : ' ▼'}</small>
            </Button>
          )}
        </div>
      </ListGroup.Item>
      {showExplainer && (party === 0 || party === 1) && (
        <MajorPartyExplainer forecast={props.forecast} partyIndex={party} />
      )}
      {showExplainer && party === -1 && <OthersExplainer />}
    </>
  );
};
OverallWinGovernmentRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  partyIndex: PropTypes.string.isRequired,
  text: PropTypes.string,
  detailHandler: PropTypes.func,
  expanded: PropTypes.bool,
};

const MajorPartyCollapsibleRows = props => {
  const [showDetail, setShowDetail] = useState(false);

  const detailHandler = () => setShowDetail(!showDetail);

  return (
    <>
      <OverallWinGovernmentRow
        partyIndex={props.partyIndex}
        forecast={props.forecast}
        detailHandler={detailHandler}
        expanded={showDetail}
      />
      {showDetail && (
        <>
          <MajorityWinGovernmentRow
            partyIndex={props.partyIndex}
            forecast={props.forecast}
          />
          <MinorityWinGovernmentRow
            partyIndex={props.partyIndex}
            forecast={props.forecast}
          />
        </>
      )}
    </>
  );
};
MajorPartyCollapsibleRows.propTypes = {
  forecast: PropTypes.object.isRequired,
  partyIndex: PropTypes.string.isRequired,
};

const HungExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This row shows the share of model simulations in which no party gets a{' '}
        <a href="https://en.wikipedia.org/wiki/Majority_government">majority</a>
        , and additionally no major party can form{' '}
        <a href="https://en.wikipedia.org/wiki/Minority_government">
          minority government
        </a>{' '}
        only with those parties assumed to support them. In this situation, some
        party will still eventually form government once it gains the confidence
        of independent candidates and unaligned parties (or perhaps if that
        cannot be done, a new election is held).
      </p>
      <hr />
      <p>
        Click on &quot;Show details&quot; above to show these simulations broken
        down by the party getting the most seats. Note that the party with the
        most seats will not necessarily form government, but is more likely to
        have the upper hand in any negotiations. The final entry shows the
        chance outcomes where two (or rarely more) parties are exactly tied in
        the lead with the same number of seats.
      </p>
    </Alert>
  );
};

const HungParliamentMainRow = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  let prob = 100;
  for (const el of props.forecast.majorityWinPc) {
    prob -= el[1];
  }
  for (const el of props.forecast.minorityWinPc) {
    prob -= el[1];
  }
  const bgClasses = `${styles.formationOfGovernmentTopItem} ${lightBgClass(
    'OTH'
  )}`;
  return (
    <>
      <ListGroup.Item className={bgClasses}>
        <div className={styles.majorRowArranger}>
          <div className={styles.formationOfGovernmentDescription}>
            <ProbStatement
              forecast={props.forecast}
              party={null}
              prob={prob}
              text={props.text}
              outcome={'no clear winner in the parliament'}
            />
            &nbsp;
            <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
          </div>
          {props.detailHandler !== undefined && (
            <Button
              onClick={props.detailHandler}
              className={styles.formationOfGovernmentExpand}
            >
              {props.expanded ? ' Hide detail' : ' Show detail'}
              <small>{props.expanded ? ' ▲' : ' ▼'}</small>
            </Button>
          )}
        </div>
      </ListGroup.Item>
      {showExplainer && <HungExplainer />}
    </>
  );
};
HungParliamentMainRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  text: PropTypes.string,
  detailHandler: PropTypes.func,
  expanded: PropTypes.bool,
};

const HungParliamentCollapsibleRows = props => {
  const [showDetail, setShowDetail] = useState(false);

  const detailHandler = () => setShowDetail(!showDetail);

  const parties = [];
  for (const el of props.forecast.mostSeatsWinPc) {
    parties.push(el[0]);
  }

  parties.sort(
    (a, b) =>
      jsonMap(props.forecast.mostSeatsWinPc, b) -
      jsonMap(props.forecast.mostSeatsWinPc, a)
  );

  return (
    <>
      <HungParliamentMainRow
        forecast={props.forecast}
        detailHandler={detailHandler}
        expanded={showDetail}
      />
      {showDetail &&
        [...parties].map((el, index) => {
          const rows = [];
          if (
            jsonMap(props.forecast.majorityWinPc, el, undefined) !== undefined
          ) {
            rows.push(
              <MostSeatsRow
                partyIndex={el}
                forecast={props.forecast}
                key={index}
              />
            );
          }
          return rows;
        })}
      {showDetail && (
        <TiesRow
          forecast={props.forecast}
          detailHandler={detailHandler}
          expanded={showDetail}
        />
      )}
    </>
  );
};
HungParliamentCollapsibleRows.propTypes = {
  forecast: PropTypes.object.isRequired,
};

const OthersCollapsibleRows = props => {
  const [showDetail, setShowDetail] = useState(false);

  const minorParties = [];
  for (const el of props.forecast.majorityWinPc) {
    if (el[0] === 0 || el[0] === 1) continue;
    minorParties.push(el[0]);
  }

  minorParties.sort(
    (a, b) =>
      jsonMap(props.forecast.majorityWinPc, b) -
      jsonMap(props.forecast.majorityWinPc, a)
  );

  let detailHandler = () => setShowDetail(!showDetail);

  // Signal that no expansion should be allowed if there are no detail rows to show
  if (!minorParties.length) detailHandler = undefined;

  return (
    <>
      <OverallWinGovernmentRow
        partyIndex="-1"
        forecast={props.forecast}
        detailHandler={detailHandler}
        expanded={showDetail}
        text="Any other party"
      />
      {showDetail &&
        minorParties.map((el, index) => {
          const rows = [];
          if (
            jsonMap(props.forecast.majorityWinPc, el, undefined) !== undefined
          ) {
            rows.push(
              <MajorityWinGovernmentRow
                partyIndex={el}
                forecast={props.forecast}
                key={index}
              />
            );
          }
          return rows;
        })}
    </>
  );
};
OthersCollapsibleRows.propTypes = {
  forecast: PropTypes.object.isRequired,
};

const MainExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section describes the forecast model&apos;s calculated chances for
        parties to be in a position to <b>form government</b> by getting either
        a&nbsp;
        <a href="https://en.wikipedia.org/wiki/Majority_government">
          majority
        </a>{' '}
        themselves, or winning{' '}
        <a href="https://en.wikipedia.org/wiki/Minority_government">
          minority government
        </a>{' '}
        with the confidence of minor parties, in parliament.
      </p>
      <hr />
      <p>
        Simulated results are grouped here into four categories, with the chance
        of each shown as a percentage:
      </p>
      <ul>
        <li>
          one for <i>each major party</i> (Labor/ALP and the Liberal/National
          Coalition) being in a position to form government
        </li>
        <li>
          one for <i>some other party</i> being in a position to form government
          (this is usually highly unlikely)
        </li>
        <li>
          one for <i>no party</i> being in a such a position
        </li>
      </ul>
      <p>
        Click on the information icons (<InfoIcon />) for each section below for
        more on that particular category.
      </p>
    </Alert>
  );
};

const FormationOfGovernment = props => {
  const [showExplainer, setShowExplainer] = useState(false);

  const partyProb = party => {
    let probMajority = jsonMap(props.forecast.majorityWinPc, party);
    let probMinority = jsonMap(props.forecast.minorityWinPc, party);
    if (probMajority === undefined) probMajority = 0;
    if (probMinority === undefined) probMinority = 0;
    return probMajority + probMinority;
  };

  const higherProbParty = partyProb(0) > partyProb(1) ? '0' : '1';
  const lowerProbParty = higherProbParty === '0' ? '1' : '0';

  return (
    <Card className={styles.summary}>
      <Card.Header className={styles.formationOfGovernmentTitle}>
        <strong>
          Formation of Government&nbsp;
          <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
        </strong>
      </Card.Header>
      <Card.Body className={styles.formationOfGovernmentBody}>
        <StandardErrorBoundary>
          <ListGroup className={styles.formationOfGovernmentTopList}>
            {showExplainer && <MainExplainer />}
            <MajorPartyCollapsibleRows
              partyIndex={higherProbParty}
              forecast={props.forecast}
            />
            <MajorPartyCollapsibleRows
              partyIndex={lowerProbParty}
              forecast={props.forecast}
            />
            <OthersCollapsibleRows forecast={props.forecast} />
            <HungParliamentCollapsibleRows forecast={props.forecast} />
          </ListGroup>
        </StandardErrorBoundary>
        <StandardErrorBoundary>
          <GovernmentFormationChart
            forecast={props.forecast}
            windowWidth={props.windowWidth}
          />
        </StandardErrorBoundary>
      </Card.Body>
    </Card>
  );
};
FormationOfGovernment.propTypes = {
  forecast: PropTypes.object.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

export default FormationOfGovernment;
