import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import History from './index';
import {liveHistoryPoints} from './timeAxis';

jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({children}) =>
    require('react').cloneElement(children, {width: 640, height: 280}),
}));

test('Queensland starts its election-night window with the pre-count forecast at 5:30 pm AEST', () => {
  const before = {unixDate: Date.parse('2024-10-25T20:12:44+10:00'), votes: 0};
  const opening = Date.parse('2024-10-26T17:30:00+10:00');
  const firstCount = {unixDate: Date.parse('2024-10-26T18:00:59+10:00')};
  const overnight = {unixDate: Date.parse('2024-10-27T05:29:59+10:00')};
  const late = {unixDate: Date.parse('2024-10-27T05:30:00+10:00')};
  const history = [before, firstCount, overnight, late];

  expect(liveHistoryPoints(history, '2024qld', true)).toEqual([
    {...before, unixDate: opening},
    firstCount,
    overnight,
  ]);
  expect(liveHistoryPoints(history, '2024qld', false)).toEqual([
    {...before, unixDate: opening},
    firstCount,
    overnight,
    late,
  ]);
  expect(history[0].unixDate).toBe(Date.parse('2024-10-25T20:12:44+10:00'));
  expect(liveHistoryPoints([firstCount], '2024qld', true)).toEqual([
    firstCount,
  ]);
  expect(liveHistoryPoints(history, '2020qld', true)).toEqual([before]);
});

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
    voteCategoryDeviations: [
      {
        key: 'vote_type/Postal',
        label: 'Postal',
        tpp: thresholds.map((q, i) => i - 9),
      },
    ],
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
      partyAbbr: [
        [0, 'ALP'],
        [1, 'LIB'],
        [2, 'ONP'],
      ],
      statewidePreferenceFlows: flows,
      voteCategoryDeviations:
        i === 4
          ? [{...forecast.voteCategoryDeviations[0], tpp: [0]}]
          : flows.length
          ? forecast.voteCategoryDeviations
          : [],
    },
  ]);
  const page = data => (
    <History
      forecast={data}
      election="2026sa"
      mode="live"
      showCategoryDeviations
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
  fireEvent.click(
    screen.getByRole('button', {name: 'Display: ALP → ON vs LIB'})
  );
  fireEvent.click(
    screen.getByRole('button', {name: 'Postal – ALP TPP deviation (pp)'})
  );
  const deviation = view.container.querySelector('.recharts-line-curve');
  expect(deviation.getAttribute('d').split('M')).toHaveLength(3);
  expect(
    view.container.querySelector('.recharts-reference-line')
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Display: Postal – ALP TPP deviation (pp)',
    })
  );
  fireEvent.click(screen.getByRole('button', {name: 'ALP → ON vs LIB'}));
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
