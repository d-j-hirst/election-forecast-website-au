// Prepare one domain for a group of comparable rows. Results use the same units
// as the forecast (percentage points or seats); absent values are not zeros.
export const distributionBounds = (
  distributions,
  results = [],
  {includeZero = false, integer = false} = {}
) => {
  const values = [...distributions.flat(), ...results].filter(Number.isFinite);
  // Empty groups have no bars to plot. Keep their layout bounds finite without
  // manufacturing a forecast or a result for any missing row.
  if (values.length === 0) return {minVoteTotal: 0, maxVoteTotal: 1};

  let minVoteTotal = Math.min(...values);
  let maxVoteTotal = Math.max(...values);
  if (includeZero) minVoteTotal = Math.min(0, minVoteTotal);

  // Integer bars cover the half-seat either side of an inclusive seat count.
  // Apply this to the entire group so every party keeps the same scale.
  if (integer) {
    minVoteTotal = Math.max(0, minVoteTotal - 0.5);
    maxVoteTotal += 0.5;
  } else if (minVoteTotal === maxVoteTotal) {
    // A point distribution still needs a nonzero plotting span. Padding is
    // visual only: the percentile values and tooltip text stay unchanged.
    minVoteTotal = Math.min(minVoteTotal, Math.max(0, minVoteTotal - 0.5));
    maxVoteTotal = Math.max(maxVoteTotal, Math.min(100, maxVoteTotal + 0.5));
  }

  return {minVoteTotal, maxVoteTotal};
};
