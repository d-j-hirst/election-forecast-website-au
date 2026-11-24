import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import Live from './index';
import {getDirect} from 'utils/sdk';

jest.mock('utils/sdk', () => ({getDirect: jest.fn()}));
jest.mock('utils/report_manager', () => ({prepareForecastReport: jest.fn()}));
jest.mock('components', () => {
  const {Link} = require('react-router-dom');
  return {
    ForecastLayout: ({live}) => <>{live.navigation}<Link to={live.seatLink('Sample')}>Sample</Link></>,
    SeatDetails: ({live}) => <>{live.navigation}<Link to={live.returnUrl}>Seat list</Link></>,
  };
});

test('step through archived reports and keep the snapshot when opening a seat', async () => {
  const run = {run_id: 'demo', timezone: 'Australia/Melbourne'};
  getDirect.mockImplementation(async url => {
    const first = url.includes('snapshot=f00000002');
    const body = url.includes('/latest') ? {
      forecast_id: first ? 'f00000002' : 'f00000008',
      report: {seatNames: ['Sample']},
      replay_navigation: {first: 'f00000002', position: first ? 1 : 2, total: 2,
        previous: first ? null : 'f00000002', next: first ? 'f00000008' : null},
    } : {points: []};
    return {ok: true, data: {run, revision: 3, ...body}};
  });
  render(<MemoryRouter initialEntries={['/2022vic/replays/demo']}><Routes>
    <Route path="/:code/replays/:runId" element={<Live />} />
    <Route path="/:code/replays/:runId/seat/:seat" element={<Live />} />
  </Routes></MemoryRouter>);
  await screen.findByText('Snapshot 2 of 2');
  expect(screen.getByText('Forward')).toBeDisabled();
  fireEvent.click(screen.getByText('Back'));
  await screen.findByText('Snapshot 1 of 2');
  expect(screen.getByText('Back')).toBeDisabled();
  fireEvent.click(screen.getByText('Sample'));
  await screen.findByText('Snapshot 1 of 2');
  expect(screen.getByText('Seat list')).toHaveAttribute('href', '/2022vic/replays/demo?snapshot=f00000002#seats');
  expect(getDirect.mock.calls.map(([url]) => url)).toContain(
    'forecast-api/live/v1/replays/2022vic/demo/seat-history?seat=Sample&snapshot=f00000002'
  );
  fireEvent.click(screen.getByText('Forward'));
  await screen.findByText('Snapshot 2 of 2');
  await act(async () => {
    fireEvent.click(screen.getByText('Follow latest'));
  });
  expect(screen.getByText('Seat list')).toHaveAttribute('href', '/2022vic/replays/demo#seats');
});
