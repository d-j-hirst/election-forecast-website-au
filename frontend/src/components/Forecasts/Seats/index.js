import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import {HashLink as Link} from 'react-router-hash-link';

import SeatWinsSection from '../SeatWins';
import SeatTcpSection from '../SeatTcp';
import SeatFpSection from '../SeatFp';
import SeatTcpSwingFactors from '../SwingFactors';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import WinnerBarDist from '../../General/WinnerBarDist';
import {SmartBadge} from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';
import TooltipWrapper from '../../General/TooltipWrapper';

import {coalitionAbbreviation} from '../../../utils/coalition.js';
import {deepCopy} from '../../../utils/deepcopy.js';
import {jsonMap, jsonMapReverse} from '../../../utils/jsonmap.js';
import {partyCategory} from '../../../utils/partyclass.js';
import {getSeatUrl} from '../../../utils/seaturls.js';
import {seatInRegion} from '../../../utils/seatregion.js';
import {useWarning} from '../../../utils/seatwarnings.js';

import styles from './Seats.module.css';

const seatAsterisks = {
  '2023nsw;Bega':
    'This seat was won by Labor at a by-election with a margin of 5.1%. ' +
    'However, general election results historically are a more reliable ' +
    'indicator of performance in these cases, so the 2019 election ' +
    'margin of 6.9% to the Liberals is used as the baseline for the forecast.',
  '2023nsw;Monaro':
    'This seat was won by the Nationals at a by-election with a margin of 5.2%. ' +
    'However, general election results are historically a more reliable ' +
    'indicator of performance in these cases, so the 2019 election ' +
    'margin of 11.6% to the Nationals is used as the baseline for the forecast.',
  '2023nsw;Strathfield':
    'This seat was won by Labor at a by-election with a margin of 5.8%. ' +
    'However, general election results are historically a more reliable ' +
    'indicator of performance in these cases, so the 2019 election ' +
    'margin, adjusted for redistribution, of 5.2% to Labor is used as the ' +
    'baseline for the forecast.',
  '2023nsw;Upper Hunter':
    'This seat was won by the Nationals at a by-election with a margin of 5.8%. ' +
    'However, general election results are historically a more reliable ' +
    'indicator of performance in these cases, so the 2019 election ' +
    'margin, adjusted for redistribution, of 0.5% to the Nationals is used as the ' +
    'baseline for the forecast.',
  '2024qld;Ipswich West':
    'This seat was won by the LNP at a by-election with a margin of 3.5%. ' +
    'However, general election results are historically a more reliable ' +
    'indicator of performance in these cases, so the 2020 election ' +
    'margin of 14.35% to Labor is used as the ' +
    'baseline for the forecast.',
  '2024qld;Inala':
    'This seat was won by Labor at a by-election with a margin of 6.7%. ' +
    'However, general election results are historically a more reliable ' +
    'indicator of performance in these cases, so the 2020 election ' +
    'margin of 28.2% to Labor is used as the ' +
    'baseline for the forecast.',
};

const SeatRow = props => {
  const [showMore, setShowMore] = useState(false);

  const moreHandler = () => setShowMore(!showMore);

  const seatName = props.forecast.seatNames[props.index];
  let displayName = seatName;
  if (displayName.length > 14) {
    displayName = displayName.replace('North', 'N').replace('South', 'S');
    displayName = displayName.replace('East', 'E').replace('West', 'W');
  }
  const asteriskCode = props.election + ';' + seatName;
  const asterisk = seatAsterisks.hasOwnProperty(asteriskCode)
    ? seatAsterisks[asteriskCode]
    : '';
  const incumbentIndex = props.forecast.seatIncumbents[props.index];
  const tempAbbr = jsonMap(props.forecast.partyAbbr, incumbentIndex);
  const incumbentAbbr =
    props.forecast.coalitionSeatCountFrequencies && tempAbbr === 'LNP'
      ? 'LIB'
      : tempAbbr;
  const margin = props.forecast.seatMargins[props.index];

  const freqs = deepCopy(props.forecast.seatPartyWinFrequencies[props.index]);
  freqs.sort((a, b) => {
    const aName = jsonMap(props.forecast.partyAbbr, a[0]);
    const bName = jsonMap(props.forecast.partyAbbr, b[0]);
    return partyCategory(aName) - partyCategory(bName);
  });
  const detailsLink =
    props.archiveId !== undefined
      ? `/archive/${props.election}/${props.archiveId}/seat/${getSeatUrl(
          seatName
        )}`
      : `/seat/${props.election}/${props.mode}/${getSeatUrl(seatName)}`;

  const winner =
    props.result !== null ? Object.keys(props.result.tcp)[0] : null;

  let detailsAvailable = true;
  if (
    props.archiveId === undefined &&
    props.election === '2022vic' &&
    props.mode === 'live'
  )
    detailsAvailable = false;

  let marginTooltip = '';
  if (incumbentIndex === 0) {
    marginTooltip =
      'The two-party-preferred (2PP) margin against the Liberal/National Coalition, after adjustment for redistributions.';
  } else if (incumbentIndex === 1) {
    marginTooltip =
      'The two-party-preferred (2PP) margin against Labor, after adjustment for redistributions.';
  } else {
    marginTooltip =
      'The final two-candidate-preferred margin in the previous election, after adjustment for redistributions.';
  }

  // const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
  return (
    <>
      <ListGroup.Item className={styles.seatsItem}>
        <div className={styles.seatsLeft}>
          <strong>
            {displayName === seatName && displayName}
            {displayName !== seatName && (
              <TooltipWrapper tooltipText={seatName}>
                {displayName}
              </TooltipWrapper>
            )}
          </strong>
          {asterisk.length > 0 && (
            <TooltipWrapper tooltipText={asterisk}>*</TooltipWrapper>
          )}
          {' - '}
          <SmartBadge
            party={incumbentAbbr}
            termCode={props.forecast.termCode}
          />{' '}
          <TooltipWrapper tooltipText={marginTooltip} placement="bottom">
            {Number(margin).toFixed(1)}%
          </TooltipWrapper>
          {useWarning(props.election, seatName) && (
            <>
              {' '}
              <InfoIcon
                warning={true}
                noToggle={true}
                tooltipText="This seat has unusual circumstances which make it particularly difficult to model. Treat with caution."
              />
            </>
          )}
          <br />
          {detailsAvailable && (
            <>
              <span className={styles.seatsLink} onClick={moreHandler}>
                {!showMore && <>&#9660;more</>}
                {showMore && <>&#9650;less</>}
              </span>
              {(props.mode !== 'live' || props.election !== '2022sa') && (
                <>
                  {'  |  '}
                  <Link to={detailsLink}>
                    <span className={styles.seatsLink}>
                      <strong>&#187;</strong>full detail
                    </span>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        <WinnerBarDist
          forecast={props.forecast}
          freqSet={freqs}
          index={props.index}
          result={winner}
          width={Math.min(props.windowWidth - 70, 300)}
        />
      </ListGroup.Item>
      {showMore && (
        <SeatMore
          index={props.index}
          forecast={props.forecast}
          windowWidth={props.windowWidth}
          mode={props.mode}
          result={props.result}
          election={props.election}
        />
      )}
    </>
  );
};
SeatRow.propTypes = {
  forecast: PropTypes.object.isRequired,
  result: PropTypes.object,
  index: PropTypes.number.isRequired,
  election: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
  archiveId: PropTypes.number,
};

const SeatMore = props => {
  const seatName = props.forecast.seatNames[props.index];
  return (
    <>
      {useWarning(props.election, seatName) && (
        <Alert variant="warning" className={styles.alert}>
          <p>
            <InfoIcon inactive={true} warning={true} /> This seat has unusual
            circumstances which make it particularly difficult to model. Treat
            this projection with extra caution.
          </p>
        </Alert>
      )}
      <SeatWinsSection
        forecast={props.forecast}
        index={props.index}
        abbreviated={true}
      />
      {(props.mode !== 'live' || props.election !== '2022sa') && (
        <>
          <SeatFpSection
            forecast={props.forecast}
            election={props.election}
            index={props.index}
            result={props.result}
            windowWidth={props.windowWidth}
            mode={props.mode}
            abbreviated={true}
          />
          <SeatTcpSection
            forecast={props.forecast}
            election={props.election}
            index={props.index}
            result={props.result}
            windowWidth={props.windowWidth}
            abbreviated={true}
          />
        </>
      )}
      {props.mode !== 'live' &&
        props.forecast.hasOwnProperty('seatSwingFactors') && (
          <SeatTcpSwingFactors
            forecast={props.forecast}
            election={props.election}
            index={props.index}
            result={props.result}
            windowWidth={props.windowWidth}
            mode={props.mode}
            abbreviated={true}
          />
        )}
    </>
  );
};
SeatMore.propTypes = {
  forecast: PropTypes.object.isRequired,
  result: PropTypes.object,
  index: PropTypes.number.isRequired,
  election: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
};

const MainExplainer = props => {
  const marginTooltip =
    'How much of the total two-candidate-preferred vote the incumbent can lose' +
    ' before they lose the seat. For example, in a seat with 10000 voters and a margin of 3%,' +
    ' the incumbent has 5300 votes and can lose the seat if they lose 300 votes.';

  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section lists the simulated results for each seat in this election.
        Each row shows the seat name, incumbent party and the{' '}
        <TooltipWrapper tooltipText={marginTooltip}>
          <strong> margin </strong>
        </TooltipWrapper>{' '}
        of the incumbent. Seats are shown in order of their competitiveness,
        with the least certain results highest on the page.
      </p>
      <hr />
      <p>
        The coloured bar to the right of each row indicates the modelled
        probabilities for parties to win the seat. Tap or mouse over the colours
        to see the party name and percentage chance of winning.
      </p>
      <hr />
      <p>
        Click on &quot;more&quot; or &quot;full detail&quot; to show more
        information about the model&apos;s forecast for each seat.
        &quot;More&quot; will display an abbreviated set of results inline on
        this page, while &quot;full detail&quot; will show everything there is
        to see on a separate page.
      </p>
      <hr />
      <p>
        The most robust seat figures here are those for the major parties, as
        there are much more data on major-major contests for the model to work
        with. Results for seats where a minor party or independent is prominent
        should be approached with some caution; good local knowledge is likely
        to be more accurate than the model in such seats.
      </p>
    </Alert>
  );
};

const Seats = props => {
  const SortTypeEnum = Object.freeze({
    competitiveness: 1,
    alphabetical: 2,
    alpTppMargin: 3,
    lnpTppMargin: 4,
    winChance: 5,
  });

  const [showExplainer, setShowExplainer] = useState(false);
  const [sortType, setSortType] = useState(SortTypeEnum.competitiveness);
  const [sortParty, setSortParty] = useState(0);
  const [filter, setFilter] = useState('all');

  const getIndexedMargins = () => {
    return props.forecast.seatMargins.map((a, index) => [
      index,
      a,
      jsonMap(
        props.forecast.partyAbbr,
        props.forecast.seatIncumbents[index]
      ) === 'NAT'
        ? 1
        : props.forecast.seatIncumbents[index],
    ]);
  };

  let sortedIndices = [];
  if (sortType === SortTypeEnum.competitiveness) {
    const indexedSeats = props.forecast.seatPartyWinFrequencies.map(
      (a, index) => [index, a]
    );
    const findMax = pair => pair[1].reduce((p, c) => (p > c[1] ? p : c[1]), 0);
    const indexedCompetitiveness = indexedSeats.map(a => [a[0], findMax(a)]);
    indexedCompetitiveness.sort((a, b) => a[1] - b[1]);
    sortedIndices = indexedCompetitiveness.map(a => a[0]);
  } else if (sortType === SortTypeEnum.alphabetical) {
    const indexedNames = props.forecast.seatNames.map((a, index) => [index, a]);
    indexedNames.sort((a, b) => (a[1] < b[1] ? -1 : 1));
    sortedIndices = indexedNames.map((a, b) => a[0]);
  } else if (sortType === SortTypeEnum.alpTppMargin) {
    const indexedMargins = getIndexedMargins();
    indexedMargins.sort((a, b) => {
      if (a[2] <= 1 && b[2] >= 2) return -1;
      if (a[2] >= 2 && b[2] <= 1) return 1;
      let margin1 = a[1];
      let margin2 = b[1];
      if (a[2] === 1) margin1 = -margin1;
      if (b[2] === 1) margin2 = -margin2;
      return margin1 > margin2 ? -1 : 1;
    });
    sortedIndices = indexedMargins.map((a, b) => a[0]);
  } else if (sortType === SortTypeEnum.lnpTppMargin) {
    const indexedMargins = getIndexedMargins();
    indexedMargins.sort((a, b) => {
      if (a[2] <= 1 && b[2] >= 2) return -1;
      if (a[2] >= 2 && b[2] <= 1) return 1;
      let margin1 = a[1];
      let margin2 = b[1];
      if (a[2] === 0) margin1 = -margin1;
      if (b[2] === 0) margin2 = -margin2;
      return margin1 > margin2 ? -1 : 1;
    });
    sortedIndices = indexedMargins.map((a, b) => a[0]);
  } else if (sortType === SortTypeEnum.winChance) {
    let indexedChances = [];
    if (jsonMap(props.forecast.partyAbbr, sortParty) === 'IND') {
      indexedChances = props.forecast.seatPartyWinFrequencies.map(
        (a, index) => [index, jsonMap(a, sortParty, 0) + jsonMap(a, -2, 0)]
      );
    } else {
      indexedChances = props.forecast.seatPartyWinFrequencies.map(
        (a, index) => [index, jsonMap(a, sortParty, 0)]
      );
    }
    indexedChances.sort((a, b) => (a[1] > b[1] ? -1 : 1));
    sortedIndices = indexedChances.map((a, b) => a[0]);
  }

  sortedIndices = sortedIndices.filter(val =>
    seatInRegion(props.forecast.seatNames[val], filter)
  );

  const sortTitle = (() => {
    let title = 'Sort by: ';
    const partyAbbr = (() => {
      if (sortParty === -2) return 'Emerging IND ';
      if (sortParty === -3) return 'Emerging party ';
      return jsonMap(props.forecast.partyAbbr, sortParty);
    })();
    if (sortType === SortTypeEnum.competitiveness) title += 'Competitiveness';
    else if (sortType === SortTypeEnum.alphabetical)
      title += 'Alphabetical order';
    else if (sortType === SortTypeEnum.alpTppMargin) title += 'ALP 2PP margin';
    else if (sortType === SortTypeEnum.lnpTppMargin)
      title += `${coalitionAbbreviation(props.election)} 2PP margin`;
    else if (sortType === SortTypeEnum.winChance)
      title += `${partyAbbr} win chance`;
    return title;
  })();

  const isFederal = props.election.substring(4) === 'fed';

  const filterTitle = (() => {
    let title = 'Filter:';
    if (filter === 'all') {
      title += ' All seats';
    } else {
      title += ' ' + filter.toUpperCase() + ' seats';
    }
    return title;
  })();

  const grnIndex = jsonMapReverse(props.forecast.partyAbbr, 'GRN');
  const indIndex = jsonMapReverse(
    props.forecast.partyAbbr,
    'IND',
    null,
    a => a >= 0
  );
  let libIndex = jsonMapReverse(props.forecast.partyAbbr, 'LIB');
  if (
    libIndex &&
    jsonMap(props.forecast.seatCountFrequencies, libIndex)[14] === 0
  )
    libIndex = null;
  let lnpIndex = jsonMapReverse(props.forecast.partyAbbr, 'LNP');
  if (lnpIndex < 0)
    lnpIndex = jsonMapReverse(props.forecast.partyAbbr.slice(1), 'LNP');
  if (
    lnpIndex &&
    jsonMap(props.forecast.seatCountFrequencies, lnpIndex)[14] === 0
  )
    libIndex = null;
  let natIndex = jsonMapReverse(props.forecast.partyAbbr, 'NAT');
  if (
    natIndex &&
    jsonMap(props.forecast.seatCountFrequencies, natIndex)[14] === 0
  )
    natIndex = null;
  let onIndex = jsonMapReverse(props.forecast.partyAbbr, 'ON');
  if (
    onIndex &&
    jsonMap(props.forecast.seatCountFrequencies, onIndex)[14] === 0
  )
    onIndex = null;
  let uapIndex = jsonMapReverse(props.forecast.partyAbbr, 'UAP');
  if (
    uapIndex &&
    jsonMap(props.forecast.seatCountFrequencies, uapIndex)[14] === 0
  )
    uapIndex = null;
  let kapIndex = jsonMapReverse(props.forecast.partyAbbr, 'KAP');
  if (
    kapIndex &&
    jsonMap(props.forecast.seatCountFrequencies, kapIndex)[14] === 0
  )
    kapIndex = null;

  const setSortCompetitiveness = () => {
    setSortType(SortTypeEnum.competitiveness);
  };
  const setSortAlphabetical = () => {
    setSortType(SortTypeEnum.alphabetical);
  };
  const setSortAlpTppMargin = () => {
    setSortType(SortTypeEnum.alpTppMargin);
  };
  const setSortLnpTppMargin = () => {
    setSortType(SortTypeEnum.lnpTppMargin);
  };
  const setSortAlpWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(0);
  };
  const setSortLnpWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(1);
  };
  const setSortLibWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(1);
  };
  const setSortNatWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(natIndex);
  };
  const setSortGrnWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(grnIndex);
  };
  const setSortIndWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(indIndex);
  };
  const setSortOnWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(onIndex);
  };
  const setSortUapWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(uapIndex);
  };
  const setSortKapWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(kapIndex);
  };
  const setSortEmergingPartyWinChance = () => {
    setSortType(SortTypeEnum.winChance);
    setSortParty(-3);
  };

  const setFilterAll = () => {
    setFilter('all');
  };
  const setFilterNsw = () => {
    setFilter('nsw');
  };
  const setFilterVic = () => {
    setFilter('vic');
  };
  const setFilterQld = () => {
    setFilter('qld');
  };
  const setFilterWa = () => {
    setFilter('wa');
  };
  const setFilterSa = () => {
    setFilter('sa');
  };
  const setFilterTas = () => {
    setFilter('tas');
  };
  const setFilterAct = () => {
    setFilter('act');
  };
  const setFilterNt = () => {
    setFilter('nt');
  };

  return (
    <Card className={styles.summary}>
      <Card.Header className={styles.seatsTitle} id="seats">
        Seats &nbsp;
        <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
      </Card.Header>
      <Card.Body className={styles.seatsBody}>
        {showExplainer && <MainExplainer />}
        <StandardErrorBoundary>
          <ListGroup className={styles.seatsList}>
            <ListGroup.Item className={styles.seatOptions}>
              <DropdownButton
                id="sort-dropdown"
                title={sortTitle}
                variant="secondary"
              >
                <Dropdown.Item as="button" onClick={setSortCompetitiveness}>
                  Competitiveness
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={setSortAlphabetical}>
                  Alphabetical order
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={setSortAlpTppMargin}>
                  ALP 2PP margin
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={setSortLnpTppMargin}>
                  {coalitionAbbreviation(props.election)} 2PP margin
                </Dropdown.Item>
                <Dropdown.Item as="button" onClick={setSortAlpWinChance}>
                  ALP win chance
                </Dropdown.Item>
                {lnpIndex && (
                  <Dropdown.Item as="button" onClick={setSortLnpWinChance}>
                    {coalitionAbbreviation(props.election)} win chance
                  </Dropdown.Item>
                )}
                {grnIndex && (
                  <Dropdown.Item as="button" onClick={setSortGrnWinChance}>
                    GRN win chance
                  </Dropdown.Item>
                )}
                {libIndex && (
                  <Dropdown.Item as="button" onClick={setSortLibWinChance}>
                    LIB win chance
                  </Dropdown.Item>
                )}
                {natIndex && (
                  <Dropdown.Item as="button" onClick={setSortNatWinChance}>
                    NAT win chance
                  </Dropdown.Item>
                )}
                {indIndex && (
                  <Dropdown.Item as="button" onClick={setSortIndWinChance}>
                    IND win chance
                  </Dropdown.Item>
                )}
                {onIndex && (
                  <Dropdown.Item as="button" onClick={setSortOnWinChance}>
                    ON win chance
                  </Dropdown.Item>
                )}
                {uapIndex && (
                  <Dropdown.Item as="button" onClick={setSortUapWinChance}>
                    UAP win chance
                  </Dropdown.Item>
                )}
                {kapIndex && (
                  <Dropdown.Item as="button" onClick={setSortKapWinChance}>
                    KAP win chance
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  as="button"
                  onClick={setSortEmergingPartyWinChance}
                >
                  Emerging party win chance
                </Dropdown.Item>
              </DropdownButton>
              {isFederal && (
                <DropdownButton
                  id="filter-dropdown"
                  title={filterTitle}
                  variant="secondary"
                >
                  <Dropdown.Item as="button" onClick={setFilterAll}>
                    All seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterNsw}>
                    NSW seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterVic}>
                    VIC seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterQld}>
                    QLD seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterWa}>
                    WA seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterSa}>
                    SA seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterTas}>
                    TAS seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterAct}>
                    ACT seats
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setFilterNt}>
                    NT seats
                  </Dropdown.Item>
                </DropdownButton>
              )}
            </ListGroup.Item>
            {sortedIndices.map(index => (
              <SeatRow
                archiveId={props.archiveId}
                election={props.election}
                forecast={props.forecast}
                index={index}
                key={props.forecast.seatNames[index]}
                mode={props.mode}
                result={
                  props.results !== null &&
                  props.forecast.seatNames[index] in props.results.seats
                    ? props.results.seats[props.forecast.seatNames[index]]
                    : null
                }
                windowWidth={props.windowWidth}
              />
            ))}
          </ListGroup>
        </StandardErrorBoundary>
      </Card.Body>
    </Card>
  );
};
Seats.propTypes = {
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  election: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  windowWidth: PropTypes.number.isRequired,
  archiveId: PropTypes.number,
};

export default Seats;
