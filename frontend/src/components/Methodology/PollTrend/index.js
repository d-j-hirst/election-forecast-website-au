import React from 'react';

import GlossaryLink from '../GlossaryLink';

import { ExtLink } from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
    return (
        <>
            <h4 id="poll-trend">Poll Trend</h4>
            <p>
                The first step of preparing the forecast is to generate
                a <i><GlossaryLink word="poll trend" /></i> from public opinion polling.
            </p>
            <h5 id="poll-data-used">Poll data used</h5>
            <p>
                <GlossaryLink word="Poll" /> results have been collected from public sources
                (principally the <ExtLink href="https://www.pollbludger.net/">Poll Bludger</ExtLink> archives
                with some additional historical data from <ExtLink href="https://www.wikipedia.org/">Wikipedia</ExtLink>).
                Polls that require a paywall or personal contact to view, as well as any internal polling reports, are not included.
                In addition, polls must:
            </p>
            <ul>
                <li>
                    cover the entire region for the election they are being run for 
                    (so, for example, a poll for a federal election that only covers one state is not included)
                </li>
                <li>meet minimum standards for having a plausible sampling methodology</li>
                <li>
                    report <GlossaryLink word="first preference (FP)" /> votes for at least the
                    two <GlossaryLink word="major parties" /> and the Greens
                    (the Greens are not required for historical polls before 2010)
                </li>
                <li>report/imply whether undecided voters are in the sample and if so, what proportion they are</li>
            </ul>
            <p>
                The poll files used for forecasts can be
                viewed <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser/tree/master/analysis/Data">here</ExtLink> under
                the poll-data-xxx.csv files.
                Feel free to inform the site's author of any polls not yet included, noting that they can only be included
                if the results are available to be released publicly.
                The following data from the poll are used:
            </p>
            <ul>
                <li>
                    The date of the poll, or the average of fieldwork dates. If the date is not known precisely, it is either
                    estimated from the known fieldwork dates of previous polls by the polling house,
                    or assumed to be a few days before the release of its results.</li>
                <li>
                    The brand name of the polling house that took the poll. Polling houses that use
                    substantially different methodologies under the same brand name are classed separately
                    (for example, there are different entries for Roy Morgan face-to-face,
                    phone, SMS and multi-mode polls.)
                </li>
                <li>
                    First preference votes for all significant parties (some polled parties may be judged sufficiently unlikely to
                    ever challenge for a lower house seat). The Liberal and National parties are recorded separately for polls in
                    Western Australia but only the sum of their vote shares is recorded elsewhere. The
                    publicised <GlossaryLink word="two-party-preferred vote" /> (if present)
                    is recorded for display purposes but is not used in the forecast calculations. If the poll report
                    leaves undecided voters in the sample, they are removed and the vote shares are rescaled so that the
                    total adds to 100%. If a poll does not give a specific value for "Others" it is assumed to be the
                    number required to make all the first preferences add up to 100.
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
                aims to find the probability distribution of a hidden variable (in this case, the actual voting
                intention of the population over time) using imperfect information and assumptions. This results
                in a trend over time with probability bands, similar to the one shown under "Vote Totals" on the forecast page.
                (Important note: the poll trend is <i>not</i> actually the same data as this published vote trend, it just has a
                similar form. Further adjustments are made as described later.) 
            </p>
            <p>
                The following assumptions are used to formulate the model:
            </p>
            <ul>
                <li>
                    The real voting intention for the whole election is assumed to change over time approximately following a
                    a <ExtLink href="https://en.wikipedia.org/wiki/Random_walk#Gaussian_random_walk">Gaussian random walk</ExtLink>.
                    Changes in voting intention are assumed to mostly be small most of the time, but increase during the election campaign,
                    especially in the final two weeks. The process is 
                </li>
                <li>
                    Polls are assumed to be imperfect and biased estimates of actual voting intention.
                    This is expected to manifest as a mix of random error and longer-term systemic bias.
                    Random errors are expected as a result of sampling variability, but may potentially also be due to
                    changes in timing of the poll (if not consistent) and external events that affect
                    response rates separately to actual changes in voting intention. On the other hand
                    systemic bias is expected as a result of the inability of methods to perfectly
                    represent the full population in their sampling, leaving some parts of the population
                    underrepresented in each poll.
                </li>
                <li>
                    The random component of the error is assumed to vary depending on the pollster and method.
                    For each pollster, a measure of how closely their polls follow the trend of other pollsters
                    is taken (see "More on pollster calibration" below). This indicates the volatility of the pollster's
                    results; pollsters with higher volatility are considered to be less reliable indicators of the
                    voting intention trend, and the method is therefore designed so that they do not
                    influence the calculated poll trend as much.
                </li>
                <li>
                    Pollsters are also assumed to have a <i>house effect</i>, giving lower or higher results than
                    the actual voting intention on average over time. The model accounts for this by summing a
                    weighted average of all pollsters' house effects and constraining them to be equal to the
                    expected overall bias. The weighting is based on how close the house effect of the poll
                    has been to the poll trend in other elections (see "More on pollster calibration" below);
                    pollsters who are usually in the "middle of the pack" are weighted more heavily. The sum
                    of the house effects is equal to the average bias of the pollsters involved when compared
                    to actual election results; the same weightings as before are used in calculating this average.
                </li>
                <li>
                    A pollster's house effect is not assumed to be entirely constant over time. Instead a "new"
                    and "old" house effect are used for polls less than four months old and over eight months old
                    respectively, with polls in between those times using a linear mix of both house effects.
                    These two house effects are loosely assumed to be similar but are allowed to differ quite
                    substantially if the evidence indicates.
                </li>
                <li>
                    In the absence of polling data, as a weak prior, voting intention is loosely assumed to be
                    the same as at the previous election, but with considerable uncertainty.
                </li>
            </ul>
            <p>
                The model is run using the available polling data, generating trends for vote shares across the whole election
                from the first poll in the current
                election cycle until the most recent poll. Separate estimates are made for first preferences for all major and
                minor parties deemed "significant" (generally, polling more than 3% or getting more than 5% in some
                previous general election), as well as a generic "others" for all minor parties except the Greens.
                A trend is generated for the entire time period, even for minor parties that
                don't have any polling data for a long period.
            </p>
            <p>
                A polling trend is also calculated for the two-party-preferred (TPP) vote. This does <i>not</i> use published
                TPP values, but instead calculates them according to the first preferences using preference flows
                from the previous election. Adjustments may be made to this estimation in cases where notable shifts in preference flows
                are observed in other elections. If a poll does not report first preferences for some minor parties for which
                first-preference trends are being generated, then the first-preference poll trend of that minor party
                at the date of the poll is used for the TPP calculation, and the corresponding amount is subtracted
                from the "Others" value reported in the poll.
            </p>
            <p>
                These polling trends are then used for the next step of the process: projecting the poll trend to actual election
                vote shares.
            </p>
            <h5 id="pollster-calibration">More on pollster calibration</h5>
            <p>
                In order to best make use of polling information, it's important for the model to
                determine the value of pollsters in estimating true voting intention. The most natural way to
                do this is to compare pollsters' results to actual election results. Unfortunately, most Australian
                pollsters have been tested at extremely few elections; with such a low sample size the results of
                such a comparison won't have much meaning. Therefore assessing pollsters needs to be done in a somewhat
                more indirect manner, by measuring pollsters and polls <i>against each other</i>.
                This allows for the following workflow to be used:
            </p>
            <ul>
                <li>
                    First, use the poll data to create a poll trend, calibrated by the
                    relationship between past polls and other polls nearby in time.
                </li>
                <li>
                    Second, use that poll <i>trend</i> to estimate the distribution of final results,
                    calibrated by the relationship between past poll trends and results.
                </li>
            </ul>
            <p>
                Importantly, the two steps (polls to poll trends, and poll trends to results) will
                now each have a large enough sample size to make calibrations meaningful.
            </p>
            <p>
                To achieve this, for each election
                other than the one we are currently analysing, a simplified poll trend is generated.
                This follows a similar approach as for the final poll trend described above, with the
                following exceptions (these are done once for each pollster producing any polls for the
                election, we shall call this pollster the <i>pollster in focus</i>):
            </p>
            <ul>
                <li>
                    Exclude all the polls from the pollster in focus from the analysis. 
                </li>
                <li>
                    Treat all other pollsters as equivalent, with the same volatility and the same
                    weighting for calculating the summed house effect.
                </li>
                <li>
                    The sum of house effect will always equal zero.
                </li>
            </ul>
            <p>The central value (median) of the
                resultant trend is then compared with the pollster's polls. Since the random variation between
                polls is the focus of this step, the average deviation from this trendline and the pollster's polls
                is removed, and the average error of the remaining polls is used.
            </p>
            {/* need to fill this section out! Introduce section, describe creation of calibration trends, 
                calculation of pollster volatility/trend-following (and implications), calculation of
                pollster house effect centrality, calculation of expected bias for a set of pollsters,
                note further bias adjustment measures in later stages */}
        </>
    );
}

export default MethodologyPollTrend;