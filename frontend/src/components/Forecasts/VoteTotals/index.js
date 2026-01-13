import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import TooltipPercentage from '../../General/TooltipPercentage';
import TooltipWrapper from '../../General/TooltipWrapper';
import ProbBarDist from '../../General/ProbBarDist';
import VoteTrendChart from './VoteTrendChart';
import {SmartBadge} from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';

import {coalitionName} from '../../../utils/coalition.js';
import {jsonMap} from '../../../utils/jsonmap.js';
import {isOutlook} from '../../../utils/outlook.js';

import styles from './VoteTotals.module.css';

const VoteShareRow = props => {
  let partyAbbr =
    props.freqSet[0] === null
      ? 'LNP'
      : jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
  const canShowCoalition =
    Object.hasOwn(props.forecast, 'coalitionFpFrequencies') &&
    props.forecast.coalitionFpFrequencies.length > 0;
  if (canShowCoalition && !props.showCoalition && partyAbbr === 'LNP') {
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
    isOutlook(props.forecast.termCode) && props.forecast.reportMode !== 'RF'
      ? styles.rowPercentageDeemphasised
      : styles.rowPercentageStrong;
  const outerStyle =
    isOutlook(props.forecast.termCode) && props.forecast.reportMode !== 'RF'
      ? styles.rowPercentageStrong
      : styles.rowPercentage;
  return (
    <ListGroup.Item className={styles.voteTotalsItem}>
      <div className={styles.rowLeftSection}>
        <div className={styles.rowParty}>
          <SmartBadge party={partyAbbr} termCode={props.forecast.termCode} />
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
        pluralNoun="vote totals"
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
  maxVoteTotal: PropTypes.number.isRequired,
  minVoteTotal: PropTypes.number.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

const FpExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section shows the model&apos;s projections for the first-preference
        vote. This is a measure of how many voters mark the party <i>first</i>{' '}
        on their ballot paper.
      </p>
      <hr />
      <p>
        First preferences (also known as <i>primary votes</i>) are a very simple
        way to measure a party&apos;s support. However, in Australia&apos;s
        preferential voting system they are not a reliable predictor for the
        winner of an election as a party that is behind on first preferences can
        catch up on later preferences from other parties. (For example, in
        recent years Labor has generally gained many more preferences than the
        Coalition as a result of favourable preference flows from the Greens.)
      </p>
      <hr />
      <p>
        Parties not listed here (generally because their vote is not reported in
        enough polls) and independents are grouped together under
        &quot;Others&quot;.
      </p>
    </Alert>
  );
};

const CoalitionRow = props => {
  return (
    <ListGroup.Item className={styles.voteTotalsNote}>
      <input type="checkbox" checked={props.value} onChange={props.onChange} />
      {'  '}Combine {coalitionName(props.termCode)} vote totals
    </ListGroup.Item>
  );
};
CoalitionRow.propTypes = {
  onChange: PropTypes.func.isRequired,
  termCode: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
};

const FpRowSet = props => {
  const canShowCoalition =
    Object.hasOwn(props.forecast, 'coalitionFpFrequencies') &&
    props.forecast.coalitionFpFrequencies.length > 0;
  const [showCoalition, setShowCoalition] = useState(
    canShowCoalition && props.forecast.termCode.slice(4) !== 'wa'
  );
  const [showExplainer, setShowExplainer] = useState(false);

  let freqs = props.forecast.fpFrequencies.sort((el1, el2) => {
    return el2[1][7] - el1[1][7];
  });
  if (showCoalition) {
    freqs = freqs.filter(el => {
      const partyAbbr = jsonMap(props.forecast.partyAbbr, el[0]);
      return partyAbbr !== 'LIB' && partyAbbr !== 'NAT' && partyAbbr !== 'LNP';
    });
    freqs.push([null, props.forecast.coalitionFpFrequencies]);
    freqs.sort((el1, el2) => {
      return el2[1][7] - el1[1][7];
    });
  }

  const results =
    props.results === null
      ? null
      : freqs.map(freq => {
          const thisPartyAbbr = jsonMap(props.forecast.partyAbbr, freq[0]);
          if (
            thisPartyAbbr === 'ON' &&
            props.results.overall.fp['ONP'] !== undefined
          ) {
            return props.results.overall.fp['ONP'];
          }
          return props.results.overall.fp[thisPartyAbbr];
        });
  const maxVoteTotal = Math.max(...freqs.map(el => Math.max(...el[1])));
  let combinedCoalition = 0.0;
  if (
    props.results !== null &&
    props.results.overall.fp['LIB'] !== undefined &&
    props.results.overall.fp['NAT'] !== undefined
  ) {
    combinedCoalition =
      props.results.overall.fp['LIB'] + props.results.overall.fp['NAT'];
  } else if (
    props.results !== null &&
    props.results.overall.fp['LNP'] !== undefined &&
    props.results.overall.fp['NAT'] !== undefined
  ) {
    combinedCoalition =
      props.results.overall.fp['LNP'] + props.results.overall.fp['NAT'];
  }
  return (
    <>
      <ListGroup.Item className={styles.voteTotalsSubHeading}>
        First preference votes&nbsp;
        <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
      </ListGroup.Item>
      {showExplainer && <FpExplainer />}
      {canShowCoalition && (
        <CoalitionRow
          onChange={() => setShowCoalition(!showCoalition)}
          termCode={props.forecast.termCode}
          value={showCoalition}
        />
      )}
      {freqs.map((freqSet, index) => (
        <VoteShareRow
          forecast={props.forecast}
          freqSet={freqSet}
          key={index}
          maxVoteTotal={maxVoteTotal}
          minVoteTotal={0}
          showCoalition={showCoalition}
          result={
            results === null
              ? null
              : results[index] === undefined
              ? combinedCoalition
              : results[index]
          }
          windowWidth={props.windowWidth}
        />
      ))}
    </>
  );
};
FpRowSet.propTypes = {
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  windowWidth: PropTypes.number.isRequired,
};

const TppExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section shows the model&apos;s projections for the two-party
        preferred vote. This is a measure of whether voters mark Labor or the
        Coalition with the higher preference on the ballot.
      </p>
      <hr />
      <p>
        The two-party preferred is historically the most reliable overall
        indicator for determining the winner of Australian elections. Parties
        that win the two-party preferred usually also win the election, but
        exceptions can occur (when the vote is distributed unevenly in certain
        ways, if third parties or independents win many seats, or also
        historically in the case of{' '}
        <a href="https://en.wikipedia.org/wiki/Malapportionment">
          malapportionment
        </a>
        ).
      </p>
    </Alert>
  );
};

const TppRowSet = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  const partyFreqs = [[0, props.forecast.tppFrequencies]];
  partyFreqs.push([1, partyFreqs[0][1].map(freq => 100 - freq).reverse()]);
  const partyResults =
    props.results === null
      ? [null, null]
      : [props.results.overall.tpp, 100 - props.results.overall.tpp];
  const maxVoteTotal = Math.max(
    Math.max(...partyFreqs[0][1]),
    Math.max(...partyFreqs[1][1])
  );
  const minVoteTotal = Math.min(
    Math.min(...partyFreqs[0][1]),
    Math.min(...partyFreqs[1][1])
  );
  const firstHigher = partyFreqs[0][1][7] > partyFreqs[1][1][7];
  return (
    <>
      <ListGroup.Item className={styles.voteTotalsSubHeading}>
        Two-party-preferred votes&nbsp;
        <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
      </ListGroup.Item>
      {showExplainer && <TppExplainer />}
      <VoteShareRow
        forecast={props.forecast}
        freqSet={partyFreqs[firstHigher ? 0 : 1]}
        maxVoteTotal={maxVoteTotal}
        minVoteTotal={minVoteTotal}
        showCoalition={true} // Make it use coalition badge
        result={partyResults[firstHigher ? 0 : 1]}
        windowWidth={props.windowWidth}
      />
      <VoteShareRow
        forecast={props.forecast}
        freqSet={partyFreqs[firstHigher ? 1 : 0]}
        maxVoteTotal={maxVoteTotal}
        minVoteTotal={minVoteTotal}
        showCoalition={true} // Make it use coalition badge
        result={partyResults[firstHigher ? 1 : 0]}
        windowWidth={props.windowWidth}
      />
    </>
  );
};
TppRowSet.propTypes = {
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  windowWidth: PropTypes.number.isRequired,
};

const ChartExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section shows the trend over time since the last election for a
        number of different vote measures, with darker sections of the graph
        indicating the mostly likely values at that time and lighter sections
        showing less likely but still somewhat plausible levels. All polls used
        in the model are also displayed as dots on the graph. Mouse/tap the
        graph to see more details about the estimated trend at that time point.
      </p>
      <hr />
      <p>
        There are two menus, one for choose the party and type of vote data and
        the other for the display of polls. For the party menu, the two-party
        preferred votes for both major parties and the first preferences for all
        other parties, and also &quot;Others&quot; can be selected.
      </p>
      <hr />
      <p>
        The second menu allows for different ways to display the results of
        opinion polls. For two-party preferred results, three options are given:
      </p>
      <ul>
        <li>
          <i>Calculated two-party</i> - the two-party preferred vote calculated
          from the first preference votes, using preference flows from the
          previous election
        </li>
        <li>
          <i>House effect adjusted</i> - the calculated two-party vote adjusted
          to the model&apos;s estimates of house effects.
        </li>
        <li>
          <i>Reported two-party</i> - the value reported by the poll, without
          any adjustment by the model.
        </li>
      </ul>
      <p>
        For first-preference trends the is no &quot;Calculated two-party&quot;
        option as there is nothing to calculate, but the other options still
        exist.
      </p>
    </Alert>
  );
};
TppRowSet.propTypes = {
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  windowWidth: PropTypes.number.isRequired,
};

const VoteTrendChartSet = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  return (
    <>
      <ListGroup.Item className={styles.voteTotalsSubHeading}>
        Estimated past voting trend&nbsp;
        <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
      </ListGroup.Item>
      {showExplainer && <ChartExplainer />}
      <VoteTrendChart forecast={props.forecast} />
    </>
  );
};
VoteTrendChartSet.propTypes = {
  forecast: PropTypes.object.isRequired,
};

const MainExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This part of the simulation report covers the{' '}
        <strong> share of the total vote </strong> that significant political
        parties are projected to get. These estimates are based on analysis of
        how historical poll results and other political factors relate to
        election results, and take into account their historic biases and level
        of accuracy.
      </p>
      <hr />
      <p>
        Parties&apos; possible vote shares are represented as text percentages
        along with shaded bars to represent more and less likely ranges for the
        vote.
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

const VoteTotals = props => {
  const [showExplainer, setShowExplainer] = useState(false);

  let showFpTotals = true;
  if (props.mode === 'live' && props.election === '2022sa')
    showFpTotals = false;
  if (props.mode === 'live' && props.election === '2022vic' && !props.isArchive)
    showFpTotals = false;
  if (props.mode === 'live' && props.election === '2023nsw')
    showFpTotals = false;

  return (
    <Card className={styles.summary}>
      <Card.Header className={styles.voteTotalsTitle}>
        <strong>
          Vote Totals&nbsp;
          <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
        </strong>
      </Card.Header>
      <Card.Body className={styles.voteTotalsBody}>
        <ListGroup className={styles.voteTotalsList}>
          {showExplainer && <MainExplainer />}
          <StandardErrorBoundary>
            <TppRowSet
              forecast={props.forecast}
              results={props.results}
              windowWidth={props.windowWidth}
            />
          </StandardErrorBoundary>
          {showFpTotals && (
            <StandardErrorBoundary>
              <FpRowSet
                forecast={props.forecast}
                results={props.results}
                windowWidth={props.windowWidth}
              />
            </StandardErrorBoundary>
          )}
          {(props.mode !== 'live' || props.election !== '2022sa') &&
            props.forecast.polls !== undefined && (
              <StandardErrorBoundary>
                <VoteTrendChartSet
                  forecast={props.forecast}
                  windowWidth={props.windowWidth}
                />
              </StandardErrorBoundary>
            )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
VoteTotals.propTypes = {
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  mode: PropTypes.string.isRequired,
  election: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
  isArchive: PropTypes.bool,
};

export default VoteTotals;
