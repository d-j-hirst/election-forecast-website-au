import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import App from './app';
import {getDirect} from 'utils/sdk';

// Route checks never contact a backend or payment service. Pending replies keep
// data pages in their legitimate loading state while exercising the real shell.
jest.mock('utils/sdk', () => ({
  getDirect: jest.fn(() => new Promise(() => {})),
}));
jest.mock('config/donations', () => ({DONATIONS_ENABLED: false}));

const open = path => {
  window.history.replaceState({}, '', path);
  return render(<App />);
};

beforeEach(() => {
  localStorage.clear();
  getDirect.mockImplementation(() => new Promise(() => {}));
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  window.scrollTo.mockRestore();
});

test.each([
  '/not-a-page',
  '/forecast/2026vic',
  '/seat/2026vic/regular',
  '/archive/2026vic',
])('unknown path %s is retained with explicit recovery links', path => {
  open(path);
  expect(window.location.pathname).toBe(path);
  expect(
    screen.getByRole('heading', {level: 1, name: 'Page not found'})
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', {name: 'Browse current forecasts'})
  ).toHaveAttribute('href', '/forecast/2026vic/regular');
  expect(
    screen.getByRole('link', {name: 'Browse forecast archives'})
  ).toHaveAttribute('href', '/forecast/2026vic/archives');
  expect(getDirect).not.toHaveBeenCalled();
});

test.each(['NaN', '-1', '0', '1.5', 'Infinity', '9007199254740993'])(
  'invalid archive ID %s never reaches a loader',
  id => {
    for (const suffix of ['', '/seat/alpha']) {
      const view = open(`/archive/2025fed/${id}${suffix}`);
      expect(
        screen.getByRole('heading', {name: 'Page not found'})
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', {name: 'Browse forecast archives'})
      ).toHaveAttribute('href', '/forecast/2025fed/archives');
      expect(getDirect).not.toHaveBeenCalled();
      view.unmount();
    }
  }
);

test.each(['/forecast/2026vic/invalid', '/seat/2026vic/invalid/alpha'])(
  'invalid mode at %s never reaches a loader',
  path => {
    open(path);
    expect(
      screen.getByRole('heading', {name: 'Page not found'})
    ).toBeInTheDocument();
    expect(getDirect).not.toHaveBeenCalled();
  }
);

test.each(['/', '/forecast'])(
  'intentional default entry %s still redirects',
  path => {
    open(path);
    expect(window.location.pathname).toBe('/forecast/2026vic/regular');
    expect(getDirect).toHaveBeenCalledWith(
      'forecast-api/election-summary/2026vic/regular'
    );
  }
);

test('the legacy methodology route still reaches Methods', () => {
  open('/methodology');
  expect(window.location.pathname).toBe('/methods');
  expect(
    screen.getByRole('heading', {level: 1, name: 'Methods'})
  ).toBeInTheDocument();
});

test.each([
  '/forecast/2026vic/regular',
  '/forecast/2026vic/nowcast',
  '/forecast/2025fed/live',
  '/forecast/2026vic/archives',
  '/seat/2026vic/regular/alpha',
  '/archive/2026vic/42',
  '/archive/2026vic/42/seat/alpha',
  '/guide',
  '/glossary',
  '/methods',
  '/commentary',
  '/commentary/42',
  '/about',
  '/support',
])(
  'public route %s has a stable landmark, page heading and external footer',
  path => {
    open(path);
    expect(window.location.pathname).toBe(path);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getAllByRole('heading', {level: 1})).toHaveLength(1);
    expect(main.contains(screen.getByRole('contentinfo'))).toBe(false);
    expect(
      screen.getByRole('link', {name: 'Skip to main content'})
    ).toHaveAttribute('href', '#main-content');
    if (/^\/(forecast|seat|archive)\//.test(path)) {
      expect(screen.getByRole('link', {name: 'Forecasts'})).toHaveAttribute(
        'aria-current',
        'true'
      );
    }
  }
);

test('client page navigation focuses the actual new content', () => {
  open('/guide');
  const about = screen.getByRole('link', {name: 'About'});
  about.focus();
  fireEvent.click(about);
  expect(window.location.pathname).toBe('/about');
  expect(screen.getByRole('main')).toHaveFocus();
});

test.each([
  ['/forecast/2026vic/nowcast', 'Nowcast', 'page', 'nowcast'],
  ['/seat/2026vic/nowcast/alpha', 'Nowcast', 'true', 'nowcast'],
  ['/forecast/2025fed/live', 'Live', 'page', 'regular'],
  ['/seat/2025fed/live/alpha', 'Live', 'true', 'regular'],
])(
  'navigation reflects %s while data is still loading',
  (path, name, current, switchMode) => {
    open(path);
    expect(screen.getByRole('link', {name, exact: true})).toHaveAttribute(
      'aria-current',
      current
    );
    expect(screen.getByRole('link', {name: 'New South Wales'})).toHaveAttribute(
      'href',
      `/forecast/2027nsw/${switchMode}`
    );
  }
);
