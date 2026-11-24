import React from 'react';
import useStoredString from 'pages/Live/useStoredString';
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ErrorBar,
  Line,
  ReferenceLine,
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

// Round the padded interval outward to a regular percentage grid. These
// spacings all land on 50%, so the majority threshold gets a normal tick
// whenever it is in view.
function voteShareAxis(intervals) {
  const {minVoteTotal, maxVoteTotal} = distributionBounds(intervals);
  const span = maxVoteTotal - minVoteTotal;
  let step = 10;
  if (span <= 10) step = 2;
  else if (span <= 25) step = 5;

  const padding = Math.max(0.1, span * 0.08);
  const lower = Math.max(0, Math.floor((minVoteTotal - padding) / step) * step);
  const upper = Math.min(
    100,
    Math.ceil((maxVoteTotal + padding) / step) * step
  );
  const ticks = Array.from(
    {length: (upper - lower) / step + 1},
    (_, index) => lower + index * step
  );
  return {domain: [lower, upper], ticks};
}

// The emerging categories are optional forecasts. Keep them when either
// bound shows a possible vote share in the selected period.
function includeFpCandidate([identity, currentBand], samples) {
  if (identity[0] !== -2 && identity[0] !== -3) return true;
  const key = JSON.stringify(identity);
  const bands = samples
    .map(
      sample =>
        sample.fp.find(([candidate]) => JSON.stringify(candidate) === key)?.[1]
    )
    .filter(Boolean);
  if (!bands.length) bands.push(currentBand);
  return bands.some(band => band.some(share => share > 0));
}

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
  const [choice, setChoice] = useStoredString(
    'seatHistory:candidate:' + measure,
    ''
  );
  const tcp = measure === 'tcp';
  // Scenario frequency is a proportion of all simulations in the latest
  // report. The plotted vote shares are conditional on that exact pairing.
  const frequencies = new Map(
    tcpScenarios.map(([pair, frequency]) => [pairKey(pair), frequency])
  );
  const available = tcp
    ? current
    : current.filter(entry => includeFpCandidate(entry, samples));
  const options = available.map(([identity]) => {
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
  const {domain, ticks} = voteShareAxis(intervals);
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
              ticks={ticks}
              interval={0}
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
            {/* Keep the guides above the shaded interval and below the median. */}
            <CartesianGrid
              vertical={false}
              stroke="#6c757d"
              strokeOpacity={0.5}
            />
            {tcp && <ReferenceLine y={50} stroke="#495057" />}
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
