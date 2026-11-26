import React from 'react';
import PropTypes from 'prop-types';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {countTime} from 'utils/date';
import {seatHistoryColourClass} from 'utils/partyclass';
import styles from 'components/Forecasts/History/History.module.css';

const emergingLabels = {'-2': 'Emerging independent', '-3': 'Emerging party'};
const MIN_WIN_BASIS_POINTS = 1;

export default function SeatWinHistory({samples, axis, parties, zone}) {
  const lines = new Map();
  // Use the candidate identity from each observation so a replacement
  // candidate starts a new series and missing updates remain gaps.
  const data = samples.map(({unixDate, wins}) => {
    const row = {unixDate};
    wins.forEach(([party, name, value]) => {
      const key = JSON.stringify([party, name]);
      const abbreviation = parties[party];
      if (!lines.has(key)) {
        const label =
          name && abbreviation ? name + ' (' + abbreviation + ')' : name;
        lines.set(key, {
          id: 'p' + lines.size,
          name: label || emergingLabels[party] || abbreviation || 'OTH',
          colour: `var(--${seatHistoryColourClass(party, abbreviation)})`,
          visible: false,
        });
      }
      const line = lines.get(key);
      if (value >= MIN_WIN_BASIS_POINTS) line.visible = true;
      row[line.id] = value / 100;
    });
    return row;
  });
  const visible = [...lines.values()].filter(line => line.visible);
  if (!visible.length)
    return <p className="m-2">No win probabilities to plot for this period.</p>;
  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{top: 20, right: 20, bottom: 20, left: 20}}
        >
          <XAxis {...axis} interval="preserveStartEnd" />
          <YAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            tickCount={6}
            width={36}
          />
          <Tooltip
            labelFormatter={value => countTime(value, zone)}
            formatter={value => value.toFixed(2) + '%'}
            isAnimationActive={false}
          />
          {visible.map(line => (
            <Line
              key={line.id}
              name={line.name}
              dataKey={line.id}
              type="stepAfter"
              stroke={line.colour}
              strokeWidth={2}
              dot={data.length === 1}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ul className={styles.winLegend} aria-label="Win probability legend">
        {visible.map(line => (
          <li key={line.id} style={{color: line.colour}}>
            <span aria-hidden="true" style={{backgroundColor: line.colour}} />
            {line.name}
          </li>
        ))}
      </ul>
      <p className="small mx-2">
        Only candidates with a recorded win probability of at least 0.01% in
        this period are shown.
      </p>
    </>
  );
}

SeatWinHistory.propTypes = {
  samples: PropTypes.array.isRequired,
  axis: PropTypes.object.isRequired,
  parties: PropTypes.object.isRequired,
  zone: PropTypes.string.isRequired,
};
