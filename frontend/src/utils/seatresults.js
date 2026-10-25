import {jsonMap} from './jsonmap.js';

// Observed TCP shares identify the two final candidates. Incomplete or invalid
// observations, and tied shares, cannot identify a winner for markers or sorting.
export const getTcpWinner = tcp => {
  if (!tcp || typeof tcp !== 'object' || Array.isArray(tcp)) return null;
  const entries = Object.entries(tcp);
  if (
    entries.length !== 2 ||
    entries.some(
      ([, share]) => !Number.isFinite(share) || share < 0 || share > 100
    )
  )
    return null;

  const [first, second] = entries;
  if (first[1] === second[1]) return null;
  return first[1] > second[1] ? first[0] : second[0];
};

// Result categories are distinct from badge/colour labels: the emerging
// independent uses IND* in observations, but indx when displayed as a badge.
export const getSeatResultPartyCode = (party, partyAbbr) => {
  if (party === -2) return 'IND*';
  if (party === -3) return 'OTH';
  return jsonMap(partyAbbr, party, null);
};
