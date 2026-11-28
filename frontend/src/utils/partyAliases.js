// Display abbreviations shared by full forecast reports and compact history points.
export const partyAliases = new Map([['ONP', 'ON']]);

// Live commentary and comparisons carry candidate codes from the original
// forecast, even when the website has already prepared the main report.
export const displayPartyCode = code =>
  partyAliases.get(code.toUpperCase()) ?? code;
