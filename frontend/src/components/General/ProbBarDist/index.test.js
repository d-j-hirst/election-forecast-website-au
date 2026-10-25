import React from 'react';
import {render} from '@testing-library/react';
import ProbBarDist from './index';

const thresholds = Array.from({length: 7}, (_, i) => [i * 2, i * 2 + 2, i]);
const levels = [
  0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 75, 90, 95, 97.5, 99, 99.5, 99.9,
];
const base = {
  thresholds,
  thresholdLevels: levels,
  partyAbbr: 'ALP',
  pluralNoun: 'vote totals',
  valType: 'percentage',
  width: 220,
};

// Inspect the actual rendered pixel coordinates, including the full result
// caps, rather than relying on JSDOM's unavailable layout measurements.
const expectContained = container => {
  const chart = container.firstChild;
  const width = parseFloat(chart.style.width);
  expect(chart.children.length).toBeGreaterThan(0);
  for (const child of chart.children) {
    const left = parseFloat(child.style.left);
    const childWidth = parseFloat(child.style.width);
    expect(Number.isFinite(left)).toBe(true);
    expect(Number.isFinite(childWidth)).toBe(true);
    expect(left).toBeGreaterThanOrEqual(0);
    expect(childWidth).toBeGreaterThan(0);
    expect(left + childWidth).toBeLessThanOrEqual(width);
  }
};

test.each([0, 50, 100])(
  'renders a point distribution and result at %s',
  value => {
    const {container} = render(
      <ProbBarDist
        {...base}
        freqSet={[0, Array(15).fill(value)]}
        minVoteTotal={value}
        maxVoteTotal={value}
        result={value}
      />
    );
    expectContained(container);
    expect(
      container.querySelectorAll('[style*="background-color: black"]').length
    ).toBe(3);
  }
);

test.each([0, 20, 80, 100])(
  'keeps an outlying observed %s inside the chart',
  result => {
    const {container} = render(
      <ProbBarDist
        {...base}
        freqSet={[0, Array(15).fill(50)]}
        minVoteTotal={49}
        maxVoteTotal={51}
        result={result}
      />
    );
    expectContained(container);
  }
);

test.each([0, 1, 150])(
  'keeps inclusive integer bars inside at %s seats',
  value => {
    const {container} = render(
      <ProbBarDist
        {...base}
        valType="integer"
        adjust={true}
        freqSet={[0, Array(15).fill(value)]}
        minVoteTotal={0}
        maxVoteTotal={value}
        result={value}
      />
    );
    expectContained(container);
  }
);

test.each([null, undefined, NaN, Infinity])(
  'does not draw a missing or nonfinite result: %s',
  result => {
    const {container} = render(
      <ProbBarDist
        {...base}
        freqSet={[0, Array(15).fill(50)]}
        minVoteTotal={49}
        maxVoteTotal={51}
        result={result}
      />
    );
    expectContained(container);
    expect(
      container.querySelector('[style*="background-color: black"]')
    ).toBeNull();
  }
);

test.each(
  [[], [0], Array(15).fill(null), Array(15).fill(NaN)].map(values => [values])
)(
  'does not manufacture bars for incomplete or invalid percentiles',
  frequencies => {
    const {container} = render(
      <ProbBarDist
        {...base}
        freqSet={[0, frequencies]}
        minVoteTotal={0}
        maxVoteTotal={0}
        result={null}
      />
    );
    expect(container).toBeEmptyDOMElement();
  }
);
