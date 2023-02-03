import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  ZAxis,
  ReferenceLine,
  Area,
  Scatter,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';

import {jsonMap, jsonMapReverse} from '../../../../utils/jsonmap.js';
import {deepCopy} from '../../../../utils/deepcopy.js';

import styles from './VoteTrendChart.module.css';

const round1 = num => (num === null ? null : Math.round(num * 10) / 10);
const round2 = num => Math.round(num * 100) / 100;

const addDays = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const dateToStr = date => {
  var dateUTC = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  return dateUTC.toISOString().slice(0, 10);
};

const colours = [
  ['ALP', ['#FF0000', '#FF4444', '#FFAAAA', '#FFCCCC']],
  ['LNP', ['#0000FF', '#4444FF', '#AAAAFF', '#CCCCFF']],
  ['GRN', ['#008800', '#22CC00', '#66FF44', '#BBFF99']],
  ['ONP', ['#AA6600', '#FF7F00', '#FFAB58', '#FFC388']],
  ['UAP', ['#886600', '#C2B615', '#EBDF43', '#F0E87C']],
  ['SAB', ['#886600', '#C2B615', '#EBDF43', '#F0E87C']],
  ['OTH', ['#777777', '#999999', '#C5C5C5', '#E0E0E0']],
];

const VoteTrendTooltip = ({active, payload, label}) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p>{payload[0].payload.date}</p>
        <p className={styles.smallTooltipText}>
          Vote total percentiles (
          <span className={styles.outerProbsText}>5%</span>
          <span className={styles.innerProbsText}>-25%</span>-
          <strong>median</strong>-
          <span className={styles.innerProbsText}>75%-</span>
          <span className={styles.outerProbsText}>95%</span>)
        </p>
        <p>
          <span className={styles.outerProbsText}>{payload[1].value[0]}</span>
          <span
            className={styles.innerProbsText}
          >{` - ${payload[2].value[0]} - `}</span>
          <strong>{payload[3].value}</strong>
          <span
            className={styles.innerProbsText}
          >{` - ${payload[2].value[1]} - `}</span>
          <span className={styles.outerProbsText}>{payload[1].value[1]}</span>
        </p>
        {payload[0].payload.pollDesc !== undefined && (
          <p className={styles.smallTooltipText}>Polls:</p>
        )}
        {payload[0].payload.pollDesc !== undefined &&
          payload[0].payload.pollDesc.split(';').map((poll, index) => (
            <p key={index}>
              {poll.split(',')[0]}:{' '}
              <strong>{round1(poll.split(',')[1])}</strong>
            </p>
          ))}
      </div>
    );
  }

  return null;
};
VoteTrendTooltip.propTypes = {
  payload: PropTypes.array,
  active: PropTypes.bool,
  label: PropTypes.string,
};

const VoteTrendChart = props => {
  const [isFp, setIsFp] = useState(false);
  const [party, setParty] = useState('ALP');
  const [pollType, setPollType] = useState('base');

  if (props.forecast.polls === undefined) {
    console.log(
      "Not showing poll trend as the forecast didn't contain poll information."
    );
    return null;
  }

  const getPartyIndexFromAbbr = abbr =>
    jsonMapReverse(props.forecast.partyAbbr, abbr, null, a => a >= -1);

  const partyHasFpTrend = abbr => {
    return (
      props.forecast.fpTrend.find(a => a[0] === getPartyIndexFromAbbr(abbr)) !==
      undefined
    );
  };

  const getTrendFromAbbr = abbr => {
    return jsonMap(props.forecast.fpTrend, getPartyIndexFromAbbr(abbr));
  };

  const invertPoll = poll => {
    poll.adjusted = 100 - poll.adjusted;
    poll.base = 100 - poll.base;
    if (poll.reported !== null) poll.reported = 100 - poll.reported;
    return poll;
  };

  let thisTrend = undefined;
  let thisPolls = undefined;
  const period = props.forecast.trendPeriod;
  const finalDay = props.forecast.finalTrendValue;
  const dateParts = props.forecast.trendStartDate.split('-');
  const date = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2])
  );
  let trendData = undefined;
  let maxVal = undefined;
  let minVal = undefined;
  let tickDistance = undefined;
  let minTick = undefined;
  let numTicks = undefined;
  let ticks = undefined;
  if (!isFp) {
    thisTrend = deepCopy(props.forecast.tppTrend);
    thisPolls = deepCopy(props.forecast.polls['@TPP']);
  } else {
    const tempTrend = getTrendFromAbbr(party);
    if (tempTrend !== undefined) {
      thisTrend = deepCopy(tempTrend);
      thisPolls = deepCopy(props.forecast.polls[party]);
    }
  }
  if (thisTrend !== undefined) {
    if (!isFp && party === 'LNP') {
      thisTrend = thisTrend.map(spread =>
        [...spread].reverse().map(a => 100 - a)
      );
      thisPolls = thisPolls.map(invertPoll);
    }
    trendData = thisTrend.map((spread, index) => {
      return {
        date: dateToStr(addDays(date, index * period)),
        day: index * period,
        median: [round2(spread[3])],
        '25-75': [round2(spread[2]), round2(spread[4])],
        '5-95': [round2(spread[1]), round2(spread[5])],
        '1-99': [round2(spread[0]), round2(spread[6])],
      };
    });

    trendData[trendData.length - 1].date = dateToStr(addDays(date, finalDay));
    trendData[trendData.length - 1].day = finalDay;
    for (let poll of thisPolls) {
      if (party === 'OTH') break;
      let trendIndex = Math.floor((poll.day - period / 2) / period) + 1;
      if (poll.day >= finalDay) trendIndex = trendData.length - 1;
      let pollVal = poll[pollType];
      if (pollVal === null) continue;
      // not the most elegant way of doing this, but it'll work for now.
      // Add more lines if needed to handle more polls in a single time period.
      if (trendData[trendIndex].hasOwnProperty('poll5')) {
        trendData[trendIndex]['poll6'] = round1(pollVal);
      } else if (trendData[trendIndex].hasOwnProperty('poll4')) {
        trendData[trendIndex]['poll5'] = round1(pollVal);
      } else if (trendData[trendIndex].hasOwnProperty('poll3')) {
        trendData[trendIndex]['poll4'] = round1(pollVal);
      } else if (trendData[trendIndex].hasOwnProperty('poll2')) {
        trendData[trendIndex]['poll3'] = round1(pollVal);
      } else if (trendData[trendIndex].hasOwnProperty('poll')) {
        trendData[trendIndex]['poll2'] = round1(pollVal);
      } else {
        trendData[trendIndex]['poll'] = round1(pollVal);
      }
      if (!trendData[trendIndex].hasOwnProperty('pollDesc'))
        trendData[trendIndex]['pollDesc'] = '';
      else trendData[trendIndex]['pollDesc'] += ';';
      const pollster = poll.pollster.replace('Newspoll2', 'Newspoll');
      trendData[trendIndex]['pollDesc'] += `${pollster}, ${round1(pollVal)}`;
    }

    // this will compress trend to most recent polls if desired

    // trendData = trendData.slice(176);
    // thisTrend = thisTrend.slice(176);

    maxVal = thisTrend.reduce((prev, spread) => {
      return Math.max(prev, spread[spread.length - 1]);
    }, 0);
    minVal = thisTrend.reduce((prev, spread) => {
      return Math.min(prev, spread[0]);
    }, 100);
    tickDistance = 2;
    minTick = Math.floor(minVal / tickDistance) * tickDistance;
    numTicks = Math.floor((maxVal - minTick) / tickDistance) + 1;
    ticks = [...Array(Math.abs(numTicks)).keys()].map(
      n => n * tickDistance + minTick
    );
  }

  const currentColours = jsonMap(colours, party);

  const setPollsBase = () => {
    setPollType('base');
  };
  const setPollsAdjusted = () => {
    setPollType('adjusted');
  };
  const setPollsOriginal = () => {
    setPollType('reported');
  };

  const setAlpTpp = () => {
    setIsFp(false);
    setParty('ALP');
  };
  const setLnpTpp = () => {
    setIsFp(false);
    setParty('LNP');
  };
  const setGenericFp = party => {
    setIsFp(true);
    setParty(party);
    if (pollType === 'reported') setPollsBase();
  };
  const setAlpFp = () => {
    setGenericFp('ALP');
  };
  const setLnpFp = () => {
    setGenericFp('LNP');
  };
  const setGrnFp = () => {
    setGenericFp('GRN');
  };
  const setOnpFp = () => {
    setGenericFp('ONP');
  };
  const setUapFp = () => {
    setGenericFp('UAP');
  };
  const setSabFp = () => {
    setGenericFp('SAB');
  };
  const setOthFp = () => {
    setGenericFp('OTH');
  };

  const pollTypeDesc = pollType => {
    if (pollType === 'reported') {
      return 'Polls: Reported two-party';
    } else if (pollType === 'base') {
      return isFp
        ? 'Polls: Reported party vote'
        : 'Polls: Calculated two-party';
    } else if (pollType === 'adjusted') {
      return 'Polls: House effect adjusted';
    }
  };
  const currentPollTypeDesc = () => pollTypeDesc(pollType);

  const dropdownTitle =
    'Party: ' + party + (isFp ? ' first preferences' : ' two-party preferred');

  return (
    <>
      <ListGroup.Item className={styles.voteChartOptions}>
        <DropdownButton
          id="party-dropdown"
          title={dropdownTitle}
          variant="secondary"
        >
          <Dropdown.Item as="button" onClick={setAlpTpp}>
            Party: ALP two-party preferred
          </Dropdown.Item>
          <Dropdown.Item as="button" onClick={setLnpTpp}>
            Party: LNP two-party preferred
          </Dropdown.Item>
          <Dropdown.Item as="button" onClick={setAlpFp}>
            Party: ALP first preferences
          </Dropdown.Item>
          <Dropdown.Item as="button" onClick={setLnpFp}>
            Party: LNP first preferences
          </Dropdown.Item>
          <Dropdown.Item as="button" onClick={setGrnFp}>
            Party: GRN first preferences
          </Dropdown.Item>
          {partyHasFpTrend('ONP') && (
            <Dropdown.Item as="button" onClick={setOnpFp}>
              Party: ONP first preferences
            </Dropdown.Item>
          )}
          {partyHasFpTrend('UAP') && (
            <Dropdown.Item as="button" onClick={setUapFp}>
              Party: UAP first preferences
            </Dropdown.Item>
          )}
          {partyHasFpTrend('SAB') && (
            <Dropdown.Item as="button" onClick={setSabFp}>
              Party: SAB first preferences
            </Dropdown.Item>
          )}
          <Dropdown.Item as="button" onClick={setOthFp}>
            Party: OTH first preferences
          </Dropdown.Item>
        </DropdownButton>
        {party !== 'OTH' && (
          <DropdownButton
            id="poll-dropdown"
            title={currentPollTypeDesc()}
            variant="secondary"
          >
            <Dropdown.Item as="button" onClick={setPollsBase}>
              {pollTypeDesc('base')}
            </Dropdown.Item>
            <Dropdown.Item as="button" onClick={setPollsAdjusted}>
              {pollTypeDesc('adjusted')}
            </Dropdown.Item>
            {!isFp && (
              <Dropdown.Item as="button" onClick={setPollsOriginal}>
                {pollTypeDesc('reported')}
              </Dropdown.Item>
            )}
          </DropdownButton>
        )}
      </ListGroup.Item>
      {party === 'OTH' && ( // don't show polls for OTH as different polls have different original OTH values
        <div className={styles.chartNote}>Polls not shown for Others</div>
      )}
      {thisTrend !== undefined && (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            width={730}
            height={250}
            data={trendData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <XAxis dataKey="date" />
            <ZAxis range={[12, 12]} width={200} />
            <YAxis
              type="number"
              domain={[minVal, maxVal]}
              ticks={ticks}
              width={25}
            />
            <Area
              dataKey="1-99"
              type="number"
              stroke="none"
              activeDot={false}
              isAnimationActive={false}
              fill={currentColours[3]}
            />
            <Area
              dataKey="5-95"
              type="number"
              stroke="none"
              activeDot={false}
              isAnimationActive={false}
              fill={currentColours[2]}
            />
            <Area
              dataKey="25-75"
              type="number"
              stroke="none"
              activeDot={false}
              isAnimationActive={false}
              fill={currentColours[1]}
            />
            {!isFp && <ReferenceLine y={50} stroke="black" />}
            <Line
              dataKey="median"
              type="number"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              stroke={currentColours[0]}
              fill="none"
            />
            {party !== 'OTH' && ( // don't show polls for OTH as different polls have different original OTH values
              <>
                <Scatter
                  dataKey="poll"
                  type="number"
                  dot={true}
                  shape={'circle'}
                  isAnimationActive={false}
                  stroke={currentColours[0]}
                  fill={currentColours[0]}
                />
                <Scatter
                  dataKey="poll2"
                  type="number"
                  dot={true}
                  shape={'circle'}
                  isAnimationActive={false}
                  stroke={currentColours[0]}
                  fill={currentColours[0]}
                />
                <Scatter
                  dataKey="poll3"
                  type="number"
                  dot={true}
                  shape={'circle'}
                  isAnimationActive={false}
                  stroke={currentColours[0]}
                  fill={currentColours[0]}
                />
                <Scatter
                  dataKey="poll4"
                  type="number"
                  dot={true}
                  shape={'circle'}
                  isAnimationActive={false}
                  stroke={currentColours[0]}
                  fill={currentColours[0]}
                />
                <Scatter
                  dataKey="poll5"
                  type="number"
                  dot={true}
                  shape={'circle'}
                  isAnimationActive={false}
                  stroke={currentColours[0]}
                  fill={currentColours[0]}
                />
                <Scatter
                  dataKey="poll6"
                  type="number"
                  dot={true}
                  shape={'circle'}
                  isAnimationActive={false}
                  stroke={currentColours[0]}
                  fill={currentColours[0]}
                />
              </>
            )}
            <Tooltip content={<VoteTrendTooltip />} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      {thisTrend === undefined && (
        <>Poll trend not available for this selection</>
      )}
    </>
  );
};
VoteTrendChart.propTypes = {
  forecast: PropTypes.object.isRequired,
};

export default VoteTrendChart;
