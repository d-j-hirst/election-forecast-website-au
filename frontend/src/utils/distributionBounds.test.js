import {distributionBounds} from './distributionBounds';

test('includes results outside either end of a shared forecast range', () => {
  expect(
    distributionBounds(
      [
        [49, 50, 51],
        [49, 50, 51],
      ],
      [20, 80]
    )
  ).toEqual({
    minVoteTotal: 20,
    maxVoteTotal: 80,
  });
});

test.each([0, 50, 100])(
  'keeps a point at %s finite and within percentage limits',
  value => {
    const {minVoteTotal, maxVoteTotal} = distributionBounds([[value, value]]);
    expect(minVoteTotal).toBeGreaterThanOrEqual(0);
    expect(maxVoteTotal).toBeLessThanOrEqual(100);
    expect(minVoteTotal).toBeLessThanOrEqual(value);
    expect(maxVoteTotal).toBeGreaterThanOrEqual(value);
    expect(maxVoteTotal).toBeGreaterThan(minVoteTotal);
  }
);

test('includes half-seat visual boundaries on a common zero-based scale', () => {
  expect(
    distributionBounds(
      [
        [10, 20],
        [5, 10],
      ],
      [30, 0],
      {
        includeZero: true,
        integer: true,
      }
    )
  ).toEqual({minVoteTotal: 0, maxVoteTotal: 30.5});
});

test('preserves zero observations while ignoring absent and nonfinite values', () => {
  expect(
    distributionBounds([[40, 50]], [null, undefined, NaN, Infinity])
  ).toEqual({
    minVoteTotal: 40,
    maxVoteTotal: 50,
  });
  expect(distributionBounds([[40, 50]], [0])).toEqual({
    minVoteTotal: 0,
    maxVoteTotal: 50,
  });
});

test('empty groups have finite bounds without creating any data', () => {
  const data = [[], []];
  expect(distributionBounds(data)).toEqual({minVoteTotal: 0, maxVoteTotal: 1});
  expect(data).toEqual([[], []]);
});
