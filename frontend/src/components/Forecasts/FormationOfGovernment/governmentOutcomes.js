import {coalitionAbbreviation} from 'utils/coalition';
import {jsonMapReverse} from 'utils/jsonmap';

// The chart presents rounded slices. Recent Changes compares the underlying
// values using the same categories and apportionment, at its own precision.
export default function governmentOutcomes(forecast) {
  const {partyAbbr, termCode} = forecast;
  const asMap = values =>
    Array.isArray(values) ? Object.fromEntries(values) : values;
  const overall = asMap(forecast.overallWinPc);
  const majority = asMap(forecast.majorityWinPc);
  const minority = asMap(forecast.minorityWinPc);
  const mostSeats = asMap(forecast.mostSeatsWinPc);
  if (
    !majority ||
    !minority ||
    !mostSeats ||
    !Number.isFinite(overall?.[0]) ||
    !Number.isFinite(overall?.[1])
  )
    return [];

  const names = Object.fromEntries(partyAbbr);
  const oneNation =
    parseInt(termCode.slice(0, 4)) >= 2026
      ? jsonMapReverse(partyAbbr, 'ON')
      : null;
  const ties = party =>
    Math.max(
      0,
      overall[party] -
        (majority[party] ?? 0) -
        (minority[party] ?? 0) -
        (mostSeats[party] ?? 0)
    );
  const onMajority = majority[oneNation] ?? 0;
  const onMostSeats = mostSeats[oneNation] ?? 0;
  const others = 100 - overall[0] - overall[1];

  const rows = [
    ['majority-0', names[0], 'majority', majority[0] ?? 0, '#dc3545'],
    ['minority-0', names[0], 'minority', minority[0] ?? 0, '#ec7480'],
    ['most-seats-0', names[0], 'most seats', mostSeats[0] ?? 0, '#f5a3ab'],
    ['ties', null, 'Exact ties', ties(0) + ties(1), '#885588'],
    [
      'others',
      null,
      'Any other party leads',
      oneNation === null
        ? others
        : Math.max(0, others - onMajority - onMostSeats),
      '#888888',
    ],
    ['most-seats-1', names[1], 'most seats', mostSeats[1] ?? 0, '#87b2e7'],
    ['minority-1', names[1], 'minority', minority[1] ?? 0, '#5792da'],
    ['majority-1', names[1], 'majority', majority[1] ?? 0, '#1467cc'],
  ];

  if (oneNation !== null) {
    rows.splice(
      5,
      0,
      ['most-seats-on', 'ON', 'most seats', onMostSeats, '#ffc388'],
      ['majority-on', 'ON', 'majority', onMajority, '#ff7f00']
    );
  }
  return rows.map(([id, party, label, value, color]) => {
    const prefix = party === 'LNP' ? coalitionAbbreviation(termCode) : party;
    return {
      id,
      party,
      label,
      name: prefix ? prefix + ' ' + label : label,
      value,
      color,
    };
  });
}
