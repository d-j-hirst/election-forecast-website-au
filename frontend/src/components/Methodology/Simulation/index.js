import React from 'react';

import {ExtLink} from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
  return (
    <>
      <h4 id="simulation">Simulation of full election results</h4>
      <p>
        To generate forecasts, the model simulates the election a large number
        of times (typically 100,000) to evaluate how projected vote totals
        translate into actual seat outcomes in Parliament. This process
        involves:
      </p>
      <ul>
        <li>
          Generating election samples, using projected vote shares from the poll
          trends and fundamentals as described in the previous sections.
        </li>
        <li>
          Simulating seat-by-seat results, incorporating historical seat-level
          voting patterns.
        </li>
        <li>
          Adjusting results to ensure the overall totals match the projected
          election sample as closely as possible.
        </li>
        <li>
          Collating results across all simulations to produce probability
          distributions for various election outcomes.
        </li>
      </ul>
      <h5 id="tpp-region">
        Regional analysis of two-party-preferred (2PP) vote share
      </h5>
      <p>
        Elections rarely exhibit uniform swings across all regions. For example,
        in the 2019 Federal Election, the ALP gained ground in Victoria but lost
        support in Queensland.
      </p>
      <p>
        In federal elections, polling often includes regional breakdowns by
        state. In state elections, some polls occasionally provide regional
        breakdowns within the state. For the purpose of this section, &quot;
        region&quot; refers to either:
      </p>
      <ul>
        <li>A state/territory (in a federal election), or</li>
        <li>A geographic region (within a state election).</li>
      </ul>
      <p>
        This model considers regional variations in two-party-preferred (2PP)
        vote swings, but not first-preference variations across regions.
      </p>
      <h6>Estimating Regional Swings from Polls</h6>
      <p>
        When a poll provides regional breakdowns, the model calculates swing
        deviations—the difference between a region&apos;s swing and the overall
        national/statewide swing in the same poll.
      </p>
      <p>Example Calculation of Swing Deviation:</p>
      <p>A poll reports a +4% swing to the ALP nationally.</p>
      <p>It reports a +2% swing in a specific region.</p>
      <p>
        The regional swing deviation is -2% (i.e., 2% less than the national
        swing).
      </p>
      <p>
        Each poll&apos;s regional swing deviations are aggregated using a
        Bayesian analysis, similar to the method used for national poll trends.
      </p>
      <ul>
        <li>
          This ensures that swing deviations are estimated as accurately as
          possible, while accounting for polling uncertainty.
        </li>
        <li>
          A key constraint is that the weighted sum of all regional swing
          deviations must be zero, ensuring that total seat swings still match
          the overall election-wide trend.
        </li>
        <li>
          If pollsters divide regions differently, the aggregation process
          resolves overlaps by producing a final set of non-overlapping regions.
        </li>
      </ul>
      <h6>Assessing the Reliability of Regional Polling</h6>
      <p>
        To ensure regional polling is used realistically, the model evaluates
        historical polling performance by measuring:
      </p>
      <ul>
        <li>
          <i>Bias</i> – Do polled regional swing deviations systematically
          overestimate support for one party?
        </li>
        <li>
          <i>Sensitivity</i> – How well do polled deviations correlate with
          actual election swings? Generally, polls tend to exaggerate regional
          swing deviations, but some regions are more predictable than others.
        </li>
        <li>
          <i>Spread of Errors</i> – After accounting for bias and sensitivity,
          how large are the remaining discrepancies between polled and actual
          swing deviations?
        </li>
      </ul>
      <h6>Estimating Regional Swings Without Polling</h6>
      <p>
        Not all regions have regular polling data—for example, in federal
        elections, Tasmania, ACT, and NT often lack regional polling.
      </p>
      <p>
        For these regions, the model instead uses historical patterns, analyzing
        how their past swings tended to differ from national swings:
      </p>
      <ul>
        <li>
          Bias now reflects long-term trends in how the region typically swings
          relative to the national average.
        </li>
        <li>
          Sensitivity measures whether the region tends to swing more or less
          than the national average in any given election.
        </li>
        <li>
          In regions with limited polling, the final regional swing estimate is
          a mix of poll-based deviations (when available), historically inferred
          deviations (when polling is unavailable or unreliable). If regional
          polling exists but is outdated, its weight is gradually reduced over
          time.
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
        simulate the two-party-preferred (2PP) result for each seat. This is
        done for all seats, even those where the final two-candidate-preferred
        (2CP) result was not between the two major parties.
      </p>
      <h6>Applying Regional Swings to Individual Seats</h6>
      <p>Each seat&apos;s projected 2PP swing is determined by:</p>
      <ul>
        <li>
          Applying the regional swing to the existing seat margin, adjusted for
          redistributions using{' '}
          <ExtLink href="https://antonygreen.com.au/category/redistribution/">
            Antony Green&apos;s estimates
          </ExtLink>{' '}
          (including draft redistributions where applicable).
        </li>
        <li>
          Adjusting for seat elasticity, which accounts for whether the seat
          typically swings more or less than the regional average. If a seat has
          changed names or borders, historical data from similar past seats is
          incorporated. If a seat is completely new, data from comparable seats
          is used instead. Validating seat elasticity estimates using a
          cross-one-out analysis to measure their predictive accuracy and adjust
          their influence accordingly.
        </li>
      </ul>
      <h6>Adjustments for Candidate-Specific Factors</h6>
      <p>
        Certain candidate-related effects are incorporated into the seat&apos;s
        2PP adjustment, including:
      </p>
      <ul>
        <li>
          Retirements – The loss of an incumbent advantage when a sitting MP
          does not recontest.
        </li>
        <li>
          Sophomore Surge – Newly elected MPs (and new parties in a seat) tend
          to outperform the regional average in their second election.
          <ul>
            <li>
              This effect is analysed separately for individual candidates and
              political parties, and both factors are combined when a candidate
              wins a seat from an opposing party.
            </li>
            <li>
              The impact is also assessed separately for urban and regional
              seats to capture geographic differences.
            </li>
          </ul>
        </li>
        <li>
          Disendorsement effects – Adjustments for:
          <ul>
            <li>A vote loss when a candidate is disendorsed.</li>
            <li>
              A vote recovery in the next election after such a disendorsement.
            </li>
          </ul>
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
          considering the above factors.
        </li>
        <li>
          However, a minimum level of variability is imposed, as small sample
          sizes might otherwise underestimate the true volatility of certain
          seats.
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
        the FP vote is also modelled, as some contests do not result in a
        two-party-preferred final count. This process is complex, involving
        numerous variables and judgment calls, particularly in cases with third
        parties and independents where historical data is limited.
      </p>
      <h6>Simulating Minor Party and Independent FP Votes</h6>
      <p>
        The simulation begins by modelling FP votes for non-major parties,
        including independents and a generic &quot;others&quot; category. This
        is done by:
      </p>
      <ul>
        <li>
          Analysing historical FP vote behaviour for different party categories
          (see &quot;Fundamentals&quot; above).
        </li>
        <li>
          Applying historical trends to previous election vote shares, adjusting
          for incumbency effects, previous vote share, and natural vote
          volatility.
        </li>
      </ul>
      <h6>Independents</h6>
      <p>For independent candidates, additional considerations are made:</p>
      <p>Recontesting probabilities:</p>
      <ul>
        <li>
          Incumbents or strong previous candidates may choose not to recontest;
          historical patterns are used to estimate these probabilities.
        </li>
        <li>
          If a candidate announces retirement, they are removed from
          simulations.
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
          stand for a party but run primarily on personal appeal.
        </li>
      </ul>
      <p>Correlated performance of independents:</p>
      <ul>
        <li>
          The performance of independents is not treated as fully independent
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
        Parties in the &quot;populist&quot; category (e.g., One Nation, UAP,
        Australian Democrats) do not necessarily contest every seat.
      </p>
      <p>
        In each simulation, they are assigned a random number of contested
        seats, based on historical patterns but with substantial variation,
        preferentially contest seats where they historically performed well.
      </p>
      <p>
        FP votes for these parties are calibrated by ideology, based on how
        similar parties have performed in comparable seats.
      </p>
      <p>
        Unidentified emerging parties are randomly assigned an ideological
        alignment (right-wing, centrist, or in-between) to determine their
        potential support base. (No left-wing populist category exists in the
        model, as no such party has significantly emerged in Australia.)
      </p>
      <h6>Incorporation of betting odds</h6>
      <p>
        As of September 2022, seat betting odds are used to adjust vote shares
        for minor party and independent candidates. This is achieved by running
        preliminary simulations to determine the FP vote share required for a
        certain probability of winning a seat. The model then nudges the
        simulated FP vote toward the vote share implied by the betting odds.
      </p>
      <h6 id="fp-seat-">Simulating Major Party FP Votes</h6>
      <p>
        Once minor party FP votes and the seat-level 2PP result have been
        established, major party FP votes are determined by:
      </p>
      <ul>
        <li>
          Calculating preference flows for each party, based on previous
          elections.
        </li>
        <li>
          Adjusting preference flows using the baseline from the election
          sample, the seat-level deviation from the previous election, and
          randomvariability to account for uncertainty.
        </li>
        <li>
          Deriving the major party FP vote shares, ensuring they align with the
          simulated 2PP result for each seat.
        </li>
      </ul>
      <h6 id="fp-seat-">
        Reconciling Seat-Level FP Votes with the Election Sample
      </h6>
      <p>
        After seat-level FP votes are generated, their totals may no longer
        align with the FP vote distribution in the original election sample. To
        correct this:
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
        party&apos;s general FP vote share, adjustments are modified to minimise
        reductions to their vote. This ensures that independent candidates with
        strong personal support are not unfairly penalised due to overall minor
        party vote fluctuations.
      </p>
      <h5 id="simulation-aggregation">Aggregation of simulation results</h5>
      <p>
        Once each election simulation is completed, the results for all seats—
        including first-preference votes, two-candidate-preferred (TCP)
        outcomes, total seats won, and overall vote shares—are recorded.
      </p>
      <p>
        After all simulations have run, the results are aggregated into
        statistical summaries, including:
      </p>
      <ul>
        <li>Averages and percentiles for key outcomes.</li>
        <li>Probability distributions for different election scenarios.</li>
      </ul>
      <p>
        These processed results are then stored and uploaded to the server,
        where they can be viewed on the website in either the latest report or
        the archives.
      </p>
    </>
  );
};

export default MethodologyPollTrend;
