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
