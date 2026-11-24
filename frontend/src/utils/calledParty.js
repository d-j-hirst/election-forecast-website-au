import {coalitionAbbreviation, seatPartyCode} from './coalition';

// A federal bulletin can group Liberal and Queensland LNP seats under one
// forecast party ID. Keep both badge codes so each retains its own identity.
export function calledPartyCodes(report, party, seats = []) {
  const abbr = report.partyAbbr?.find(
    ([id]) => String(id) === String(party)
  )?.[1];
  if (Number(party) === -2) return ['INDx'];
  if (Number(party) === -3) return ['OTH'];
  if (Number(party) >= 0 && (abbr === 'LNP' || abbr === 'LIB')) {
    const codes = new Set(
      seats.map(seat => seatPartyCode(abbr, report.termCode, seat))
    );
    if (codes.size > 1 || (!codes.size && report.termCode?.endsWith('fed')))
      return ['LIB', 'LNPx'];
    return codes.size ? [...codes] : [seatPartyCode(abbr, report.termCode)];
  }
  return abbr ? [abbr] : [];
}

// Seat bars use a plain label for the same party identities.
export function calledParty(report, party, seats) {
  return calledPartyCodes(report, party, seats)
    .map(code => {
      if (code === 'INDx') return 'IND*';
      if (code === 'LNPx') return 'LNP';
      if (code === 'LNP') return coalitionAbbreviation(report.termCode);
      return code;
    })
    .join('/');
}
