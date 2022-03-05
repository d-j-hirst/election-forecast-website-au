import React from 'react';

import { ExtLink } from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
    return (
        <>
            <h4 id="simulation">Simulation of full election results</h4>
            <p>
                In order to generate forecasts, the model simulates the election a large number of times
                (typically 100,000) to evaluate how the projected vote totals correspond to actual seats
                in parliament. This involves taking election samples, simulating the results in each seat (based on
                both the overall vote shares and also the history of that individual seat), adjusting those
                results so that the overall totals match the projected election sample as closely as possible,
                and then collating the results across all the simulation into statistics for display on the
                site.
            </p>
            <h5 id="tpp-region">Regional analysis of two-party-preferred (TPP) vote share</h5>
            <p>
                Many elections have different swings in different areas. (For example, the 2019 Federal Election
                had a swing to the ALP in Victoria but to the LNP in Queensland.) In federal elections,
                there are often polls that break down the results by state (and for state elections there are
                occasionally polls that break down their results by region as well). For the rest of this section,
                the word "region" may be considered to refer to either states in a federal election or, rarely, regions
                within a state election. In this model only TPP differences between regions are considered.
            </p>
            <p>
                For each poll that breaks down results by region, the <i>swing deviation</i> is observed for
                each region - calculated by subtracting the region swing the poll records from the overall swings
                For example, if a poll says the overall swing is 4% to the ALP but the swing in a particular region
                is only 2%, that is a swing deviation of -2%.
            </p>
            <p>
                For each region, the swing deviations of recent polls are averaged together. Due to small sample
                sizes, multiple recent polls are often included in this average for most pollsters, and some pollsters
                (notably Newspoll) are weighted higher to reflect greater historical accuracy and experience with
                their state breakdowns.
            </p>
            <p>
                In order for the use of these swing deviations to reflect their historic performance, the predictiveness
                of polled swing deviations from previous elections is analysed. Regional polling breakdowns are analysed for:
            </p>
            <ul>
                <li>
                    bias - do swing deviations overestimate one party or the other on average?
                </li>
                <li>
                    sensitivity - how do the sizes of swing deviations in polls compare to those in an actual election? 
                    (Generally the swing deviations
                    seen in polls overestimate those in the actual result, but more so in some regions than others.)
                </li>
                <li>
                    spread in the error - after taking those two factors into account, how far off are the swing deviations from the actual results?
                </li>
            </ul>
            <p>
                A similar process is run for elections, but this time without taking into account polls at all -
                instead it is in terms of how does the <i>overall swing</i> predict state swings. In this case
                the "bias" represents trends over time for a state compared to the national average,
                and the "sensitivity" represents whether the state swings more or less than the national average. These
                results are used both for regions which don't have polling (for federal elections, usually Tasmania, ACT and NT)
                or mixed with the poll-based deviations for polling that is some time out from the election.
            </p>
            <p>
                In any given election simulation, each region has its own swing deviation calculated from the
                patterns observed in the polled swing deviation and/or the base deviation, with different random variation for
                each simulation. The deviation is then adjusted so that the total of all swing deviations, weighted by population,
                is equal to zero, as it is desired that these swings do not change the national TPP from the election sample. Finally the swing
                deviations are added to the election sample's national swing to give the regional swing for the simulation.
            </p>
            <h5 id="tpp-seat">Two-party-preferred (TPP) seat vote share</h5>
            <p>
                Following the generation of each region's TPP swings, the next step of the seat simulation is to generate a
                two-party-preferred result for each seat. (This is done even for seats where the the final TCP was not
                between the major parties.) The regional two-party swing is applied to the existing margin
                in the seat (accounting for the redistributed margin according
                to <ExtLink href="https://antonygreen.com.au/category/redistribution/">Antony Green's estimates</ExtLink>,
                including for draft redistributions). This is then adjusted to account for the <i>elasticity</i> of the seat -
                whether it tends to swing more or less than the regional average. This analysis includes previous seats covering
                a similar area with a different name, and if the seat is new the statistics from other seats are used.
                As in sections above, a cross-one-out analysis is used to estimate the predictiveness of the elasticity analysis
                and adjust the extent to which it affects the simulated result.
            </p>
            <p>
                The TPP for each seat is also adjusted for candidate factors - such as retirements, and the
                "sophomore surge" where newly elected candidates and parties do better than the region average
                for their second election. (Sophomore effects for new candidates and parties are treated as
                separate, with both added together when a candidate takes a seat from the opposing party,
                and are also analysed separately for urban and regional seats).
                These adjustments are determined by analysing previous elections separately for urban and
                regional seats. An adjustment is also made for candidate disendorsements, it is assumed that
                a candidate loses 3% TPP on average for being disendorsed and the party gains half that much (1.5%)
                back following that election.
            </p>
            <p>
                Finally, random variability is added to each seat. The standard deviation of such variability is again
                assessed on a seat-by-seat basis as some seats tend to be more volatile than others even after
                accounting for the above factors. However, the variability is given a minimum variability level
                as due to the fairly small sample sizes involved it is quite likely that some seats' variability
                is underestimated.
            </p>
            <p>
                The above adjustments mean that usually the population-weighted average of seat TPPs no longer
                matches the regional TPP calculated before. In order to keep all aspects of the simulation consistent,
                the TPPs are adjusted linearly so that the seat average TPP for each region matches the overall TPP.
                (Keep in mind that the regional TPPs have already been adjusted to match the election TPP, so this
                adjustment also brings the seat TPPs in line with the election TPP.)
            </p>
            <h5 id="fp-seat">First preference (FP) seat vote share</h5>
            <p>
                The model simulates TPP votes first before FP as the former are a lot easier to work with and more
                reliable to simulate. However, because this is a comprehensive model, and for the simulation of
                contests that may not result in a TPP contest, FP votes are also simulated. This process is quite
                involved as there are a lot of different variables to consider and many corner cases to cover,
                so this page will only give an outline. There are also more judgment calls in this section than
                others as there is relatively little historical data on the performance of third parties and
                independents in some unusual situations.
            </p>
            <p>
                FP votes for non-major parties including independents and a generic "others" category are simulated first. The behaviour of FP votes
                in historical elections is analysed for each party category (see "Fundamentals" above) and then the results
                are applied to the vote for those parties in the previous election. This includes, where appropriate, changes from previous election
                vote share based on incumbency, previous vote share, and the level of variability in the vote (for
                random variation).
            </p>
            <h6 id="fp-seat-">Independents</h6>
            <p>
                For iindependents who are either incumbent, or obtained a substantial vote share in the previous election,
                the possibility that the independent may not recontest is also considered.
                The chance to recontest is based on historical analysis and also some estimation about how this
                probability might change as the election approaches as reliable historical data is hard to find.
                Candidates that announce they are retiring/not recontesting are removed from consideration while
                those announcing they will contest have their recontest chances greatly increased (but not quite to 100%).
            </p>
            <p>
                The potential for as-yet-unrecognised independents to emerge and gain a significant vote is
                also considered. Previous elections have been analysed for the typical rates that independent
                candidates achieve certain levels of the vote, and how this varies by seat type (inner/outer urban,
                provincial or rural), the previous performance of non-major parties in the seat,
                and whether the election is a federal or state election.
            </p>
            <p>
                Known independent candidates that are prominent, but are not yet incumbents, are treated similarly.
                (There is some judgment about whether a candidate is considered prominent or not, but it generally
                comes down to whether they are getting prominent media coverage and have a significant campaign team.)
                Seat betting odds and seat polls are used here (and only here!) to help inform of the likely performance
                of the prominent independent candidates. A slight historical bias overestimating independents' support in
                seat betting and polling is taken into account, and for polls a considerable margin of error is used due to the
                low accuracy of Australian
                seat polling (see <ExtLink href="https://kevinbonham.blogspot.com/2018/06/is-seat-polling-utterly-useless.html">this
                analysis</ExtLink> by Kevin Bonham). This also applies to certain quasi-independent candidates
                who technically stand for a party but are largely running on their personal appeal.
            </p>
            <h6 id="fp-seat-">"Populist" parties and ideology</h6>
            <p>
                Parties in the "populist" category, which includes emerging parties, are considered to not be running in every
                seat. Rather, they are assigned a random number of seats based on the number of seats they have contested
                historically (with substatial random variation), and only run in seats in a randomised fashion that heavily favours
                seats that they are likely to get higher vote shares in. Additionally, the votes of such parties
                are calibrated on a seat-by-seat basis according to how parties of similar ideology have done in that or similar
                seats historically - to One Nation in the case of rightist parties and to the Australian Democrats in the case of
                centrist parties. Unidentified emerging parties are randomly decided between being centrist, rightist or somewhere
                in between. (Some might wonder why the lack of a leftist "populist" party - basically, we've
                never really had one so there's no way to assess where they might be most popular.)
            </p>
            <h6 id="fp-seat-">Major party FP votes</h6>
            <p>
                Having now simulated a set of minor party FP results for the seat, and a TPP result, the model
                now calculates the major party FP votes implied from those results. This requires preference flows to be
                calculated for each party. Since preference flows tend to differ from seat to seat and from election to
                election, these must also be simulated to achieve this. The preference flow from the election sample is
                used as a base, then adjusted for whether the preference flow in the seat was above or below the national
                average in the previous election, and then further random variability is applied. Using this newly
                calculated preference flow result, the total preferences for each party are calculated and the major parties
                are allocated an FP vote share required to match the TPP result.
            </p>
            <h6 id="fp-seat-">Reconciling the simulated results with the election sample</h6>
            <p>
                Finally, once all the FP votes have been simulated, their totals across the whole election will usually
                no longer match those in the election sample. In order for the simulation to be an accurate reflection of
                the election sampling, the seat FPs need to be adjusted to fit the original sample. While the actual process is
                quite involved, mainly it proceeds by adjusting minor party votes proportionally up or down across all seats, and then
                recalculating the major party TPPs for each seat. This process is repeated 5 times, at which point the difference
                between the FP votes for the election sample and simulation are usually on average below 0.1% (though rare cases
                where a minor party gets a much higher share of the FP vote will be higher than this). 
            </p>
            <p>
                One detail is
                that in seats where a candidate is significantly higher that the general party vote, this seat will not
                be impacted as much by the adjusment. This particularly affects independents who shouldn't have their vote
                projections heavily reduced because the generic Others vote was too high.
            </p>
            <h5 id="simulation-aggregation">Aggregation of simulation results</h5>
            <p>
                There's not too much to say about this. For each simulation, the results of each seat (primaries, TCP results)
                are recorded along with many aggregate results (total seats won, total vote share, etc.). After all simulations
                are complete, percentiles, averages and some other statistics are compiled. These are then stored and uploaded to the
                server, from where they can be viewed on the website from either the latest report or the archives.
            </p>
        </>
    );
}

export default MethodologyPollTrend;