import React from 'react';

import {fireEvent, render, screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';

import MethodsChangesAlert from './index.js';

const makeChange = (date, title) => ({
  date,
  title,
  shortDescription: `${title} short description.`,
  longDescription: [`${title} long description.`],
});

const renderAlert = props =>
  render(
    <BrowserRouter>
      <MethodsChangesAlert
        changes={props.changes}
        isArchive={props.isArchive}
        mode="regular"
        now={new Date(2026, 6, 18, 12)}
        reportDate="2026-07-18T10:00:00Z"
      />
    </BrowserRouter>
  );

describe('MethodsChangesAlert', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('shows applicable changes and links to their full details', () => {
    renderAlert({changes: [makeChange('2026-07-10', 'Current change')]});

    expect(screen.getByText('10 July 2026:')).toBeInTheDocument();
    expect(
      screen.getByText('Current change short description.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/methods#recent-methods-changes'
    );
  });

  test('persists dismissal and reappears when a new change is added', () => {
    const firstChange = makeChange('2026-07-10', 'First change');
    const {unmount} = renderAlert({changes: [firstChange]});

    fireEvent.click(screen.getByLabelText('Close alert'));
    expect(
      screen.queryByText(/following recent major methods changes/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /show recent major methods changes/i})
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {name: /show recent major methods changes/i})
    );
    expect(
      screen.getByText(/following recent major methods changes/i)
    ).toBeInTheDocument();
    unmount();

    const sameChanges = renderAlert({changes: [firstChange]});
    expect(
      screen.queryByText(/following recent major methods changes/i)
    ).not.toBeInTheDocument();
    sameChanges.unmount();

    renderAlert({
      changes: [firstChange, makeChange('2026-07-15', 'New change')],
    });
    expect(
      screen.getByText(/First change short description/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/New change short description/)
    ).toBeInTheDocument();
  });

  test('does not render on archived forecasts', () => {
    const {container} = renderAlert({
      changes: [makeChange('2026-07-10', 'Archived change')],
      isArchive: true,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
