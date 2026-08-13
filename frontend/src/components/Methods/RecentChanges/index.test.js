import React from 'react';

import {fireEvent, render, screen} from '@testing-library/react';

import RecentMethodsChanges from './index.js';

const changes = [
  {
    date: '2026-06-01',
    title: 'Older method change',
    shortDescription: 'Older short description',
    longDescription: ['Older first paragraph.', 'Older second paragraph.'],
  },
  {
    date: '2026-07-01',
    title: 'Newer method change',
    shortDescription: 'Newer short description',
    longDescription: ['Newer paragraph.'],
  },
];

describe('RecentMethodsChanges', () => {
  test('renders all changes newest-first with every paragraph', () => {
    render(<RecentMethodsChanges changes={changes} />);

    const strongText = screen.getAllByText(/2026|method change/, {
      selector: 'strong',
    });
    expect(strongText[0]).toHaveTextContent('1 July 2026: Newer method change');
    expect(strongText[1]).toHaveTextContent('1 June 2026: Older method change');
    expect(screen.getByText('Older first paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Older second paragraph.')).toBeInTheDocument();
  });

  test('keeps the heading available while hiding and showing entries', () => {
    render(<RecentMethodsChanges changes={changes} />);

    fireEvent.click(screen.getByRole('button', {name: 'hide'}));
    expect(screen.getByText('Recent major methods changes')).toBeInTheDocument();
    expect(screen.queryByText('Newer paragraph.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'show'}));
    expect(screen.getByText('Newer paragraph.')).toBeInTheDocument();
  });

  test('renders nothing when no changes are published', () => {
    const {container} = render(<RecentMethodsChanges changes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
