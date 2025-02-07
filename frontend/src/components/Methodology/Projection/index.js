import React from 'react';

import {ExtLink} from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
  return (
    <>
      <h4 id="projection">Projecting election vote shares</h4>
      <p>
        The poll trends represent the model&apos;s best estimate of where
        polling averages would settle if a large number of polls were conducted.
        Although pre-election polling is generally reliable, there have been
        notable exceptions – for instance, the 2019 federal election and the
        2018 Victorian state election saw significant discrepancies between
        polls and actual outcomes. Furthermore, the predictive accuracy of poll
        trends diminishes the further they are from the election date.
      </p>
      <p>
        The next step is to transform the poll trend into a probability
        distribution for the actual election result. This projection accounts
        for additional uncertainties, including the time remaining until the
        election, potential systemic errors in the poll trend, and shifts in
        preference flows from minor to major parties.
      </p>
      <h5 id="fundamentals">Fundamentals</h5>
      <p>
        The first step in projecting election outcomes is to establish a
        baseline estimate—known as the fundamentals projection. This baseline
        represents the expected result in the absence of polling data and is
        later combined with real-time poll trends to produce the final
        projection.
      </p>
      <p>
        Fundamentals are analysed for various party categories, which are chosen
        based on similar electoral behaviour (with some overlap). These
        categories are:
      </p>
      <ul>
        <li>Two-party-preferred vote</li>
        <li>ALP first preference vote</li>
        <li>L/NP combined first preference vote</li>
        <li>
          &quot;Constituency minors&quot;: minor parties representing a fairly
          well-defined ideology or section of the community (e.g. Greens, Family
          First, WA Nationals)
        </li>
        <li>
          &quot;Populist minors&quot;: minor parties that position themselves
          against the major parties and exhibit volatile support (e.g. One
          Nation, Australian Democrates, UAP/PUP)
        </li>
        <li>
          &quot;Others&quot;: the sum of <i>all</i> parties and independents
          (including any mentioned above) <i>except</i> for the major parties,
          Greens, and WA Nationals
        </li>
        <li>
          &quot;Unnamed others&quot;: Parties not considered significant for
          analysis (either not polled or polling at very low levels), along with
          independents
        </li>
      </ul>
      <p>
        For each category, the relationship between certain fundamental factors
        and the eventual outcome is analysed. Rather than relying on economic
        conditions—which have proven to be weak predictors for Australian
        elections (see{' '}
        <ExtLink href="https://armariuminterreta.com/2021/08/05/australian-economy-electoral-impact/">
          this analysis by Armarium Interreta
        </ExtLink>
        )—the fundamentals projection relies on known electoral factors:
      </p>
      <ul>
        <li>
          The vote share a party achieved at the previous election (for minor
          parties and &quot;others&quot;), the average of the previous six
          elections (for major party first preference vote shares), and a 50-50
          split for two-party-preferred vote shares.
        </li>
        <li>
          For major parties: whether the party is incumbent or in opposition,
          and the number of years the party has been in government or
          opposition.
        </li>
        <li>
          For state-level major parties: whether the incumbent federal party is
          the same as the state party. (If a federal election is expected before
          the state election, the projected federal outcomes are taken into
          account.)
        </li>
      </ul>
      <p>
        Data for these factors have been collected for all elections since 1990,
        and linear regression with{' '}
        <ExtLink href="https://en.wikipedia.org/wiki/Elastic_net_regularization">
          elastic net regularization
        </ExtLink>{' '}
        is used to estimate the conditional median of each party category&apos;s
        election vote share. This method has demonstrated the best predictive
        accuracy when backtested against previous elections.
      </p>
      <p>
        The analyses were validated using{' '}
        <ExtLink href="https://en.wikipedia.org/wiki/Cross-validation_(statistics)#Leave-one-out_cross-validation">
          cross-one-out validation
        </ExtLink>{' '}
        —repeatedly running the procedure with one data point omitted and
        measuring how accurately that point is predicted. This approach tests
        the model&apos;s ability to forecast out-of-sample data and confirms
        that the method retains predictive value.
      </p>
      <p>
        Comparisons were made between the fundamentals regression and simpler
        baselines (using the previous election result, averages of previous
        results, or a simple 50-50 split for 2PP). For state elections, the
        fundamentals projection showed significant improvements over these
        baselines for both 2PP and major party first preference votes, as well
        as for &quot;populist&quot; minor parties. Although the improvement was
        less pronounced for &quot;constituency&quot; parties or
        &quot;others&quot;, the results were not worse than the simpler methods.
      </p>
      <p>
        For federal elections, however, the fundamentals regression did not
        perform as well for 2PP and major party first preference votes. This is
        likely due to the closer margins, smaller swings, and reduced incumbency
        benefits typical of federal contests. Consequently, a simple 50-50
        baseline is used as the fundamentals for federal 2PP vote shares, which
        in turn slightly improves the fit for state results.
      </p>
      <p>
        For a future election with an as-yet unknown outcome, the fundamentals
        are calculated using regression on the current known factors in that
        election, thereby producing the fundamentals estimate.
      </p>
      <h5 id="mixing">Calculating the projection parameters</h5>
      <p>
        To refine the projection, the model blends the fundamentals estimate
        with the poll trend using a weighted average. The weighting depends on
        both the party and vote type (2PP versus FP) and the time remaining
        until the election. These parameters are optimised using data from past
        elections with available polling. Separate estimates are generated for
        various time points prior to the election—from immediately before the
        election to about three years out (beyond which there is insufficient
        polling data).
      </p>
      <p>
        The following steps are carried out for each combination of vote type
        and time point:
      </p>
      <ul>
        <li>
          <strong>Bias Adjustment:</strong> The biases of both the poll trend
          and the fundamentals estimate are calculated by determining how much
          higher or lower each is relative to the actual election result. For
          example, it is observed that both &quot;Others&quot; and
          &quot;Populist Minors&quot; tend to poll significantly higher than
          their eventual outcomes around one to two years from the election.
          These biases are subtracted from the poll trend and fundamentals
          before proceeding.
        </li>
        <li>
          <strong>Mix Factor Determination:</strong> The next step is to
          identify the optimal mix factor, which determines the proportion of
          the final projection derived from the poll trend versus the
          fundamentals. For instance, if (after bias correction) the
          fundamentals projection estimates the ALP&apos;s 2PP vote share at 54%
          while the poll trend indicates 48%, then the final projection could
          range from 54% (100% fundamentals) to 48% (100% poll trend), or lie
          somewhere in between. The optimal mix factor is chosen by minimising
          the error across all elections.
        </li>
        <li>
          <strong>Final Bias Correction:</strong> Once the mixed estimate is
          calculated for each election, a further correction is applied by
          determining the remaining bias of this mixed estimate, which is then
          subtracted to produce the final projection.
        </li>
        <li>
          <strong>Uncertainty Measurement:</strong> Equally important is
          quantifying the uncertainty in the final estimate. For each election,
          the error between the final projection and the actual result is
          measured, forming a sample distribution of errors. From this
          distribution, measures such as the standard deviation and kurtosis
          (which captures the frequency of extreme values) are computed
          separately for positive and negative errors to account for any
          asymmetry.
        </li>
      </ul>
      <p>
        This process is repeated for different time intervals before the
        election, each yielding its own set of parameters (biases, mix factor,
        and spread measures). Because historical polling data can be volatile
        and the sample sizes small, the parameters obtained for each time point
        may fluctuate. To prevent these fluctuations from misleading the model,
        they are heavily smoothed over time into gradual trends. This smoothing
        includes a heavy weighting for the result immediately before the
        election, ensuring that more uncertain earlier estimates do not unduly
        influence the final projection.
      </p>
      <p>
        The final, smoothed parameter trends are then used to produce a
        projection of the future election result from the poll trend.
      </p>
      <h5 id="mixing">Validating the projection</h5>
      <p>
        It is essential to verify that the projection method possesses
        predictive skill with out-of-sample data. Since new elections cannot be
        staged solely for validation purposes, cross-validation is employed. For
        each past election with an available polling trend, the full procedure
        to derive the fundamentals and projection parameters is repeated while
        completely excluding any data from the election being tested (and any
        subsequent data).
      </p>
      <p>
        The newly derived parameters are then used to project the election
        result from the poll trend, and the error in this projection is
        recorded. Validation primarily focuses on the two-party-preferred (2PP)
        result, given its critical role in determining the overall election
        outcome, although other values are also assessed. For comparison, errors
        from several simpler estimates are also recorded:
      </p>
      <ul>
        <li>
          <strong>Baseline Estimate:</strong> For the 2PP vote, this is simply a
          50-50 split; for minor parties and &quot;others,&quot; it is the most
          recent first-preference result in the same region; and for major party
          first preference votes, it is the average of the most recent six
          election results.
        </li>
        <li>
          <strong>Poll Trend Only:</strong> The median value derived solely from
          the poll trend.
        </li>
        <li>
          <strong>Fundamentals:</strong> The &quot;fundamentals&quot; value used
          in calculating the projection.
        </li>
      </ul>
      <p>
        Focusing on 2PP, the results are generally clear. For almost all time
        points, the projection method produces a significant reduction in error
        compared to these simpler estimates. For example, exactly one year prior
        to an election, the average absolute error from the projection is 2.87
        percentage points, compared to 3.68 for the fundamentals alone, 3.77 for
        the poll trend alone, and 4.29 for the baseline estimate.
      </p>
      <p>
        There are two main exceptions. First, for federal elections more than a
        year out, the projection for federal 2PP is not consistently better than
        the straightforward fundamentals (which, despite being a simple 50-50
        split, are often quite close due to the narrow margins typical of
        federal contests). While the projection generally performs better, there
        are instances—such as at 500 and 900+ days from the election (as of
        March 2022)—where it does not outperform the fundamentals, though it is
        not significantly worse. Second, for estimates very close to the
        election—within a week or less—the projection is neither markedly better
        nor worse than the raw poll trend.
      </p>
      <h5 id="mixing">Sampling elections from the projection</h5>
      <p>
        Up to this point, the fundamentals, poll trend, and projection have been
        used to generate probability distributions for each party&apos;s
        first-preference (FP) vote share and the two-party-preferred (2PP) vote
        share. However, simulating an election requires a complete picture in
        which FP votes sum to 100% and are consistent with the 2PP result. To
        achieve this, a single vote share sample is created for each simulated
        election, encompassing the FP votes, the 2PP, and the corresponding
        preference flows from each party—with random variation incorporated at
        each step.
      </p>
      <p>
        For minor parties (including the Greens), a first-preference vote share
        is randomly drawn from the relevant probability distribution.
      </p>
      <p>
        Some simulations also include an &quot;emerging party&quot; to account
        for the possibility of a new political force gaining traction (for
        example, One Nation in 1998 or the Palmer United Party in 2013). The
        model estimates both the probability of an emerging party and its vote
        share based on historical cases; these factors decline as the election
        draws nearer.
      </p>
      <p>
        Because FP votes and 2PP results must align, the model employs two
        methods to coordinate major party vote shares with the 2PP:
      </p>
      <ul>
        <li>
          <strong>FP-first:</strong> Assign first-preference shares initially,
          then derive the 2PP using historical preference flows.
        </li>
        <li>
          <strong>2PP-First:</strong> Assign the 2PP first, then back-calculate
          FP shares based on expected preference flows.
        </li>
      </ul>
      <p>
        Each method has strengths and weaknesses, so the model randomly selects
        one per simulation to reflect possible real-world variance.
      </p>
      <p>
        Since preference flows from minor parties to the major parties are not
        fixed, random variance—drawn from a probability distribution reflecting
        historical fluctuations—is introduced in both approaches.
      </p>
      <p>
        Once the major party and 2PP vote shares are determined, a coherent vote
        share sample is assembled. This sample serves as the basis for a single
        election simulation. The process is repeated many times to generate a
        broad range of possible election outcomes.
      </p>
    </>
  );
};

export default MethodologyPollTrend;
