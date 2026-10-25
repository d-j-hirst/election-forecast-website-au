import React from 'react';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';

import Seats from './index.js';
import SeatDetailBody from '../SeatDetailBody';

// Synthetic report values keep the list and full-detail consumers on the same
// seat/party contract without depending on a saved election or network request.
const makeForecast = (names = ['Alpha']) => {
  const band = median => Array.from({length: 15}, (_, i) => median + i - 7);
  return {
    termCode: '2025fed',
    reportMode: 'RF',
    partyAbbr: [
      [-2, 'IND'],
      [0, 'ALP'],
      [1, 'LNP'],
      [4, 'GRN'],
    ],
    partyName: [
      [-2, 'Emerging Ind'],
      [0, 'Labor'],
      [1, 'Coalition'],
      [4, 'Greens'],
    ],
    seatCountFrequencies: [
      [0, band(20)],
      [1, band(15)],
      [4, band(10)],
    ],
    seatNames: names,
    seatIncumbents: names.map(() => 0),
    seatMargins: names.map(() => 5),
    seatPartyWinFrequencies: names.map(() => [
      [0, 60],
      [1, 20],
      [4, 10],
      [-2, 10],
    ]),
    seatFpBands: names.map(() => [
      [0, band(40)],
      [1, band(35)],
    ]),
    seatTcpBands: names.map(() => [[[0, 1], band(55)]]),
    seatTcpScenarios: names.map(() => [[[0, 1], 1]]),
    voteTotalThresholds: [
      0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5, 99.9,
    ],
  };
};

const renderSeatView = (Component, forecast, results, extraProps = {}) =>
  render(
    <MemoryRouter>
      <Component
        forecast={forecast}
        results={results}
        election={forecast.termCode}
        mode="regular"
        index={0}
        windowWidth={800}
        {...extraProps}
      />
    </MemoryRouter>
  );

const winnerBars = container =>
  [...container.querySelectorAll('[style]')].filter(
    element => element.style.border === '2px solid black'
  );

describe.each([
  ['seat list', Seats],
  ['full seat detail', SeatDetailBody],
])('%s winner markers', (_name, Component) => {
  test.each([
    [{ALP: 45, LNP: 55}, 'lnp-bg'],
    [{LNP: 55, ALP: 45}, 'lnp-bg'],
    [{ALP: 40, GRN: 60}, 'grn-bg'],
    [{ALP: 40, 'IND*': 60}, 'indx-bg'],
  ])('marks the observed winner for %j', (tcp, expectedClass) => {
    const {container} = renderSeatView(Component, makeForecast(), {
      seats: {Alpha: {tcp, fp: {}}},
    });
    const bars = winnerBars(container);
    expect(bars).toHaveLength(1);
    expect(bars[0]).toHaveClass(expectedClass);
  });

  test.each([{}, {ALP: 50, LNP: 50}])(
    'omits an indeterminate winner for %j',
    tcp => {
      const {container} = renderSeatView(Component, makeForecast(), {
        seats: {Alpha: {tcp, fp: {}}},
      });
      expect(winnerBars(container)).toHaveLength(0);
    }
  );
});

test('unexpectedness uses the marked winner and puts missing/tied outcomes last', async () => {
  const forecast = makeForecast(['Alpha', 'Beta', 'Gamma', 'Delta']);
  forecast.seatPartyWinFrequencies[1] = [
    [0, 80],
    [1, 10],
    [-2, 10],
  ];
  const results = {
    seats: {
      Alpha: {tcp: {ALP: 45, LNP: 55}, fp: {}},
      Beta: {tcp: {ALP: 40, 'IND*': 60}, fp: {}},
      Gamma: {tcp: {}, fp: {}},
      Delta: {tcp: {ALP: 50, LNP: 50}, fp: {}},
    },
  };
  const before = JSON.stringify({forecast, results});
  const {container} = renderSeatView(Seats, forecast, results);
  await act(async () => {
    userEvent.click(screen.getByRole('button', {name: /Sort by:/}));
  });
  userEvent.click(screen.getByRole('button', {name: 'Most unexpected'}));
  const links = screen.getAllByRole('link', {name: /full detail/});
  expect(links.map(link => link.getAttribute('href').split('/').pop())).toEqual(
    ['beta', 'alpha', 'delta', 'gamma']
  );
  expect(winnerBars(container).map(bar => bar.className)).toEqual([
    'indx-bg',
    'lnp-bg',
  ]);
  expect(JSON.stringify({forecast, results})).toBe(before);
});

test('Tab reaches the disclosure; Enter and Space toggle it without moving focus', async () => {
  renderSeatView(Seats, makeForecast(), null);
  const button = screen.getByRole('button', {name: 'More details for Alpha'});
  const content = document.getElementById(button.getAttribute('aria-controls'));
  expect(button).toHaveAttribute('type', 'button');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(content).not.toBeVisible();

  // Tab through the actual list controls rather than focusing the target by hand.
  for (let i = 0; i < 10 && document.activeElement !== button; i++)
    userEvent.tab();
  expect(button).toHaveFocus();
  await userEvent.type(button, '{enter}', {skipClick: true});
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(button).toHaveAccessibleName('Less detail for Alpha');
  expect(content).toBeVisible();
  expect(content).toHaveTextContent('Win Probabilities');
  expect(button).toHaveFocus();

  await userEvent.type(button, '{space}', {skipClick: true});
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(content).not.toBeVisible();
  expect(button).toHaveFocus();
});

test('pointer expansion remains attached to its seat after sorting an archive', async () => {
  const forecast = makeForecast(['Beta', 'Alpha']);
  const before = JSON.stringify(forecast);
  const {container} = renderSeatView(Seats, forecast, null, {
    archiveId: 42,
    windowWidth: 320,
  });
  const button = screen.getByRole('button', {name: 'More details for Beta'});
  const targetId = button.getAttribute('aria-controls');
  userEvent.click(button);
  await act(async () => {
    userEvent.click(screen.getByRole('button', {name: /Sort by:/}));
  });
  userEvent.click(screen.getByRole('button', {name: 'Alphabetical order'}));

  expect(screen.getByRole('button', {name: 'Less detail for Beta'})).toBe(
    button
  );
  expect(button).toHaveAttribute('aria-controls', targetId);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById(targetId)).toHaveTextContent('for Beta');
  expect(
    screen.getByRole('button', {name: 'More details for Alpha'})
  ).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getAllByRole('link', {name: /full detail/})[0]).toHaveAttribute(
    'href',
    '/archive/2025fed/42/seat/alpha'
  );
  const ids = [...container.querySelectorAll('[id^="seat-details-"]')].map(
    element => element.id
  );
  expect(new Set(ids).size).toBe(ids.length);
  expect(JSON.stringify(forecast)).toBe(before);
});
