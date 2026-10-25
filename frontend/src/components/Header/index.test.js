import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Header from './index';
import ForecastsNav from '../Forecasts/Nav';
import MainContent from '../MainContent';

const shell = (width = 320, election = '2026vic', mode = 'regular') => (
  <MemoryRouter initialEntries={[`/forecast/${election}/${mode}`]}>
    <Header windowWidth={width} page="forecast" />
    <ForecastsNav election={election} mode={mode} />
    <MainContent title="Example">Content</MainContent>
  </MemoryRouter>
);

test('each collapsed menu names a unique panel and announces its own state', () => {
  render(shell());
  const panels = new Set();
  for (const name of ['pages', 'elections', 'modes']) {
    const button = screen.getByRole('button', {name: `Toggle ${name}`});
    const panelId = button.getAttribute('aria-controls');
    expect(document.querySelectorAll(`#${panelId}`)).toHaveLength(1);
    panels.add(panelId);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  }
  expect(panels.size).toBe(3);
  expect(screen.getAllByRole('navigation')).toHaveLength(3);
});

test('mode selection collapses its menu without changing another group', () => {
  render(shell());
  const modes = screen.getByRole('button', {name: 'Toggle modes'});
  const elections = screen.getByRole('button', {name: 'Toggle elections'});
  fireEvent.click(modes);
  fireEvent.click(elections);
  fireEvent.click(screen.getByRole('link', {name: 'Nowcast'}));
  expect(modes).toHaveAttribute('aria-expanded', 'false');
  expect(elections).toHaveAttribute('aria-expanded', 'true');
});

test('current section, election and exact mode page have appropriate current semantics', () => {
  render(shell(1200));
  expect(screen.getByRole('link', {name: 'Forecasts'})).toHaveAttribute(
    'aria-current',
    'true'
  );
  expect(screen.getByRole('link', {name: 'Victoria'})).toHaveAttribute(
    'aria-current',
    'true'
  );
  const mode = within(screen.getByRole('navigation', {name: 'Modes'}))
    .getAllByRole('link')
    .find(link => link.getAttribute('href').endsWith('/regular'));
  expect(mode).toHaveAttribute('aria-current', 'page');
});

test('the selected past election is named when its dropdown is closed', () => {
  render(shell(1200, '2025fed', 'regular'));
  const dropdown = screen.getByRole('button', {
    name: /Past Elections\s*:\s*2025 Federal selected/,
  });
  fireEvent.click(dropdown);
  expect(screen.getByRole('link', {name: '2025 Federal'})).toHaveAttribute(
    'aria-current',
    'true'
  );
});

test.each([320, 575, 576, 767, 768, 939, 940, 1280])(
  'global destinations and skip target remain present at width %s',
  width => {
    render(shell(width));
    const pages = screen.getByRole('navigation', {name: 'Pages'});
    expect(within(pages).getAllByRole('link')).toHaveLength(6);
    expect(
      screen.getByRole('link', {name: 'Skip to main content'})
    ).toHaveAttribute('href', '#main-content');
    expect(document.getElementById('main-content')).toHaveAttribute(
      'tabindex',
      '-1'
    );
    expect(!!screen.queryByRole('button', {name: 'Toggle pages'})).toBe(
      width < 940
    );
  }
);

test.each([
  ['live', 'regular'],
  ['other', 'regular'],
  ['', 'regular'],
  ['nowcast', 'nowcast'],
  ['archives', 'archives'],
])(
  'switching election from %s preserves the existing %s policy',
  (mode, destination) => {
    render(shell(1200, '2025fed', mode));
    expect(screen.getByRole('link', {name: 'Victoria'})).toHaveAttribute(
      'href',
      `/forecast/2026vic/${destination}`
    );
    expect(screen.getByRole('link', {name: 'Live'})).toBeInTheDocument();
    if (mode === 'other') {
      const modes = screen.getByRole('navigation', {name: 'Modes'});
      expect(modes.querySelector('[aria-current]')).toBeNull();
    }
  }
);
