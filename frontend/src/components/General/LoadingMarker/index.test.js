import React from 'react';
import {render, screen} from '@testing-library/react';
import LoadingMarker from './index';

test('the loading status contains its visible message and decorative spinner', () => {
  const view = render(<LoadingMarker />);
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent('Loading report');
  expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  view.rerender(<LoadingMarker text="Loading archive list" />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading archive list');
  expect(screen.getAllByRole('status')).toHaveLength(1);
});
