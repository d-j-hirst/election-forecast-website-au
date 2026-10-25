import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import SeatDetails from './index';
import {fetchReport} from '../../../utils/report_manager';

jest.mock('../../../utils/report_manager', () => ({fetchReport: jest.fn()}));
// Exercise the real seat-page notice contract without requesting reports or
// requiring the unrelated numerical displays to have complete forecast data.
jest.mock('components', () => ({
  Header: () => null,
  Footer: () => null,
  ForecastsNav: () => null,
  ForecastHeader: () => null,
  LoadingMarker: () => null,
  MainContent: require('../../MainContent').default,
  ForecastAlert: require('../Alerts/ForecastAlert').default,
  StandardErrorBoundary: require('../../General/StandardErrorBoundary').default,
  SeatDetailBody: () => <p>Seat report content</p>,
}));

const tree = (code, isArchive) => (
  <HelmetProvider>
    <MemoryRouter>
      <SeatDetails
        code={code}
        seat="alpha"
        mode={isArchive ? undefined : 'regular'}
        id={isArchive ? 42 : undefined}
        isArchive={isArchive}
      />
    </MemoryRouter>
  </HelmetProvider>
);

beforeEach(() => localStorage.clear());

test.each(
  ['2026sa', '2026vic'].flatMap(code =>
    [
      ['RF', 'report for the Synthetic election.'],
      ['NC', 'if it were held at that time'],
      ['LF', 'incorporating official election results'],
    ].map(([mode, context]) => [code, mode, context])
  )
)(
  'an archived %s %s seat remains clearly historical when its introduction is opened',
  (code, reportMode, context) => {
    fetchReport.mockImplementation(settings => {
      settings.setForecast({
        termCode: code,
        reportMode,
        electionName: 'Synthetic election',
        seatNames: ['Alpha'],
      });
      settings.setForecastValid(true);
    });
    render(tree(code, true));
    expect(screen.getByText('Seat report content')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /show introduction/i}));
    expect(screen.getByRole('alert')).toHaveTextContent('archived');
    expect(screen.getByRole('alert')).not.toHaveTextContent(/was the final/);
    expect(screen.getByRole('alert')).toHaveTextContent(context);
    expect(
      screen.queryByRole('link', {name: 'nowcast'})
    ).not.toBeInTheDocument();
  }
);

test('moving from an archived to a current seat restores current introduction context', () => {
  fetchReport.mockImplementation(settings => {
    settings.setForecast({
      termCode: '2026vic',
      reportMode: 'RF',
      electionName: 'Synthetic election',
      seatNames: ['Alpha'],
    });
    settings.setForecastValid(true);
  });
  const view = render(tree('2026vic', true));
  fireEvent.click(screen.getByRole('button', {name: /show introduction/i}));
  expect(screen.getByRole('alert')).toHaveTextContent('archived');
  view.rerender(tree('2026vic', false));
  expect(screen.getByRole('alert')).not.toHaveTextContent('archived');
  expect(screen.getByRole('link', {name: 'nowcast'})).toBeInTheDocument();
});
