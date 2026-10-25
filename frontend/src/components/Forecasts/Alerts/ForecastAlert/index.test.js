import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ForecastAlert from './index';
import StandardErrorBoundary from '../../../General/StandardErrorBoundary';

const storageKey = 'liveForecastAlertClosed';
const tree = (props = {}) => (
  <MemoryRouter>
    <StandardErrorBoundary>
      <ForecastAlert
        code="2026sa"
        mode="live"
        forecast={{electionName: 'Synthetic election'}}
        {...props}
      />
      <p>Report content</p>
    </StandardErrorBoundary>
  </MemoryRouter>
);

beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

test.each(['method', 'property'])(
  'a blocked storage %s leaves the live introduction and report usable',
  failure => {
    const denied = () => {
      throw new Error('Storage unavailable');
    };
    if (failure === 'property') {
      jest.spyOn(window, 'localStorage', 'get').mockImplementation(denied);
    } else {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
    }
    const view = render(tree());
    expect(screen.getByText('Known potential issues:')).toBeInTheDocument();
    expect(screen.getByText('Report content')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close alert'));
    expect(
      screen.queryByText('Known potential issues:')
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /show introduction/i}));
    expect(screen.getByText('Known potential issues:')).toBeInTheDocument();

    // The mode effect reads the preference again after a successful initial render.
    view.rerender(tree({mode: 'nowcast'}));
    view.rerender(tree());
    expect(screen.getByText('Known potential issues:')).toBeInTheDocument();
    expect(screen.getByText('Report content')).toBeInTheDocument();
  }
);

test('a denied write still dismisses locally, without claiming persistence on remount', () => {
  const write = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {
      throw new Error('Storage full');
    });
  const view = render(tree());
  fireEvent.click(screen.getByLabelText('Close alert'));
  expect(write).toHaveBeenCalledWith(storageKey, 'true');
  expect(screen.queryByText('Known potential issues:')).not.toBeInTheDocument();
  expect(screen.getByText('Report content')).toBeInTheDocument();
  view.unmount();
  render(tree());
  expect(screen.getByText('Known potential issues:')).toBeInTheDocument();
});

test('successful dismissal preserves the existing saved preference and reopen action', () => {
  const view = render(tree());
  fireEvent.click(screen.getByLabelText('Close alert'));
  expect(localStorage.getItem(storageKey)).toBe('true');
  view.unmount();
  render(tree());
  expect(screen.queryByText('Known potential issues:')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: /show introduction/i}));
  expect(screen.getByText('Known potential issues:')).toBeInTheDocument();
});

test('non-live introductions do not use the live preference', () => {
  const read = jest.spyOn(Storage.prototype, 'getItem');
  const write = jest.spyOn(Storage.prototype, 'setItem');
  render(tree({mode: 'regular'}));
  fireEvent.click(screen.getByLabelText('Close alert'));
  expect(read).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
});

test.each([
  ['2022sa', 'www.ecsa.sa.gov.au'],
  ['2022fed', 'results.aec.gov.au'],
  ['2022vic', 'www.vec.vic.gov.au'],
  ['2023nsw', 'vtr.elections.nsw.gov.au'],
  ['2024qld', 'results.elections.qld.gov.au'],
  ['2025wa', 'www.elections.wa.gov.au'],
  ['2025fed', 'results.aec.gov.au'],
  ['2026sa', 'result.ecsa.sa.gov.au'],
])(
  'the final %s introduction links to its electoral commission',
  (code, host) => {
    render(tree({code, mode: 'regular'}));
    const url = new URL(screen.getByRole('link', {name: 'here'}).href);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe(host);
  }
);

test('the Western Australia results link identifies the official 2025 PDF', () => {
  render(tree({code: '2025wa', mode: 'regular'}));
  const url = new URL(screen.getByRole('link', {name: 'here'}).href);
  expect(url.pathname).toContain('SGE2025');
  expect(url.pathname).toMatch(/\.pdf$/);
  expect(screen.getByRole('alert')).toHaveTextContent('here (PDF)');
});

test.each(['2028fed', 'unknown-election', 'toString'])(
  'a live %s report does not promise an unavailable result destination',
  code => {
    render(tree({code}));
    expect(
      screen.queryByText(/View the official results/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/final such forecast/)).not.toBeInTheDocument();
  }
);

test('final live wording remains complete when the stopping stage was not recorded', () => {
  const view = render(tree({code: '2025fed'}));
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This was the final such forecast made for this election, visible for historical purposes only.'
  );
  view.rerender(tree());
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This was the final such forecast made after final results were available'
  );
});
