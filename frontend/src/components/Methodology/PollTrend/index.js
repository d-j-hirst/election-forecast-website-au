import React from 'react';

import { ExtLink } from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
    return (
        <>
            <h4 id="poll-trend">Poll Trend</h4>
            <p>
                The first step of preparing the forecast is to generate a <i>poll trend</i> from public opinion polling.
            </p>
            <h5 id="poll-data-used">Poll data used</h5>
            <p>
                Poll results have been collected from public sources
                (principally the <ExtLink href="https://www.pollbludger.net/">Poll Bludger</ExtLink> archives and <ExtLink href="https://www.wikipedia.org/">Wikipedia</ExtLink>).
                Polls that require a paywall or personal contact to view, as well as any internal polling reports, are not included.
                In addition, polls must:
            </p>
            <ul>
                <li>cover the entire region for the election they are being run for</li>
                <li>meet minimum standards for having a plausible sampling methodology</li>
                <li>report first preference (FP) votes for at least the two major parties and the Greens
                    (the Greens are not required for historical polls before 2010)</li>
                <li>report whether undecided voters are in the sample and if so, what proportion they are.</li>
            </ul>
            <p>
                The poll files used for forecasts can be viewed <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser/tree/master/analysis/Data">here</ExtLink> under the poll-data-xxx.csv files.
                The following data are used:
            </p>
            <ul>
                <li>The date of the poll, or the average of fieldwork dates. If the date is not given precisely it is
                    estimated from either previous polls by the pollster or to be a few days before its release.</li>
                <li>The brand name of the pollster that took the poll. Pollsters that use substantially different methodologies under
                    the same brand name are classed separately (for example, there are different entries for Roy Morgan face-to-face,
                    phone, SMS and multi-mode polls.)
                </li>
                <li>
                    A <i>quality rating</i> for the poll, based on track record (or lack thereof), sample size, regularity, membership of
                    the Australian Polling Council (only for polls taken after its inception), and other factors. For the full breakdown of
                    how polls are rated see this <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser/blob/master/analysis/Data/poll-quality-guidelines.txt">file</ExtLink>.
                    Lower ratings are better, and given more weight when generating the forecast.
                </li>
                <li>
                    First preference votes for all significant parties (some polled parties may be judged sufficiently unlikely to
                    ever challenge for a lower house seat). The Liberal and National parties are recorded separately for polls in
                    Western Australia but only the sum of their votes is recorded elsewhere. The publicised two-party preferred vote
                    for the ALP (if present) is recorded for display purposes but is not used in the forecast calculations. If the poll report
                    leaves undecided voters in the sample they are removed and the vote shares are rescaled so that the total adds to 100%.
                    If a poll does not give a specific value for "Others" it is assumed to be the number required to make all the first preferences
                    add up to 100.
                </li>
            </ul>
            <h5 id="poll-data-used">Generating the poll trend</h5>
            <p>
                From this data the actual poll trend is generated. This is done
                using <ExtLink href="https://en.wikipedia.org/wiki/Bayesian_hierarchical_modeling">Bayesian hierarchical modelling</ExtLink> through
                the <ExtLink href="https://www.python.org/">python</ExtLink> module <ExtLink href="https://pystan.readthedocs.io/en/latest/">pystan</ExtLink>.
                This approach is inspired by the <ExtLink href="https://marktheballot.blogspot.com/p/the.html">work</ExtLink> of
                blogger <ExtLink href="https://marktheballot.blogspot.com/">Mark the Ballot</ExtLink>, whose posts introduced the author to
                the technique.
            </p>
            <p>
                A detailed treatment of this method is quite technical and beyond the scope of this page. In brief, the method
                aims to find the probability distribution of a hiddle variable (in this case, the actual voting
                intention of the population over time) using imperfect information and assumptions. This results
                in a trend over time with probability bands, similar to the one shown under "Vote Totals" on the forecast page.
                (Important note: the poll trend is <i>not</i> actually the same data as the published vote trend, it just has a
                similar form. Further adjustments are made as described later.) 
            </p>
            <p>
                The following assumptions are used to formulate the model:
            </p>
            <ul>
                <li>The real voting intention changes over time according to
                    a <ExtLink href="https://en.wikipedia.org/wiki/Random_walk#Gaussian_random_walk">Gaussian random walk</ExtLink>.
                    Changes in voting intention are assumed to mostly be small most of the time, but increase during the election campaign,
                    especially in the final two weeks.
                </li>
                <li>Polls are assumed to be imperfect and biased estimates of actual voting intention.
                    Polls with the best quality rating are assumed to have an effective sample size of 1000
                    to determine their margin of error. (even if the actual sample size is larger),
                    and polls with lower quality ratings are assigned lower effective sample sizes. Roughly speaking,
                    this determines how much weight the model gives the poll in terms of its effect on the vote trend.
                </li>
                <li>Polls are assumed to have a <i>house effect</i>, giving lower or higher results than
                    the actual voting intention on average over time. Further, house effects from certain
                    "anchoring" pollsters are assumed to sum to zero. Anchoring pollsters selected are generally
                    polls with good quality ratings (specifically, 0 or 1 excluding sample size considerations, see above)
                    and, after the inception of the Australian Polling Council, must be members of it. If there cannot
                    be at least two pollsters running polls that meet these criteria, then another pollster may be used
                    as an anchoring pollster temporarily. The likelihood that the house effects of these pollsters
                    do not actually add to zero in practice is accounted for later.
                </li>
                <li>A poll's house effect is not assumed to be entirely constant over time. Instead a "new"
                    and "old" house effect are used for polls less than four months old and over eight months old
                    respectively, with polls in between those times using a linear mix of both house effects
                    These two house effects are loosely assumed to be similar but are allowed to differ quite
                    substantially is the evidence requires. The constraint of anchored house effects summing to
                    zero is applied separately for the set of new house effects and the set of old house effects.
                </li>
                <li>In the absence of polling data, voting intention is loosely assumed to be the same as at the previous
                    election, but with considerable uncertainty.
                </li>
            </ul>
            <p>
                The model is run using the available polling data, generating trends from the first poll in the current
                election cycle until the most recent poll. Estimates are made for first preferences for all major and
                minor parties deemed "significant" (generally, polling more than 3% or getting more than 5% in some
                previous general election), as well as a generic "others" for all minor parties except the Greens.
                A trend is generated for the entire time period, even for minor parties that
                don't have any data for a long period.
            </p>
            <p>
                A polling trend is also calculated for the two-party-preferred (TPP) vote. This does <i>not</i> use published
                TPP values, but instead calculates them according to the first preferences using preference flows
                from the previous election. Adjustments may be made to this estimation in cases where notable shifts in preference flows
                are observed in other elections. If a poll does not report first preferences for some minor parties that
                the first-preference trends are being calculated for, the first-preference trend of that minor party
                is used for the calculation and the corresponding amount is subtracted from the "Others" value reported in the poll.
            </p>
            <p>
                These polling trends are then used for the next step of the process: projecting the poll trend to actual election
                vote shares.
            </p>
        </>
    );
}

export default MethodologyPollTrend;