export const toIsoString = date => {
    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = num => (num < 10 ? '0' : '') + num;
  
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
}
  
export const toShortIsoString = date => {
    const pad = num => (num < 10 ? '0' : '') + num;
  
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        ' ' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds());
  }

export const parseDateStringAsUTC = raw => {
    // Remove any Z and anything after it and replace with UTC label
    const date = new Date(raw.split('Z')[0] + '.000Z');
    return toShortIsoString(date).split(".")[0].replace("T", " ");
};