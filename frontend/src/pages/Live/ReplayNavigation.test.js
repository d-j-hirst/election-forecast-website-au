import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import Live from './index';
import ReplayNavigation from './ReplayNavigation';
import {getDirect} from 'utils/sdk';

jest.mock('utils/sdk', () => ({getDirect: jest.fn()}));
jest.mock('utils/report_manager', () => ({prepareForecastReport: jest.fn()}));
jest.mock('components', () => {
  const {Link} = require('react-router-dom');
  const PropTypes = require('prop-types');
  function ForecastLayout({live}) {
    if (!live) return <p>Archived statewide forecast</p>;
    if (live.error) return <p>{live.error}</p>;
    return (
      <>
        {live.navigation}
        <span>{live.publication?.points?.length} chart points</span>
        <Link to={live.seatLink('Sample')}>Sample</Link>
      </>
    );
  }
  ForecastLayout.propTypes = {
    live: PropTypes.shape({
      error: PropTypes.string,
      navigation: PropTypes.node,
      publication: PropTypes.shape({points: PropTypes.array}),
      seatLink: PropTypes.func,
    }),
  };

  function SeatDetails({live}) {
    if (!live) return <p>Archived seat forecast</p>;
    return (
      <>
        {live.navigation}
        <Link to={live.returnUrl}>Seat list</Link>
      </>
    );
  }
  SeatDetails.propTypes = {
    live: PropTypes.shape({
      navigation: PropTypes.node,
      returnUrl: PropTypes.string,
    }),
  };
  return {ForecastLayout, SeatDetails};
});

test('a first visit shows the report while the replay history is still downloading', async () => {
  const run = {run_id: 'demo'};
  const id = 'f00000001';
  let finishHistory;
  const history = new Promise(resolve => {
    finishHistory = resolve;
  });
  getDirect.mockImplementation(async url =>
    url.includes('replay-history')
      ? history
      : {
          ok: true,
          data: {
            run,
            revision: 1,
            report: {seatNames: ['Sample']},
            forecast_id: id,
            replay_navigation: {position: 1, total: 1},
            replay_complete: true,
          },
        }
  );
  render(
    <MemoryRouter initialEntries={['/2022vic/replays/demo']}>
      <Routes>
        <Route path="/:code/replays/:runId" element={<Live />} />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByText('Loading replay history…');
  expect(document.title).toBe(
    '2022vic - Live Replay | Australian Election Forecasts'
  );
  expect(screen.getByText('0 chart points')).toBeInTheDocument();
  await act(async () =>
    finishHistory({
      ok: true,
      data: {
        run,
        revision: 1,
        ids: [id],
        updates: [[id, ['2022-11-26T08:00:00Z', {}]]],
        cursor: id,
      },
    })
  );
  expect(screen.getByText('Snapshot 1 of 1')).toBeInTheDocument();
  expect(screen.queryByText(/Replay complete/)).toBeNull();
  expect(screen.getByText('1 chart points')).toBeInTheDocument();
});

test('a completed replay stops idle and visibility checks but still loads an earlier quiet report', async () => {
  jest.useFakeTimers();
  getDirect.mockClear();
  let complete = false;
  const ids = ['f00000001', 'f00000002'];
  getDirect.mockImplementation(async url => {
    const first = url.includes('snapshot=f00000001');
    const report = url.includes('/latest')
      ? {
          forecast_id: ids[first ? 0 : 1],
          report: {seatNames: ['Sample']},
          replay_navigation: {
            position: first ? 1 : 2,
            total: 2,
            first: ids[0],
            previous: first ? null : ids[0],
            next: first ? ids[1] : null,
          },
        }
      : {};
    return {
      ok: true,
      data: {
        run: {run_id: 'demo'},
        revision: 2,
        replay_complete: complete,
        ids,
        updates: ids.map(id => [id, ['2022-11-26T08:00:00Z', {}]]),
        cursor: ids[1],
        ...report,
      },
    };
  });
  try {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/2022vic/replays/demo']}>
          <Routes>
            <Route path="/:code/replays/:runId" element={<Live />} />
          </Routes>
        </MemoryRouter>
      );
    });
    expect(screen.getByText('Snapshot 2 of 2')).toBeInTheDocument();
    complete = true;
    await act(async () => {
      jest.advanceTimersByTime(15000);
    });
    expect(screen.getByText('Snapshot 2 of 2')).toBeInTheDocument();
    getDirect.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(60000);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(getDirect).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(screen.getByText('First'));
    });
    expect(screen.getByText('Snapshot 1 of 2')).toBeInTheDocument();
    expect(getDirect.mock.calls.map(([url]) => url)).toEqual([
      'forecast-api/live/v1/replays/2022vic/demo/latest?snapshot=f00000001',
    ]);
  } finally {
    jest.useRealTimers();
    getDirect.mockClear();
  }
});

test('step through archived reports and keep the snapshot when opening a seat', async () => {
  const run = {run_id: 'demo', timezone: 'Australia/Melbourne'};
  let revision = 3;
  getDirect.mockImplementation(async url => {
    const first = url.includes('snapshot=f00000002');
    const ids =
      revision === 3
        ? ['f00000002', 'f00000008']
        : ['f00000002', 'f00000004', 'f00000008'];
    const incremental = url.includes('after=');
    const body = url.includes('/latest')
      ? {
          forecast_id: first ? 'f00000002' : 'f00000008',
          report: {seatNames: ['Sample']},
          replay_navigation: {
            first: 'f00000002',
            position: first ? 1 : ids.length,
            total: ids.length,
            previous: first ? null : 'f00000002',
            next: first ? 'f00000008' : null,
          },
        }
      : {
          ids,
          cursor: ids[1],
          incremental,
          updates: (incremental ? ['f00000004'] : ids).map(id => [
            id,
            ['2022-11-26T08:00:00Z', {id}],
          ]),
        };
    return {ok: true, data: {run, revision, ...body}};
  });
  render(
    <MemoryRouter initialEntries={['/2022vic/replays/demo']}>
      <Routes>
        <Route path="/:code/replays/:runId" element={<Live />} />
        <Route path="/:code/replays/:runId/seat/:seat" element={<Live />} />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByText('Snapshot 2 of 2');
  expect(screen.getByText('Forward')).toBeDisabled();
  fireEvent.click(screen.getByText('Back'));
  await screen.findByText('Snapshot 1 of 2');
  expect(screen.getByText('1 chart points')).toBeInTheDocument();
  const histories = () =>
    getDirect.mock.calls
      .map(([url]) => url)
      .filter(url => url.includes('replay-history'));
  expect(histories()).toHaveLength(1);
  expect(screen.getByText('Back')).toBeDisabled();
  fireEvent.click(screen.getByText('Sample'));
  await screen.findByText('Snapshot 1 of 2');
  expect(screen.getByText('Seat list')).toHaveAttribute(
    'href',
    '/2022vic/replays/demo?snapshot=f00000002#seats'
  );
  expect(getDirect.mock.calls.map(([url]) => url)).toContain(
    'forecast-api/live/v1/replays/2022vic/demo/replay-history?seat=Sample'
  );
  fireEvent.click(screen.getByText('Forward'));
  await screen.findByText('Snapshot 2 of 2');
  await act(async () => {
    fireEvent.click(screen.getByText('Follow latest'));
  });
  expect(screen.getByText('Seat list')).toHaveAttribute(
    'href',
    '/2022vic/replays/demo#seats'
  );
  fireEvent.click(screen.getByText('Seat list'));
  await screen.findByText('2 chart points');
  expect(histories()).toHaveLength(2);
  revision = 4;
  fireEvent(document, new Event('visibilitychange'));
  await waitFor(() =>
    expect(screen.getByText('3 chart points')).toBeInTheDocument()
  );
  expect(histories().slice(-1)[0]).toMatch(
    /replay-history\?after=f00000008&revision=3$/
  );
});

test('dragging across snapshots previews local time and opens only the released forecast', async () => {
  // Equal observation times and skipped IDs are both valid. A late delivery
  // also inserts a new point while the reader is selecting a snapshot.
  let ids = ['f00000002', 'f00000008', 'f00000004', 'f00000009'];
  const times = {
    f00000002: '2022-11-26T07:00:00Z',
    f00000005: '2022-11-26T07:30:00Z',
    f00000008: '2022-11-26T08:00:00Z',
    f00000004: '2022-11-26T08:00:00Z',
    f00000009: '2022-11-26T09:00:00Z',
  };
  getDirect.mockImplementation(async url => {
    const forecast =
      new URLSearchParams(url.split('?')[1]).get('snapshot') ||
      ids[ids.length - 1];
    return {
      ok: true,
      data: {
        run: {run_id: 'demo', timezone: 'Australia/Melbourne'},
        revision: ids.length,
        report: {seatNames: ['Sample']},
        forecast_id: forecast,
        ids,
        updates: ids.map(id => [id, [times[id], {}]]),
        cursor: ids[ids.length - 1],
        replay_navigation: {
          position: ids.indexOf(forecast) + 1,
          total: ids.length,
        },
      },
    };
  });
  render(
    <MemoryRouter initialEntries={['/2022vic/replays/demo/seat/sample']}>
      <Routes>
        <Route path="/:code/replays/:runId/seat/:seat" element={<Live />} />
      </Routes>
    </MemoryRouter>
  );
  const slider = await screen.findByRole('slider', {
    name: 'Choose replay snapshot',
  });
  getDirect.mockClear();
  fireEvent.pointerDown(slider);
  fireEvent.change(slider, {target: {value: '2'}});
  fireEvent.change(slider, {target: {value: '3'}});
  expect(slider.getAttribute('aria-valuetext')).toMatch(
    /Snapshot 3 of 4, .*7:00:00\s?pm/i
  );
  expect(getDirect).not.toHaveBeenCalled();
  ids = [ids[0], 'f00000005', ...ids.slice(1)];
  await act(async () => {
    fireEvent(document, new Event('visibilitychange'));
  });
  expect(slider).toHaveAttribute('max', '4');
  getDirect.mockClear();
  fireEvent.pointerUp(slider);
  await screen.findByText('Snapshot 4 of 5');
  expect(getDirect.mock.calls.map(([url]) => url)).toEqual([
    'forecast-api/live/v1/replays/2022vic/demo/latest?snapshot=f00000004',
  ]);
  expect(screen.getByText('Seat list')).toHaveAttribute(
    'href',
    '/2022vic/replays/demo?snapshot=f00000004#seats'
  );
  expect(slider.value).toBe('4');
  getDirect.mockClear();
  fireEvent.keyDown(slider, {key: 'Home'});
  fireEvent.change(slider, {target: {value: '1'}});
  expect(getDirect).not.toHaveBeenCalled();
  fireEvent.keyUp(slider, {key: 'Home'});
  await screen.findByText('Snapshot 1 of 5');
  expect(getDirect).toHaveBeenCalledTimes(1);
});

test('page arrows step once while reading and leave focused controls and browser shortcuts alone', () => {
  const selectSnapshot = jest.fn();
  const publication = {
    run: {timezone: 'Australia/Melbourne'},
    forecast_id: 'first',
    replay_navigation: {position: 1, total: 2, previous: null, next: 'second'},
    replayTimeline: ['first', 'second'].map(id => ({
      id,
      time: '2022-11-26T08:00:00Z',
    })),
  };
  const page = snapshot => (
    <>
      <ReplayNavigation
        publication={publication}
        snapshot={snapshot}
        selectSnapshot={selectSnapshot}
      />
      <p tabIndex={-1}>Seat commentary</p>
      <select aria-label="Chart options" />
    </>
  );
  const view = render(page('first'));
  const reading = screen.getByText('Seat commentary');
  reading.focus();
  fireEvent.keyDown(reading, {key: 'ArrowLeft'}); // First snapshot.
  for (const option of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'repeat']) {
    fireEvent.keyDown(reading, {key: 'ArrowRight', [option]: true});
  }
  const handled = new KeyboardEvent('keydown', {
    key: 'ArrowRight',
    bubbles: true,
    cancelable: true,
  });
  handled.preventDefault();
  fireEvent(reading, handled);
  fireEvent.keyDown(screen.getByRole('combobox'), {key: 'ArrowRight'});
  const slider = screen.getByRole('slider');
  fireEvent.keyDown(slider, {key: 'ArrowRight'});
  fireEvent.keyUp(slider, {key: 'ArrowRight'});
  expect(selectSnapshot).not.toHaveBeenCalled();

  fireEvent.keyDown(reading, {key: 'ArrowRight'});
  expect(selectSnapshot.mock.calls).toEqual([['second']]);
  expect(reading).toHaveFocus();
  view.rerender(page('second')); // The selected report is still loading.
  fireEvent.keyDown(reading, {key: 'ArrowRight'});
  expect(selectSnapshot).toHaveBeenCalledTimes(1);
  view.unmount();
  fireEvent.keyDown(document.body, {key: 'ArrowRight'});
  expect(selectSnapshot).toHaveBeenCalledTimes(1);
});

test('pinning survives a reload and the loading label replaces the position in its reserved slot', () => {
  localStorage.clear();
  const ids = Array.from({length: 12}, (_, i) => 'f' + (i + 1));
  const publication = {
    run: {timezone: 'Australia/Melbourne'},
    forecast_id: ids[0],
    replay_navigation: {position: 1, total: 12, next: ids[1]},
    replayTimeline: ids.map(id => ({id, time: '2022-11-26T08:00:00Z'})),
  };
  const page = snapshot => (
    <ReplayNavigation
      publication={publication}
      snapshot={snapshot}
      selectSnapshot={jest.fn()}
    />
  );
  const view = render(page(ids[0]));
  const nav = screen.getByRole('navigation', {name: 'Replay snapshots'});
  expect(nav).toHaveClass('replay-controls-pinned');
  const slot = screen.getByText('Snapshot 1 of 12').parentElement;
  expect(slot.querySelector('[data-size]')).toHaveAttribute(
    'data-size',
    'Snapshot 12 of 12'
  );
  const back = screen.getByRole('button', {name: /Previous snapshot/});
  view.rerender(page(ids[11]));
  expect(screen.getByText('Loading…').parentElement).toBe(slot);
  expect(screen.queryByText('Snapshot 12 of 12')).toBeNull();
  expect(screen.getByRole('button', {name: /Previous snapshot/})).toBe(back);
  view.rerender(page(null)); // Following latest while the earlier report is on screen.
  expect(screen.getByText('Loading…')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Unpin replay controls'}));
  expect(nav).not.toHaveClass('replay-controls-pinned');
  view.unmount();
  render(page(ids[0]));
  fireEvent.click(screen.getByRole('button', {name: 'Pin replay controls'}));
  expect(screen.getByRole('navigation')).toHaveClass('replay-controls-pinned');
});

test.each([
  [
    '/forecast/2022vic/live',
    '/forecast/:code/live',
    {ok: false, status: 404},
    'Archived statewide forecast',
  ],
  [
    '/seat/2022vic/live/ripon',
    '/seat/:code/live/:seat',
    {ok: true, legacyApiMissing: true},
    'Archived seat forecast',
  ],
  [
    '/forecast/2022vic/live',
    '/forecast/:code/live',
    {ok: false, status: 503},
    'Update unavailable. Retrying automatically.',
  ],
  [
    '/2022vic/replays/private',
    '/:code/replays/:runId',
    {ok: false, status: 404},
    'This forecast run is unavailable.',
  ],
])(
  'opens the correct report or error for %s',
  async (url, path, response, expected) => {
    getDirect.mockResolvedValue(response);
    render(
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path={path} element={<Live />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText(expected)).toBeInTheDocument();
  }
);
