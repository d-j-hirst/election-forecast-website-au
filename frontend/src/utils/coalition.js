import {seatInRegion} from './seatregion';

// The feed uses LNP for both the Liberal candidate and a combined Coalition
// total. Seat views know the district. LNPx selects the actual Queensland
// party badge, while the unqualified LNP badge represents the combined total.
export function seatPartyCode(party, termCode, seat) {
  const code = party?.toUpperCase();
  if (code !== 'LNP' && code !== 'LIB') return party;
  const merged = Number(termCode?.slice(0, 4)) >= 2008;
  if (
    merged &&
    (termCode.endsWith('qld') ||
      (termCode.endsWith('fed') && seat && seatInRegion(seat, 'qld')))
  )
    return 'LNPx';
  return 'LIB';
}

// Swing factors describe a district's Labor-versus-Coalition contest. Use
// its named candidates and modelled FP rows; the negative ID for the
// combined Coalition total never represents an individual candidate.
export function seatCoalitionBadge(forecast, index) {
  const ids = new Set();
  for (const [id] of forecast.seatCandidateNames?.[index] || []) {
    ids.add(Number(id));
  }
  for (const [id, bands] of forecast.seatFpBands?.[index] || []) {
    if (bands.some(share => share > 0)) ids.add(Number(id));
  }
  const parties = (forecast.partyAbbr || [])
    .filter(([id]) => Number(id) >= 0 && ids.has(Number(id)))
    .map(([, abbr]) => abbr);
  const liberal = parties.includes('LIB') || parties.includes('LNP');
  const national = parties.includes('NAT');
  if (liberal && !national)
    return seatPartyCode('LIB', forecast.termCode, forecast.seatNames[index]);
  if (national && !liberal) return 'NAT';
  // Both partners stand, or an older forecast doesn't identify candidates.
  return 'LNP';
}

// Split reports carry the combined Coalition at -4 and the Liberals at 1.
// Older unsplit aggregate series still represent the whole Coalition.
export function seriesPartyCode(party, id, parties, termCode) {
  if (
    party === 'LNP' &&
    Number(id) === 1 &&
    parties.some(([key, abbr]) => Number(key) === -4 || abbr === 'NAT')
  )
    return seatPartyCode(party, termCode);
  return party;
}

export const coalitionName = termCode => {
  if (!termCode) return 'Liberal–National Coalition';
  const state = termCode.slice(4);
  const year = parseInt(termCode.slice(0, 4));
  if (state === 'wa') {
    return 'Liberal and National Parties';
  } else if (state === 'sa') {
    return 'Liberal Party';
  } else if (state === 'qld' && year >= 2008) {
    return 'Liberal National Party';
    // } else if (state === 'fed' && year >= 2028) {
    //   return 'Liberal and National Parties';
  }
  return 'Liberal–National Coalition';
};

// A seat-wide TPP or combined win chance can involve either Coalition
// partner. Without a specified candidate use the collective name in prose.
export function seatCoalitionLabel(termCode) {
  const label = coalitionAbbreviation(termCode);
  return label === 'L–NC' ? 'Coalition' : label;
}

export const coalitionAbbreviation = termCode => {
  if (!termCode) return 'L–NC';
  const state = termCode.slice(4);
  const year = parseInt(termCode.slice(0, 4));
  if (state === 'wa') {
    return 'L/NP';
  } else if (state === 'sa') {
    return 'LIB';
  } else if (state === 'qld' && year >= 2008) {
    return 'LNP';
    // } else if (state === 'fed' && year >= 2028) {
    //   return 'L/NP';
  }
  return 'L–NC';
};
