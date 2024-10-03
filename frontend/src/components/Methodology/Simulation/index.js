import React from 'react';

import {ExtLink} from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
  return (
    <>
      <h4 id="simulation">Simulation of full election results</h4>
      <p>
        To generate forecasts, the model simulates the election a large number
        of times (typically 100,000) to evaluate how the projected vote totals
        correspond to actual seats in Parliament. This process involves taking
        election samples, simulating the results in each seat based on both the
        overall vote shares and athe history of each individual seat, adjusting
        those results so that the overall totals match the projected election
        sample as closely as possible, and then collating the results across all
        the simulations into statistics for display on the site.
      </p>
      <h5 id="tpp-region">
        Regional analysis of two-party-preferred (2PP) vote share
      </h5>
      <p>
        Many elections experience different swings in different areas. For
        example, the 2019 Federal Election had a swing to the ALP in Victoria
        but to the LNP in Queensland. In federal elections, there are often
        polls that break down the results by state; for state elections there
        are occasionally polls that break down their results by region as well.
        For the rest of this section, the word &quot;region&quot; refers to
        either states in a federal election or, regions within a state election.
        In this model, only 2PP differences between regions are considered.
      </p>
      <p>
        For each poll that breaks down results by region, the{' '}
        <i>swing deviation</i> is calculated for each region by subtracting the
        region&apos; swing recorded in the poll from the overall swing recorded
        in the same poll. For example, if a poll says the overall swing is 4% to
        the ALP but the swing in a particular region is only 2%, that is a swing
        deviation of -2%.
      </p>
      <p>
        The swing deviations of recent polls are then analysed by a Bayesian
        aggregation to create regional trends similar to the way the overall
        trends are created. This is done in a single pass with the constraint
        that the sum of all the swing deviations, weighted by expected turnout,
        is equal to zero. If different pollsters have different ways to divide
        into regions, this can result in differences in the definition of the
        regions between inputs and outputs, with some regions in the inputs
        overlapping. The aggregation is designed to handle these differences,
        and outputs a set of mutually exclusive regions that cover the entire
        electorate.
      </p>
      <p>
        To ensure that the use of these swing deviations reflects their historic
        performance, the predictiveness of polled swing deviations from previous
        elections is analysed. Regional polling breakdowns are analysed for:
      </p>
      <ul>
        <li>
          <i>bias</i>—do swing deviations overestimate one party or the other on
          average?
        </li>
        <li>
          <i>sensitivity</i>—how do the sizes of swing deviations in polls
          correlate to those in an actual election? (Generally, the swing
          deviations seen in polls overestimate those seen in the actual result,
          but more so in some regions than others.)
        </li>
        <li>
          <i>spread in the error</i>—after taking those two factors into
          account, how far are the swing deviations from the actual results?
        </li>
      </ul>
      <p>
        Separately, a similar process is used run without taking into account
        polls at all - instead, it examines how the <i>overall swing</i>{' '}
        predicts state swings. In this case, the &quot;bias&quot; represents
        trends over time for a state compared to the national average, and the
        &quot;sensitivity&quot; represents whether the state swings more or less
        than the national average. These results are used for regions which
        don&apos;t have polling (for federal elections, usually Tasmania, ACT
        and NT) and they are mixed with the poll-based deviations for polling
        when that polling is some time out from the election.
      </p>
      <p>
        In any given election simulation, each region has its own swing
        deviation calculated from the patterns observed in the polled swing
        deviation and/or the base deviation, with different random variation for
        each simulation. The deviations are then adjusted so that the total of
        all swing deviations, weighted by population, is equal to zero, as it is
        desired that the resulting swings match the national 2PP swing from the
        election sample. Finally, the swing deviations are each combined with
        the election sample&apos;s national swing to give the regional swing for
        the simulation.
      </p>
      <h5 id="tpp-seat">Two-party-preferred (2PP) seat vote share</h5>
      <p>
        Following the generation of each region&apos;s 2PP swings, the next step
        in the seat simulation is to produce a two-party-preferred result for
        each seat. This is done even for seats where the the final 2CP was not
        between the major parties. The regional two-party swing is applied to
        the existing margin in the seat, accounting for the redistributed margin
        according to{' '}
        <ExtLink href="https://antonygreen.com.au/category/redistribution/">
          Antony Green&apos;s estimates
        </ExtLink>
        , including draft redistributions. This margin is then adjusted to
        reflect the <i>elasticity</i> of the seat—whether it tends to swing more
        or less than the regional average. The analysis includes previous seats
        covering a similar area with a different name, and if the seat is new,
        statistics from other seats are used. As mentioned in earlier sections,
        a cross-one-out analysis is employed to estimate the predictiveness of
        the elasticity analysis and adjust its impact on the simulated result.
      </p>
      <p>
        The 2PP for each seat is also adjusted for candidate factors, such as
        retirements and the &quot;sophomore surge&quot;, where newly elected
        candidates and parties perform better than the regional average in their
        second election. Sophomore effects for new candidates and parties are
        treated as separate, with both added together when a candidate takes a
        seat from the opposing party. These effects are also analysed separately
        for urban and regional seats. Additionally, an adjustment is also made
        for both the loss of vote following candidate disendorsements, and the
        gain of vote in the election following such a disendorsement.
      </p>
      <p>
        For state elections, a further adjustment to the simulated 2PP for each
        seat is made to account for the tendency of state election swings tend
        to correlate with federal election swings in the same areas. Analysis of
        the 2022 South Australia, 2019 New South Wales and 2018 Victorian
        elections found a statistically significant correlation between the
        swing in that seat and the estimated federal swing within the boundaries
        of the state seat, after accounting for the candidate effects noted
        earlier. The size of this effect fit a decaying curve where
        approximately 55% of the federal swing is reflected in a state Election
        held concurrently, decreasing to 33% for a state election six months on
        either side of the federal election (such as the 2022 Victorian
        election). Given the small number of elections used to form this
        conclusion and the potential for significant variability between
        elections, the actual effect size in each simulation is generated by a
        gamma distribution calibrated so that the median effect size matches the
        estimates above. This approach allows the effect size in any individual
        simulation to range from almost zero to scenarios where the state
        election amplifies the federal swings.
      </p>
      <p>
        Finally, random variability is added to each seat. The standard
        deviation of this variability is assessed on a seat-by-seat basis, as
        some seats tend to be more volatile than others even after accounting
        for the above factors. However, a minimum level of variability is
        imposed because, due to the relatively small sample sizes involved, it
        is quite likely that the variability of some seats is underestimated.
      </p>
      <p>
        These adjustments mean that the population-weighted average of seat 2PPs
        usually no longer matches the regional 2PP calculated before. To
        maintain consistency across the simulation, the 2PPs are adjusted
        linearly so that the seat average 2PP for each region aligns with the
        overall 2PP. Keep in mind that the regional 2PPs have already been
        adjusted to match the election 2PP, so this final adjustment also
        ensures that the seat 2PPs are in line with the election 2PP.
      </p>
      <h5 id="fp-seat">First-preference (FP) seat vote share</h5>
      <p>
        The model simulates 2PP votes first before FP, as the former are much
        easier to work with and more reliable to simulate. However, because this
        is a comprehensive model and because some contests may not result in a
        2PP contest, FP votes are also simulated. This process is quite involved
        due to the numerous variables to consider and the many corner cases to
        cover, so this page will only give an outline. Additionally, there are
        more judgment calls in this section than others, as there is relatively
        little historical data on the performance of third parties and
        independents in some unusual situations.
      </p>
      <p>
        FP votes for non-major parties, including independents and a generic
        &quot;others&quot; category, are simulated first. The behaviour of FP
        votes in historical elections is analysed separately for each party
        category (see &quot;Fundamentals&quot; above) and then the results are
        applied to the vote for those parties in the previous election. This
        includes, where appropriate, changes from the previous election&apos;
        vote share based on incumbency, previous vote share, and the level of
        variability in the vote (for random variation).
      </p>
      <h6 id="fp-seat-">Independents</h6>
      <p>
        For independent candidates who are either incumbents or secured a
        substantial vote share in the previous election, the possibility that
        they may not recontest is also considered. The likelihood of
        recontesting is based on historical analysis and estimates of how this
        probability might change as the election approaches, since reliable
        historical data is hard to obtain. Candidates who announce their
        retirement or that they will not recontest are removed from
        consideration, while those who declare their intention to run again have
        their chances of recontesting significantly increased (though not to
        100%).
      </p>
      <p>
        The potential for yet-to-be-recognised independents to emerge and secure
        a significant vote share is also taken into account. Previous elections
        have been analysed to determine the typical vote shares independent
        candidates achieve at various levels, and how this varies by seat type
        (inner or outer urban, provincial, or rural), the prior performance of
        non-major parties in each seat, and whether the election is a federal or
        state one.
      </p>
      <p>
        Prominent independent candidates who are not incumbents are handled in a
        similar manner. Determining whether a candidate is considered prominent
        involves some judgement, typically based on whether they receive
        substantial media coverage and have a significant campaign team. Seat
        betting odds and seat polls are used to inform the likely performance of
        these prominent independent candidates. Due to the low accuracy of
        Australian seat polling (as demonstrated in Kevin Bonham&apos;s{' '}
        <ExtLink href="https://kevinbonham.blogspot.com/2018/06/is-seat-polling-utterly-useless.html">
          analysis
        </ExtLink>
        ), a considerable margin of error is applied to polls. This approach
        also applies to certain quasi-independent candidates who technically
        stand for a party but primarily run on their personal appeal.
      </p>
      <p>
        The performance of independents is not assumed to be statistically
        independent. Instead, correlations relative to expectations in
        independents&apos; performance are anticipated, which can sometimes be
        quite strong. In other words, independents may collectively overperform
        expectations in some elections and underperform in others. For each
        simulation, parameters are randomly selected from a beta distribution to
        intentionally bias the variable component of the independents&apos; FP
        vote share. The distribution of these parameters is chosen so that the
        distribution of an individual independent&apos;s FP share remains very
        close to what it would be without any correlation. Consequently, the
        overall simulated performance of each independent is minimally affected
        by this step, while the distribution of total independent seats across
        many simulations exhibits a much wider range of outcomes than if each
        independent were treated independently.
      </p>
      <h6 id="fp-seat-">Greens</h6>
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
      <h6 id="fp-seat-">&quot;Populist&quot; parties and ideology</h6>
      <p>
        Parties in the &quot;populist&quot; category, which includes emerging
        parties, are considered not to run in every seat. Instead, in each
        simulation they are assigned a random number of seats based on the
        number of seats they have contested historically (with substatial random
        variation), and only run in seats in a randomised fashion that heavily
        favours seats where they are likely to obtain higher vote shares.
        Additionally, the votes of such parties are calibrated on a seat-by-seat
        basis according to how parties of similar ideology have performed in
        that or similar seats historically—such as One Nation in the case of
        right-wing parties and the Australian Democrats for centrist parties.
        Unidentified emerging parties are randomly assigned as centrist,
        right-wing, or somewhere in between for the purposes of determining
        where they might be most popular. (Some might wonder why there is no
        left-wing &quot;populist&quot; party—basically, there has never really
        been one, so there&apos;s no way to assess where they might be most
        popular.)
      </p>
      <h6 id="fp-seat-">Major party FP votes</h6>
      <p>
        After simulating a set of minor party FP results for the seat and a 2PP
        result, the model now calculates the major party FP votes implied from
        those results. This requires calculating preference flows for each
        party. Since preference flows typically vary from seat to seat and from
        election to election, they must also be simulated. The preference flow
        from the election sample serves as a baseline, which is then adjusted
        based on how the preference flow in the seat compared to the overall
        average in the previous election. Additional random variability is
        subsequently applied. Using this newly calculated preference flow, the
        total preferences for each party are determined, and the major parties
        are assigned FP vote shares necessary to match the 2PP result.
      </p>
      <h6 id="fp-seat-">
        Reconciling the simulated results with the election sample
      </h6>
      <p>
        Once all the FP votes have been simulated, their totals across the
        entire election usually no longer align with those in the election
        sample. To ensure the simulation accurately reflects the election
        sampling, the seat FPs need to be adjusted to match the original sample.
        Although the actual process is quite involved, it primarily involves
        proportionally adjusting minor party votes up or down across all seats
        and then recalculating the major party 2PPs for each seat. This process
        is repeated five times, after which the difference between the FP votes
        in the election sample and the simulation is typically below 0.1% on
        average. However, in rare cases where a minor party receives a
        significantly higher share of the FP vote, the discrepancy may exceed
        this threshold.
      </p>
      <p>
        One important detail is that in seats where a candidate&apos;s vote is
        significantly higher that the overall vote for their party, the
        adjustment is modified so that it impacts the seat significantly less.
        This particularly affects independents, whose vote projections should
        not be heavily reduced simply because the generic Others vote happened
        to be too high.
      </p>
      <h5 id="simulation-aggregation">Aggregation of simulation results</h5>
      <p>
        There&apos;s not too much to say about this. For each simulation, the
        results of each seat (primaries, TCP results) are recorded, along with
        various aggregate results such as total seats won, total vote share, and
        so on. Once all simulations are complete, percentiles, averages and
        additional statistics are compiled. These are then stored and uploaded
        to the server, where they can be viewed on the website in either the
        latest report or the archives.
      </p>
    </>
  );
};

export default MethodologyPollTrend;
