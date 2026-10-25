import React from 'react';
import {render} from '@testing-library/react';
import VoteTotals from './VoteTotals';
import SeatTotals from './SeatTotals';
import SeatFp from './SeatFp';
import SeatTcp from './SeatTcp';

const band = value => Array(15).fill(value);
const forecast = () => ({
  termCode: '2025fed',
  reportMode: 'RF',
  partyAbbr: [
    [0, 'ALP'],
    [1, 'LNP'],
  ],
  partyName: [
    [0, 'Labor'],
    [1, 'Coalition'],
  ],
  voteTotalThresholds: [
    0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5, 99.9,
  ],
  tppFrequencies: band(50),
  fpFrequencies: [
    [0, band(20)],
    [1, band(20)],
  ],
  seatCountFrequencies: [
    [0, band(10)],
    [1, band(10)],
  ],
  seatNames: ['Example'],
  seatFpBands: [
    [
      [0, band(20)],
      [1, band(20)],
    ],
  ],
  seatTcpBands: [[[[0, 1], band(50)]]],
  seatTcpScenarios: [[[[0, 1], 1]]],
});
const common = {
  election: '2025fed',
  mode: 'regular',
  windowWidth: 320,
  index: 0,
  abbreviated: false,
};
const results = {
  overall: {fp: {ALP: 80, LNP: 20}, seats: {ALP: 80, LNP: 20}, tpp: 80},
};

const chartsIn = container =>
  Array.from(container.querySelectorAll('div')).filter(
    el => el.style.position === 'relative' && el.style.height === '30px'
  );
const verifyPair = (charts, markerCount = 3) => {
  expect(charts).toHaveLength(2);
  for (const chart of charts) {
    const width = parseFloat(chart.style.width);
    for (const element of chart.children) {
      const left = parseFloat(element.style.left);
      const barWidth = parseFloat(element.style.width);
      expect(Number.isFinite(left)).toBe(true);
      expect(Number.isFinite(barWidth)).toBe(true);
      expect(left).toBeGreaterThanOrEqual(0);
      expect(left + barWidth).toBeLessThanOrEqual(width);
    }
    expect(
      chart.querySelectorAll('[style*="background-color: black"]')
    ).toHaveLength(markerCount);
  }
  // Equal distributions must align even when their observed results differ.
  // Per-row expansion alone would satisfy containment but fail this check.
  expect(charts[0].firstChild.style.left).toBe(charts[1].firstChild.style.left);
  expect(charts[0].firstChild.style.width).toBe(
    charts[1].firstChild.style.width
  );
};

test.each([320, 1000])(
  'election FP and TPP pairs share scales at width %s',
  windowWidth => {
    const {container} = render(
      <VoteTotals
        {...common}
        windowWidth={windowWidth}
        forecast={forecast()}
        results={results}
      />
    );
    const charts = chartsIn(container);
    expect(charts).toHaveLength(4);
    verifyPair(charts.slice(0, 2));
    verifyPair(charts.slice(2));
  }
);

test('seat totals share a scale with result and half-seat padding', () => {
  const {container} = render(
    <SeatTotals {...common} forecast={forecast()} results={results} />
  );
  verifyPair(chartsIn(container));
});

test('seat FP rows share a scale containing the observed shares', () => {
  const {container} = render(
    <SeatFp
      {...common}
      forecast={forecast()}
      result={{fp: {ALP: 80, LNP: 20}}}
    />
  );
  verifyPair(chartsIn(container));
});

test('election distributions remain finite when results are absent', () => {
  const {container} = render(
    <VoteTotals {...common} forecast={forecast()} results={null} />
  );
  const charts = chartsIn(container);
  verifyPair(charts.slice(0, 2), 0);
  verifyPair(charts.slice(2), 0);
});

test('combined Coalition results participate in the shared vote and seat scales', () => {
  const data = forecast();
  data.partyAbbr.push([3, 'NAT']);
  data.partyName.push([3, 'Nationals']);
  data.fpFrequencies = [
    [0, band(20)],
    [1, band(10)],
    [3, band(10)],
  ];
  data.seatCountFrequencies = [
    [0, band(10)],
    [1, band(5)],
    [3, band(5)],
  ];
  data.coalitionFpFrequencies = band(20);
  data.coalitionSeatCountFrequencies = band(10);
  const finalResults = {
    overall: {
      tpp: 50,
      fp: {ALP: 20, LNP: 50, NAT: 30},
      seats: {ALP: 20, LNP: 50, NAT: 30},
    },
  };
  const votes = render(
    <VoteTotals {...common} forecast={data} results={finalResults} />
  );
  verifyPair(chartsIn(votes.container).slice(2));
  const seats = render(
    <SeatTotals {...common} forecast={data} results={finalResults} />
  );
  verifyPair(chartsIn(seats.container));
});

test('seat TCP rows share a scale containing complementary results', () => {
  const {container} = render(
    <SeatTcp
      {...common}
      forecast={forecast()}
      result={{tcp: {ALP: 80, LNP: 20}}}
    />
  );
  verifyPair(chartsIn(container));
});

test('a missing TPP result is not complemented into a 100% marker', () => {
  const {container} = render(
    <VoteTotals
      {...common}
      forecast={forecast()}
      results={{overall: {...results.overall, tpp: null}}}
    />
  );
  for (const chart of chartsIn(container).slice(0, 2)) {
    expect(
      chart.querySelector('[style*="background-color: black"]')
    ).toBeNull();
  }
});
