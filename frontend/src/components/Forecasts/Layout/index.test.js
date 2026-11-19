import React from 'react';
import {act, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import ForecastLayout from './index';
import {fetchReport} from '../../../utils/report_manager';
import {History, Seats} from 'components';

jest.mock('../../../utils/report_manager', () => ({fetchReport: jest.fn()}));
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
  SeatTotals: () => null,
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
  const live = {
    replay: true,
    publication: {
      report: {...report('2026-11-18T00:00:00'), reportMode: 'LF'},
      source_time: '2026-03-21T08:00:00Z',
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
  render(
    <HelmetProvider>
      <MemoryRouter>
        <ForecastLayout code="2026sa" mode="live" live={live} />
      </MemoryRouter>
    </HelmetProvider>
  );
  expect(screen.getByText('Vote totals loaded')).toBeInTheDocument();
  expect(screen.getByText('Replay update summary')).toBeInTheDocument();
  expect(screen.getByText(/Count observation/)).toHaveTextContent('21 Mar');
  expect(History.mock.calls.at(-1)[0]).toMatchObject({
    runPoints: points,
    timeZone: 'Australia/Adelaide',
  });
  expect(Seats.mock.calls.at(-1)[0]).toMatchObject({seatLink, results: null});
  expect(fetchReport).not.toHaveBeenCalled();
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
