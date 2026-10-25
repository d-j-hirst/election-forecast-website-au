// Validate route syntax before mounting components that fetch data. Record and
// election availability still belong to the API; these checks do not hardcode it.
export const isValidArchiveId = id =>
  /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;

export const isForecastMode = mode =>
  ['regular', 'nowcast', 'live'].includes(mode);
