import React from 'react';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import ForecastLayout from './index';
import {fetchReport} from '../../../utils/report_manager';
import {History, Seats} from 'components';

jest.mock('../../../utils/report_manager', () => ({
  fetchReport: jest.fn(),
  fetchResults: jest.fn(),
}));
// Keep layout/recovery/heading code real; the numerical feature displays have
// their own tests and need not be given a complete report for this lifecycle test.
jest.mock('components', () => ({
  Header: () => null,
  Footer: () => <footer>Footer remains available</footer>,
  ForecastsNav: () => null,
  MainContent: require('../../MainContent').default,
  ForecastHeader: require('../Header').default,
  StandardErrorBoundary: require('../../General/StandardErrorBoundary').default,
  LoadingMarker: require('../../General/LoadingMarker').default,
  ForecastAlert: () => null,
  MethodsChangesAlert: () => null,
  FormationOfGovernment: () => null,
  VoteTotals: () => <p>Vote totals loaded</p>,
  SeatTotals: () => <p>Seat Totals</p>,
  History: jest.fn(),
  Seats: jest.fn(),
}));

beforeEach(() => {
  History.mockReturnValue(null);
  Seats.mockReturnValue(null);
});

const tree = (code, id) => (
  <HelmetProvider>
    <MemoryRouter>
      <ForecastLayout
        code={code}
        id={id}
        mode="regular"
        isArchive={id !== undefined}
      />
    </MemoryRouter>
  </HelmetProvider>
);
const report = date => ({
  electionName: 'Synthetic election',
  reportMode: 'RF',
  reportDate: date,
  reportLabel: 'Example',
});

test('a replay uses the forecast layout with only its run history and seat links', () => {
  fetchReport.mockClear();
  const points = [['2026-03-21T08:00:00Z', {}]];
  const seatLink = seat => '/2026sa/replays/sample/seat/' + seat.toLowerCase();

  const flows = [
    {
      sourceParty: 0,
      destinationParty: 1,
      otherFinalist: 2,
      percentiles: [35, 38, 40, 43, 46, 49, 54, 60, 65, 70, 73, 76, 79, 81, 85],
    },
    {
      sourceParty: 1,
      destinationParty: 2,
      otherFinalist: 0,
      percentiles: Array(15).fill(64),
    },
  ];
  const live = {
    replay: true,
    publication: {
      report: {
        ...report('2026-11-18T00:00:00'),
        reportMode: 'LF',
        termCode: '2026sa',
        partyAbbr: [
          [0, 'ALP'],
          [1, 'LNP'],
          [2, 'ON'],
        ],
        seatCountFrequencies: [[0, []]],
        voteTotalThresholds: [
          0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5, 99.9,
        ],
        statewidePreferenceFlows: flows,
        countProgress: {
          fp_votes: 3932,
          tcp_votes: 600,
          expected_formal_votes: 1124363.998,
        },
      },
      source_time: '2026-03-21T08:00:00Z',
      forecast_id: 'f00000005',
      local_diagnostics: true,
      run: {
        kind: 'replay',
        display_name: 'sample',
        timezone: 'Australia/Adelaide',
      },
      points,
    },
    summary: <p>Replay update summary</p>,
    seatLink,
  };
  const replayTree = live => (
    <HelmetProvider>
      <MemoryRouter>
        <ForecastLayout code="2026sa" mode="live" live={live} />
      </MemoryRouter>
    </HelmetProvider>
  );
  const view = render(replayTree(live));
  expect(screen.getByText('Vote totals loaded')).toBeInTheDocument();
  expect(screen.getByText('Replay update summary')).toBeInTheDocument();
  const status = screen.getByText(/Count observation/);
  expect(status).toHaveTextContent('21 Mar');
  expect(status).toHaveTextContent(
    '· Count progress: FP 0.3%, TCP 0.1% · Snapshot f00000005'
  );
  expect(History.mock.calls.at(-1)[0]).toMatchObject({
    runPoints: points,
    timeZone: 'Australia/Adelaide',
  });
  expect(Seats.mock.calls.at(-1)[0]).toMatchObject({seatLink, results: null});
  expect(fetchReport).not.toHaveBeenCalled();

  const heading = screen.getByRole('heading', {name: 'Preference Flows'});
  const seatTotals = screen.getByText('Seat Totals');
  const recent = screen.getByText('Replay update summary');
  expect(
    seatTotals.compareDocumentPosition(heading) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(
    heading.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();

  const card = heading.closest('.card');
  const bars = () => card.querySelectorAll('[style*="height: 30px"]');
  const shares = () =>
    within(card)
      .getAllByText(/^\d+\.\d%$/)
      .map(el => el.textContent);
  expect(bars()).toHaveLength(2);
  expect(shares()).toEqual([
    '46.0%',
    '60.0%',
    '73.0%',
    '27.0%',
    '40.0%',
    '54.0%',
  ]);
  fireEvent.click(
    within(card).getByRole('button', {name: 'Flow: ALP → LIB vs ON'})
  );
  fireEvent.click(within(card).getByRole('button', {name: 'LIB → ON vs ALP'}));
  expect(bars()).toHaveLength(2);
  expect(shares()).toEqual([
    '64.0%',
    '64.0%',
    '64.0%',
    '36.0%',
    '36.0%',
    '36.0%',
  ]);

  const updated = {
    ...live,
    publication: {
      ...live.publication,
      forecast_id: 'f00000006',
      report: {
        ...live.publication.report,
        statewidePreferenceFlows: [
          flows[0],
          {...flows[1], percentiles: Array(15).fill(63)},
        ],
      },
    },
  };
  view.rerender(replayTree(updated));
  expect(screen.getByText(/Count observation/)).toHaveTextContent(
    'Snapshot f00000006'
  );
  expect(
    within(card).getByRole('button', {name: 'Flow: LIB → ON vs ALP'})
  ).toBeInTheDocument();
  expect(shares()).toEqual([
    '63.0%',
    '63.0%',
    '63.0%',
    '37.0%',
    '37.0%',
    '37.0%',
  ]);

  view.rerender(
    replayTree({
      ...live,
      publication: {
        ...live.publication,
        local_diagnostics: false,
        report: {
          ...live.publication.report,
          statewidePreferenceFlows: undefined,
        },
      },
    })
  );
  expect(
    screen.queryByRole('heading', {name: 'Preference Flows'})
  ).not.toBeInTheDocument();
  expect(screen.getByText(/Count observation/)).not.toHaveTextContent(
    'Snapshot'
  );

  view.rerender(
    replayTree({
      ...live,
      replay: false,
      publication: {
        ...live.publication,
        run: {...live.publication.run, kind: 'live'},
      },
    })
  );
  expect(screen.getByText(/Count observation/)).not.toHaveTextContent(
    'Snapshot'
  );
});

test('an outer render failure recovers on the next healthy election/archive delivery', () => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  fetchReport.mockImplementation(settings => settings.setForecastValid(false));
  try {
    const view = render(tree('2026vic'));
    const first = fetchReport.mock.calls.at(-1)[0];
    act(() => {
      first.setForecast(report(null));
      first.setForecastValid(true);
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    view.rerender(tree('2025fed', 42));
    const second = fetchReport.mock.calls.at(-1)[0];
    act(() => {
      second.setForecast(report('2026-10-01T00:00:00'));
      second.setForecastValid(true);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Vote totals loaded')).toBeInTheDocument();

    // Replacing data at the same route also retries a previously failed display.
    act(() => {
      second.setForecast(report(null));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => {
      second.setForecast(report('2026-10-02T00:00:00'));
    });
    expect(screen.getByText('Vote totals loaded')).toBeInTheDocument();
  } finally {
    errors.mockRestore();
  }
});
