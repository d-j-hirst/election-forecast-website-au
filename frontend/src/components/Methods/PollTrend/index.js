import React from 'react';

import GlossaryLink from '../GlossaryLink';

import {ExtLink} from '../../../utils/extlink.js';

const MethodsPollTrend = props => {
  return (
    <>
      <h4 id="poll-trend">Poll Trend</h4>
      <p>
        The first step in preparing the forecast is to generate a{' '}
        <i>
          <GlossaryLink word="poll trend" />
        </i>{' '}
        from public opinion polling data.
      </p>
      <h5 id="poll-data-used">Poll data used</h5>
      <p>
        <GlossaryLink word="Polls" /> are collected mainly from public sources:
        directly from pollsters, through news media, or from the{' '}
        <ExtLink href="https://www.pollbludger.net/">Poll Bludger</ExtLink>{' '}
        archives, with additional historical data from{' '}
        <ExtLink href="https://www.wikipedia.org/">Wikipedia</ExtLink>. Wherever
        possible, the figures are verified in original sources, often via the{' '}
        <ExtLink href="https://archive.org/web/">Wayback Machine</ExtLink>. Many
        older results (pre-2007) have been kindly provided by{' '}
        <ExtLink href="https://kevinbonham.blogspot.com/">Kevin Bonham</ExtLink>
        .
      </p>
      <p>
        Polls that require payment to access are not included unless a free
        method is available. To be eligible for analysis, polls must:
      </p>
      <ul>
        <li>
          Cover the entire voting region for the relevant election (for example,
          a federal election poll covering only one state is excluded);
        </li>
        <li>Meet minimum standards for plausible sampling methods;</li>
        <li>
          Report <GlossaryLink word="first preference (FP)" /> votes for at
          least the two <GlossaryLink word="major parties" /> and the Greens
          (except for historical polls before 2010)
        </li>
        <li>
          Indicate whether undecided voters are included in the sample and, if
          so, specify their proportion.
        </li>
      </ul>
      <p>
        The poll files used for forecasts can be viewed{' '}
        <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser/tree/master/analysis/Data">
          here
        </ExtLink>{' '}
        under the poll-data-xxx.csv files. If you notice any missing polls, feel
        free to inform the site&apos;s author (email link above), noting that
        only publicly available poll results can be included.
      </p>
      <h6>Data Recorded for Each Poll</h6>
      <p>For each poll, the following information is recorded:</p>
      <ul>
        <li>
          <strong>Date:</strong> The fieldwork date or the average of the
          fieldwork dates. If unknown, an estimate is made based on previous
          polling timelines or is assumed to be a few days before release.
        </li>
        <li>
          <strong>Pollster:</strong> The brand name of the polling firm. If a
          pollster uses different methodologies under the same name, they are
          classed separately (e.g., Roy Morgan face-to-face, phone, SMS, and
          multi-mode polls).
        </li>
        <li>
          <strong>First preference votes:</strong> Votes for all significant
          parties. Note that in Western Australia the Liberal and National
          parties are recorded separately, while elsewhere they are combined.
          The publicised <GlossaryLink word="two-party-preferred vote" />, if
          present, is recorded for display purposes only and is not used in
          forecast calculations.
        </li>
        <li>
          <strong>Undecided Votes:</strong> If undecided voters are included in
          the sample, they are removed and the remaining vote shares are
          rescaled to total 100%.
        </li>
        <li>
          <strong>&quot;Others&quot; Vote Share:</strong> If a poll does not
          specify a value for &quot;Others,&quot; it is inferred so that the
          first preferences sum to 100%.
        </li>
      </ul>
      <h5 id="poll-data-used">Generating the poll trend</h5>
      <p>
        The poll trend is generated via{' '}
        <ExtLink href="https://en.wikipedia.org/wiki/Bayesian_hierarchical_modeling">
          Bayesian hierarchical modelling
        </ExtLink>{' '}
        using the <ExtLink href="https://www.python.org/">Python</ExtLink>{' '}
        module{' '}
        <ExtLink href="https://pystan.readthedocs.io/en/latest/">
          PyStan
        </ExtLink>
        . This method—inspired by the{' '}
        <ExtLink href="https://marktheballot.blogspot.com/p/the.html">
          work
        </ExtLink>{' '}
        of{' '}
        <ExtLink href="https://marktheballot.blogspot.com/">
          Mark the Ballot
        </ExtLink>{' '}
        and first applied in the 2004 federal election{' '}
        <ExtLink href="http://dx.doi.org/10.1080/10361140500302472">
          (Jackman, 2005)
        </ExtLink>
        —estimates the probability distribution of a hidden variable (in this
        case, actual voting intention over time) using imperfect polling data
        and statistical assumptions. The result is a trend with probability
        bands, similar to the display under Vote Totals on the forecast page.
        (Note: the poll trend itself is not the same as the published vote
        trend; further adjustments are applied later.)
      </p>
      <p>The model incorporates the following assumptions:</p>
      <ul>
        <li>
          <strong>Voting Intention Dynamics:</strong> Voting intention changes
          over time in a manner approximating a{' '}
          <ExtLink href="https://en.wikipedia.org/wiki/Random_walk#Gaussian_random_walk">
            Gaussian random walk
          </ExtLink>
          . These shifts are generally small but tend to increase during the
          election campaign, particularly in the final two weeks.
        </li>
        <li>
          <strong>Poll imperfections:</strong> Polls are imperfect estimates of
          true voting intention, influenced by random errors (such as sampling
          variation, timing inconsistencies, and response biases) as well as
          systematic bias due to methodological limitations.
        </li>
        <li>
          <strong>Pollster Reliability:</strong> The historical volatility of
          each pollster&apos;s results—measuring the degree to which results
          deviate from the overall trend—is evaluated to determine reliability.
          Pollsters with higher volatility are deemed less reliable in tracking
          shifts in voting intention, so their results are given less weight for
          short-term movements in the trend.
        </li>
        <li>
          <strong>House Effects:</strong> Pollsters often overestimate or
          underestimate certain parties because of methodological differences.
          The model calculates a systematic bias, or{' '}
          <GlossaryLink word="house effects" />, for each pollster based on past
          election performance. Those with consistent biases are weighted more
          heavily when determining overall support levels, ensuring that
          fluctuating biases do not disproportionately affect the trend.
        </li>
        <li>
          <strong>Variable House Effects Over Time:</strong> A pollster&apos;s
          house effect is not assumed to be constant. Instead, separate
          &quot;new&quot; and &quot;old&quot; house effects are applied to polls
          less than four months old and those over eight months old,
          respectively. Polls from the intermediate period use a linear
          combination of the two. While these effects are assumed to be similar,
          they may differ substantially if the evidence indicates.
        </li>
        <li>
          <strong>Weak Prior in the Absence of Data:</strong> In situations with
          no polling data, voting intention is loosely assumed to match the
          previous election, albeit with considerable uncertainty.
        </li>
      </ul>
      <p>
        The model is run using the available polling data, generating vote share
        trends for the entire election period—from the earliest poll in the
        cycle to the most recent. Separate estimates are produced for:
      </p>
      <ul>
        <li>
          <strong>First Preferences:</strong> Estimates for all major parties
          and significant minor parties (generally those polling above 3% or
          with support exceeding 5% in past elections).
        </li>
        <li>
          <strong>&quot;Others&quot; Category:</strong> A generic category
          aggregating all minor parties except the Greens.
        </li>
        <li>
          <strong>Two-Party-Preferred (2PP):</strong> Vote shares calculated
          from first preferences using historical preference flows, with
          adjustments made if significant shifts in these flows are observed.
        </li>
      </ul>
      <p>
        If a poll lacks first-preference data for a minor party included in the
        trend, an estimated value from the trend is used, with the corresponding
        share subtracted from the &quot;Others&quot; total.
      </p>
      <p>
        These poll trends form the basis for the next step: projecting the poll
        trend to actual election vote shares.
      </p>
      <h5 id="pollster-calibration">Further details on pollster calibration</h5>
      <p>
        To effectively use polling data, the model must assess each
        pollster&apos;s reliability in estimating true voting intention.
        Directly comparing poll results with actual election outcomes isn&apos;t
        statistically reliable for most Australian pollsters—many have only been
        tested in a few elections. Instead, pollsters are evaluated{' '}
        <i>relative to one another</i> through the following two-step process:
      </p>
      <ul>
        <li>
          <strong>Step 1:</strong> Use the poll data to create a poll trend,
          calibrated by the relationship between past polls and those conducted
          nearby in time.
        </li>
        <li>
          <strong>Step 2:</strong> Use that poll trend to estimate the
          distribution of results, calibrated by the relationship between past
          poll trends and election outcomes.
        </li>
      </ul>
      <p>
        These steps ensure that each calibration is based on a sufficiently
        large sample.
      </p>
      <p>For each pollster, three key factors are measured:</p>
      <ul>
        <li>
          <strong>Trend Tracking:</strong> How closely the pollster&apos;s data
          follows the general trend. After accounting for a constant house
          effect, does the pollster produce results that align with other polls,
          or are they unusually noisy or divergent?
        </li>
        <li>
          <strong>Typical Bias:</strong> Whether the pollster systematically
          overestimates or underestimates support for certain parties.
        </li>
        <li>
          <strong>Bias Consistency:</strong> How stable the pollster&apos;s bias
          is across different elections. When calibrating the overall poll
          trend, data from pollsters with consistent biases is preferred—even if
          the bias is large—over data from those whose bias varies significantly
          between elections.
        </li>
      </ul>
      <h6 id="pollster-calibration">Setting up the comparison poll trends</h6>
      <p>
        To evaluate these factors, a simplified <i>comparison poll trend</i> is
        generated for each pollster in every election. In this setup, the
        pollster under evaluation (the <i>pollster in focus</i>) is compared
        against a trend constructed solely from the other pollsters. This
        process differs from the above poll trend generation in that:
      </p>
      <ul>
        <li>All polls from the pollster in focus are excluded.</li>
        <li>
          All remaining pollsters are treated as equivalent, assuming the same
          volatility and weighting for calculating the summed house effect.
        </li>
        <li>The sum of house effects will always equal zero.</li>
      </ul>
      <h6 id="pollster-calibration">Calculating the indication of trend</h6>
      <p>
        The next step is to determine how effectively the pollster in focus
        indicates the general trend. This is done as follows:
      </p>
      <ul>
        <li>
          <strong>House Effect Adjustment:</strong> First, the house effect of
          the pollster in focus—relative to the comparison trend—is calculated
          and subtracted from each of its polls (as it is only needed to
          consider the movement, not the absolute values).
        </li>
        <li>
          <strong>Averaging Differences:</strong> The remaining differences
          between these adjusted polls and the comparison trend at the
          corresponding times are then averaged. This average is weighted by
          proximity to other polls (for example, polls conducted on the same day
          as two others receive full weighting, while those with no other polls
          within two months receive almost zero weighting).
        </li>
      </ul>
      <p>
        This measure is independent of actual election outcomes. A lower value
        indicates that the pollster&apos;s results closely follow the overall
        trend (though it does not necessarily mean the pollster is a better
        indicator of the “true” voting intention). Caution is advised in
        interpreting this variable—a low value could result from herding (or
        even fabrication), while a high value might reflect that the pollster is
        picking up real changes that others miss. The model assumes that the
        overall trend is generally more informative than individual deviations.
      </p>
      <p>
        After calculating the indication of trend for each individual election,
        the results are combined across all elections for each pollster using a
        weighted average. The weightings depend on both the number of polls the
        pollster in focus has conducted and the total number of polls in that
        election—more polls yield a higher weighting. In addition to the actual
        results, this weighted average includes an &quot;initial&quot; election
        (a hypothetical result acting similarly to a regularisation parameter or
        Bayesian prior) that represents the performance of a rather erratic
        pollster who recorded about seven polls. As the pollster conducts more
        actual polls, the influence of this initial estimate gradually
        diminishes, until such time as the pollster has sufficient data, at
        which point the effect of this initial estimate becomes insignificant.
      </p>
      <h6 id="pollster-calibration">
        Calculating the typical bias and its variability
      </h6>
      <p>
        One straightforward method to assess a pollster&apos;s long-term bias is
        by comparing its final results with the actual election outcomes. In
        Australia, however, many pollsters have a limited track record—often
        providing final pre-election polls in only a few elections—so random
        polling variation may obscure meaningful signals.
      </p>
      <p>
        To reduce such fluctuations, the model evaluates an entire election
        cycle&apos;s polling data rather than relying solely on final
        pre-election polls. This is achieved by combining the estimated house
        effect for a pollster (determined relative to the comparison poll trend)
        with the final median value of that trend. The sum produces a refined
        final result estimate for the pollster, effectively reducing random
        noise by incorporating multiple poll samples. (For the house effect, all
        polls by the pollster in the term prior to the election are included,
        and for the final poll value, all polls conducted close to the election
        by any pollster are considered.)
      </p>
      <p>
        For example, if an election&apos;s final two-party-preferred (2PP) vote
        is 53%, the final poll trend value is 52%, and a pollster&apos;s average
        house effect is 2%, then the pollster&apos;s final result estimate
        becomes 52 + 2 = 54%. The bias for that election is then 54 – 53 = +1%.
      </p>
      <p>
        The typical bias for a pollster is calculated as a weighted average of
        these biases across elections in which the pollster has participated.
        The weighting is adjusted based on both the number of polls the pollster
        conducted and the total number of polls in that election, so that
        estimates based on larger samples receive higher weight. The variability
        of the bias is measured using the standard deviation of these weighted
        biases.
      </p>
      <p>
        As with the indication-of-trend measures, the model includes an initial
        estimate to address cases where a pollster has little or no historical
        election data. This initial estimate comprises two hypothetical
        elections with equal but opposite biases and low weightings. In
        practice, this means that for new or untested pollsters, the model
        assumes a neutral bias (zero) but assigns high uncertainty to that
        assumption. This approach prevents such pollsters from unduly
        influencing the expected election bias until enough data is available.
        As the pollster contributes more real-world data, the influence of this
        initial estimate gradually diminishes.
      </p>
    </>
  );
};

export default MethodsPollTrend;
