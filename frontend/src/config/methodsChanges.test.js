import {
  MethodChangeForecastType,
  formatMethodChangeDate,
  getApplicableRecentMethodChanges,
  methodChangeAppliesToMode,
  parseDismissedMethodChangeKeys,
  sortMethodChangesNewestFirst,
} from './methodsChanges.js';

const change = (date, title, forecastType) => ({
  date,
  title,
  shortDescription: `${title} short description`,
  longDescription: [`${title} long description`],
  ...(forecastType ? {forecastType} : {}),
});

describe('methods change configuration helpers', () => {
  test('matches default general, live, and both forecast types', () => {
    const general = change('2026-07-01', 'General change');
    const live = change(
      '2026-07-01',
      'Live change',
      MethodChangeForecastType.LIVE
    );
    const both = change(
      '2026-07-01',
      'Both change',
      MethodChangeForecastType.BOTH
    );

    expect(methodChangeAppliesToMode(general, 'regular')).toBe(true);
    expect(methodChangeAppliesToMode(general, 'nowcast')).toBe(true);
    expect(methodChangeAppliesToMode(general, 'live')).toBe(false);
    expect(methodChangeAppliesToMode(live, 'live')).toBe(true);
    expect(methodChangeAppliesToMode(live, 'regular')).toBe(false);
    expect(methodChangeAppliesToMode(both, 'regular')).toBe(true);
    expect(methodChangeAppliesToMode(both, 'nowcast')).toBe(true);
    expect(methodChangeAppliesToMode(both, 'live')).toBe(true);
  });

  test('uses an inclusive rolling 30-day window and excludes future changes', () => {
    const changes = [
      change('2026-06-17', 'Too old'),
      change('2026-06-18', 'Boundary'),
      change('2026-07-18', 'Today'),
      change('2026-07-19', 'Future'),
    ];

    const applicable = getApplicableRecentMethodChanges({
      changes,
      mode: 'regular',
      reportDate: '2026-07-18T10:00:00Z',
      now: new Date(2026, 6, 18, 12),
    });

    expect(applicable.map(item => item.title)).toEqual(['Today', 'Boundary']);
  });

  test('excludes changes newer than the displayed report', () => {
    const applicable = getApplicableRecentMethodChanges({
      changes: [change('2026-07-10', 'Later change')],
      mode: 'regular',
      reportDate: '2026-07-09T23:00:00Z',
      now: new Date(2026, 6, 18, 12),
    });

    expect(applicable).toEqual([]);
  });

  test('sorts newest-first without mutating the source', () => {
    const source = [
      change('2026-06-01', 'Older'),
      change('2026-07-01', 'Newer'),
    ];

    expect(
      sortMethodChangesNewestFirst(source).map(item => item.title)
    ).toEqual(['Newer', 'Older']);
    expect(source.map(item => item.title)).toEqual(['Older', 'Newer']);
  });

  test('formats dates and safely parses dismissed keys', () => {
    expect(formatMethodChangeDate('2026-07-18')).toBe('18 July 2026');
    expect(parseDismissedMethodChangeKeys('["one","two"]')).toEqual([
      'one',
      'two',
    ]);
    expect(parseDismissedMethodChangeKeys('{bad json')).toEqual([]);
    expect(parseDismissedMethodChangeKeys('{"key":"value"}')).toEqual([]);
    expect(parseDismissedMethodChangeKeys('["one",2]')).toEqual([]);
  });
});
