import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Commentary from './Commentary';

const divider = '[[AEF_RULE_BASED_COMMENTARY_V1]]\n';
const trial = {
  status: 'complete',
  format: 'seat-bullets-v1',
  entities: {'{seat:Light}': {kind: 'seat', label: 'Light', seat: 'Light'}},
  text: {
    summary: 'Key changes:\n- Original headline.',
    developments: [
      {seats: ['Light'], text: 'In {seat:Light}:\n- Original detail.'},
      {seats: [], text: divider + 'Key changes:\n- Rule-based headline.'},
      {
        seats: ['Light'],
        text: 'In {seat:Light}:\n- Rule-based detail **58%**.',
      },
    ],
  },
};
function page(item, period = 'previous') {
  return (
    <MemoryRouter>
      <Commentary
        item={item}
        period={period}
        code="2026sa"
        seatLink={seat => '/replay/seat/' + seat.toLowerCase()}
      />
    </MemoryRouter>
  );
}

beforeEach(() => localStorage.clear());

test('quiet historical and current highlights use the same unheaded notice', () => {
  const archived =
    'Counting was updated with little change in the projected winners.';
  const quiet =
    'There were no significant changes to the results since the previous forecast.';
  const item = summary => ({
    status: 'complete',
    source: 'local',
    format: 'seat-bullets-v1',
    text: {summary, developments: []},
  });
  const view = render(page(item(archived)));
  expect(screen.getByText(quiet).tagName).toBe('P');
  view.rerender(page(item(quiet)));
  expect(screen.getByText(quiet).tagName).toBe('P');
  expect(screen.queryByText('Counting update')).toBeNull();
  view.rerender(page(item(archived), 'since_start'));
  expect(
    screen.getByText(
      'There were no significant changes to the results since counting began.'
    )
  ).toBeInTheDocument();
  view.rerender(
    page(item('No new counting occurred since the previous forecast.'))
  );
  expect(
    screen.getByText('No new counting occurred since the previous forecast.')
  ).toBeInTheDocument();
});

test('switching writers preserves formatting and the choice across windows and older reports', () => {
  const view = render(page(trial));
  expect(screen.getByRole('button', {name: 'AI commentary'})).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  expect(screen.getByText('Original detail.')).toBeInTheDocument();
  expect(screen.queryByText('Rule-based headline.')).toBeNull();
  fireEvent.click(screen.getByRole('button', {name: 'Rule-based commentary'}));
  expect(
    screen.getByRole('button', {name: 'Rule-based commentary'})
  ).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Rule-based headline.')).toBeInTheDocument();
  expect(screen.getByText('58%').tagName).toBe('STRONG');
  expect(screen.getByRole('link', {name: 'Light'})).toHaveAttribute(
    'href',
    '/replay/seat/light'
  );
  expect(screen.queryByText('Original detail.')).toBeNull();
  expect(screen.queryByText(/large language model|AEF_RULE_BASED/)).toBeNull();

  view.rerender(
    page({
      status: 'complete',
      source: 'local',
      text: {summary: 'No new counting.'},
    })
  );
  expect(screen.getByText('No new counting.')).toBeInTheDocument();
  expect(screen.queryByRole('group', {name: 'Commentary writer'})).toBeNull();
  view.unmount();
  render(page(trial));
  expect(screen.getByText('Rule-based headline.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'AI commentary'}));
  expect(screen.getByText('Original headline.')).toBeInTheDocument();
  expect(screen.getByText(/large language model/)).toBeInTheDocument();
});

test('an unavailable AI edition can still carry a rule-written report', () => {
  render(page({...trial, status: 'unavailable', reason: 'Deadline reached.'}));
  expect(screen.queryByText(/AI commentary unavailable/)).toBeNull();
  expect(
    screen.queryByRole('heading', {name: 'Rule-based commentary'})
  ).toBeNull();
  expect(screen.getByText('Rule-based headline.')).toBeInTheDocument();
  expect(screen.queryByRole('group', {name: 'Commentary writer'})).toBeNull();
  expect(
    screen.queryByText(/Original headline|large language model|AEF_RULE_BASED/)
  ).toBeNull();
});
