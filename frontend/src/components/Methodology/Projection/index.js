import React from 'react';

import { ExtLink } from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
    return (
        <>
            <h4 id="projection">Projecting to election results</h4>
            <p>
                The poll trends can be thought of as the model's best guess at where the
                poll averages would be if very many polls were done. The polling average 
                immediately before the election has historically been quite accurate
                in the majority of elections, but as has been seen at some
                previous elections, such as the 2019 Federal Election and the 2018 Victorian
                state election, the poll average can still sometimes differ significantly from the polling average.
                Additionally, any time between the present and the election further reduces the predictiveness
                of the polling average.
            </p>
            <p>
                So, the next task after finding the poll trend is to project the trend to
                a probability distribution for the actual election. This will take into account
                further sources of uncertainty, including time before the election,
                systemic error in the polling average, and changes in preference flows from
                minor parties to the major parties.
            </p>
            <h5 id="fundamentals">Fundamentals</h5>
            <p>
                The first step of this projection procedure is to have a baseline value for the
                result that would be expected if there were <i>no</i> polls. This is called
                a <i>fundamentals</i> projection. Fundamentals are analysed for a number
                of different categories of parties and votes (known as party categories). The party categories are
                chosen according to similar electoral behaviour, and some do overlap:
            </p>
            <ul>
                <li>Two-party-preferred vote</li>
                <li>ALP first preference vote</li>
                <li>LNP first preference vote (including combination of both parties' vote in WA state elections)</li>
                <li>"Constituency minors" - minor parties that represent a fairly well-defined ideology or
                    section of the community, e.g. Greens, Family First, WA Nationals</li>
                <li>"Populist minors" - minor parties that tend to define themselves against the major parties
                    and have volatile support levels, e.g. One Nation, Australian Democrates, UAP/PUP</li>
                <li>"Others" - Sum of <i>all</i> parties (including any mentioned above) <i>except</i> the major parties, Greens, and WA Nationals</li>
                <li>"Unnamed others" - Sum of all parties not considered significant 
                    (either not polled, or only polling very low numbers)</li>
            </ul>
            <p>
                For each of these party categories, the relationship between certain "fundamental" factors and the
                eventual outcome are analysed. While the economic condition is often considered in such analyses,
                especially overseas, both this site and others (such
                as <ExtLink href="https://armariuminterreta.com/2021/08/05/australian-economy-electoral-impact/">this analysis 
                by Armarium Interreta</ExtLink>) have found
                that the predictiveness of such factors is weak for Australian elections.
                The fundamentals projection used here instead relies on known facts of the electoral situation:
            </p>
            <ul>
                <li>
                    How much a party polled at the previous election (for minor parties/others) or
                    the average of the previous six elections (for TPP and major parties)
                </li>
                <li>
                    (For major parties) Whether a party is incumbent or in opposition
                </li>
                <li>
                    (For major parties) How many years a party has been in government/opposition for
                </li>
                <li>
                    (For major parties at state level) Whether the incumbent federal party is the same as
                    the this party. If a federal election might be held before the relevant state
                    election, this is taken into account using the forecast for that federal election.
                </li>
            </ul>
            <p>
                The values of the above factors are collected for all elections since 1990
                and <ExtLink href="https://en.wikipedia.org/wiki/Quantile_regression">quantile regression</ExtLink> is
                used to find the best estimate for the conditional median of the party category's election vote share. 
                (Quantile regression differs from standard linear regression in that it minimizes the average error rather than
                the average squared error, and is therefore affected less by outliers.)
            </p>
            <p>
                The analyses were validated 
                using <ExtLink href="https://en.wikipedia.org/wiki/Cross-validation_(statistics)#Leave-one-out_cross-validation">
                    cross-one-out validation
                </ExtLink> to
                test their predictive effectiveness. This involves running the procedure repeatedly with a data point
                left out, and determining how accurately the procedure predicts that data point, and is a measure's ability
                to predict out-of-sample data. Fitted models such as these are often less accurate when working on new
                "out-of-sample" data than the data that the model is trained on,and this validation checks that
                the method still has predictive value.
            </p>
            <p>
                The predictive accuracy of the fundamentals regression was compared to simple baselines: using the
                previous election result, averages of previous election results, and a simple 50-50 result for TPP.
                The <ExtLink href="https://en.wikipedia.org/wiki/Root-mean-square_deviation">RMSE</ExtLink>,
                mean absolute error and median absolute error are used to measure the accuracy.
                The "fundamentals" projection was a significant improvement over the baseline is found
                for <i>state</i> election TPP and major party FP, as well as for "populist" minor parties. Little improvement
                over the baseline is found for "constituency" parties or "others", but the results were not worse either.
            </p>
            <p>
                However, the results were a very poor fit for <i>federal</i> election TPP and major party FP votes. This appears
                to be a result of federal elections being much closer with smaller swings, and incumbency being much less of 
                a benefit. Because of this, the average for the last six elections is used instead as the "fundamentals" for
                these vote shares (which in turn results in a slightly improved fit for the state results).
            </p>
            <p>
                For a future election with an as yet unknown result, the fundamentals are then calculated
                using the regression on the current known factors in that election to create the <i>fundamentals estimate</i>.
            </p>
            <h5 id="mixing">Calculating the projection parameters</h5>
            <p>
                The idea here is to take the fundamentals estimate on one hand, and the poll trend on the other,
                and mix them together as a weighted average to make the most accurate estimate possible.
                The parameters for this process will depend on the vote type (the party and whether TPP or FP)
                and the length of time until the election.
                For this process all elections from 2004 onwards are used, and separate estimates of the parameters are
                made at numerous time points ranging from immediately before the election to about 3 years out
                (beyond that point there are too few elections to get a useful sample size). The following steps are
                taken separately for each combination of vote type and time point.
            </p>
            <p>
                First, the <i>biases</i> of both the poll trend and the fundamentals estimate are calculated - that is,
                how much higher or lower than the actual election result those estimates are. For example, it is found that
                both "Others" and "Populist Minors" poll significantly higher than their election result around 1-2 years
                from the election. (Biases for fundamentals are usually quite small). These biases are then subtracted
                from the poll trend and fundamental before the next steps.
            </p>
            <p>
                The next step is to find the optimal amount of mixing between the poll trend and fundamentals. The proportion
                given to the polls is called the <i>mix factor</i>. For example,
                if (after correction for bias) the fundamentals projection has the ALP's TPP vote share at 54 but the poll trend is at 48,
                then the mixing could be 100% fundamentals (mix factor 0%, giving a final projection of 54),
                100% poll trend (mix factor 100%, giving a final projection of 48),
                50% of each (mix factor 50%, giving a final projection of 51), or some other proportions. The optimal mix factor is found where
                the error is minimized across all elections. Then for each election this mixed estimate is calculated, and a further correction
                is made to calculate the bias of this mixed estimate. This bias is then subtracted to create the final estimate
                for the election.
            </p>
            <p>
                Just as important as obtaining a final estimate, however, is to measure the uncertainty in that
                estimate by calculating <i>measures of spread</i>. For each election in the analysis, the error between the
                final estimate and the eventual result is measured. This forms a sample distribution of errors, from which
                statistics relating to the standard deviation and kurtosis (a measure of the frequency of extreme values)
                are taken. These are taken separately for each side of the distribution (i.e. positive or negative errors)
                so that any asymmetry in the distribution is measured.
            </p>
            <p>
                As mentioned before, the above process is repeated separately using different time points for the polling trend,
                each with its own set of parameters for the models (biases, mix factor, and measures of spread).
                Due to fluctuations in historical polling and the relatively small sample size, the parameters obtained
                also tend to fluctuate. Since such fluctuations are very unlikely to have predictive value (being the result of
                polling volatility across a small sample of elections), and indeed are likely to mislead if they were actually used for modelling,
                the obtained parameters are each individually smoothed heavily
                over time into trends with gradual changes. This smoothing includes a heavy weighting for the result immediately before the
                election to avoid that time point being influenced by the considerably more uncertain earlier estimates.
            </p>
            <p>
                These smoothed parameter trends are then the truly final values that are used to project from a poll trend to
                a future election result.
            </p>
            <h5 id="mixing">Validating the projection</h5>
            <p>
                Finally, it is important to validate that this projection actually has predictive skill in predicting out-of-sample
                data. Since one cannot simply run new elections to test this, cross-one-out validation is again used. For each
                election for which a polling trend has been generated (i.e. 2004 Federal and afterwards) the above procedures to find
                the election fundamentals and projection parameters are repeated <i>completely excluding any data from the 
                election being tested for</i> (and for a range of different time points in the poll trend, from immediately
                before the election to about 2.5 years before). This usually results in a slightly different set of parameters and fundamentals compared
                to those obtained when the election is included in the analyses.
            </p>
            <p>
                The new parameters are used to project the
                election result from the poll trend, and the error in this projection is recorded. Validation is focused on the TPP result
                as it is the most critical for determining the overall election result, but other values are also checked.
                Errors for alternative, more basic estimates are also recorded for comparison:
            </p>
            <ul>
                <li>
                    A simple baseline value, 50-50 for TPP, the most recent election for minor parties/others, and the average of the
                    most recent 6 elections for major party primaries.
                </li>
                <li>The median value of the poll trend only.</li>
                <li>The "fundamentals" value used in calculating the projection.</li>
            </ul>
            <p>
                Focusing on TPP, the results are clear - for almost all time points the projection method results in a
                significant reduction in the error compared to any of the more basic estimates. For example, at exactly one year out, the
                average absolute error from the projection is 2.87 percentage points, compared to 3.68 from "fundamentals" only, 3.77
                from the poll trend only, and 4.29 from the baseline value.
            </p>
            <p>
                There are two main exceptions to this. The first is that, when out from the election by a year or longer, the
                projection for <i>federal</i> TPP is not consistently better than the straight fundamentals (which, despite being merely
                an average of the past 6 elections, are quite an accurate predictor most of the time!). For example, at 730 days (exactly two years) the
                projected model is still somewhat better than the fundamentals (and <i>much</i> better than the raw poll trend!) but this is not
                the case for 600 and 500 days, as fluctuations in historical polling actually cause the projected model to narrowly underperform
                the fundamentals at those times. Note this <i>doesn't</i> apply to state elections - for them, the projected model notably and
                consistently outperforms other estimates as far as 2.5 years out from the election.
            </p>
            <p>
                The other exception is that for estimates <i>very close</i> to the election - within a week or less - the raw poll trend does
                outperform the projection somewhat.
                
            </p>
            <h5 id="mixing">Sampling elections from the projection</h5>
            <p>
                So far, the fundamentals, poll trend and projection can be used to create a probability distribution for
                each party's FP vote and also the TPP. But simulating an election requires the complete picture - all the
                FP votes need to add to 100 and also need to match with the TPP. Doing this requires the creation of
                an <i>election sample</i>, a complete description of the vote shares of the significant political parties,
                including FP votes, the TPP and also the preference flows from each party (which will be subject to some
                random variation).
            </p>
            <p>
                The most straightforward part of this step is for the minor parties (including the Greens), which get a first
                preference vote randomly selected from the probability distribution in their FP projection, as determined above.
            </p>
            <p>
                In addition to the significant minor parties, some samples also have an "emerging party", representing the possibility
                of a new party emerging and getting a sizeable percentage of the vote (as One Nation did significantly in 1998 QLD, and
                to a lesser extent PUP in 2013 Federal). The probability of emergence and size of the vote are loosely extrapolated from
                the few such events that have occurred in the past, and both are reduced as the election approaches. The rate of this
                reduction over time is based on a subjective judgment as, while it is obvious that the chances of a new party
                emerging should decrease as the election approaches, there is too little data on the matter to even roughly estimate how much.
            </p>
            <p>
                With the major parties, it is necessary to coordinate their FPs with the TPP so that the TPP can come from a reasonable
                preference flow. There are two approaches used to achieve this, either by using the FPs and ignoring the TPP projection
                (<i>FP-first</i> approach) or by using the TPP projection and ignoring the FPs (<i>TPP-first</i> approach). These both
                have advantages and disadvantages, so for each sample either one or the other is picked at random.
            </p>
            <ul>
                <li>
                    FP-first: Both ALP and LNP primaries are projected. The FP of all parties are adjusted proportionally so that the total
                    is equal to 100%, then each minor party is assigned a preference flow based on its preference flow at the
                    previous election (or, if that is not available, the most comparable election available), with random variance
                    according to the historic variability in that preference flow. From this a TPP is calculated and used in the
                    election sample.
                </li>
                <li>
                    TPP-first: The TPP value is projected. Preference flows for the minor parties are calculated as for the FP-first approach,
                    including historical variance. Then the preferences are added together and major parties are given FP vote shares
                    such that after accounting for the preferences, they match the TPP.
                </li>
            </ul>
            <p>
                Once the major party and TPP vote shares have been determined, there is now a coherent election sample that
                can be used as a basis for an election simulation. This process will be repeated many times over to generate the
                overall conditions for each election simulation.
            </p>
        </>
    );
}

export default MethodologyPollTrend;