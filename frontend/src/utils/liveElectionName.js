// Use the public election title even when an older saved project abbreviated SA.
export default function liveElectionName(report) {
  const name = report?.electionName || report?.termCode;
  return name?.replace(
    /\bSA State Election$/,
    'South Australian State Election'
  );
}
