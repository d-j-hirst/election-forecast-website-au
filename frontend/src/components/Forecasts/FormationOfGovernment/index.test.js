import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import FormationOfGovernment from './index';

jest.mock('./GovernmentFormationChart', () => () => null);
jest.mock(
  '../../General/ProbStatement',
  () =>
    ({party, prob, outcome}) =>
      `${party} · ${outcome} · ${prob}`
);

test.each([true, false])(
  'expands majority and minority rows for both major parties in probability order (%s)',
  laborFirst => {
    const error = jest.spyOn(console, 'error');
    try {
      const majority = laborFirst ? [60, 20] : [20, 60];
      const forecast = {
        termCode: '2022vic',
        partyAbbr: [
          [0, 'ALP'],
          [1, 'LIB'],
          [-1, 'OTH'],
        ],
        majorityWinPc: [
          [0, majority[0]],
          [1, majority[1]],
        ],
        minorityWinPc: [
          [0, 3],
          [1, 5],
        ],
        mostSeatsWinPc: [
          [0, 1],
          [1, 2],
        ],
        overallWinPc: [
          [0, majority[0] + 3],
          [1, majority[1] + 5],
        ],
      };
      render(<FormationOfGovernment forecast={forecast} />);
      const buttons = screen.getAllByRole('button', {name: /Show detail/});
      fireEvent.click(buttons[0]);
      const first = laborFirst ? 0 : 1;
      expect(
        screen.getByText(
          new RegExp(first + ' · have a majority · ' + majority[first])
        )
      ).toBeInTheDocument();
      fireEvent.click(buttons[1]);
      expect(
        screen.getByText(
          new RegExp(1 - first + ' · have a majority · ' + majority[1 - first])
        )
      ).toBeInTheDocument();
      expect(error.mock.calls.flat().join(' ')).not.toMatch(
        /Failed prop type|Invalid prop/
      );
    } finally {
      error.mockRestore();
    }
  }
);
