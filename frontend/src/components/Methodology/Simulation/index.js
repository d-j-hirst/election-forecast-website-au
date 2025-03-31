import React from 'react';

import {ExtLink} from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
  return (
    <>
      <h4 id="simulation">Simulation of full election results</h4>
      <p>
        To produce forecasts, the model simulates the election a large number of
        times (typically at least 100,000) to determine how the projected vote
        shares translate into actual seat outcomes in Parliament. This process
        involves:
      </p>
      <ul>
        <li>
          <strong>Generating election samples:</strong> Using the projected vote
          shares derived from the poll trends and fundamentals.
        </li>
        <li>
          <strong>Simulating seat-by-seat results:</strong> Incorporating
          historical seat-level voting patterns.
        </li>
        <li>
          <strong>Adjusting totals:</strong> Tweaking the results so that the
          overall simulated totals closely match the original election sample.
        </li>
        <li>
          <strong>Collating outcomes:</strong> Aggregating the results from all
          simulations to form probability distributions for various election
          scenarios.
        </li>
      </ul>
      <h5 id="tpp-region">
        Regional analysis of two-party-preferred (2PP) vote share
      </h5>
      <p>
        Elections rarely exhibit uniform swings across all regions. For example,
        in the 2019 federal election the ALP gained ground in Victoria while
        losing support in Queensland.
      </p>
      <p>
        In federal elections, polling typically includes regional breakdowns by
        state. In state elections, some polls provide regional breakdowns within
        the state. For the purpose of this analysis, a &quot;region&quot; refers
        either to a state or territory (in federal elections) or to a geographic
        region within a state (in state elections). The model accounts for
        regional variations in 2PP swings, though it does not consider regional
        differences in first-preference votes.
      </p>
      <h6>Estimating Regional Swings from Polls</h6>
      <p>
        When a poll provides regional breakdowns, the model calculates swing
        deviations—the difference between a region&apos;s swing and the overall
        national or statewide swing in the same poll.
      </p>
      <p>Example Calculation of Swing Deviation:</p>
      <p>A poll reports a +4% swing to the ALP nationally.</p>
      <p>It reports a +2% swing in a specific region.</p>
      <p>
        The regional swing deviation is -2% (i.e., 2% less than the national
        swing).
      </p>
      <p>
        These regional deviations are aggregated using a Bayesian approach
        similar to that applied to national poll trends. This method accounts
        for polling uncertainty while ensuring that the weighted sum of all
        regional swing deviations is zero, so that total seat swings remain
        consistent with the overall election-wide trend. When pollsters divide
        regions differently, the aggregation process resolves overlaps to
        produce a final set of non-overlapping regions.
      </p>
      <h6>Assessing the Reliability of Regional Polling</h6>
      <p>
        To ensure that regional polling is used realistically, the model
        evaluates historical polling performance by measuring:
      </p>
      <ul>
        <li>
          <i>Bias</i>: Whether polled regional swing deviations systematically
          overestimate support for one party.
        </li>
        <li>
          <i>Sensitivity</i>: How well the polled deviations correlate with
          actual election swings. Although polls tend to exaggerate regional
          differences, some regions prove more predictable than others.
        </li>
        <li>
          <i>Spread of Errors</i>: After accounting for bias and sensitivity,
          the magnitude of the remaining discrepancies between polled and actual
          swing deviations.
        </li>
      </ul>
      <h6>Estimating Regional Swings Without Polling</h6>
      <p>
        Not all regions have regular polling data—for instance, Tasmania, the
        ACT, and the NT often lack regional polls in federal elections. In such
        cases, the model uses historical patterns to estimate regional swings by
        analysing how a region&apos;s past swings have differed from the
        national average. Here:
      </p>
      <ul>
        <li>
          Bias reflects long-term trends in a region&apos;s typical deviation
          from the national swing.
        </li>
        <li>
          Sensitivity measures whether a region tends to swing more or less than
          the national average in any given election.
        </li>
        <li>
          For regions with limited polling, the final regional swing estimate is
          a mix of available poll-based deviations and historically inferred
          deviations. If regional polling exists but is outdated, its weight is
          gradually reduced over time.
        </li>
      </ul>
      <h6>Applying Regional Swing Deviations in Simulations</h6>
      <p>
        Each simulated election assigns randomized regional swing deviations
        based on the estimated regional patterns.
      </p>
      <ul>
        <li>
          A swing deviation is randomly generated for each region based on
          polling trends and/or historical patterns.
        </li>
        <li>
          Total swing deviations are adjusted so that the population-weighted
          sum remains zero (ensuring that the overall national swing is
          preserved).
        </li>
        <li>
          Each region&apos;s final swing deviation is applied to the national
          swing from the election sample, producing a realistic set of regional
          swings for that simulation.
        </li>
      </ul>
      <h5 id="tpp-seat">Two-party-preferred (2PP) seat vote share</h5>
      <p>
        Once regional 2PP swings have been determined, the next step is to
        simulate the 2PP result for each seat. This simulation is applied to
        every seat—even in contests where the final two-candidate-preferred
        outcome did not involve the two major parties.
      </p>
      <h6>Applying Regional Swings to Individual Seats</h6>
      <p>For each seat, the projected 2PP swing is determined by:</p>
      <ul>
        <li>
          <strong>Applying Regional Swings:</strong> The regional swing is
          applied to the existing seat margin, which is adjusted for
          redistributions using{' '}
          <ExtLink href="https://antonygreen.com.au/category/redistribution/">
            Antony Green&apos;s estimates
          </ExtLink>{' '}
          (including draft redistributions where applicable).
        </li>
        <li>
          <strong>Adjusting for Seat Elasticity:</strong> Seats often swing by
          more or less than the regional average. To account for this,
          adjustments are made based on historical data from similar seats. For
          seats with altered names or boundaries, comparable past seats are
          used, and entirely new seats are matched with data from comparable
          areas. These elasticity estimates are validated through a
          cross-one-out analysis to measure predictive accuracy and fine-tune
          their influence.
        </li>
      </ul>
      <h6>Incorporating Candidate-Specific Factors</h6>
      <p>
        Several candidate-related effects are factored into the 2PP adjustment:
      </p>
      <ul>
        <li>
          <strong>Retirements:</strong> A loss of incumbent advantage occurs
          when a sitting MP does not recontest.
        </li>
        <li>
          <strong>Sophomore Surge:</strong> Newly elected MPs (or new parties in
          a seat) tend to outperform the regional average in their second
          election. This effect is analysed separately for individual candidates
          and parties, and the combined influence is applied when a candidate
          wins a seat from an opposing party
        </li>
        <li>
          <strong>Disendorsement Effects:</strong> Adjustments account for a
          vote loss when a candidate is disendorsed and a subsequent recovery in
          the following election.
        </li>
      </ul>
      <h6>State Elections: Correlation with Federal Swings</h6>
      <p>
        In state elections, an additional adjustment accounts for the tendency
        of state-level swings to correlate with federal swings in the same
        areas.
      </p>
      <p>
        An analysis of the 2022 South Australian, 2019 New South Wales, and 2018
        Victorian elections found a statistically significant correlation
        between state and federal swings at the seat level, after accounting for
        candidate effects. This was confirmed by results from the 2022 Victorian
        and 2023 New South Wales elections.
      </p>
      <p>The size of this effect follows a decay curve:</p>
      <ul>
        <li>
          If a state election is held concurrently with a federal election, ~55%
          of the federal swing is reflected in the state result.
        </li>
        <li>
          If the state election occurs ~6 months before/after the federal
          election, the effect decreases to ~33%.
        </li>
      </ul>
      <p>
        Due to the small sample size of available elections and potential
        variability, the actual effect size in each simulation is randomized
        using a gamma distribution, calibrated so that the median effect matches
        the estimates above. This approach allows for simulated scenarios where
        the state election effect is minimal or, alternatively, where federal
        swings are amplified at the state level.
      </p>
      <h6>Incorporating Random Variability</h6>
      <p>
        Random variation is introduced into each seat&apos;s 2PP vote share,
        accounting for historical volatility at the seat level:
      </p>
      <ul>
        <li>
          Some seats are naturally more volatile than others, even after
          considering the above factors, and this is reflected in the magnitude
          of the random variation.
        </li>
        <li>
          However, a minimum level of variability of about half the average
          amount is imposed, as small sample sizes might otherwise underestimate
          the true volatility of certain seats, as well as changes in the
          electoral environment that may change the level of variability.
        </li>
      </ul>
      <h6>Ensuring Seat 2PP Totals Align with the Election-Wide 2PP</h6>
      <p>
        These seat-level adjustments mean that the population-weighted average
        of seat 2PPs may no longer match the regional 2PP calculated earlier.
      </p>
      <p>
        To maintain consistency, a final linear adjustment is applied so that:
      </p>
      <ul>
        <li>
          Each region&apos;s average seat 2PP aligns with its previously
          calculated regional 2PP.
        </li>
        <li>
          The regions&apos; 2PP still sums up to the election-wide projected
          2PP.
        </li>
      </ul>
      <p>
        This ensures the seat-level projections remain in line with the overall
        election sample.
      </p>
      <h5 id="fp-seat">First-preference (FP) seat vote share</h5>
      <p>
        Although the 2PP vote is simulated first due to its greater reliability,
        the FP vote is also modelled, since some contests do not result in a
        two-party-preferred count. This process is complex, involving numerous
        variables and judgment calls—especially where historical data for third
        parties and independents is limited.
      </p>
      <h6>Simulating Minor Party and Independent FP Votes</h6>
      <p>
        This simulation begins for each seat by modelling FP votes for non-major
        parties, including independents and a generic &quot;others&quot;
        category. This is done by:
      </p>
      <ul>
        <li>
          Analysing historical FP vote behaviour for different party categories
          (the same categories as used in &quot;Fundamentals&quot; above).
          Incumbency effects, previous vote share, and volatility between
          elections are measured.
        </li>
        <li>
          Applying this historical data to estimate the first preference votes
          for each party based on previous election vote shares.
        </li>
      </ul>
      <h6>Independents</h6>
      <p>For independent candidates, additional considerations are applied:</p>
      <p>Recontesting probabilities:</p>
      <ul>
        <li>
          Incumbents or strong previous candidates may choose not to recontest;
          historical patterns are used to estimate these probabilities.
        </li>
        <li>
          Candidates who announce retirement are removed from simulations.
        </li>
        <li>
          If a candidate declares intent to run, their recontesting probability
          is significantly increased (though not necessarily to 100%).
        </li>
      </ul>
      <p>New independent candidates:</p>
      <ul>
        <li>
          Simulations consider the likelihood of a new independent emerging with
          a strong FP vote.
        </li>
        <li>
          Historical elections are analysed to determine typical independent
          vote shares, adjusted for factors such as seat type (urban,
          provincial, rural) and whether the election is state or federal.
        </li>
      </ul>
      <p>Prominent non-incumbent independents:</p>
      <ul>
        <li>
          A candidate is considered &quot;prominent&quot; if they receive
          significant media coverage and have a strong campaign team.
        </li>
        <li>
          Seat betting odds and seat polling inform the likely performance of
          these candidates, but a substantial margin of error is applied due to
          the low accuracy of Australian seat polling (as noted in Kevin
          Bonham&apos;s{' '}
          <ExtLink href="https://kevinbonham.blogspot.com/2018/06/is-seat-polling-utterly-useless.html">
            analysis
          </ExtLink>
          ).
        </li>
        <li>
          This also applies to quasi-independent candidates, who technically
          stand for a party but rely primarily on personal appeal.
        </li>
      </ul>
      <p>Correlated performance of independents:</p>
      <ul>
        <li>
          Independents&apos; performance is not treated as fully independent
          across seats.
        </li>
        <li>
          Some elections see independents collectively overperform or
          underperform expectations.
        </li>
        <li>
          To reflect this, a beta distribution is used to introduce a small bias
          across independents in each simulation, ensuring a wider range of
          total independent seat outcomes without significantly altering
          individual seat projections.
        </li>
      </ul>
      <h6>Greens</h6>
      <p>
        As of September 2022, seat betting is also used to adjust Greens FP vote
        shares. This is done by running a number of preliminary simulations to
        establish the Greens FP vote share expected to result in a certain
        probability of winning the seat, and then adjusting the modelled FP vote
        in the direction of the vote share indicated by the betting odds. (
        <i>
          This also applies to other adjustments for seat betting—a more
          detailed description will be added when the author has time.
        </i>
        )
      </p>
      <h6>&quot;Populist&quot; parties and ideology</h6>
      <p>
        Parties in the &quot;populist&quot; category (e.g. One Nation, UAP,
        Australian Democrats) do not necessarily contest every seat. In each
        simulation, they are assigned a random number of contested seats based
        on historical patterns, with substantial variation, and are
        preferentially placed in seats where they have historically performed
        well. Their FP votes are calibrated by ideology, drawing on how similar
        parties have performed in comparable seats.
      </p>
      <p>
        Unidentified emerging parties are randomly assigned an ideological
        alignment (right-wing, centrist, or in-between) to determine their
        potential support base. (No left-wing populist category exists in the
        model, as no such party has significantly emerged in Australia.)
      </p>
      <h6>Incorporation of betting odds</h6>
      <p>
        Seat betting odds are also used to adjust vote shares for minor party
        and independent candidates. Preliminary simulations determine the FP
        vote share required for a specific probability of winning a seat, and
        the simulated FP vote is nudged toward the betting odds.
      </p>
      <h6>Simulating Major Party FP Votes</h6>
      <p>
        Once minor party FP votes and the seat-level 2PP result have been
        established, major party FP votes are determined by:
      </p>
      <ul>
        <li>
          Calculating preference flows for each party based on previous
          elections.
        </li>
        <li>
          Adjusting these flows using the baseline from the election sample, the
          seat-level deviation from the previous election, and random
          variability to capture uncertainty.
        </li>
        <li>
          Deriving major party FP vote shares that align with the simulated 2PP
          result for each seat.
        </li>
      </ul>
      <h6>Nationals </h6>
      <p>
        <i>
          Note: Prior to February 2025, the Nationals were treated as identical
          to the Liberal Party.
        </i>
      </p>
      <p>
        When both the Nationals and the Liberal Party field candidates in a
        seat, the proportion of votes allocated to the Nationals is modelled as
        a random variable, with its distribution derived from historical
        patterns.
      </p>
      <p>
        A linear regression on historical results, using the Nationals&apos;
        share in each of the previous two elections, provides the best estimate
        of the Nationals&apos; share, while the standard deviation of the
        regression residuals quantifies the associated uncertainty in the
        Nationals&apos; share for each seat.
      </p>
      <p>
        In addition, the overall Nationals&apos; vote share across all seats is
        adjusted per simulation using a probability distribution calibrated to
        historical results, with its standard deviation and kurtosis reflecting
        observed variability.
      </p>
      <h6>Reconciling Seat-Level FP Votes with the Election Sample</h6>
      <p>
        After generating seat-level FP votes, the totals may not align with the
        FP vote distribution in the original election sample. To correct this:
      </p>
      <ul>
        <li>
          Minor party votes are proportionally adjusted up or down across all
          seats.
        </li>
        <li>
          Major party 2PPs are recalculated for each seat based on the adjusted
          minor party votes.
        </li>
        <li>
          This process is repeated five times, bringing the average difference
          between the sample and the simulation below 0.1%.
        </li>
      </ul>
      <p>
        In seats where a specific independent significantly outperforms their
        party&apos;s general FP vote share, adjustments are tailored to minimise
        reductions to that candidate&apos;s vote, ensuring strong personal
        support is not unfairly penalised by overall minor party vote
        fluctuations.
      </p>
      <h5 id="simulation-aggregation">Aggregation of simulation results</h5>
      <p>
        After each individual simulation – representing a single iteration of a
        simulated election – the resulting statistics (including FP votes, TCP
        outcomes, overall vote shares, and other key outputs) are added to
        running totals and averages. Once all individual simulations have been
        performed, additional calculations are carried out to finalise the
        overall forecast, incorporating the construction of probability
        distributions for each seat and other aggregate statistics.
      </p>
      <p>
        These processed results are then stored and uploaded to the server,
        where they can be viewed on the website in either the latest report or
        the archives.
      </p>
    </>
  );
};

export default MethodologyPollTrend;
