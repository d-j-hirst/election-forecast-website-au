import {unixDateToStr, unixTimeToStr} from 'utils/date';

const ELECTION_NIGHT_MS = 12 * 60 * 60 * 1000;
const QLD_2024_PRE_COUNT_TIME = Date.parse('2024-10-26T17:30:00+10:00');

// The election-night chart covers 12 hours from its first plotted forecast.
// Queensland's 2024 replay opens with a pre-count capture from the previous
// evening. Plot it at 5:30 pm Brisbane time to show the starting forecast
// beside the first returns. Both chart periods use this opening point.
export function liveHistoryPoints(points, election, eveningOnly) {
  const plotted =
    election === '2024qld'
      ? points.map(point =>
          point.unixDate < QLD_2024_PRE_COUNT_TIME
            ? {...point, unixDate: QLD_2024_PRE_COUNT_TIME}
            : point
        )
      : points;
  if (!eveningOnly) return plotted;
  const start = plotted.reduce(
    (first, point) => Math.min(first, point.unixDate),
    Infinity
  );
  return plotted.filter(point => point.unixDate < start + ELECTION_NIGHT_MS);
}

const TickIntervalEnum = Object.freeze({
  MonthThird: 1,
  MonthHalf: 2,
  Month: 3,
  TwoMonths: 4,
  ThreeMonths: 5,
  SixMonths: 6,
});

const createTicks = (lowUnixDate, highUnixDate) => {
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;
  const lowDateRep = new Date(lowUnixDate);
  const highDateRep = new Date(highUnixDate);
  const numDays = Math.round(Math.abs((highDateRep - lowDateRep) / ONE_DAY));
  const daysToInterval = days => {
    if (days < 60) return TickIntervalEnum.MonthThird;
    if (days < 90) return TickIntervalEnum.MonthHalf;
    if (days < 180) return TickIntervalEnum.Month;
    if (days < 360) return TickIntervalEnum.TwoMonths;
    if (days < 540) return TickIntervalEnum.ThreeMonths;
    return TickIntervalEnum.SixMonths;
  };
  const interval = daysToInterval(numDays);
  const dateInfo = {
    lowDateDay: lowDateRep.getDate(),
    highDateDay: highDateRep.getDate(),
    lowDateMonth: lowDateRep.getMonth(),
    highDateMonth: highDateRep.getMonth(),
    lowDateYear: lowDateRep.getFullYear(),
    highDateYear: highDateRep.getFullYear(),
  };
  const customTicks = [];
  // For shorter periods, just divide the interval into ticks with a certain spacing
  const collectCustomTicks = tickSpacing => {
    for (
      let tick =
        Math.ceil(lowUnixDate / tickSpacing) * tickSpacing - tickSpacing / 2;
      tick < highUnixDate;
      tick += tickSpacing
    ) {
      customTicks.push(new Date(tick));
    }
    return customTicks;
  };
  if (numDays < 1) {
    return collectCustomTicks(ONE_HOUR);
  } else if (numDays < 3) {
    return collectCustomTicks(ONE_HOUR * 12);
  } else if (numDays < 6) {
    return collectCustomTicks(ONE_DAY);
  } else if (numDays < 12) {
    return collectCustomTicks(ONE_DAY * 2);
  } else if (numDays < 24) {
    return collectCustomTicks(ONE_DAY * 4);
  }
  // for longer periods, we want the ticks to align with the start of each month
  for (let year = dateInfo.lowDateYear; year <= dateInfo.highDateYear; ++year) {
    for (
      let month =
        1 * (year === dateInfo.lowDateYear ? dateInfo.lowDateMonth : 0);
      month <= (year === dateInfo.highDateYear ? dateInfo.highDateMonth : 11);
      ++month
    ) {
      const pushTick = (monthRem, day) => {
        if (
          month % monthRem === 0 &&
          (year > dateInfo.lowDateYear ||
            month > dateInfo.lowDateMonth ||
            dateInfo.lowDateDay <= day) &&
          (year < dateInfo.highDateYear ||
            month < dateInfo.highDateMonth ||
            dateInfo.highDateDay >= day)
        ) {
          customTicks.push(Date.UTC(year, month, day));
        }
      };
      if (interval === TickIntervalEnum.MonthThird) {
        pushTick(1, 1);
        pushTick(1, 11);
        pushTick(1, 21);
      } else if (interval === TickIntervalEnum.MonthHalf) {
        pushTick(1, 1);
        pushTick(1, 16);
      } else if (interval === TickIntervalEnum.Month) {
        pushTick(1, 1);
      } else if (interval === TickIntervalEnum.TwoMonths) {
        pushTick(2, 1);
      } else if (interval === TickIntervalEnum.ThreeMonths) {
        pushTick(3, 1);
      } else if (interval === TickIntervalEnum.SixMonths) {
        pushTick(6, 1);
      }
    }
  }
  return customTicks;
};

export const historyTime = (value, mode, timeZone) => {
  if (!timeZone)
    return mode === 'live' ? unixTimeToStr(value) : unixDateToStr(value);
  const fields =
    mode === 'live'
      ? {hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}
      : {day: 'numeric', month: 'short'};
  return new Intl.DateTimeFormat('en-AU', {timeZone, ...fields}).format(value);
};

// Both forecast history cards use elapsed observation time and the same
// election-local time or date labels. Tooltips can show the full timestamp.
export const historyTimeAxis = (lowDate, highDate, mode, timeZone) => {
  const customTicks = createTicks(lowDate, highDate);
  return {
    type: 'number',
    dataKey: 'unixDate',
    domain: [lowDate, highDate],
    scale: 'time',
    ticks: customTicks.length ? customTicks : [lowDate],
    interval: 0,
    tickFormatter: value => historyTime(value, mode, timeZone),
  };
};
