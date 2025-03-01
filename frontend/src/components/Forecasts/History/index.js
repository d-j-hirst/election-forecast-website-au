import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import InfoIcon from '../../General/InfoIcon';
import LoadingMarker from '../../General/LoadingMarker';

import {getDirect} from 'utils/sdk';

import styles from './History.module.css';
import {coalitionAbbreviation} from '../../../utils/coalition.js';
import {colours} from '../../../utils/GraphPartyColours.js';
import {jsonMap, jsonMapReverse} from '../../../utils/jsonmap.js';
import {unixDateToStr, unixTimeToStr} from '../../../utils/date.js';

const tieColour = '#885588';

const round2 = num => Math.round(num * 100) / 100;

const integerPercent = a => String(Math.round(a)) + '%';

const GraphTypeEnum = Object.freeze({
  governmentFormation: 1,
  tpp: 2,
  fp: 3,
  seats: 4,
  coalitionFp: 5,
  coalitionSeats: 6,
});

const TickIntervalEnum = Object.freeze({
  MonthThird: 1,
  MonthHalf: 2,
  Month: 3,
  TwoMonths: 4,
  ThreeMonths: 5,
  SixMonths: 6,
});

const createTicks = (lowUnixDate, highUnixDate) => {
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;
  const lowDateRep = new Date(lowUnixDate);
  const highDateRep = new Date(highUnixDate);
  const numDays = Math.round(Math.abs((highDateRep - lowDateRep) / ONE_DAY));
  const daysToInterval = days => {
    if (days < 60) return TickIntervalEnum.MonthThird;
    if (days < 90) return TickIntervalEnum.MonthHalf;
    if (days < 180) return TickIntervalEnum.Month;
    if (days < 360) return TickIntervalEnum.TwoMonths;
    if (days < 540) return TickIntervalEnum.ThreeMonths;
    return TickIntervalEnum.SixMonths;
  };
  const interval = daysToInterval(numDays);
  const dateInfo = {
    lowDateDay: lowDateRep.getDate(),
    highDateDay: highDateRep.getDate(),
    lowDateMonth: lowDateRep.getMonth(),
    highDateMonth: highDateRep.getMonth(),
    lowDateYear: lowDateRep.getFullYear(),
    highDateYear: highDateRep.getFullYear(),
  };
  const customTicks = [];
  // For shorter periods, just divide the interval into ticks with a certain spacing
  const collectCustomTicks = tickSpacing => {
    for (
      let tick =
        Math.ceil(lowUnixDate / tickSpacing) * tickSpacing - tickSpacing / 2;
      tick < highUnixDate;
      tick += tickSpacing
    ) {
      customTicks.push(new Date(tick));
    }
    return customTicks;
  };
  if (numDays < 1) {
    return collectCustomTicks(ONE_HOUR);
  } else if (numDays < 3) {
    return collectCustomTicks(ONE_HOUR * 12);
  } else if (numDays < 6) {
    return collectCustomTicks(ONE_DAY);
  } else if (numDays < 12) {
    return collectCustomTicks(ONE_DAY * 2);
  } else if (numDays < 24) {
    return collectCustomTicks(ONE_DAY * 4);
  }
  // for longer periods, we want the ticks to align with the start of each month
  for (let year = dateInfo.lowDateYear; year <= dateInfo.highDateYear; ++year) {
    for (
      let month =
        1 * (year === dateInfo.lowDateYear ? dateInfo.lowDateMonth : 0);
      month <= (year === dateInfo.highDateYear ? dateInfo.highDateMonth : 11);
      ++month
    ) {
      const pushTick = (monthRem, day) => {
        if (
          month % monthRem === 0 &&
          (year > dateInfo.lowDateYear ||
            month > dateInfo.lowDateMonth ||
            dateInfo.lowDateDay <= day) &&
          (year < dateInfo.highDateYear ||
            month < dateInfo.highDateMonth ||
            dateInfo.highDateDay >= day)
        ) {
          customTicks.push(Date.UTC(year, month, day));
        }
      };
      if (interval === TickIntervalEnum.MonthThird) {
        pushTick(1, 1);
        pushTick(1, 11);
        pushTick(1, 21);
      } else if (interval === TickIntervalEnum.MonthHalf) {
        pushTick(1, 1);
        pushTick(1, 16);
      } else if (interval === TickIntervalEnum.Month) {
        pushTick(1, 1);
      } else if (interval === TickIntervalEnum.TwoMonths) {
        pushTick(2, 1);
      } else if (interval === TickIntervalEnum.ThreeMonths) {
        pushTick(3, 1);
      } else if (interval === TickIntervalEnum.SixMonths) {
        pushTick(6, 1);
      }
    }
  }
  return customTicks;
};

const genericXAxis = (lowDate, highDate, mode) => {
  const customTicks = createTicks(lowDate, highDate);
  return (
    <XAxis
      type="number"
      dataKey="unixDate"
      domain={[lowDate, highDate]}
      scale="time"
      ticks={customTicks}
      interval={0}
      tickFormatter={mode === 'live' ? unixTimeToStr : unixDateToStr}
    />
  );
};

// Representation of each area in the chart
// This pattern is repeated many time, so make a template component
const genericChartArea = (dataKey, colourKey, num, stroke) => {
  const fill =
    '' + (dataKey === 'ties' ? tieColour : jsonMap(colours, colourKey)[num]);
  return (
    <Area
      dataKey={dataKey}
      type="stepAfter"
      activeDot={false}
      stroke={stroke}
      isAnimationActive={false}
      fill={fill}
    />
  );
};

const GovernmentFormationTooltip = ({active, payload, mode, termCode}) => {
  if (active && payload && payload.length) {
    const date = payload[0].payload.unixDate;
    const thisDate =
      mode === 'live' ? unixTimeToStr(date) : unixDateToStr(date);
    const p = payload[0].payload;

    // Representation of each value in the GovernmentFormationTooltip
    // This pattern is repeated many time, so make a template component
    const Val = props => {
      return (
        <>
          {props.text}: {round2(props.high - props.low)}%
          <br />
        </>
      );
    };
    Val.propTypes = {
      text: PropTypes.string.isRequired,
      low: PropTypes.number.isRequired,
      high: PropTypes.number.isRequired,
    };

    return (
      <div className={styles.customTooltip}>
        <p>
          Update: {payload[0].payload.label}
          <br />
          Forecast {mode === 'live' ? 'time' : 'date'}: {thisDate}
          <br />
          <Val text="ALP majority" high={p.alpMaj[1]} low={0} />
          <Val text="ALP minority" high={p.alpMin[1]} low={p.alpMaj[1]} />
          <Val text="ALP most seats" high={p.alpMost[1]} low={p.alpMin[1]} />
          <Val text="Exact Ties" high={p.ties[1]} low={p.alpMost[1]} />
          <Val text="Other party leads" high={p.othLeads[1]} low={p.ties[1]} />
          <Val
            text={`${coalitionAbbreviation(termCode)} most seats`}
            high={p.lnpMost[1]}
            low={p.othLeads[1]}
          />
          <Val
            text={`${coalitionAbbreviation(termCode)} minority`}
            high={p.lnpMin[1]}
            low={p.lnpMost[1]}
          />
          <Val
            text={`${coalitionAbbreviation(termCode)} majority`}
            high={p.lnpMaj[1]}
            low={p.lnpMin[1]}
          />
        </p>
      </div>
    );
  }

  return null;
};
GovernmentFormationTooltip.propTypes = {
  payload: PropTypes.array,
  active: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  termCode: PropTypes.string,
};

const GovernmentFormation = props => {
  const lowDate = Math.min.apply(
    Math,
    props.data.map(a => a.unixDate)
  );
  const highDate = Math.max.apply(
    Math,
    props.data.map(a => a.unixDate)
  );

  const customTicks = createTicks(lowDate, highDate);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        width={730}
        height={280}
        data={props.data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <XAxis
          type="number"
          dataKey="unixDate"
          domain={[lowDate, highDate]}
          scale="time"
          ticks={customTicks}
          interval={0}
          tickFormatter={props.mode === 'live' ? unixTimeToStr : unixDateToStr}
        />
        <YAxis
          type="number"
          domain={[0, 100]}
          tickCount={6}
          tickFormatter={integerPercent}
          width={30}
        />
        {genericChartArea('alpMaj', 'ALP', 0)}
        {genericChartArea('alpMin', 'ALP', 1)}
        {genericChartArea('alpMost', 'ALP', 2)}
        {genericChartArea('ties', 'tie', 0)}
        {genericChartArea('othLeads', 'OTH', 1)}
        {genericChartArea('lnpMost', 'LNP', 2)}
        {genericChartArea('lnpMin', 'LNP', 1)}
        {genericChartArea('lnpMaj', 'LNP', 0)}
        <Tooltip
          content={
            <GovernmentFormationTooltip
              mode={props.mode}
              termCode={props.termCode}
            />
          }
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
GovernmentFormation.propTypes = {
  data: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  termCode: PropTypes.string,
};

const RangeTooltip = ({active, payload, label, mode, obsLabel, dataKey}) => {
  if (active && payload && payload.length) {
    const date = payload[0].payload.unixDate;
    const thisDate =
      mode === 'live' ? unixTimeToStr(date) : unixDateToStr(date);
    return (
      <div className={styles.customTooltip}>
        <p>
          Update: {payload[0].payload.label}
          <br />
          Forecast {mode === 'live' ? 'time' : 'date'}: {thisDate}
          <br />
        </p>
        <p className={styles.smallTooltipText}>
          {obsLabel} percentiles (
          <span className={styles.outerProbsText}>5%</span>
          <span className={styles.innerProbsText}>-25%</span>-
          <strong>median</strong>-
          <span className={styles.innerProbsText}>75%-</span>
          <span className={styles.outerProbsText}>95%</span>)
        </p>
        <p>
          <span className={styles.outerProbsText}>
            {round2(payload[0].payload[`${dataKey}5-25`][0])}
          </span>
          <span className={styles.innerProbsText}>
            {` - ${round2(payload[0].payload[`${dataKey}25-75`][0])} - `}
          </span>
          <strong>{round2(payload[0].payload[`${dataKey}Median`])}</strong>
          <span className={styles.innerProbsText}>
            {` - ${round2(payload[0].payload[`${dataKey}25-75`][1])} - `}
          </span>
          <span className={styles.outerProbsText}>
            {round2(payload[0].payload[`${dataKey}75-95`][1])}
          </span>
        </p>
      </div>
    );
  }

  return null;
};
RangeTooltip.propTypes = {
  payload: PropTypes.array,
  active: PropTypes.bool,
  label: PropTypes.number,
  obsLabel: PropTypes.string.isRequired,
  dataKey: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
};

const Tpp = props => {
  // Remove certain outliers so that the chart is more readable
  const modifiedLowTpp = Math.min.apply(
    Math,
    props.data.map(a =>
      a.unixDate > 1718668800000 && a.unixDate < 1721347200000
        ? 100
        : Math.floor(a['tpp1-5'][0])
    )
  );
  let lowTpp = modifiedLowTpp;
  while (lowTpp % 2 >= 1) --lowTpp;
  lowTpp = Math.min(48, lowTpp);
  const modifiedHighTpp = Math.max.apply(
    Math,
    props.data.map(a =>
      a.unixDate > 1718668800000 && a.unixDate < 1721347200000
        ? 0
        : Math.floor(a['tpp95-99'][1]) + 1
    )
  );
  let highTpp = modifiedHighTpp;
  while ((highTpp - lowTpp) % 2 >= 1) ++highTpp;
  highTpp = Math.max(52, highTpp);
  const numTicks = (highTpp - lowTpp) / 2 + 1;

  const lowDate = Math.min.apply(
    Math,
    props.data.map(a => a.unixDate)
  );
  const highDate = Math.max.apply(
    Math,
    props.data.map(a => a.unixDate)
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        width={730}
        height={280}
        data={props.data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        {genericXAxis(lowDate, highDate, props.mode)}
        <YAxis
          allowDataOverflow={true}
          allowDecimals={false}
          domain={[lowTpp, highTpp]}
          interval="preserveStartEnd"
          scale="linear"
          tickCount={numTicks}
          type="number"
          width={25}
        />
        <ReferenceLine y={50} stroke="black" />
        {genericChartArea('tpp1-5', props.partyAbbr, 3, 'none')}
        {genericChartArea('tpp5-25', props.partyAbbr, 2, 'none')}
        {genericChartArea('tpp25-75', props.partyAbbr, 1, 'none')}
        {genericChartArea('tpp75-95', props.partyAbbr, 2, 'none')}
        {genericChartArea('tpp95-99', props.partyAbbr, 3, 'none')}
        <Line
          dataKey="tppMedian"
          type="stepAfter"
          activeDot={false}
          dot={false}
          isAnimationActive={false}
          stroke={jsonMap(colours, props.partyAbbr)[0]}
        />
        <Tooltip
          content={
            <RangeTooltip
              mode={props.mode}
              obsLabel="Vote total"
              dataKey="tpp"
            />
          }
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
Tpp.propTypes = {
  data: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  partyAbbr: PropTypes.string.isRequired,
};

const Fp = props => {
  // Remove certain outliers so that the chart is more readable
  const modifiedLowFp = Math.min.apply(
    Math,
    props.data.map(a =>
      a.unixDate > 1718668800000 && a.unixDate < 1721347200000
        ? 100
        : Math.floor(a['fp1-5'][0])
    )
  );
  let lowFp = modifiedLowFp;
  while (lowFp % 4 >= 1) --lowFp;
  const modifiedHighFp = Math.max.apply(
    Math,
    props.data.map(a =>
      a.unixDate > 1718668800000 && a.unixDate < 1721347200000
        ? 0
        : Math.floor(a['fp95-99'][1]) + 1
    )
  );
  let highFp = modifiedHighFp;
  while ((highFp - lowFp) % 4 >= 1) ++highFp;
  const numTicks = (highFp - lowFp) / 4 + 1;

  const lowDate = Math.min.apply(
    Math,
    props.data.map(a => a.unixDate)
  );
  const highDate = Math.max.apply(
    Math,
    props.data.map(a => a.unixDate)
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        width={730}
        height={280}
        data={props.data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        {genericXAxis(lowDate, highDate, props.mode)}
        <YAxis
          allowDataOverflow={true}
          allowDecimals={false}
          domain={[lowFp, highFp]}
          interval="preserveStartEnd"
          scale="linear"
          tickCount={numTicks}
          type="number"
          width={25}
        />
        {genericChartArea('fp1-5', props.partyAbbr, 3, 'none')}
        {genericChartArea('fp5-25', props.partyAbbr, 2, 'none')}
        {genericChartArea('fp25-75', props.partyAbbr, 1, 'none')}
        {genericChartArea('fp75-95', props.partyAbbr, 2, 'none')}
        {genericChartArea('fp95-99', props.partyAbbr, 3, 'none')}
        <Line
          dataKey="fpMedian"
          type="stepAfter"
          activeDot={false}
          dot={false}
          isAnimationActive={false}
          stroke={jsonMap(colours, props.partyAbbr)[0]}
        />
        <Tooltip
          content={
            <RangeTooltip
              mode={props.mode}
              obsLabel="Vote total"
              dataKey="fp"
            />
          }
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
Fp.propTypes = {
  data: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  partyAbbr: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
};

const Seats = props => {
  // Remove certain outliers so that the chart is more readable
  const modifiedLowSeats = Math.min.apply(
    Math,
    props.data.map(a =>
      a.unixDate > 1718668800000 && a.unixDate < 1721347200000
        ? 150
        : Math.floor(a['seats1-5'][0])
    )
  );
  let lowSeats = modifiedLowSeats;
  while (lowSeats % 10 >= 1) --lowSeats;
  const modifiedHighSeats = Math.max.apply(
    Math,
    props.data.map(a =>
      a.unixDate > 1718668800000 && a.unixDate < 1721347200000
        ? 0
        : Math.floor(a['seats95-99'][1]) + 1
    )
  );
  let highSeats = modifiedHighSeats;
  while ((highSeats - lowSeats) % 10 >= 1) ++highSeats;
  let numTicks = (highSeats - lowSeats) / 10 + 1;
  if (numTicks < 5) numTicks = (highSeats - lowSeats) / 5 + 1;
  if (numTicks < 4) numTicks = (highSeats - lowSeats) / 2 + 1;

  const lowDate = Math.min.apply(
    Math,
    props.data.map(a => a.unixDate)
  );
  const highDate = Math.max.apply(
    Math,
    props.data.map(a => a.unixDate)
  );

  const colourKey = jsonMap(colours, props.partyAbbr) ? props.partyAbbr : 'OTH';

  const majorityLine = (() => {
    if (props.election === '2019fed') return 75.5;
    if (props.election === '2022fed') return 75.5;
    if (props.election === '2022sa') return 23.5;
    if (props.election === '2022vic') return 44.5;
    if (props.election === '2023nsw') return 46.5;
    if (props.election === '2024qld') return 46.5;
    if (props.election === '2025wa') return 29.5;
    if (props.election === '2025fed') return 75.5;
  })();

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        width={730}
        height={280}
        data={props.data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        {genericXAxis(lowDate, highDate, props.mode)}
        <YAxis
          allowDataOverflow={true}
          allowDecimals={false}
          domain={[lowSeats, highSeats]}
          interval="preserveStartEnd"
          scale="linear"
          tickCount={numTicks}
          type="number"
          width={25}
        />
        {genericChartArea('seats1-5', colourKey, 3, 'none')}
        {genericChartArea('seats5-25', colourKey, 2, 'none')}
        {genericChartArea('seats25-75', colourKey, 1, 'none')}
        {genericChartArea('seats75-95', colourKey, 2, 'none')}
        {genericChartArea('seats95-99', colourKey, 3, 'none')}
        {highSeats > majorityLine && (
          <ReferenceLine y={majorityLine} stroke="black" />
        )}
        <Line
          dataKey="seatsMedian"
          type="stepAfter"
          activeDot={false}
          dot={false}
          isAnimationActive={false}
          stroke={jsonMap(colours, colourKey)[0]}
        />
        <Tooltip
          content={
            <RangeTooltip mode={props.mode} obsLabel="Seats" dataKey="seats" />
          }
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
Seats.propTypes = {
  data: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  partyAbbr: PropTypes.string.isRequired,
  election: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
};

const Chart = props => {
  const unixDates = props.data.map(a =>
    new Date(
      Number(a.date.substring(0, 4)),
      Number(a.date.substring(5, 7)) - 1,
      Number(a.date.substring(8, 10)),
      Number(a.date.substring(11, 13)),
      Number(a.date.substring(14, 16)),
      Number(a.date.substring(17, 19))
    ).getTime()
  );
  const tempDates = unixDates.map(a => a / 86400000);
  const labels = props.data.map(a =>
    a.label.length > 26 ? a.label.substring(0, 24) + '...' : a.label
  );
  const prevDate = Math.min.apply(Math, tempDates);
  const adjDates = tempDates.map(a => a - prevDate);
  const alpMaj = props.data.map(a => jsonMap(a.majorityWinPc, 0));
  const alpMin = props.data.map((a, index) => jsonMap(a.minorityWinPc, 0));
  const alpMost = props.data.map((a, index) => jsonMap(a.mostSeatsWinPc, 0));
  const ties = props.data.map(
    (a, index) =>
      100 -
      a.majorityWinPc.reduce((a, b) => a + b[1], 0) -
      a.minorityWinPc.reduce((a, b) => a + b[1], 0) -
      a.mostSeatsWinPc.reduce((a, b) => a + b[1], 0)
  );
  const othLeads = props.data.map(
    (a, index) =>
      a.majorityWinPc.reduce(
        (a, b) => a + (b[0] > 1 || b[0] < 0 ? b[1] : 0),
        0
      ) +
      a.minorityWinPc.reduce(
        (a, b) => a + (b[0] > 1 || b[0] < 0 ? b[1] : 0),
        0
      ) +
      a.mostSeatsWinPc.reduce(
        (a, b) => a + (b[0] > 1 || b[0] < 0 ? b[1] : 0),
        0
      )
  );
  const lnpMost = props.data.map((a, index) => jsonMap(a.mostSeatsWinPc, 1));
  const lnpMin = props.data.map((a, index) => jsonMap(a.minorityWinPc, 1, 0));
  const lnpMaj = props.data.map((a, index) => jsonMap(a.majorityWinPc, 1));

  const alpMinStacked = alpMin.map((a, index) => a + alpMaj[index]);
  const alpMostStacked = alpMost.map((a, index) => a + alpMinStacked[index]);
  const tiesStacked = ties.map((a, index) => a + alpMostStacked[index]);
  const othLeadsStacked = othLeads.map((a, index) => a + tiesStacked[index]);
  const lnpMostStacked = lnpMost.map((a, index) => a + othLeadsStacked[index]);
  const lnpMinStacked = lnpMin.map((a, index) => a + lnpMostStacked[index]);
  const lnpMajStacked = lnpMaj.map((a, index) => a + lnpMinStacked[index]);

  const thresholds = [1, 4, 6, 7, 8, 10, 13];

  let tpp =
    props.party === 0 || props.party === 1
      ? props.data.map(a => thresholds.map(t => a.tppFrequencies[t]))
      : null;
  if (props.party === 1) tpp = tpp.map(a => a.reverse().map(b => 100 - b));

  let fp = props.data.map(a =>
    jsonMap(a.fpFrequencies, props.party, null) !== null
      ? thresholds.map(t => jsonMap(a.fpFrequencies, props.party)[t])
      : thresholds.map(t => 0)
  );

  if (props.type === GraphTypeEnum.coalitionFp) {
    fp = props.data.map(a =>
      a.coalitionFpFrequencies !== null && a.coalitionFpFrequencies.length > 0
        ? thresholds.map(t => a.coalitionFpFrequencies[t])
        : thresholds.map(t => 0)
    );
  }

  let seats = props.data.map(a =>
    jsonMap(a.seatCountFrequencies, props.party, null) !== null
      ? thresholds.map(t => jsonMap(a.seatCountFrequencies, props.party)[t])
      : thresholds.map(t => 0)
  );

  if (props.type === GraphTypeEnum.coalitionSeats) {
    seats = props.data.map(a =>
      a.coalitionSeatCountFrequencies !== null &&
      a.coalitionSeatCountFrequencies.length > 0
        ? thresholds.map(t => a.coalitionSeatCountFrequencies[t])
        : thresholds.map(t => 0)
    );
  }

  let chartData = adjDates.map((date, index) => ({
    date: date,
    unixDate: unixDates[index],
    label: labels[index],
    alpMaj: [0, alpMaj[index]],
    alpMin: [alpMaj[index], alpMinStacked[index]],
    alpMost: [alpMinStacked[index], alpMostStacked[index]],
    ties: [alpMostStacked[index], tiesStacked[index]],
    othLeads: [tiesStacked[index], othLeadsStacked[index]],
    lnpMost: [othLeadsStacked[index], lnpMostStacked[index]],
    lnpMin: [lnpMostStacked[index], lnpMinStacked[index]],
    lnpMaj: [lnpMinStacked[index], lnpMajStacked[index]],
    'tpp1-5': tpp ? [tpp[index][0], tpp[index][1]] : null,
    'tpp5-25': tpp ? [tpp[index][1], tpp[index][2]] : null,
    'tpp25-75': tpp ? [tpp[index][2], tpp[index][4]] : null,
    'tpp75-95': tpp ? [tpp[index][4], tpp[index][5]] : null,
    'tpp95-99': tpp ? [tpp[index][5], tpp[index][6]] : null,
    tppMedian: tpp ? tpp[index][3] : null,
    'fp1-5': [fp[index][0], fp[index][1]],
    'fp5-25': [fp[index][1], fp[index][2]],
    'fp25-75': [fp[index][2], fp[index][4]],
    'fp75-95': [fp[index][4], fp[index][5]],
    'fp95-99': [fp[index][5], fp[index][6]],
    fpMedian: fp[index][3],
    'seats1-5': [seats[index][0], seats[index][1]],
    'seats5-25': [seats[index][1], seats[index][2]],
    'seats25-75': [seats[index][2], seats[index][4]],
    'seats75-95': [seats[index][4], seats[index][5]],
    'seats95-99': [seats[index][5], seats[index][6]],
    seatsMedian: seats[index][3],
  }));

  if (props.mode === 'live' && props.eveningOnly) {
    const lowDate = Math.min.apply(
      Math,
      chartData.map(a => a.unixDate)
    );
    chartData = chartData.filter(a => a.unixDate < lowDate + 43200000); // 12-hour period after first result
  }
  const effectiveMode =
    props.mode === 'live' && !props.eveningOnly ? 'liveEx' : props.mode;

  const partyAbbr = jsonMap(props.partyAbbr, props.party);

  return (
    <>
      {chartData !== undefined && (
        <>
          {props.type === GraphTypeEnum.governmentFormation && (
            <GovernmentFormation
              data={chartData}
              mode={effectiveMode}
              termCode={props.election}
            />
          )}
          {props.type === GraphTypeEnum.tpp && (
            <Tpp data={chartData} partyAbbr={partyAbbr} mode={effectiveMode} />
          )}
          {(props.type === GraphTypeEnum.fp ||
            props.type === GraphTypeEnum.coalitionFp) && (
            <Fp
              data={chartData}
              partyAbbr={partyAbbr}
              mode={effectiveMode}
              type={props.type}
            />
          )}
          {(props.type === GraphTypeEnum.seats ||
            props.type === GraphTypeEnum.coalitionSeats) && (
            <Seats
              data={chartData}
              partyAbbr={partyAbbr}
              election={props.election}
              mode={effectiveMode}
              type={props.type}
            />
          )}
        </>
      )}
    </>
  );
};
Chart.propTypes = {
  data: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  partyAbbr: PropTypes.array.isRequired,
  election: PropTypes.string.isRequired,
  party: PropTypes.number.isRequired,
  type: PropTypes.number.isRequired,
  eveningOnly: PropTypes.bool,
};

const MainExplainer = props => {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        This section displays graphs for the{' '}
        <b>history of this forecast type</b> over time. That is, it shows the
        changes over time of what the forecast was{' '}
        <i>predicting at that time</i>.
      </p>
      <hr />
      <p>
        You can see the history of the following statistics by selecting the
        appropriate option in the dropdown menu:
      </p>
      <ul>
        <li>
          <i>Formation of government:</i> Shows the probabilities of parties
          winning a majority as well as different scenarios where no party wins
          a majority.
        </li>
        <li>
          <i>Two-party preferred:</i> Shows the forecast two-party-preferred
          vote at that point in time for a major party. Note that for the
          regular forecast this is the forecast vote at the actual election, not
          the voting intention at that point in time! A black horizontal line
          indicates the 50% level.
        </li>
        <li>
          <i>First preferences:</i> Shows the forecast first preferences for a
          significant party or collective &quot;others&quot; at that point in
          time. Note that for the regular forecast this is the forecast vote at
          the election, not the voting intention at that point in time!
        </li>
        <li>
          <i>Seats:</i> Shows the forecast number of seats won for significant
          parties as well as collective known independents at that point in
          time. A black horizonal line indicates the number of seats required
          for a majority.
        </li>
      </ul>
    </Alert>
  );
};

const History = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyValid, setHistoryValid] = useState(false);
  const [graphType, setGraphType] = useState(GraphTypeEnum.governmentFormation);
  const [graphParty, setGraphParty] = useState(0);
  const [eveningOnly, setEveningOnly] = useState(true);
  // const windowDimensions = useWindowDimensions();

  useEffect(() => {
    setHistoryValid(false);

    const getElectionSummary = () => {
      let requestUri = `forecast-api/election-timeseries/${props.election}/${props.mode}/`;
      if (
        props.election === localStorage.getItem('cachedHistoryCode') &&
        props.mode === localStorage.getItem('cachedHistoryMode')
      ) {
        const cached_id = localStorage.getItem('cachedHistoryVersion');
        if (cached_id !== null) requestUri += `${cached_id}/`;
      }
      return getDirect(requestUri).then(resp => {
        if (!resp.ok) throw Error("Couldn't find election data");
        return resp.data;
      });
    };

    const fetchElectionSummary = () => {
      if (
        props.election === localStorage.getItem('cachedHistoryCode') &&
        props.mode === localStorage.getItem('cachedHistoryMode')
      ) {
        const tempHistory = JSON.parse(localStorage.getItem('cachedHistory'));
        setHistory(tempHistory);
        setHistoryValid(true);
      }
      getElectionSummary()
        .then(data => {
          if (data.new === false) {
            data['timeseries'] = JSON.parse(
              localStorage.getItem('cachedHistory')
            );
          } else {
            localStorage.setItem(
              'cachedHistory',
              JSON.stringify(data.timeseries)
            );
            localStorage.setItem('cachedHistoryVersion', String(data.version));
            localStorage.setItem('cachedHistoryCode', String(props.election));
            localStorage.setItem('cachedHistoryMode', String(props.mode));
          }
          setHistory(data.timeseries);
          setHistoryValid(true);
        })
        .catch(e => {
          console.log(e);
        });
    };

    fetchElectionSummary();
  }, [props.election, props.mode]);

  const lastHistoryItem = history.length > 0 ? history.slice(-1)[0] : null;
  const coalitionFpAvailable =
    lastHistoryItem &&
    Object.hasOwn(lastHistoryItem, 'coalitionFpFrequencies') &&
    lastHistoryItem.coalitionFpFrequencies.length > 0;
  const coalitionSeatsAvailable =
    lastHistoryItem &&
    Object.hasOwn(lastHistoryItem, 'coalitionSeatCountFrequencies') &&
    lastHistoryItem.coalitionSeatCountFrequencies.length > 0;

  const title = (() => {
    let title = 'Display: ';
    let partyAbbr = jsonMap(props.forecast.partyAbbr, graphParty);
    if (coalitionFpAvailable && graphParty === 1) partyAbbr = 'LIB';
    if (graphType === GraphTypeEnum.governmentFormation) {
      title += 'Formation of Government';
    } else if (graphType === GraphTypeEnum.tpp) {
      if (graphParty === 1) {
        title += `${coalitionAbbreviation(props.election)} two-party preferred`;
      } else {
        title += `${partyAbbr} two-party preferred`;
      }
    } else if (graphType === GraphTypeEnum.fp) {
      title += `${partyAbbr} first preferences`;
    } else if (graphType === GraphTypeEnum.seats) {
      title += `${partyAbbr} seats`;
    } else if (graphType === GraphTypeEnum.coalitionFp) {
      title += `${coalitionAbbreviation(props.election)} first preferences`;
    } else if (graphType === GraphTypeEnum.coalitionSeats) {
      title += `${coalitionAbbreviation(props.election)} seats`;
    }
    return title;
  })();

  const eveningSetting = (() => {
    let title = 'Display: ';
    if (eveningOnly) title += 'Election night only';
    else title += 'Include late counting';
    return title;
  })();

  let lnpIndex = jsonMapReverse(props.forecast.partyAbbr, 'LNP');
  // Some reports have LNP = -4 because of the current treatment of coalition partners, but
  // that index doesn't exist for the seat count frequencies, so we need to ignore it
  if (lnpIndex < 0)
    lnpIndex = jsonMapReverse(props.forecast.partyAbbr.slice(1), 'LNP');
  if (
    lnpIndex &&
    jsonMap(props.forecast.seatCountFrequencies, lnpIndex)[14] === 0
  )
    lnpIndex = null;
  let libIndex = jsonMapReverse(props.forecast.partyAbbr, 'LIB');
  if (
    libIndex &&
    jsonMap(props.forecast.seatCountFrequencies, libIndex)[14] === 0
  )
    libIndex = null;
  if (props.forecast.coalitionSeatCountFrequencies && lnpIndex) {
    libIndex = lnpIndex;
    lnpIndex = null;
  }
  let natIndex = jsonMapReverse(props.forecast.partyAbbr, 'NAT');
  if (
    natIndex &&
    jsonMap(props.forecast.seatCountFrequencies, natIndex)[14] === 0
  )
    natIndex = null;
  const grnIndex = jsonMapReverse(props.forecast.partyAbbr, 'GRN');
  const indIndex = jsonMapReverse(
    props.forecast.partyAbbr,
    'IND',
    null,
    a => a >= 0
  );
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

  const setGraphGovernmentFormation = () => {
    setGraphType(GraphTypeEnum.governmentFormation);
  };
  const setGraphAlpTpp = () => {
    setGraphType(GraphTypeEnum.tpp);
    setGraphParty(0);
  };
  const setGraphLnpTpp = () => {
    setGraphType(GraphTypeEnum.tpp);
    setGraphParty(1);
  };
  const setGraphCoalitionFp = () => {
    setGraphType(GraphTypeEnum.coalitionFp);
    setGraphParty(1);
  };
  const setGraphAlpFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(0);
  };
  const setGraphLnpFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(lnpIndex);
  };
  const setGraphLibFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(libIndex);
  };
  const setGraphNatFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(natIndex);
  };
  const setGraphGrnFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(grnIndex);
  };
  const setGraphOnFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(onIndex);
  };
  const setGraphUapFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(uapIndex);
  };
  const setGraphOthFp = () => {
    setGraphType(GraphTypeEnum.fp);
    setGraphParty(-1);
  };
  const setGraphCoalitionSeats = () => {
    setGraphType(GraphTypeEnum.coalitionSeats);
    setGraphParty(1);
  };
  const setGraphAlpSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(0);
  };
  const setGraphLnpSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(lnpIndex);
  };
  const setGraphLibSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(libIndex);
  };
  const setGraphNatSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(natIndex);
  };
  const setGraphGrnSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(grnIndex);
  };
  const setGraphOnSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(onIndex);
  };
  const setGraphUapSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(uapIndex);
  };
  const setGraphIndSeats = () => {
    setGraphType(GraphTypeEnum.seats);
    setGraphParty(indIndex);
  };
  const setIsEveningOnly = () => {
    setEveningOnly(true);
  };
  const setNotEveningOnly = () => {
    setEveningOnly(false);
  };

  return (
    <Card className={styles.summary}>
      <Card.Header className={styles.historyTitle}>
        <strong>
          {props.mode === 'nowcast' ? 'Nowcast ' : 'Forecast '}
          History&nbsp;
          <InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
        </strong>
      </Card.Header>
      <Card.Body className={styles.historyBody}>
        {showExplainer && <MainExplainer />}
        <ListGroup className={styles.historyList}>
          {historyValid && (
            <StandardErrorBoundary>
              <ListGroup.Item className={styles.historyOptions}>
                <DropdownButton
                  id="type-dropdown"
                  title={title}
                  variant="secondary"
                >
                  <Dropdown.Item
                    as="button"
                    onClick={setGraphGovernmentFormation}
                  >
                    Formation of government
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setGraphAlpTpp}>
                    ALP two-party-preferred
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={setGraphLnpTpp}>
                    {coalitionAbbreviation(props.election)} two-party-preferred
                  </Dropdown.Item>
                  {(props.mode !== 'live' || props.election !== '2022sa') && (
                    <>
                      <Dropdown.Item as="button" onClick={setGraphAlpFp}>
                        ALP first preferences
                      </Dropdown.Item>
                      {coalitionFpAvailable && (
                        <Dropdown.Item
                          as="button"
                          onClick={setGraphCoalitionFp}
                        >
                          {coalitionAbbreviation(props.election)} first
                          preferences
                        </Dropdown.Item>
                      )}
                      {lnpIndex && (
                        <Dropdown.Item as="button" onClick={setGraphLnpFp}>
                          {coalitionAbbreviation(props.election)} first
                          preferences
                        </Dropdown.Item>
                      )}
                      {libIndex && (
                        <Dropdown.Item as="button" onClick={setGraphLibFp}>
                          LIB first preferences
                        </Dropdown.Item>
                      )}
                      {natIndex && (
                        <Dropdown.Item as="button" onClick={setGraphNatFp}>
                          NAT first preferences
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item as="button" onClick={setGraphGrnFp}>
                        GRN first preferences
                      </Dropdown.Item>
                      {onIndex && (
                        <Dropdown.Item as="button" onClick={setGraphOnFp}>
                          ON first preferences
                        </Dropdown.Item>
                      )}
                      {uapIndex && (
                        <Dropdown.Item as="button" onClick={setGraphUapFp}>
                          UAP first preferences
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item as="button" onClick={setGraphOthFp}>
                        OTH first preferences
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Item as="button" onClick={setGraphAlpSeats}>
                    ALP seats
                  </Dropdown.Item>
                  {coalitionSeatsAvailable && (
                    <Dropdown.Item as="button" onClick={setGraphCoalitionSeats}>
                      {coalitionAbbreviation(props.election)} seats
                    </Dropdown.Item>
                  )}
                  {lnpIndex && (
                    <Dropdown.Item as="button" onClick={setGraphLnpSeats}>
                      {coalitionAbbreviation(props.election)} seats
                    </Dropdown.Item>
                  )}
                  {libIndex && (
                    <Dropdown.Item as="button" onClick={setGraphLibSeats}>
                      LIB seats
                    </Dropdown.Item>
                  )}
                  {natIndex && (
                    <Dropdown.Item as="button" onClick={setGraphNatSeats}>
                      NAT seats
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as="button" onClick={setGraphGrnSeats}>
                    GRN seats
                  </Dropdown.Item>
                  {onIndex && (
                    <Dropdown.Item as="button" onClick={setGraphOnSeats}>
                      ON seats
                    </Dropdown.Item>
                  )}
                  {uapIndex && (
                    <Dropdown.Item as="button" onClick={setGraphUapSeats}>
                      UAP seats
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as="button" onClick={setGraphIndSeats}>
                    IND seats
                  </Dropdown.Item>
                </DropdownButton>
                {props.mode === 'live' && (
                  <DropdownButton
                    id="evening-dropdown"
                    title={eveningSetting}
                    variant="secondary"
                  >
                    <Dropdown.Item as="button" onClick={setIsEveningOnly}>
                      Election night only
                    </Dropdown.Item>
                    <Dropdown.Item as="button" onClick={setNotEveningOnly}>
                      Include late counting
                    </Dropdown.Item>
                  </DropdownButton>
                )}
              </ListGroup.Item>
              <Chart
                data={history}
                type={graphType}
                party={graphParty}
                partyAbbr={props.forecast.partyAbbr}
                election={props.election}
                mode={props.mode}
                eveningOnly={eveningOnly}
              />
            </StandardErrorBoundary>
          )}
          {!historyValid && <LoadingMarker text="Loading history" />}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};
History.propTypes = {
  forecast: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  election: PropTypes.string.isRequired,
  eveningOnly: PropTypes.bool,
};

export default History;
