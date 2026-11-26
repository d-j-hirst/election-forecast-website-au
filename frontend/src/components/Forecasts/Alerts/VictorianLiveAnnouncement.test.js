import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import VictorianLiveAnnouncement from './VictorianLiveAnnouncement';

test('the announcement remembers its disclosure and links to the first votes and the active live seat', () => {
  const show = props => <MemoryRouter><VictorianLiveAnnouncement {...props} /></MemoryRouter>;
  const page = render(show({counting: false}));
  for (const [name, code] of [['2026 South Australian', '2026sa'], ['2022 Victorian', '2022vic']]) {
    expect(screen.getByRole('link', {name: name + ' election replay'}))
      .toHaveAttribute('href', '/' + code + '/replays/' + code + '-public?snapshot=f00000002');
  }
  fireEvent.click(screen.getByRole('button', {name: 'Collapse live forecast announcement'}));
  page.unmount();
  const live = render(show({counting: true, seat: 'northcote'}));
  expect(screen.getByRole('button', {name: 'Show details'})).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('link', {name: 'Follow the live Victorian forecast'})).toHaveAttribute('href', '/seat/2026vic/live/northcote');
  fireEvent.click(screen.getByRole('button', {name: 'Show details'}));
  expect(screen.getByRole('link', {name: /South Australian election replay/})).toBeVisible();
  live.rerender(show({counting: true}));
  expect(screen.getByRole('link', {name: 'Follow the live Victorian forecast'})).toHaveAttribute('href', '/forecast/2026vic/live');
});
