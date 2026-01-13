// Determine whether the given election is in outlook or regular forecast mode
// (outlook is for longer-term forecasts, where uncertainty is emphasised
// and central tendency is de-emphasised )
// Outlook period is 3 months for federal elections, and 4 months for state elections
// (rounded up)

export const isOutlook = election => {
  const currentDate = new Date();
  if (election === '2026vic') {
    // Outlook until July 2026
    return (
      currentDate.getFullYear() < 2026 ||
      (currentDate.getFullYear() === 2026 && currentDate.getMonth() < 7)
    );
  }
  if (election === '2027nsw') {
    // Outlook until November 2026
    return (
      currentDate.getFullYear() < 2026 ||
      (currentDate.getFullYear() === 2026 && currentDate.getMonth() < 11)
    );
  }
  if (election === '2028fed') {
    // Outlook until February 2028
    return (
      currentDate.getFullYear() < 2028 ||
      (currentDate.getFullYear() === 2028 && currentDate.getMonth() < 2)
    );
  }
  return false;
};
