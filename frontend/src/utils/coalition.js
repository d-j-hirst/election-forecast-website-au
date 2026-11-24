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
