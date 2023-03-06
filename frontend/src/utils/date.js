export const toIsoString = date => {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = num => (num < 10 ? '0' : '') + num;

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ':' +
    pad(Math.abs(tzo) % 60)
  );
};

export const toShortIsoString = date => {
  const pad = num => (num < 10 ? '0' : '') + num;

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
};

export const parseDateStringAsUTC = raw => {
  // Remove any Z and anything after it and replace with UTC label
  const date = new Date(raw.split('Z')[0] + '.000Z');
  return toShortIsoString(date).split('.')[0].replace('T', ' ');
};

export const utcDateToLocal = utc => {
  utc.setSeconds(utc.getSeconds() - utc.getTimezoneOffset() * 60);
  return utc;
};
export const unixDateToStr = unixDate =>
  toShortIsoString(utcDateToLocal(new Date(unixDate))).slice(0, 10);
export const unixTimeToStr = unixDate =>
  toShortIsoString(utcDateToLocal(new Date(unixDate))).slice(11, 16);
