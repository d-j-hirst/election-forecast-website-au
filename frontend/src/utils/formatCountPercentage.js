// The live count uses the snapshot's estimate of the final formal vote as its
// denominator for both count types.
export default function formatCountPercentage(counted, expected) {
  if (!Number.isFinite(counted) || !Number.isFinite(expected) || expected <= 0)
    return null;
  return `${((counted / expected) * 100).toFixed(1)}%`;
}
