import {getSeatResultPartyCode, getTcpWinner} from './seatresults.js';

describe('getTcpWinner', () => {
  test.each([
    [{ALP: 45, LNP: 55}, 'LNP'],
    [{LNP: 55, ALP: 45}, 'LNP'],
    [{GRN: 60, ALP: 40}, 'GRN'],
    [{ALP: 40, 'IND*': 60}, 'IND*'],
    [{ALP: 0, LNP: 100}, 'LNP'],
    [{ALP: 50.001, LNP: 49.999}, 'ALP'],
  ])('selects the higher observed share in %j', (tcp, expected) => {
    const before = JSON.stringify(tcp);
    expect(getTcpWinner(tcp)).toBe(expected);
    expect(JSON.stringify(tcp)).toBe(before);
  });

  test.each([
    undefined,
    null,
    {},
    {ALP: 55},
    {ALP: 40, LNP: 35, GRN: 25},
    {ALP: 50, LNP: 50},
    {ALP: NaN, LNP: 45},
    {ALP: Infinity, LNP: 45},
    {ALP: null, LNP: 45},
    {ALP: '55', LNP: 45},
    {ALP: -1, LNP: 101},
    [
      ['ALP', 55],
      ['LNP', 45],
    ],
  ])('does not identify a winner from unavailable or invalid TCP %j', tcp => {
    expect(getTcpWinner(tcp)).toBeNull();
  });
});

test('keeps result categories separate from display labels and party positions', () => {
  const partyAbbr = [
    [9, 'IND'],
    [-2, 'IND'],
    [4, 'GRN'],
    [1, 'LNP'],
  ];
  expect(getSeatResultPartyCode(-2, partyAbbr)).toBe('IND*');
  expect(getSeatResultPartyCode(-3, partyAbbr)).toBe('OTH');
  expect(getSeatResultPartyCode(9, partyAbbr)).toBe('IND');
  expect(getSeatResultPartyCode(4, partyAbbr)).toBe('GRN');
  expect(getSeatResultPartyCode(1, partyAbbr)).toBe('LNP');
  expect(getSeatResultPartyCode(99, partyAbbr)).toBeNull();
});
