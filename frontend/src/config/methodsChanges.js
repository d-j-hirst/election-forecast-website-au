export const MethodChangeForecastType = Object.freeze({
  GENERAL: 'general',
  LIVE: 'live',
  BOTH: 'both',
});

export const DISMISSED_METHOD_CHANGES_KEY = 'dismissedMethodsChanges';

// Keep entries in chronological order. Omit forecastType for general/nowcast.
// longDescription is an array containing one string per paragraph.
export const methodsChanges = [
  {
    date: '2026-07-18',
    title: 'Updated minor-party trend adjustments',
    shortDescription:
      'Changed minor-party trend adjustment weightings to prioritise elections with comparable support levels. This limits the influence from historical elections under substantially different circumstances, especially for recent One Nation polling.',
    longDescription: [
      "Trend adjustments use previous elections to estimate how polling may differ from both current underlying support and the eventual election result. Previously, historical elections could have substantial influence even when a party's level of support was very different from the level currently being recorded.",
      'The method now gives greater weight to elections where the relevant party had a similar level of support. Elections conducted under substantially different circumstances still contribute, but have less influence. Where there is little comparable historical evidence, the adjustment remains closer to neutral.',
      "This can affect nowcasts and election forecasts differently. A change may increase the estimate of a party's current support while decreasing its projected election-day vote if the most comparable historical cases subsequently declined during their campaigns. It can also produce the opposite result.",
      'The immediate effect is a substantial change to projected One Nation vote shares across all current general forecast and nowcast series, along with smaller changes to other projected vote totals.',
      'The change was prompted by unusually strong One Nation polling, for which elections held when comparable parties had only low levels of support were not always informative. However, the revised method applies consistently across elections and minor-party groupings rather than making a specific adjustment for One Nation.',
      'The intention is not to assume that unusually high or low polling will continue, but to base adjustments on the most relevant historical evidence available.',
    ],
  },
  // {
  //   date: 'YYYY-MM-DD',
  //   title: 'Short methods change title',
  //   shortDescription: 'A short description for forecast-page notices.',
  //   longDescription: [
  //     'The first paragraph shown on the Methods page.',
  //     'An optional second paragraph.',
  //   ],
  //   forecastType: MethodChangeForecastType.LIVE, // or BOTH; omit for general
  // },
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const isoDateToUnix = date => {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

const localDateToUnix = date =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

export const formatMethodChangeDate = date => {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

export const methodChangeKey = change => `${change.date}:${change.title}`;

export const sortMethodChangesNewestFirst = changes =>
  [...changes].sort((a, b) => b.date.localeCompare(a.date));

export const methodChangeAppliesToMode = (change, mode) => {
  const forecastType = change.forecastType || MethodChangeForecastType.GENERAL;
  if (forecastType === MethodChangeForecastType.BOTH) return true;
  if (mode === 'live') return forecastType === MethodChangeForecastType.LIVE;
  if (mode === 'regular' || mode === 'nowcast') {
    return forecastType === MethodChangeForecastType.GENERAL;
  }
  return false;
};

export const getApplicableRecentMethodChanges = ({
  changes,
  mode,
  reportDate,
  now = new Date(),
}) => {
  if (!reportDate) return [];
  const reportIsoDate = reportDate.slice(0, 10);
  const today = localDateToUnix(now);

  return sortMethodChangesNewestFirst(
    changes.filter(change => {
      const ageInDays = (today - isoDateToUnix(change.date)) / ONE_DAY_MS;
      return (
        ageInDays >= 0 &&
        ageInDays <= 30 &&
        change.date <= reportIsoDate &&
        methodChangeAppliesToMode(change, mode)
      );
    })
  );
};

export const parseDismissedMethodChangeKeys = raw => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(key => typeof key === 'string')
      ? parsed
      : [];
  } catch (error) {
    return [];
  }
};
