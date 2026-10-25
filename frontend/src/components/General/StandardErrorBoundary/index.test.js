import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import StandardErrorBoundary from './index';
import MainContent from '../../MainContent';

const Child = ({fail}) => {
  if (fail) throw new Error('Synthetic display failure');
  return <p>Readable section</p>;
};

let errors;
beforeEach(() => {
  errors = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errors.mockRestore();
});

test('retry renders available data and keeps focus on the surviving landmark', () => {
  const tree = fail => (
    <MainContent title="Example page">
      <StandardErrorBoundary>
        <Child fail={fail} />
      </StandardErrorBoundary>
    </MainContent>
  );
  const view = render(tree(true));
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  view.rerender(tree(false));
  expect(screen.queryByText('Readable section')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: /Try displaying/}));
  expect(screen.getByText('Readable section')).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveFocus();
});

test('a persistent failure stays contained after retry', () => {
  render(
    <StandardErrorBoundary>
      <Child fail />
    </StandardErrorBoundary>
  );
  fireEvent.click(screen.getByRole('button', {name: /Try displaying/}));
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(1);
});

test('route and stable loaded-data identity reset nested boundaries', () => {
  const oldReport = {};
  const newReport = {};
  const tree = (route, report, fail) => (
    <MainContent resetKeys={[route, report]}>
      <StandardErrorBoundary>
        <StandardErrorBoundary>
          <Child fail={fail} />
        </StandardErrorBoundary>
      </StandardErrorBoundary>
    </MainContent>
  );
  const view = render(tree('first', oldReport, true));
  // A normal rerender creates a new keys array but does not change its entries.
  view.rerender(tree('first', oldReport, false));
  expect(screen.queryByText('Readable section')).not.toBeInTheDocument();
  view.rerender(tree('first', newReport, false));
  expect(screen.getByText('Readable section')).toBeInTheDocument();
  view.rerender(tree('first', newReport, true));
  view.rerender(tree('second', newReport, false));
  expect(screen.getByText('Readable section')).toBeInTheDocument();
});

test('local reset keys can recover one section independently', () => {
  const tree = (key, fail) => (
    <StandardErrorBoundary resetKeys={[key]}>
      <Child fail={fail} />
    </StandardErrorBoundary>
  );
  const view = render(tree('first', true));
  view.rerender(tree('second', false));
  expect(screen.getByText('Readable section')).toBeInTheDocument();
});
