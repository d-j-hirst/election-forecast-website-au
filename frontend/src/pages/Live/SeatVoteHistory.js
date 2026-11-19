import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import {
  Area,
  ComposedChart,
  ErrorBar,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {countTime} from 'utils/date';
import {colours} from 'utils/GraphPartyColours';
import {jsonMap} from 'utils/jsonmap';
import {distributionBounds} from 'utils/distributionBounds';
import styles from 'components/Forecasts/History/History.module.css';

function candidateLabel([id, name], parties) {
  if (name) return parties[id] ? name + ' (' + parties[id] + ')' : name;
  if (id === -2) return 'Emerging independent';
  if (id === -3) return 'Emerging party';
  return parties[id] || 'Party ' + id;
}

const pairKey = pair => [...pair].sort((a, b) => a - b).join('/');

// Seat history uses one shared timeline. Retain a row for every publication
// so Recharts breaks both the median line and the band at missing observations.
export default function SeatVoteHistory({
  samples,
  axis,
  current,
  measure,
  parties,
  zone,
  tcpScenarios = [],
}) {
  const [choice, setChoice] = useState('');
  const tcp = measure === 'tcp';
  // Scenario frequency is a proportion of all simulations in the latest
  // report. The plotted vote shares are conditional on that exact pairing.
  const frequencies = new Map(
    tcpScenarios.map(([pair, frequency]) => [pairKey(pair), frequency])
  );
  const options = current.map(([identity]) => {
    const candidates = tcp ? identity : [identity];
    const names = candidates.map(candidate =>
      candidateLabel(candidate, parties)
    );
    const frequency = tcp
      ? frequencies.get(pairKey(identity.map(([party]) => party)))
      : undefined;
    const proportion = Number.isFinite(frequency)
      ? (frequency * 100).toFixed(1) + '%'
      : null;
    return {
      key: JSON.stringify(identity),
      label: names.join(' / ') + (proportion ? ' (' + proportion + ')' : ''),
      candidate: names[0],
      party: parties[candidates[0][0]],
      proportion,
    };
  });
  const selected = options.find(option => option.key === choice) || options[0];
  if (!selected)
    return (
      <p className="m-2">
        {tcp
          ? 'No qualifying pairing at this update.'
          : 'No candidate intervals at this update.'}
      </p>
    );

  const data = samples.map(sample => {
    const match = sample[measure].find(
      ([identity]) => JSON.stringify(identity) === selected.key
    );
    const row = {unixDate: sample.unixDate, median: null, interval: null};
    if (match) {
      const [low, median, high] = match[1];
      row.median = median / 10;
      row.interval = [low / 10, high / 10];
    }
    return row;
  });
  const intervals = data.filter(row => row.interval).map(row => row.interval);
  const {minVoteTotal, maxVoteTotal} = distributionBounds(intervals);
  const padding = Math.max(0.1, (maxVoteTotal - minVoteTotal) * 0.08);
  const domain = [
    Math.max(0, Math.floor((minVoteTotal - padding) * 10) / 10),
    Math.min(100, Math.ceil((maxVoteTotal + padding) * 10) / 10),
  ];
  const palette = jsonMap(colours, selected.party, jsonMap(colours, 'OTH'));
  // A single observation has no area to shade. A whisker keeps both ends
  // of its interval visible even if the scenario disappears immediately.
  data.forEach((row, i) => {
    if (row.interval && !data[i - 1]?.interval && !data[i + 1]?.interval) {
      row.whisker = [
        row.median - row.interval[0],
        row.interval[1] - row.median,
      ];
    }
  });
  return (
    <>
      <ListGroup variant="flush" className={styles.historyList}>
        <ListGroup.Item className={styles.historyOptions}>
          <DropdownButton
            id={tcp ? 'seat-pairing-dropdown' : 'seat-candidate-dropdown'}
            title={`${tcp ? 'Final pairing' : 'Candidate'}: ${selected.label}`}
            variant="secondary"
          >
            {options.map(option => (
              <Dropdown.Item
                as="button"
                key={option.key}
                active={option.key === selected.key}
                onClick={() => setChoice(option.key)}
              >
                {option.label}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </ListGroup.Item>
        <ListGroup.Item>
          Median vote share and central 90% interval for {selected.candidate}
          {tcp && ' in this pairing'}.
          {tcp && (
            <div>
              {selected.proportion
                ? `${selected.proportion} of simulations in the current forecast reach this pairing.`
                : 'Current pairing frequency is unavailable.'}
            </div>
          )}
        </ListGroup.Item>
      </ListGroup>
      {intervals.length === 0 && (
        <p className="m-2">No projections for this selection in this period.</p>
      )}
      {intervals.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={data}
            margin={{left: 20, right: 20, top: 20, bottom: 20}}
          >
            <XAxis {...axis} interval="preserveStartEnd" />
            <YAxis
              type="number"
              domain={domain}
              allowDataOverflow
              unit="%"
              tickCount={6}
              width={48}
            />
            <Tooltip
              labelFormatter={v => countTime(v, zone)}
              formatter={value =>
                Array.isArray(value)
                  ? value.map(v => v.toFixed(1) + '%').join(' – ')
                  : value.toFixed(1) + '%'
              }
            />
            <Area
              dataKey="interval"
              name="90% interval"
              type="stepAfter"
              fill={palette[2]}
              fillOpacity={0.8}
              stroke="none"
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="median"
              name="Median"
              type="stepAfter"
              stroke={palette[0]}
              strokeWidth={2}
              dot={{r: 2}}
              connectNulls={false}
              isAnimationActive={false}
            >
              <ErrorBar dataKey="whisker" width={3} stroke={palette[0]} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </>
  );
}

SeatVoteHistory.propTypes = {
  samples: PropTypes.array.isRequired,
  axis: PropTypes.object.isRequired,
  current: PropTypes.array.isRequired,
  measure: PropTypes.oneOf(['fp', 'tcp']).isRequired,
  parties: PropTypes.object.isRequired,
  zone: PropTypes.string.isRequired,
  tcpScenarios: PropTypes.array,
};
