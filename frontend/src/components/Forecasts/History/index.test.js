import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import History from './index';

jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({children}) =>
    require('react').cloneElement(children, {width: 640, height: 280}),
}));

test('live flow history follows its destination colour, breaks at missing estimates and restores the selection', () => {
  localStorage.clear();
  const thresholds = [
    0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5, 99.9,
  ];
  const rows = [
    {
      sourceParty: 0,
      destinationParty: 2,
      otherFinalist: 1,
      percentiles: thresholds.map((q, i) => 50 + i),
    },
  ];
  const forecast = {
    termCode: '2026sa',
    partyAbbr: [
      [0, 'ALP'],
      [1, 'LIB'],
      [2, 'ON'],
    ],
    voteTotalThresholds: thresholds,
    statewidePreferenceFlows: rows,
    seatCountFrequencies: [],
  };
  const base = {
    majorityWinPc: [],
    minorityWinPc: [],
    mostSeatsWinPc: [],
    voteTotalThresholds: thresholds,
  };
  const points = [rows, rows, [], rows, rows].map((flows, i) => [
    '2026-03-21T09:0' + i + ':00Z',
    {
      ...base,
      partyAbbr: [[0, 'ALP'], [1, 'LIB'], [2, 'ONP']],
      statewidePreferenceFlows: flows,
    },
  ]);
  const page = data => (
    <History
      forecast={data}
      election="2026sa"
      mode="live"
      runPoints={points}
      timeZone="UTC"
    />
  );
  const view = render(page(forecast));
  fireEvent.click(
    screen.getByRole('button', {name: 'Display: Formation of government'})
  );
  fireEvent.click(screen.getByRole('button', {name: 'ALP → ON vs LIB'}));
  const line = view.container.querySelector('.recharts-line-curve');
  expect(line).toHaveAttribute('stroke', '#AA6600');
  expect(line.getAttribute('d').split('M')).toHaveLength(3);
  view.unmount();
  const restored = render(page(forecast));
  expect(
    screen.getByRole('button', {name: 'Display: ALP → ON vs LIB'})
  ).toBeInTheDocument();
  restored.rerender(page({...forecast, statewidePreferenceFlows: []}));
  expect(
    screen.getByRole('button', {name: 'Display: Formation of government'})
  ).toBeInTheDocument();
});
