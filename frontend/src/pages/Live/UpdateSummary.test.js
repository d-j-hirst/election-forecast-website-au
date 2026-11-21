import React from 'react';
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import UpdateSummary from './UpdateSummary';

beforeEach(() => localStorage.clear());

const choose = (toggle, option) => {
  fireEvent.click(screen.getByRole('button', {name: toggle}));
  fireEvent.click(screen.getByRole('button', {name: option}));
};

test('Numbers is the default and Text preserves the selected period and labels generated commentary', () => {
  const comparison = {
    available: true,
    reference_forecast_id: 'origin',
    win_changes: [],
  };
  const previous = {
    status: 'complete',
    entities: {
      '{seat:Alpha}': {
        kind: 'seat',
        seat: 'Alpha',
        label: 'Alpha',
        holder_party: 'LIB',
        holder_margin: 20.299999237060547,
      },
      '{seat:Beta}': {
        kind: 'seat',
        seat: 'Beta',
        label: 'Beta',
        holder_party: 'ALP',
        holder_margin: 0,
      },
    },
    text: {
      summary:
        'In {seat:Alpha}, support reached **54%**. See also {seat:Beta}. <script>plain text</script>',
      developments: [],
    },
  };
  const old = {
    status: 'complete',
    text: {
      developments: [
        {
          seat: 'Alpha',
          explanation: 'The forecast moved.',
          facts: [{metric_id: 'm', value: 55}],
        },
      ],
    },
    metrics: {m: {path: 'after', context_id: 'c'}},
    metric_contexts: {
      c: {quantity: 'percent', identity: {name: 'Candidate A'}},
    },
  };
  const data = {
    run: {election: '2026sa', timezone: 'Australia/Adelaide'},
    report: {},
    schedule: {},
    source_time: '2026-03-21T09:03:00Z',
    yesterday: {pending: true},
    windows: {
      previous: {comparison, commentary: previous},
      today: {comparison, commentary: old},
      since_start: {
        comparison,
        commentary: {
          status: 'complete',
          source: 'local',
          text: {summary: 'No new counting.'},
        },
      },
    },
  };
  const page = render(
    <MemoryRouter>
      <UpdateSummary data={data} seatLink={s => '/replay/seat/' + s} />
    </MemoryRouter>
  );
  expect(
    screen.getByRole('button', {name: 'Display: Numbers'})
  ).toBeInTheDocument();
  const headings = () =>
    screen
      .getAllByRole('heading', {level: 3})
      .map(heading => heading.textContent);
  const expectTimestampFirst = () => {
    const timing = screen.getByText(/Pre-count reference to/).parentElement;
    expect(timing).toHaveClass('text-center');
    expect(timing.nextElementSibling).toBe(
      screen.getByRole('heading', {name: 'Counting Progress'})
    );
  };
  expect(headings()).toEqual([
    'Counting Progress',
    'Seat win chance changes',
    'Other updates',
  ]);
  expectTimestampFirst();
  expect(screen.queryByText('54%')).toBeNull();
  expect(screen.queryByText(/large language model/)).toBeNull();

  choose('Display: Numbers', 'Text');
  expect(screen.getByText(/large language model/)).toBeInTheDocument();
  expect(headings()).toEqual(['Counting Progress', 'Commentary']);
  expectTimestampFirst();
  expect(screen.getByText('54%').tagName).toBe('STRONG');
  const seat = screen.getByRole('link', {name: 'Alpha'});
  expect(seat).toHaveAttribute('href', '/replay/seat/Alpha');
  expect(seat.closest('p')).toHaveTextContent(
    'In Alpha (LIB 20.3%), support reached 54%. See also Beta (ALP 0.0%).'
  );
  expect(page.container.querySelector('script')).toBeNull();
  choose('Period: Previous Update', 'Today');
  expect(screen.getByText(/Candidate A after 55 percent/)).toBeInTheDocument();
  choose('Period: Today', 'Since the start');
  expect(screen.getByText('No new counting.')).toBeInTheDocument();
  expect(screen.queryByText(/large language model/)).toBeNull();

  choose('Display: Text', 'Numbers');
  expect(
    screen.getByRole('button', {name: 'Period: Since the start'})
  ).toBeInTheDocument();
  expect(screen.getByText('Seat win chance changes')).toBeInTheDocument();
  expect(screen.queryByText('No new counting.')).toBeNull();

  fireEvent.click(
    screen.getByRole('button', {name: 'Period: Since the start'})
  );
  expect(
    screen.queryByRole('button', {name: 'Yesterday’s results'})
  ).toBeNull();
});

test('count progress, ranked candidates and election movement render with local-only diagnostics', () => {
  const rows = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map(
    (seat, index) => ({
      seat,
      party_id: '0',
      before: 40,
      after: 50 - index,
      change_pp: 10 - index,
      identity: {party: 'ALP', name: `${seat} Candidate`},
    })
  );
  rows.push({
    seat: 'Beta',
    party_id: '1',
    before: 22,
    after: 20,
    change_pp: -2,
    identity: {party: 'LIB', name: 'Another Candidate'},
  });
  const before = {
    overallWinPc: {0: 60, 1: 35},
    majorityWinPc: {0: 40, 1: 35, 2: 1},
    minorityWinPc: {0: 15},
    mostSeatsWinPc: {0: 5, 2: 2},
    tpp_percentiles: {50: 53},
    fp_percentiles_by_party: {0: {50: 40.002}, 1: {50: 30}, 2: {50: 3}},
    expectedSeats: {0: 24.001, 1: 19.9},
  };
  const after = {
    ...before,
    majorityWinPc: {0: 42, 1: 35, 2: 2},
    minorityWinPc: {0: 13},
    tpp_percentiles: {50: 53.4},
    fp_percentiles_by_party: {0: {50: 40.004}, 1: {50: 30.31}},
    expectedSeats: {0: 24.003, 1: 19.87},
  };
  const data = {
    run: {election: '2026sa', timezone: 'Australia/Adelaide'},
    report: {
      partyAbbr: [
        [0, 'ALP'],
        [1, 'LIB'],
        [2, 'ON'],
      ],
      countProgress: {
        fp_votes: 4500,
        tcp_votes: 1275,
        expected_formal_votes: 9999.998,
      },
    },
    schedule: {},
    windows: {
      previous: {
        comparison: {
          available: true,
          reference_forecast_id: 'f00000001',
          win_changes: rows,
          win_change_totals: {
            Beta: 30,
            Alpha: 20,
            Gamma: 15,
            Delta: 12,
            Epsilon: 9,
            Zeta: 8,
          },
          statewide: {before, after},
        },
      },
    },
  };
  const display = data => (
    <MemoryRouter>
      <UpdateSummary data={data} seatLink={seat => '/replay/seat/' + seat} />
    </MemoryRouter>
  );
  const page = render(display(data));
  const fp = screen.getByText('First preferences', {selector: 'strong'});
  expect(fp.closest('p')).toHaveTextContent(
    'First preferences counted: 4,500 of 10,000 expected formal votes (45.0%).'
  );
  expect(
    screen
      .getByText('Two-candidate preferred', {selector: 'strong'})
      .closest('p')
  ).toHaveTextContent(
    'Two-candidate preferred counted: 1,275 of 10,000 expected formal votes (12.8%).'
  );
  expect(screen.getAllByRole('link').map(link => link.textContent)).toEqual([
    'Beta',
    'Alpha',
    'Gamma',
    'Delta',
    'Epsilon',
  ]);
  expect(
    screen.getByRole('link', {name: 'Beta'}).closest('strong')
  ).toBeInTheDocument();
  const beta = screen.getByRole('link', {name: 'Beta'}).closest('li');
  const change = within(beta).getByText('-2.00 pp', {selector: 'strong'});
  expect(change.closest('li')).toHaveTextContent(
    'Another Candidate LIB -2.00 pp (22.00% → 20.00%)'
  );
  expect(screen.queryByText(/Reference f00000001/)).toBeNull();
  expect(screen.queryByText(/All retained movements/)).toBeNull();
  expect(screen.getByText(/Booth and declaration counts/)).toBeInTheDocument();

  fireEvent.click(screen.getByText('Election-wide movement'));
  const row = delta =>
    screen.getByText(delta, {selector: 'strong'}).closest('li');
  expect(screen.getByRole('heading', {name: 'Outcome'})).toBeInTheDocument();
  expect(screen.getByRole('heading', {name: 'Vote share'})).toBeInTheDocument();
  expect(row('+0.40 pp')).toHaveTextContent(
    'ALP two-party preferred +0.40 pp (53.00% → 53.40%)'
  );
  expect(row('+0.31 pp')).toHaveTextContent(
    'LIB first preferences +0.31 pp (30.00% → 30.31%)'
  );
  expect(row('+2.00 pp')).toHaveTextContent(
    'ALP majority +2.00 pp (40.00% → 42.00%)'
  );
  expect(row('-1.00 pp')).toHaveTextContent(
    'Any other party leads -1.00 pp (2.00% → 1.00%)'
  );
  const voteShare = screen
    .getByRole('heading', {name: 'Vote share'})
    .closest('section');
  expect(within(voteShare).getAllByRole('listitem')).toHaveLength(2);
  expect(screen.queryByRole('heading', {name: 'Expected seats'})).toBeNull();

  page.rerender(display({...data, local_diagnostics: true}));
  expect(screen.getByText(/Reference f00000001/)).toBeInTheDocument();
  expect(
    [...page.container.querySelectorAll('details > summary')].map(
      summary => summary.textContent
    )
  ).toEqual([
    'Election-wide movement',
    'Booth and declaration counts (0)',
    'All retained movements (7)',
  ]);
  expect(
    screen.getByRole('heading', {name: 'Expected seats'})
  ).toBeInTheDocument();
  expect(row('-0.03 seats')).toHaveTextContent(
    'LIB -0.03 seats (19.90 → 19.87)'
  );
});

test('period choices exclude unavailable windows and follow the most recent references', () => {
  const period = (reference, requested) => ({
    comparison: {
      available: true,
      reference_source_time: reference,
      requested_seconds: requested,
      win_changes: [],
    },
  });
  const data = {
    run: {election: '2026sa', timezone: 'Australia/Adelaide'},
    schedule: {},
    report: {},
    source_time: '2026-03-22T20:00:00Z',
    yesterday: {source_time: '2026-03-21T20:00:00Z', report_date: '2026-03-21'},
    windows: {
      '1h': period('2026-03-22T18:59:00Z', 3600),
      since_start: period(null),
      yesterday: period('2026-03-21T18:59:00Z'),
      '24h': {comparison: {available: false}},
      today: period('2026-03-22T07:59:00Z'),
      previous: period('2026-03-22T19:58:00Z'),
      '15m': period('2026-03-22T18:59:00Z', 900),
    },
  };
  const display = data => (
    <MemoryRouter>
      <UpdateSummary data={data} seatLink={seat => '/replay/seat/' + seat} />
    </MemoryRouter>
  );
  const page = render(display(data));
  const title = screen.getByRole('heading', {name: /Recent Changes/});
  fireEvent.click(title.querySelector('button'));
  expect(
    screen.getByText(/Choose a period to see how the forecast changed/)
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', {name: 'Period: Previous Update'})
  );
  expect(
    [
      ...page.container.querySelectorAll(
        '#update-period-dropdown + .dropdown-menu .dropdown-item'
      ),
    ].map(item => item.textContent)
  ).toEqual([
    'Previous Update',
    '15 minutes',
    '1 hour',
    'Today',
    'Yesterday’s results',
    'Since the start',
  ]);
  fireEvent.click(screen.getByRole('button', {name: 'Yesterday’s results'}));
  expect(screen.getByText('Reporting day 2026-03-21')).toBeInTheDocument();
  page.rerender(
    display({...data, windows: {previous: {comparison: {available: false}}}})
  );
  expect(screen.queryByRole('button', {name: /Period:/})).toBeNull();
  expect(screen.getByText('No comparison available.')).toBeInTheDocument();
});

test('Recent Changes restores both dropdowns and forgets a period that becomes unavailable', () => {
  const comparison = {available: true, win_changes: []};
  const data = {
    run: {election: '2026sa'},
    schedule: {},
    report: {},
    windows: {previous: {comparison}, '15m': {comparison}},
  };
  const page = data => (
    <MemoryRouter>
      <UpdateSummary data={data} seatLink={seat => '/seat/' + seat} />
    </MemoryRouter>
  );
  const hasDropdowns = period => {
    expect(
      screen.getByRole('button', {name: `Period: ${period}`})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Display: Text'})
    ).toBeInTheDocument();
  };

  let view = render(page(data));
  choose('Period: Previous Update', '15 minutes');
  choose('Display: Numbers', 'Text');
  view.unmount();

  view = render(page(data));
  hasDropdowns('15 minutes');
  view.rerender(page({...data, windows: {previous: {comparison}}}));
  hasDropdowns('Previous Update');
  view.unmount();

  render(page(data));
  hasDropdowns('Previous Update');
});

test('structured commentary renders headings and escaped bullets and remembers the collapsed notice', () => {
  const data = {
    run: {election: '2026sa'},
    schedule: {},
    report: {},
    windows: {
      previous: {
        comparison: {available: true, win_changes: []},
        commentary: {
          status: 'complete',
          format: 'seat-bullets-v1',
          entities: {
            '{party:1}': {kind: 'party', label: 'LNP', party: 'LNP'},
            '{party:4}': {kind: 'party', label: 'ON', party: 'ON'},
            '{seat:Alpha}': {
              kind: 'seat',
              label: 'Alpha',
              holder_party: 'LIB',
              holder_margin: 20.3,
            },
          },
          text: {
            summary:
              'Key changes:\n- {party:4} gained a seat. {party:1} held steady at **6 seats**.\n- <img src=x> is literal text.',
            developments: [
              {
                seats: ['Alpha'],
                text: 'In {seat:Alpha}:\n- The new count was **200 votes**.',
              },
            ],
          },
        },
      },
    },
  };
  const display = (
    <MemoryRouter>
      <UpdateSummary data={data} seatLink={seat => '/replay/seat/' + seat} />
    </MemoryRouter>
  );
  const page = render(display);
  choose('Display: Numbers', 'Text');
  expect(
    screen.getByRole('heading', {name: 'Key changes:'})
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', {name: 'Alpha'}).closest('h4')
  ).toHaveTextContent('In Alpha (LIB 20.3%):');
  expect(screen.getByRole('link', {name: 'Alpha'})).toHaveAttribute(
    'href',
    '/replay/seat/Alpha'
  );
  expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(
    [
      'ON gained a seat. LIB held steady at 6 seats.',
      '<img src=x> is literal text.',
      'The new count was 200 votes.',
    ]
  );
  const headline = screen.getAllByRole('listitem')[0];
  expect(within(headline).getByText('ON')).toHaveClass('on-badge');
  expect(within(headline).getByText('LIB')).toHaveClass('lnp-badge');
  expect(screen.getByText('200 votes').tagName).toBe('STRONG');
  expect(page.container.querySelector('img[src="x"]')).toBeNull();
  expect(screen.getByRole('alert')).toHaveClass('alert-info');
  fireEvent.click(
    screen.getByRole('button', {name: 'Collapse AI commentary notice'})
  );
  expect(screen.queryByText(/large language model/)).toBeNull();
  page.unmount();

  render(display);
  expect(
    screen.getByRole('button', {name: 'Display: Text'})
  ).toBeInTheDocument();
  expect(screen.queryByText(/large language model/)).toBeNull();
  fireEvent.click(
    screen.getByRole('button', {name: 'Show AI commentary notice'})
  );
  expect(screen.getByRole('alert')).toHaveTextContent(/large language model/);
});

test('booth changes group by seat, rank by the largest net change and cap the visible list', () => {
  const event = (seat, name, fp, tcp, affected_votes) => ({
    seat,
    name,
    fp_net_change: fp,
    tcp_net_change: tcp,
    affected_votes,
  });
  const data = {
    run: {election: '2026sa'},
    schedule: {},
    report: {},
    windows: {
      previous: {
        comparison: {
          available: true,
          win_changes: [],
          booth_changes: {
            available: true,
            events: [
              event('Alpha', 'Small Booth', 121, 0, 121),
              event('Beta', 'Revised Booth', 0, 0, 82),
              event('Alpha', 'Large TCP Booth', 0, 1300, 1300),
              event('Alpha', 'Large FP Booth', 1120, 0, 1120),
              event('Alpha', 'Corrected Booth', -510, 200, 520),
              event('Alpha', 'Other Booth', 0, 90, 90),
              event('Beta', 'Dual Return', 300, 280, 300),
            ],
            shortlist_omitted: {Beta: {updated: 2}},
          },
        },
      },
    },
  };
  render(
    <MemoryRouter>
      <UpdateSummary data={data} seatLink={seat => '/replay/seat/' + seat} />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText('Booth and declaration counts (7)'));
  const group = seat =>
    screen.getByRole('link', {name: seat}).closest('li').querySelector('ul');
  expect([...group('Alpha').children].map(item => item.textContent)).toEqual([
    'Large TCP Booth (+1,300 TCP votes)',
    'Large FP Booth (+1,120 FP votes)',
    'Corrected Booth (-510 FP votes, +200 TCP votes)',
    'and 2 others',
  ]);
  expect([...group('Beta').children].map(item => item.textContent)).toEqual([
    'Dual Return (+300 FP votes, +280 TCP votes)',
    'Revised Booth (82 votes affected by a correction)',
    'The original count report omitted 2 other updates.',
  ]);
});

test('each disclosure remembers opening and closing across visits', async () => {
  const data = {
    run: {election: '2026sa'},
    schedule: {},
    report: {},
    windows: {previous: {comparison: {available: true, win_changes: []}}},
  };
  const view = (
    <MemoryRouter>
      <UpdateSummary data={data} seatLink={seat => '/replay/seat/' + seat} />
    </MemoryRouter>
  );
  const booth = 'Booth and declaration counts (0)';
  const election = 'Election-wide movement';
  const disclosure = title => screen.getByText(title).closest('details');

  let page = render(view);
  fireEvent.click(screen.getByText(booth));
  await waitFor(() =>
    expect(localStorage.getItem('liveRecentChanges:booths')).toBe('true')
  );
  page.unmount();

  page = render(view);
  expect(disclosure(booth)).toHaveAttribute('open');
  expect(disclosure(election)).not.toHaveAttribute('open');
  fireEvent.click(screen.getByText(booth));
  fireEvent.click(screen.getByText(election));
  await waitFor(() => {
    expect(localStorage.getItem('liveRecentChanges:booths')).toBe('false');
    expect(localStorage.getItem('liveRecentChanges:election-movement')).toBe(
      'true'
    );
  });
  page.unmount();

  render(view);
  expect(disclosure(booth)).not.toHaveAttribute('open');
  expect(disclosure(election)).toHaveAttribute('open');
});

test('commentary shortens repeat candidate mentions within each development', () => {
  const alphaLib = '{candidate:Alpha:1}';
  const alphaInd = '{candidate:Alpha:2}';
  const betaLib = '{candidate:Beta:1}';
  const betaCoalition = '{candidate:Beta:3}';
  const betaJohn = '{candidate:Beta:4}';
  const betaJune = '{candidate:Beta:5}';
  const candidate = (seat, label, party) => ({
    kind: 'candidate',
    seat,
    label,
    party,
  });
  const item = {
    status: 'complete',
    format: 'seat-bullets-v1',
    entities: {
      [alphaLib]: candidate('Alpha', 'Sam Telfer', 'LNP'),
      [alphaInd]: candidate('Alpha', 'Meghan Petherick', 'IND'),
      [betaLib]: candidate('Beta', 'Ada Lorne', 'LIB'),
      [betaCoalition]: candidate('Beta', 'Bert Pine', 'LNP'),
      [betaJohn]: candidate('Beta', 'John Kerr', 'IND'),
      [betaJune]: candidate('Beta', 'June Kerr', 'IND'),
    },
    text: {
      summary: `Key changes:\n- ${alphaLib} gained ground.`,
      developments: [
        {
          seats: ['Alpha'],
          text: `In Alpha:\n- The contest is between ${alphaLib} and ${alphaInd}.\n- At the booth, ${alphaLib} received **85.7%** against ${alphaInd}.`,
        },
        {
          seats: ['Beta'],
          text: `In Beta:\n- ${betaLib} leads.\n- ${betaLib} gained before ${betaCoalition} caught up.\n- ${betaCoalition} now leads.\n- ${betaJohn} and ${betaJune} both moved.\n- ${betaJune} gained at the next booth.`,
        },
      ],
    },
  };
  const data = {
    run: {election: '2026sa'},
    schedule: {},
    report: {},
    windows: {
      previous: {
        comparison: {available: true, win_changes: []},
        commentary: item,
      },
    },
  };

  render(
    <React.StrictMode>
      <MemoryRouter>
        <UpdateSummary data={data} seatLink={name => '/seat/' + name} />
      </MemoryRouter>
    </React.StrictMode>
  );
  choose('Display: Numbers', 'Text');
  expect(
    screen.getAllByRole('listitem').map(point => point.textContent)
  ).toEqual([
    'Sam Telfer LIB gained ground.',
    'The contest is between Sam Telfer LIB and Meghan Petherick IND.',
    'At the booth, LIB received 85.7% against Petherick IND.',
    'Ada Lorne LIB leads.',
    'Lorne LIB gained before Bert Pine LIB caught up.',
    'Pine LIB now leads.',
    'John Kerr IND and June Kerr IND both moved.',
    'June Kerr IND gained at the next booth.',
  ]);
  expect(screen.getByText('85.7%').tagName).toBe('STRONG');
});
