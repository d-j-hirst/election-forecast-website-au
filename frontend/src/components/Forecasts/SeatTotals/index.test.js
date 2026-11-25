import React from 'react';
import {render, screen, within} from '@testing-library/react';
import SeatTotals from './index';

test('keeps Emerging Parties visible as the last projected seat disappears', () => {
  const zeros = Array(15).fill(0);
  const view = emergingSeats => (
    <SeatTotals
      election="2022vic"
      results={null}
      windowWidth={800}
      forecast={{
        termCode: '2022vic',
        partyName: [
          [-3, 'Emerging Party'],
          [-1, 'Others'],
          [0, 'Labor'],
        ],
        partyAbbr: [
          [-3, 'OTH'],
          [-1, 'OTH'],
          [0, 'ALP'],
        ],
        voteTotalThresholds: [
          0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5, 99.9,
        ],
        seatCountFrequencies: [
          [-3, emergingSeats],
          [-1, zeros],
          [0, Array(15).fill(54)],
        ],
      }}
    />
  );
  // The first and last emerging-party distributions in the 2022 Victorian replay.
  const {rerender} = render(view([...zeros.slice(0, 13), 1, 3]));
  expect(screen.getByText('???')).toBeInTheDocument();
  rerender(view(zeros));
  const row = screen.getByText('???').closest('.list-group-item');
  expect(within(row).getAllByText('0')).toHaveLength(3);
  expect(screen.queryByText('OTH')).not.toBeInTheDocument();
});
