export const parseDateData = raw => {
    const datetime = new Date(Date.parse(raw)).toLocaleString('en-AU');
    const parts = datetime.split(',');
    const dateParts = parts[0].split('/');
    const newDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}, ${parts[1]}`;
    return newDate;
};