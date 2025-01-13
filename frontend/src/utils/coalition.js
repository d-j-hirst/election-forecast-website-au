export const coalitionName = termCode => {
  if (!termCode) return 'Liberal–National Coalition';
  const state = termCode.slice(4);
  const year = parseInt(termCode.slice(0, 4));
  if (state === 'wa' && year >= 2025) {
    return 'Liberal–National Alliance';
  } else if (state === 'wa') {
    return 'Liberal and National Parties';
  } else if (state === 'qld' && year >= 2008) {
    return 'Liberal National Party';
  }
  return 'Liberal–National Coalition';
};

export const coalitionAbbreviation = termCode => {
  if (!termCode) return 'L–NC';
  const state = termCode.slice(4);
  if (state === 'wa' && year >= 2025) {
    return 'L/NP';
  } else if (state === 'wa') {
    return 'L/NP';
  } else if (state === 'qld' && year >= 2008) {
    return 'LNP';
  }
  return 'L–NC';
};
