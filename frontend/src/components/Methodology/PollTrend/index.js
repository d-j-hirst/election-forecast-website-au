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
                Feel free to inform the site's author (email link above) of any polls not yet included, noting that they can only be included
                if the results are available to be released publicly.
                The following data from the poll are used:
            </p>
            <ul>
                <li>
                    The date of the poll, or the average of fieldwork dates. If such dates are not known precisely, they is either
                    estimated from the known fieldwork dates of previous polls by the polling house,
                    or assumed to be a few days before the release of its results.</li>
                <li>
                    The brand name of the pollster that took the poll. Pollsters that use
                    substantially different methodologies under the same brand name are classed separately
                    (for example, there are different entries for Roy Morgan face-to-face,
                    phone, SMS and multi-mode polls.)
                </li>
                <li>
                    First preference votes for all significant parties (some polled parties may be judged sufficiently unlikely to
                    ever challenge for a lower house seat). The Liberal and National parties are recorded separately for polls in
                    Western Australia but only the sum of their vote shares is recorded in other states and federally. The
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
                    The real voting intention for the whole election is assumed to change over time approximately following
                    a <ExtLink href="https://en.wikipedia.org/wiki/Random_walk#Gaussian_random_walk">Gaussian random walk</ExtLink>.
                    Changes in voting intention are assumed to mostly be small most of the time, but increase during the election campaign,
                    especially in the final two weeks.
                </li>
                <li>
                    Polls are assumed to be imperfect and biased estimates of actual voting intention.
                    This is expected to manifest as a mix of independent errors in individual polls and longer-term systemic bias.
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
                    is taken (see "More on pollster calibration" below,
                    especially the sections relating to "indication of trend"). This indicates the volatility of the pollster's
                    results; pollsters with higher volatility are considered to be less reliable indicators of the
                    voting intention trend, and the method is therefore designed so that they do not
                    influence the calculated poll trend as much.
                </li>
                <li>
                    Pollsters are also assumed to have a <GlossaryLink word="house effect" />, giving lower or higher results than
                    the trend on average over time. The model accounts for this by summing a
                    weighted average of all pollsters' house effects and constraining them to be equal to the
                    expected overall bias. The weighting is based on how consistent the bias of the pollster was in previous
                    elections (see "More on pollster calibration" below, especially
                    the subsection "Calculating the typical bias and its variability");
                    pollsters who have a consistent bias over time are weighted more than those whose bias
                    has large changes between elections. The sum of the house effects is equal to the average bias
                    of the pollsters involved when compared to actual election results;
                    the same weightings as before are used in calculating this average.
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
                from the earliest poll in the current
                election cycle until the most recent poll. Separate estimates are made for first preferences for all major and
                minor parties deemed "significant" (generally, polling more than 3% or getting more than 5% in some
                previous general election), as well as a generic "others" for all minor parties except the Greens.
                A trend is generated for this entire time period, even for minor parties that
                don't have any polling data for a long part of this period.
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
                determine the value of each pollster's results in estimating true voting intention. The most natural way to
                do this is to compare pollsters' results to actual election results. Unfortunately, most Australian
                pollsters have been tested at extremely few elections; with such a low sample size, the results of
                such a comparison won't have much meaning. Therefore assessing pollsters needs to be done in a somewhat
                more indirect manner, by measuring pollsters and polls <i>against each other</i>.
            </p>
            <p>
                A brief outline of this process is described first, with more detail below:
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
                Importantly, these two steps (polls to poll trends, and poll trends to results)
                now each have a large enough sample size to make calibrations meaningful.
            </p>
            <p>
                For this process it is desired to measure three things for each pollster:
            </p>
            <ul>
                <li>
                    How good the pollster is as an <i>indicator of trend</i>? That is, after taking away
                    a constant house effect, does it follow other polls closely, or does it have noisy
                    results or trends that other pollsters don't show?
                </li>
                <li>
                    What is the <i>typical <GlossaryLink word="bias" /></i> of the pollster? Does it tend to overestimate
                    or underestimate certain parties?
                </li>
                <li>
                    What is the <i>consistency of its bias</i>? When calibrating the overall bias of the
                    poll trend, it's much better to use pollsters with a consistent bias, even if quite
                    large, rather than those that change a lot from one election to the next.
                </li>
            </ul>
            <h6 id="pollster-calibration">Setting up the comparison poll trends</h6>
            <p>
                In order to measure these, a simplified <i>comparison poll trend</i> is generated for each pollster in
                each election. This pollster shall henceforth be referred to as the <i>pollster
                in focus</i> - i.e. the one whose behaviour is being measured. This is done in order
                to compare that pollster to the trend from the <i>other</i> pollsters.
                This follows a similar approach as for the final poll trend described above, with the
                following changes:
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
                    The sum of house effects will always equal zero.
                </li>
            </ul>
            <h6 id="pollster-calibration">Calculating the indication of trend</h6>
            <p>
                The central value (median) of the resultant trend is then compared with the polls of the
                pollster in focus in order to determine how good it is as an <i>indicator of trend</i>.
                Before calculating this, the house effect of the pollster in focus is subtracted
                from each of their polls (for this step it is the movement of the polls, not the absolute
                position, that matters). 
            </p>
            <p>
                Then, the differences from each of those polls from the poll trend
                (generated from the other polls) are averaged to give a measure of the pollster's
                indication of trend for this election. In order to prevent a pollster from being penalised
                for polling when no other pollsters are polling (and potentially getting a result far off
                trend when the trend would have been much closer had there been other polls), this average
                is weighted by the proximity to other polls. While the exact formula won't be discussed here,
                to give a couple of examples, having two other polls on the same day gives a full weighting,
                and having no other polls within two months gives a near zero weighting.
            </p>
            <p>
                It should be noted that this measure does not depend on any election result actually
                being recorded - thus it can be (and is) calculated for the election being forecast.
                Also, since the value is a measure of the deviation of the pollster's polls from the trend,
                a lower number indicates the poll is more accurate <i>as an indicator of the trend</i> (but
                not necessarily compared to the "true" voting intention). It's important to be cautious in the
                interpretation of this variable - a low value may be as a result of the pollster herding, or
                even outright fabricating results, while a high value might be the result of a pollster detecting
                real changes that others might miss. Still, the model assumes that the trend
                will <i>usually</i> be more informative than those pollsters that deviate from it.
            </p>
            <p>
                Following the calculation of the indication of trend for each individual election, they
                are combined (separately for each pollster) in a weighted average. The weightings
                for each election are determined by both the number of polls for the pollster in focus,
                and also the number of polls in total (in both cases, a high number of polls gives a 
                higher weighting). Additionally to the actual results, this weighted average includes an "initial"
                election (not a real result) that is functionally similar to (but mathematically different to) a Bayesian
                prior - it allows for a default expectation of poll behaviour when there is little
                or no empirical data available. This default election is equivalant to the performance
                of a quite erratic pollster that recorded about 7 polls. As the pollster records more
                actual polls, the influence of this default value will become insignificant. But
                for pollsters with little data available to calibrate their polls, it ensures that the model
                is cautious about the influence that their results have.
            </p>
            <h6 id="pollster-calibration">Calculating the typical bias and its variability</h6>
            <p>
                As alluded to before, the most natural way to measure a pollster's long-term bias is to
                compare its final results to the actual election results. The problem with this in
                Australia is that most pollsters currently have a very limited track record, often
                having final pre-election polls in only a handful of elections. As a result, the
                random variation inherent to opinion polling is likely to overwhelm any signal in those results.
            </p>
            <p>
                As a more robust alternative, the model uses the entire set of polls for each election
                to reduce this randomness. This is taken by taking the estimated house effect for that
                pollster, relative to the trend for *all* pollsters, and adding it to the final median
                value of that poll trend. This creates a <i>final result estimate</i> for that pollster with
                much reduced noise, since for any well-polled election both values in this calculation are
                drawn from a sample of multiple results. (In the case of the house effect, all of the
                pollster's polls in the term prior to the election, and in the case of final poll value,
                all the polls from any pollster close to the election.)
            </p>
            <p>
                For example: Suppose an election has a final result where the two-party-preferred vote
                is 53%, the final value of the poll trend is 52%, and our pollster has an average house
                effect of 2% across all its polls in that election. Then the pollster's final result estimate
                is 52+2=54% (regardless of what their final poll says!) and thus their bias for that election is 54-53=+1%.
            </p>
            <p>
                The calculation of the typical bias for a pollster is then a weighted average of these calculated
                biases for elections for which the pollster conducted polls. Once again, this weighting is adjusted
                according to the number of polls that the pollster conducted, as well as the total number of
                polls conducted overall in that election, in order to reflect that such estimates are more reliable
                with a larger sample of data to draw from. Finally, the <i>bias variability</i> is measured using
                the standard deviation of the same data with the same weightings.
            </p>
            <p>
                As with the indication-of-trend measures,
                an initial estimate is included in the calculations, consisting of two elections with a fairly large
                biases (of the same size and opposite signs) but small weightings. Without additional election data,
                this results in a value of zero for typical bias but high bias variability. This ensures that pollsters with little
                or no data from previous elections  have a minimal effect on the
                expected bias of the election until there is enough data to confidently assess the characteristics
                of their biases, at which point the effect of this initial estimate becomes insignificant.
            </p>
        </>
    );
}

export default MethodologyPollTrend;