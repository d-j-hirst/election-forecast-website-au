import React from 'react';

import GlossaryLink from '../GlossaryLink';

import {ExtLink} from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
  return (
    <>
      <h4 id="poll-trend">Poll Trend</h4>
      <p>
        The first step in preparing the forecast is to generate a{' '}
        <i>
          <GlossaryLink word="poll trend" />
        </i>{' '}
        from public opinion polling.
      </p>
      <h5 id="poll-data-used">Poll data used</h5>
      <p>
        <GlossaryLink word="Poll" /> results have been collected primarily from
        public sources, either directly from the pollster, news media or from
        the <ExtLink href="https://www.pollbludger.net/">Poll Bludger</ExtLink>{' '}
        archives, with additional historical data from{' '}
        <ExtLink href="https://www.wikipedia.org/">Wikipedia</ExtLink>. Where
        possible, the figures are verified in original sources, often via the{' '}
        <ExtLink href="https://archive.org/web/">Wayback Machine</ExtLink>. Many
        older results (pre-2007) have been kindly provided by{' '}
        <ExtLink href="https://kevinbonham.blogspot.com/">Kevin Bonham</ExtLink>
        .
      </p>
      <p>
        Polls that require payment to view are not included unless a method for
        accessing the results without a paywall is available. To be included in
        the analysis, polls must:
      </p>
      <ul>
        <li>
          Cover the entire voting region for the election in question (e.g., a
          federal election poll covering only one state is excluded).
        </li>
        <li>Meet minimum standards for plausible sampling methodology</li>
        <li>
          Report <GlossaryLink word="first preference (FP)" /> votes for at
          least the two <GlossaryLink word="major parties" /> and the Greens
          (except for historical polls before 2010)
        </li>
        <li>
          Indicate whether undecided voters are included in the sample and, if
          so, what proportion they represent.
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
      <p>The following data is recorded for each poll:</p>
      <ul>
        <li>
          <strong>Date:</strong> The fieldwork date or an average of the
          fieldwork dates. If these are unknown, an estimate is made based on
          previous polling timelines or assumed to be a few days before the
          release.
        </li>
        <li>
          <strong>Pollster:</strong> The brand name of the polling firm. If a
          pollster uses different methodologies under the same name, they are
          classed separately (e.g., Roy Morgan face-to-face, phone, SMS, and
          multi-mode polls).
        </li>
        <li>
          <strong>First preference votes:</strong> Votes for all significant
          parties. The Liberal and National parties are recorded separately in
          Western Australia but combined elsewhere. The publicised{' '}
          <GlossaryLink word="two-party-preferred vote" /> (if present) is
          recorded for display purposes but is not used in forecast
          calculations.
        </li>
        <li>
          <strong>Undecided Votes:</strong> If a poll includes undecided voters
          in its sample, they are removed, and the remaining vote shares are
          rescaled to total 100%.
        </li>
        <li>
          <strong>&quot;Others&quot; Vote Share:</strong> If a poll does not
          specify a value for &quot;Others,&quot; it is inferred to ensure first
          preferences sum to 100%.
        </li>
      </ul>
      <h5 id="poll-data-used">Generating the poll trend</h5>
      <p>
        Using this data, the poll trend is generated using{' '}
        <ExtLink href="https://en.wikipedia.org/wiki/Bayesian_hierarchical_modeling">
          Bayesian hierarchical modelling
        </ExtLink>{' '}
        using the <ExtLink href="https://www.python.org/">Python</ExtLink>{' '}
        module{' '}
        <ExtLink href="https://pystan.readthedocs.io/en/latest/">
          PyStan
        </ExtLink>
        . This approach is inspired by the{' '}
        <ExtLink href="https://marktheballot.blogspot.com/p/the.html">
          work
        </ExtLink>{' '}
        of{' '}
        <ExtLink href="https://marktheballot.blogspot.com/">
          Mark the Ballot
        </ExtLink>
        and was first used in Australian politics to analyse the 2004 federal
        election{' '}
        <ExtLink href="http://dx.doi.org/10.1080/10361140500302472">
          (Jackman, 2005)
        </ExtLink>
        .
      </p>
      <p>
        A detailed explanation of this technique is beyond the scope of this
        page. In summary, the method estimates the probability distribution of a
        hidden variable—in this case, actual voting intention over time—based on
        imperfect polling data and statistical assumptions. This produces a
        trend with probability bands, similar to the one shown under Vote Totals
        on the forecast page. (
        <i>
          Note: the poll trend itself is not the same as the published vote
          trend; further adjustments are made later.
        </i>
        )
      </p>
      <p>The model incorporates the following assumptions:</p>
      <ul>
        <li>
          Voting intention changes over time in a manner approximating a{' '}
          <ExtLink href="https://en.wikipedia.org/wiki/Random_walk#Gaussian_random_walk">
            Gaussian random walk
          </ExtLink>
          . These changes are generally small but tend to increase during the
          election campaign, especially in the final two weeks.
        </li>
        <li>
          Polls are imperfect estimations of actual voting intention, influenced
          by both random errors (sampling variation, timing inconsistencies,
          response biases) and systemic bias (methodological limitations in
          representing the full population).
        </li>
        <li>
          Pollster reliability varies. Each pollster’s historical volatility—the
          extent to which its results fluctuate relative to the overall trend—is
          assessed. Pollsters with higher volatility are considered less
          reliable in tracking shifts in voting intention, so their results
          influence short-term movements in the trend line less.
        </li>
        <li>
          Pollsters have <GlossaryLink word="house effects" />. Each pollster
          tends to overestimate or underestimate certain parties over time due
          to methodological differences. The model accounts for this by
          calculating systematic bias for each pollster based on past election
          performance. Pollsters with more consistent biases are weighted more
          heavily when determining the overall level of support for each party,
          ensuring that fluctuating biases do not disproportionately affect the
          trend line&apos;s position.
        </li>
        <li>
          A pollster&apos;s house effect is not assumed to be entirely constant
          over time. Instead a &quot;new&quot; and &quot;old&quot; house effect
          are used for polls less than four months old and over eight months old
          respectively, with polls in between those times using a linear mix of
          both house effects. These two house effects are loosely assumed to be
          similar but are allowed to differ quite substantially if the evidence
          indicates.
        </li>
        <li>
          In the absence of polling data, as a weak prior, voting intention is
          loosely assumed to match the previous election, but with considerable
          uncertainty.
        </li>
      </ul>
      <p>
        The model is run using the available polling data, generating vote share
        trends for the entire election period from the earliest poll in the
        cycle to the most recent. Separate estimates are made for:
      </p>
      <ul>
        <li>
          First preferences for all major and significant minor parties
          (generally, those polling &gt;3% or exceeding 5% in past elections).
        </li>
        <li>
          a generic &quot;others&quot; category for all minor parties except the
          Greens.
        </li>
        <li>
          Two-party-preferred (2PP) vote shares, calculated from first
          preferences using past preference flows (adjusted if significant
          shifts in flow patterns are observed).
        </li>
      </ul>
      <p>
        If a poll lacks first-preference data for a minor party included in the
        trend, an estimated value from the trend is used, with the corresponding
        amount subtracted from the &quot;Others&quot; total.
      </p>
      <p>
        These poll trends form the basis for the next step: projecting the poll
        trend to actual election vote shares.
      </p>
      <h5 id="pollster-calibration">Further details on pollster calibration</h5>
      <p>
        To effectively utilise polling data, the model must assess each
        pollster&apos;s reliability in estimating true voting intention. The
        most straightforward method is to compare pollsters&apos; results to
        actual election outcomes. Most Australian pollsters have only been
        tested in a few elections, making direct comparisons statistically
        unreliable. Therefore, assessing pollsters needs to be done in a
        somewhat more indirect manner, by evaluating pollsters{' '}
        <i>relative to each other</i>.
      </p>
      <p>
        A brief outline of this process is described first, with more detail
        below:
      </p>
      <ul>
        <li>
          Use the poll data to create a poll trend, calibrated by the
          relationship between past polls and other polls nearby in time.
        </li>
        <li>
          Use that poll <i>trend</i> to estimate the distribution of results,
          calibrated by the relationship between past poll trends and results.
        </li>
      </ul>
      <p>
        Importantly, these two steps (polls to poll trends, and poll trends to
        results) now each have a large enough sample size to make calibrations
        meaningful.
      </p>
      <p>
        For this process it is desired to measure three things for each
        pollster:
      </p>
      <ul>
        <li>
          <i>How well does the pollster track the general trend?</i> That is,
          after accounting for a constant house effect, does it closely follow
          other polls, or does it produce noisy results or trends not shown by
          other pollsters?
        </li>
        <li>
          <i>
            What is the pollster&apos;s typical <GlossaryLink word="bias" />?
          </i>
          Does it systematically overestimate or underestimate certain parties?
        </li>
        <li>
          <i>How consistent is its bias across elections?</i> When calibrating
          the overall bias of the poll trend, it is preferable to use pollsters
          with a consistent bias, even if it is quite large, rather than those
          that vary significantly from one election to the next.
        </li>
      </ul>
      <h6 id="pollster-calibration">Setting up the comparison poll trends</h6>
      <p>
        To assess these factors, a simplified <i>comparison poll trend</i> is
        generated for each pollster in every election. This pollster will
        henceforth be referred to as the <i>pollster in focus</i>—i.e. the one
        whose behaviour is being measured. This is done to compare that pollster
        to the trend from the <i>other</i> pollsters. This follows a similar
        approach to the final poll trend described above, with the following
        changes:
      </p>
      <ul>
        <li>
          Exclude all the polls from the pollster in focus from the analysis.
        </li>
        <li>
          Treat all other pollsters as equivalent, with the same volatility and
          the same weighting for calculating the summed house effect.
        </li>
        <li>The sum of house effects will always equal zero.</li>
      </ul>
      <h6 id="pollster-calibration">Calculating the indication of trend</h6>
      <p>
        The central value (median) of the resultant trend is then compared with
        the polls of the pollster in focus to determine its effectiveness as an{' '}
        <i>indicator of trend</i>. First, the house effect of the pollster in
        focus relative to the comparison poll trend is calculated and then
        subtracted from each of their polls (for this step, only the movement of
        the polls, not their absolute values, is considered.).
      </p>
      <p>
        Next, the remaining differences between each of those polls and the
        comparison poll trend at the same time are averaged to provide a measure
        of the pollster&apos;s indication of trend for this election. To prevent
        a pollster from being penalised for polling when no other pollsters are
        polling (and potentially obtaining a result far off trend when the trend
        would have been much closer had there been other polls), this average is
        weighted by the proximity to other polls. While the exact formula
        won&apos;t be discussed here, to give a couple of examples, having two
        other polls on the same day gives a full weighting, and having no other
        polls within two months gives a near-zero weighting.
      </p>
      <p>
        This measure is independent of actual election results, meaning it can
        be calculated even for an election whose results are not yet known.
        Also, since the value is a measure of the deviation of the
        pollster&apos;s polls from the trend, a lower number indicates the poll
        is more accurate <i>as an indicator of the trend</i> (but not
        necessarily a better indicator of the &quot;true&quot; voting
        intention). It&apos;s important to be cautious in the interpretation of
        this variable—a low value may be as a result of the pollster herding, or
        even outright fabricating results, while a high value might be the
        result of a pollster detecting real changes that others might miss.
        Still, the model assumes that the trend will <i>usually</i> be more
        informative than those pollsters that deviate from it.
      </p>
      <p>
        Following the calculation of the indication of trend for each individual
        election, the results across all elections are combined (separately for
        each pollster) in a weighted average. The weightings for each election
        are determined by both the number of polls for the pollster in focus,
        and also the number of polls in total (in both cases, a high number of
        polls gives a higher weighting). In addition to the actual results, this
        weighted average includes an &quot;initial&quot; election (not a real
        result) that is functionally similar to (but mathematically different
        to) a Bayesian prior or regularization parameter—it allows for a default
        expectation of poll behaviour when there is little or no empirical data
        available. This default election is equivalant to the performance of a
        quite erratic pollster that recorded about seven polls. As the pollster
        records more actual polls, the influence of this default value becomes
        insignificant. But with new pollsters for which there is little data
        available to calibrate their polls, it ensures that the model is
        cautious about the influence that their results have.
      </p>
      <h6 id="pollster-calibration">
        Calculating the typical bias and its variability
      </h6>
      <p>
        As mentioned earlier, the most straightforward way to measure a
        pollster&apos;s long-term bias is to compare its final results to the
        actual election outcomes. The challenge in Australia is that many
        pollsters currently have a very limited track record, often having final
        pre-election polls in only a few elections. Consequently, the random
        variation inherent in opinion polling is likely to obscure any
        meaningful signal in those results.
      </p>
      <p>
        To reduce random fluctuations, the model evaluates an entire election
        cycle&apos;s polling data rather than just final pre-election polls.
        This is achieved by taking the estimated house effect for that pollster,
        relative to the comparison poll trend, and adding it to the final median
        value of the comparison poll trend. This creates a{' '}
        <i>final result estimate</i> for that pollster. This method produces a
        refined estimate of the pollster&apos;s final result, reducing random
        noise by incorporating multiple poll samples. (In the case of the house
        effect, all of the pollster&apos;s polls in the term prior to the
        election are included, and in the case of the final poll value, all the
        polls from any pollster close to the election are included.)
      </p>
      <p>
        For example, suppose an election has a final result where the
        two-party-preferred vote is 53%, the final value of the poll trend is
        52%, and our pollster has an average house effect of 2% across all its
        polls in that election. Then the pollster&apos;s final result estimate
        is 52&nbsp;+&nbsp;2&nbsp;=&nbsp;54% (regardless of what their final poll
        says!) and thus their bias for that election is
        54&nbsp;-&nbsp;53&nbsp;=&nbsp;+1%.
      </p>
      <p>
        The calculation of the typical bias for a pollster is then a weighted
        average of these calculated biases for elections in which the pollster
        conducted polls. This weighting is adjusted according to the number of
        polls that the pollster conducted, as well as the total number of polls
        conducted by all pollsters in that election, to reflect that such
        estimates are more reliable with a larger sample of data. Finally, the{' '}
        <i>bias variability</i> is measured using the standard deviation of the
        same data with the same weightings.
      </p>
      <p>
        As with the indication-of-trend measures, the model includes an initial
        estimate to handle cases where a pollster has little or no historical
        election data. This estimate consists of two hypothetical elections with
        equal but opposite biases and low weightings.
      </p>
      <p>
        In practice, this means that for new or untested pollsters, the model
        assumes a neutral bias (zero) but assigns high uncertainty to that
        assumption. This prevents such pollsters from unduly influencing the
        expected election bias until sufficient data is available to calibrate
        their performance. As the pollster contributes more real-world data, the
        influence of this initial estimate gradually diminishes.
      </p>
    </>
  );
};

export default MethodologyPollTrend;
