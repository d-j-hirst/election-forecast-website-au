import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import VictorianLiveAnnouncement from './VictorianLiveAnnouncement';

test('an open seat announcement links to live at 5:30 pm Melbourne time before votes arrive', () => {
  jest.useFakeTimers();
  try {
    jest.setSystemTime(new Date('2026-11-28T06:29:59Z'));
    render(
      <MemoryRouter>
        <VictorianLiveAnnouncement seat="mordialloc" />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link', {name: /Follow the live/})).toBeNull();
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByRole('link', {name: /Follow the live/})).toHaveAttribute(
      'href',
      '/seat/2026vic/live/mordialloc'
    );
  } finally {
    jest.useRealTimers();
  }
});

test('the announcement remembers its disclosure and links to the first votes and the active live seat', () => {
  const clock = jest
    .spyOn(Date, 'now')
    .mockReturnValue(Date.parse('2026-11-28T06:30:00Z'));
  const show = props => (
    <MemoryRouter>
      <VictorianLiveAnnouncement {...props} />
    </MemoryRouter>
  );
  const page = render(show({}));
  for (const [name, code] of [
    ['2026 South Australian', '2026sa'],
    ['2022 Victorian', '2022vic'],
  ]) {
    expect(
      screen.getByRole('link', {name: name + ' election replay'})
    ).toHaveAttribute(
      'href',
      '/' + code + '/replays/' + code + '-public?snapshot=f00000002'
    );
  }
  fireEvent.click(
    screen.getByRole('button', {name: 'Collapse live forecast announcement'})
  );
  page.unmount();
  const live = render(show({seat: 'northcote'}));
  expect(screen.getByRole('button', {name: 'Show details'})).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  expect(
    screen.getByRole('link', {name: 'Follow the live Victorian forecast'})
  ).toHaveAttribute('href', '/seat/2026vic/live/northcote');
  fireEvent.click(screen.getByRole('button', {name: 'Show details'}));
  expect(
    screen.getByRole('link', {name: /South Australian election replay/})
  ).toBeVisible();
  live.rerender(show({}));
  expect(
    screen.getByRole('link', {name: 'Follow the live Victorian forecast'})
  ).toHaveAttribute('href', '/forecast/2026vic/live');
  clock.mockRestore();
});
