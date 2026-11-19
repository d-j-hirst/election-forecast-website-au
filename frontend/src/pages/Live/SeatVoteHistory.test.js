import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import SeatHistory from './SeatHistory';

// Supply the viewport that jsdom lacks, while exercising the chart library's
// actual SVG paths so a future interpolation change cannot silently bridge a gap.
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({children}) =>
    require('react').cloneElement(children, {width: 640, height: 280}),
}));

const ada = [0, 'Ada'];
const bill = [1, 'Bill'];
const cora = [2, 'Cora'];
const ab = [
  [ada, bill],
  [480, 500, 520],
];
const ac = [
  [ada, cora],
  [540, 560, 580],
];
const bc = [
  [bill, cora],
  [400, 420, 440],
];
const parties = {0: 'A', 1: 'B', 2: 'C'};
const snapshots = groups =>
  groups.map((g, i) => ['2026-03-21T09:0' + i + ':00Z', [], [], g]);

const choose = (toggle, option) => {
  fireEvent.click(screen.getByRole('button', {name: toggle}));
  fireEvent.click(screen.getByRole('button', {name: option}));
};

const voteTicks = container =>
  [
    ...container.querySelectorAll(
      '.recharts-yAxis .recharts-cartesian-axis-tick-value'
    ),
  ].map(tick => tick.textContent);
const gridLines = container => [
  ...container.querySelectorAll('.recharts-cartesian-grid-horizontal line'),
];
const paintedBefore = (earlier, later) =>
  Boolean(
    earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING
  );

test('current pairings select conditional TCP histories with visible gaps in line and band', () => {
  const points = snapshots([[ac, bc], [ac], [], [ac], [ab, ac]]);
  const tcpScenarios = [
    [[1, 0], 0.38],
    [[0, 2], 0.215],
  ];
  const view = render(
    <SeatHistory
      points={points}
      parties={parties}
      zone="UTC"
      tcpScenarios={tcpScenarios}
    />
  );
  choose('Display: Win probability', 'Two-candidate preferred vote');
  expect(
    screen.getByText(
      '38.0% of simulations in the current forecast reach this pairing.'
    )
  ).toBeInTheDocument();
  const selector = screen.getByRole('button', {name: /^Final pairing:/});
  fireEvent.click(selector);
  const dropdown = within(selector.parentElement);
  expect(dropdown.getAllByRole('button')).toHaveLength(3);
  expect(
    dropdown.queryByRole('button', {name: 'Bill (B) / Cora (C)'})
  ).toBeNull();
  fireEvent.click(
    dropdown.getByRole('button', {name: 'Ada (A) / Cora (C) (21.5%)'})
  );
  expect(
    screen.getByText(
      '21.5% of simulations in the current forecast reach this pairing.'
    )
  ).toBeInTheDocument();
  expect(voteTicks(view.container)).toEqual([
    '52%',
    '54%',
    '56%',
    '58%',
    '60%',
  ]);
  expect(gridLines(view.container)).toHaveLength(5);
  const band = view.container.querySelector('.recharts-area');
  const grid = view.container.querySelector('.recharts-cartesian-grid');
  const median = view.container.querySelector('.recharts-line');
  expect(paintedBefore(band, grid)).toBe(true);
  expect(paintedBefore(grid, median)).toBe(true);
  expect(view.container.querySelector('.recharts-reference-line')).toBeNull();
  for (const path of ['.recharts-line-curve', '.recharts-area-area']) {
    const d = view.container.querySelector(path).getAttribute('d');
    expect(d.match(/M/g)).toHaveLength(2);
  }
  view.rerender(
    <SeatHistory
      points={snapshots([[ac], [ab]])}
      parties={parties}
      zone="UTC"
      tcpScenarios={tcpScenarios}
    />
  );
  expect(selector).toHaveTextContent(
    'Final pairing: Ada (A) / Bill (B) (38.0%)'
  );
  expect(voteTicks(view.container)).toEqual([
    '46%',
    '48%',
    '50%',
    '52%',
    '54%',
  ]);
  const majority = view.container.querySelector('.recharts-reference-line');
  expect(majority.querySelector('line').getAttribute('y1')).toBe(
    gridLines(view.container)[2].getAttribute('y1')
  );
  expect(
    paintedBefore(majority, view.container.querySelector('.recharts-line'))
  ).toBe(true);
  expect(
    view.container.querySelectorAll('.recharts-errorBar line')
  ).toHaveLength(3);
});

test('FP history omits zero-only emerging categories and keeps named candidates', () => {
  const points = [
    [
      '2026-03-21T09:00:00Z',
      [],
      [
        [
          [0, 'Former candidate'],
          [150, 200, 250],
        ],
        [
          [-2, null],
          [0, 0, 10],
        ],
        [
          [-3, null],
          [0, 0, 0],
        ],
      ],
      [],
    ],
    [
      '2026-03-21T09:01:00Z',
      [],
      [
        [ada, [0, 0, 0]],
        [
          [-2, null],
          [0, 0, 0],
        ],
        [
          [-3, null],
          [0, 0, 0],
        ],
      ],
      [],
    ],
  ];
  const view = render(
    <SeatHistory points={points} parties={parties} zone="UTC" />
  );
  choose('Display: Win probability', 'First preference vote');
  const selector = screen.getByRole('button', {name: 'Candidate: Ada (A)'});
  fireEvent.click(selector);
  expect(
    within(selector.parentElement)
      .getAllByRole('button')
      .map(x => x.textContent)
  ).toEqual(['Candidate: Ada (A)', 'Ada (A)', 'Emerging independent']);
  expect(view.container.querySelectorAll('.recharts-line-dot')).toHaveLength(1);
  expect(voteTicks(view.container)).toEqual(['0%', '2%']);

  view.rerender(
    <SeatHistory points={points.slice(1)} parties={parties} zone="UTC" />
  );
  expect(
    within(selector.parentElement)
      .getAllByRole('button')
      .map(x => x.textContent)
  ).toEqual(['Candidate: Ada (A)', 'Ada (A)']);
});

test.each([
  [
    [127, 240, 349],
    ['10%', '15%', '20%', '25%', '30%', '35%', '40%'],
  ],
  [
    [17, 240, 464],
    ['0%', '10%', '20%', '30%', '40%', '50%'],
  ],
])(
  'FP history uses evenly spaced gridlines for interval %j',
  (band, expected) => {
    const points = [0, 1].map(i => [
      '2026-03-21T09:0' + i + ':00Z',
      [],
      [[ada, band]],
      [],
    ]);
    const {container} = render(
      <SeatHistory points={points} parties={parties} zone="UTC" />
    );
    choose('Display: Win probability', 'First preference vote');
    expect(voteTicks(container)).toEqual(expected);
    expect(gridLines(container)).toHaveLength(expected.length);
    const positions = gridLines(container).map(line =>
      Number(line.getAttribute('y1'))
    );
    const spacing = positions[0] - positions[1];
    for (let i = 1; i < positions.length; i += 1) {
      expect(positions[i - 1] - positions[i]).toBeCloseTo(spacing);
    }
  }
);

test('win history has its own legend below the chart and switches between time and date ticks', () => {
  const points = [
    [
      '2026-03-21T09:00:00Z',
      [
        [0, 'Ada', 9997],
        [-2, null, 3],
        [-3, null, 0],
      ],
    ],
    [
      '2026-03-21T10:00:00Z',
      [
        [0, 'Ada', 9999],
        [-2, null, 1],
        [-3, null, 0],
      ],
    ],
    [
      '2026-03-22T15:00:00Z',
      [
        [0, 'Ada', 9999],
        [-2, null, 0],
        [-3, null, 1],
      ],
    ],
  ];
  const view = render(
    <SeatHistory points={points} parties={parties} zone="UTC" />
  );
  const legend = screen.getByRole('list', {name: 'Win probability legend'});
  const chart = view.container.querySelector('.recharts-wrapper');
  expect(chart.contains(legend)).toBe(false);
  expect(
    chart.compareDocumentPosition(legend) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(within(legend).getByText('Ada (A)')).toBeInTheDocument();
  expect(within(legend).getByText('Emerging independent')).toBeInTheDocument();
  expect(within(legend).queryByText('Emerging party')).toBeNull();
  expect(view.container.querySelector('.recharts-yAxis')).toHaveTextContent(
    '100%'
  );
  expect(view.container.querySelector('.recharts-xAxis')).toHaveTextContent(
    /\d{2}:\d{2}/
  );

  choose('Display: Election night only', 'Include late counting');
  expect(within(legend).getByText('Emerging party')).toBeInTheDocument();
  expect(view.container.querySelector('.recharts-xAxis')).toHaveTextContent(
    /Mar/
  );
});
