import React from 'react';

import {ExtLink} from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
  return (
    <>
      <h4 id="projection">Projecting election vote shares</h4>
      <p>
        The poll trends can be considered the model&apos;s best guess at where
        the poll averages would be if very many polls were done. Historically,
        the polling average immediately before the election has been quite
        accurate in most cases. However, as seen in some previous elections,
        such as the 2019 federal election and the 2018 Victorian state election,
        the poll average can sometimes differ significantly from the actual
        results. Additionally, any time difference between the now and the
        election further diminishes the predictiveness of the poll trend.
      </p>
      <p>
        Therefore, the next step after identifying the poll trend is to project
        this trend into a probability distribution for the actual election
        outcome. This projection will account for additional sources of
        uncertainty, including the time remaining before the election, potential
        systemic errors in the poll trend, and changes in preference flows from
        minor parties to the major parties.
      </p>
      <h5 id="fundamentals">Fundamentals</h5>
      <p>
        The first step of this projection procedure is to establish a baseline
        value for the result that would be expected if there were <i>no</i>{' '}
        polls. This is called a <i>fundamentals</i> projection. Fundamentals are
        analysed for a number of different categories of parties and votes
        (known as party categories). The party categories are chosen according
        to similar electoral behaviour, and some do overlap. The categories are:
      </p>
      <ul>
        <li>Two-party-preferred vote</li>
        <li>ALP first preference vote</li>
        <li>L/NP combined first preference vote</li>
        <li>
          &quot;Constituency minors&quot; - minor parties that represent a
          fairly well-defined ideology or section of the community, e.g. Greens,
          Family First, WA Nationals
        </li>
        <li>
          &quot;Populist minors&quot; - minor parties that tend to define
          themselves against the major parties and have volatile support levels,
          e.g. One Nation, Australian Democrates, UAP/PUP
        </li>
        <li>
          &quot;Others&quot; - Sum of <i>all</i> parties (including any
          mentioned above) <i>except</i> the major parties, Greens, and WA
          Nationals
        </li>
        <li>
          &quot;Unnamed others&quot; - Sum of all parties not considered
          significant (either not polled, or only polling very low numbers)
          along with independents
        </li>
      </ul>
      <p>
        For each of these party categories, the relationship between certain
        &quot;fundamental&quot; factors and the eventual outcome is analysed.
        While the economic condition is often considered in such analyses,
        especially overseas, both this site and others (such as{' '}
        <ExtLink href="https://armariuminterreta.com/2021/08/05/australian-economy-electoral-impact/">
          this analysis by Armarium Interreta
        </ExtLink>
        ) have found that the predictiveness of such factors is weak for
        Australian elections. The fundamentals projection used here instead
        relies on known facts of the electoral situation:
      </p>
      <ul>
        <li>
          The share of the vote a party achieved at the previous election (for
          minor parties and &quot;others&quot;), the average of the previous six
          elections (for major party first preference vote shares), and 50-50
          for two-party-preferred vote shares.
        </li>
        <li>
          (For major parties) Whether a party is incumbent or in opposition
        </li>
        <li>
          (For major parties) How many years a party has been in
          government/opposition
        </li>
        <li>
          (For major parties at state level) Whether the incumbent federal party
          is the same as the this party. If a federal election might be held
          before the relevant state election, this is taken into account using
          the projected outcomes in the forecast for that federal election.
        </li>
      </ul>
      <p>
        The values of the above factors are collected for all elections since
        1990 and linear regression with{' '}
        <ExtLink href="https://en.wikipedia.org/wiki/Elastic_net_regularization">
          elastic net regularization
        </ExtLink>{' '}
        is used to find the best estimate for the conditional median of the
        party category&apos;s election vote share. (This method was found to
        have the best predictive accuracy compared to other options when
        backtested on previous elections.)
      </p>
      <p>
        The analyses were validated using{' '}
        <ExtLink href="https://en.wikipedia.org/wiki/Cross-validation_(statistics)#Leave-one-out_cross-validation">
          cross-one-out validation
        </ExtLink>{' '}
        to test their predictive effectiveness. This involves running the
        procedure repeatedly with a data point left out and determining how
        accurately the procedure predicts that data point, which measures the
        ability to predict out-of-sample data. Fitted models such as these are
        often less accurate when working on new&quot;out-of-sample&quot; data
        than the data that the model is trained on, and this validation checks
        that the method still has predictive value.
      </p>
      <p>
        The predictive accuracy of the fundamentals regression was compared to
        some simple baselines: using the previous election result, averages of
        previous election results, and for 2PP a simple 50-50 result. The{' '}
        <ExtLink href="https://en.wikipedia.org/wiki/Root-mean-square_deviation">
          RMSD
        </ExtLink>
        , mean absolute error and median absolute error are used to measure the
        accuracy. The &quot;fundamentals&quot; projection was a significant
        improvement over the baseline for <i>state</i> election 2PP and major
        party FP, as well as for &quot;populist&quot; minor parties. Little
        improvement over the baseline is found for &quot;constituency&quot;
        parties or &quot;others&quot;, but the results were not worse either.
      </p>
      <p>
        However, the results did not validate well for <i>federal</i> election
        2PP and major party FP votes. This appears to be a result of federal
        elections being much closer with smaller swings, and incumbency being
        much less of a benefit. Because of this, a simple 50-50 baseline is used
        instead as the &quot;fundamentals&quot; for federal 2PP vote shares
        (which in turn results in a slightly improved fit for the state
        results).
      </p>
      <p>
        For a future election with an as yet unknown result, the fundamentals
        are then calculated using the regression on the current known factors in
        that election to create the <i>fundamentals estimate</i> for that
        election.
      </p>
      <h5 id="mixing">Calculating the projection parameters</h5>
      <p>
        The aim here is combine the fundamentals estimate with the poll trend,
        using a weighted average to produce the most accurate estimate possible.
        The parameters for this process depend on the vote type (the party and
        whether it is 2PP or FP) and the time remaining until the election. This
        process uses all elections with recorded polling data to determine the
        optimal parameters. Separate estimates of the parameters are made at
        various time points, ranging from immediately before the election to
        about 3 years prior (before that point there are too few elections with
        any polling to obtain a useful sample size). The following steps are
        conducted separately for each combination of vote type and time point.
      </p>
      <p>
        First, the <i>biases</i> of both the poll trend and the fundamentals
        estimate are calculated—specifically, how much higher or lower these
        estimates are compared to the actual election result. For example, it is
        observed that both &quot;Others&quot; and &quot;Populist Minors&quot;
        tend to poll significantly higher than their election result around 1-2
        years from the election. (Biases for fundamentals are usually quite
        small). the election. (Biases for fundamentals are usually quite small).
        These biases are then subtracted from the poll trend and fundamentals
        before the next steps.
      </p>
      <p>
        The next step is to determine the optimal amount of mixing between the
        poll trend and fundamentals. The proportion allocated to the polls is
        referred to as the <i>mix factor</i>. For example, if (after correcting
        for bias) the fundamentals projection has the ALP&apos;s 2PP vote share
        at 54, but the poll trend is at 48, then the mixing could be 100%
        fundamentals (mix factor 0%, resulting in a final projection of 54),
        100% poll trend (mix factor 100%, resulting in a final projection of
        48), 50% of each (mix factor 50%, resulting in a final projection of
        51), or other proportions. The optimal mix factor is identified where
        the error is minimized across all elections. Then, for each election,
        this mixed estimate is calculated, and a further correction is made to
        determine the bias of this mixed estimate. This bias is then subtracted
        to create the final estimate for the election.
      </p>
      <p>
        Equally important as obtaining a final estimate is measuring the
        uncertainty in that estimate by calculating <i>measures of spread</i>.
        For each election in the analysis, the error between the final estimate
        and the eventual result is measured. This forms a sample distribution of
        errors, from which statistics relating to the standard deviation and
        kurtosis (a measure of the frequency of extreme values) are taken. These
        are calculated separately for each side of the distribution (i.e.,
        positive or negative errors) to measure any asymmetry in the
        distribution.
      </p>
      <p>
        As mentioned earlier, the above process is repeated separately using
        different time points for the polling trend, each with its own set of
        parameters for the models (biases, mix factor, and measures of spread).
        Due to fluctuations in historical polling and the relatively small
        sample size, the parameters obtained also tend to fluctuate, as measured
        against the time remaining before the election. Since such fluctuations
        are very unlikely to have predictive value (being the result of polling
        volatility across a small sample of elections), and indeed are likely to
        mislead if they were actually used for modelling, the obtained
        parameters are each individually smoothed heavily over time into trends
        with gradual changes. This smoothing includes a heavy weighting for the
        result immediately before the election to avoid that time point being
        influenced by the considerably more uncertain earlier estimates.
      </p>
      <p>
        These smoothed parameter trends are then the truly final values used to
        produce a projection of the future election result from the poll trend.
      </p>
      <h5 id="mixing">Validating the projection</h5>
      <p>
        It is important to validate that this projection actually possesses
        predictive skill in predicting out-of-sample data. Since it is not
        feasible to new elections to test this, cross-validation is again
        employed. For each past election for which a polling trend has been
        generated, the above procedures to find the election fundamentals and
        projection parameters are repeated{' '}
        <i>
          completely excluding any data from the election being tested for or
          thereafter
        </i>
        .
      </p>
      <p>
        The new parameters are used to project the election result from the poll
        trend, and the error in this projection is recorded. Validation focuses
        on the two-party-preferred result, as it is the most critical for
        determining the overall election outcome, but other values are also
        checked. Errors for alternative, more basic estimates are also recorded
        for comparison:
      </p>
      <ul>
        <li>
          A simple baseline value: for the two-party-preferred vote, simply
          50-50, for minor parties and &quot;others&quot; their most recent
          first-preference election result in the same region, and for major
          party first preference vote shares, the average of the most recent six
          election results.
        </li>
        <li>The median value of the poll trend only.</li>
        <li>
          The &quot;fundamentals&quot; value used in calculating the projection.
        </li>
      </ul>
      <p>
        Focusing on 2PP, the results are clear—for almost all time points the
        projection method results in a significant reduction in the error
        compared to any of the more basic estimates. For example, exactly one
        year prior to the election, the average absolute error from the
        projection is 2.87 percentage points, compared to 3.68 from
        &quot;fundamentals&quot; only, 3.77 from the poll trend only, and 4.29
        from the baseline value.
      </p>
      <p>
        There are two main exceptions to this. The first is that, when out from
        the election by a year or longer, the projection for <i>federal</i> 2PP
        is not quite consistently better than the straight fundamentals (which,
        despite being simply 50-50, are quite close most of the time, as federal
        elections most often have quite a small margin). For most time points
        the modelled projection still performs better, but (as of March 2022) at
        some time points, such as 500 and 900+ days out from the election, the
        projection fails to beat the fundamentals, though it isn&apos;t
        significantly worse either. Note this <i>does not</i> apply to state
        elections—for them, the projected model notably and consistently
        outperforms simpler estimates as far as 2.5 years before the election.
      </p>
      <p>
        The other exception is that for estimates <i>very close</i> to the
        election—within a week or less—the projection becomes neither
        particularly better nor worse than the raw poll trend.
      </p>
      <h5 id="mixing">Sampling elections from the projection</h5>
      <p>
        So far in this process, the fundamentals, poll trend and projection have
        been used to create a probability distribution for each party&apos;s
        first preference (FP) vote share as well as the two-party-preferred
        (2PP) vote share. But simulating an election requires a complete
        picture—the FP votes must sum to 100% and align with the 2PP. Achieving
        this necessitates the creation of an <i>vote share sample</i>, a single
        instance of a projected election including the vote shares of the
        significant political parties. This includes FP votes, the 2PP and the
        preference flows from each party, which will be subject to some random
        variation.
      </p>
      <p>
        The most straightforward part of this step involves the minor parties
        (including the Greens), which receive a first preference vote share
        randomly selected from the probability distribution in their FP
        projection, as determined earlier.
      </p>
      <p>
        In addition to the significant minor parties, some samples are also
        assigned to include an &quot;emerging party&quot;, representing the
        possibility of a new party emerging and getting a sizeable percentage of
        the vote (as One Nation did significantly in the 1998 Queensland
        election, and to a lesser extent, the Palmer United Party in the 2013
        federal election). The probability of emergence and the size of the
        emerging party&apos;s vote are loosely extrapolated from the few such
        events that have occurred in the past; both decrease over time as the
        election approaches. The rate of this reduction over time is based on
        subjective judgment, as, while it is oevident that the chances of a new
        party emerging should decrease as the election approaches, there is
        insufficient data to even roughly estimate the rate of decrease.
      </p>
      <p>
        For the major parties, it is necessary to coordinate their FPs with the
        2PP so that the 2PP can result from a plausible preference flow. Two
        approaches are used to achieve this: either by using the FPs and
        ignoring the 2PP projection (<i>FP-first</i> approach) or by using the
        2PP projection and ignoring the FPs (<i>2PP-first</i> approach). Both
        methods have advantages and disadvantages, so for each sample, one or
        the other is picked at random.
      </p>
      <ul>
        <li>
          FP-first: Both the Labor and Coalition/Liberal FP vote shares are
          projected. The FP of all parties are then adjusted proportionally so
          that the total is equal to 100%. Each minor party is assigned a
          preference flow based on its preference flow at the previous election
          (or, if unavailable, the most comparable election available), with
          random variance according to the historical variability in that
          preference flow. From this a 2PP is calculated and used in the vote
          share sample.
        </li>
        <li>
          2PP-first: The 2PP value is projected. Preference flows for the minor
          parties are calculated as for the FP-first approach, including
          historical variance. Then the preferences are added together, and
          major parties are assigned FP vote shares such that, after accounting
          for the preferences, they match the 2PP.
        </li>
      </ul>
      <p>
        Once the major party and 2PP vote shares have been determined, a
        coherent vote share sample is established, which can be used as a basis
        for an election simulation. This process will be repeated many times
        over to generate the overall conditions for each successive election
        simulation, as described below.
      </p>
    </>
  );
};

export default MethodologyPollTrend;
