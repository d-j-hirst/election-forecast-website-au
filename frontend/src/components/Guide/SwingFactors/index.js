import React from 'react';

const GuideSwingFactors = props => {
  return (
    <>
      <h4 id="tpp-swing-factors">Two-party-preferred (TPP) swing factors</h4>
      <p>
        The &quot;two-party preferred swing factors&quot; section for each
        individual seat result shows what seat-specific factors are involved in
        forecasting the TPP in that seat. Below is a list of the different
        factors that are used. (It is safe to assume that if a factor
        you&apos;re aware of is <i>not</i> shown in the forecast, then it
        isn&apos;t being taken into account for the TPP - adjust your
        expectations accordingly.)
      </p>
      <ul>
        <li>
          <i>Base region swing</i> - this is the overall swing across the
          election, modified by state or regional differences where breakdowns
          for those are available. Note that this factor is typically a little
          larger for seats with small TPP margins than large ones, due to the
          scaling used.
        </li>
        <li>
          <i>Elasticity adjustment</i> - An additional adjustment to the base
          region swing based on how elastic (&quot;swingy&quot;) the seat is
          observed to be. Only available for seats where there is enough
          historical data for this to be meaningful.
        </li>
        <li>
          <i>Reversion from previous swing</i> - This accounts for the observed
          tendency that when a party that does unusually well or poorly in a
          seat, their performance tends to revert partially in the following
          election.
        </li>
        <li>
          <i>Correlation with federal swing</i> - Accounts for the observed
          tendency for state-level parties to do better or worse in correlation
          with the respective party&quot;s federal performance in the same area.
        </li>
        <li>
          <i>Sophomore effect</i> - Accounts for the tendency for candidates and
          parties who win a seat from a different incumbent to get an increased
          vote in the next election as a result of gaining incumbency.
        </li>
        <li>
          <i>Retirement effect</i> - Accounts for the tendency for parties to
          have a worse performance when the incumbent member does not recontest
          the seat. Most often this is because the candidate is retiring, but it
          may also be a result of losing preselection, leaving the party, and so
          on.
        </li>
        <li>
          <i>Disendorsement effect</i> and{' '}
          <i>Recovery from previous disendorsement</i> - An estimate to take
          into account the large loss in support when a party disendorses a
          candidate, and the recovery when in the following election their
          candidate is no longer disendorsed.
        </li>
        <li>
          <i>By-election result adjustment</i> - In general, for seats where a
          by-election has been held since the previous general election, the
          previous election margin is a more reliable indicator of the next
          election&apos;s result than the by-election margin. However, it is
          still not the ideal indicator - after accounting for other factors,
          parties tend to do better in seats where they got a swing in a
          by-election than elsewhere. As of writing, based on analysis of
          historical results, about 29% of the by-election swing in a seat is
          added to the projected swing in that seat. Whether the seat changed
          party at the by-election was not found to make a significant
          difference.
        </li>
        <li>
          <i>Exhaustion from aligned non-major candidates</i> - This is an
          adjustment that is applied occasionally to seats under optional
          preferential voting (OPV). While centrist non-major candidates
          generally attract voters from both parties in similar proportions,
          some do attract much more from one major party than the other. In
          these cases, the exhaustion of votes that would otherwise go to that
          party results in a shift in the projected TPP towards the other party.
        </li>
      </ul>
    </>
  );
};

export default GuideSwingFactors;
