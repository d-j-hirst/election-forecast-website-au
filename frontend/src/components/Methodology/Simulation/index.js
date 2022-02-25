import React from 'react';

import { ExtLink } from '../../../utils/extlink.js';

const MethodologyPollTrend = props => {
    return (
        <>
            <h4 id="simulation">Simulation of full election results</h4>
            <p>
                In order to generate forecasts the model simulates the election a large number of times
                (typically 100,000) to evaluate how the projected vote totals correspond to actual seats
                in parliament. This involves taking election samples simulating the results in each seat individually based on
                both the overall vote shares and also the history of that individual seat, adjusting those
                results so that the overall totals match the projected election sample as closely as possible,
                and then collating the results across all the simulation into statistics for display on the
                site.
            </p>
            <h5 id="two-party-seat">Regional analysis</h5>
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
                of polled swing deviations from previous elections is analysed. Regional polling breakdowns are analysed for bias
                (do are swing deviations too high or too low on average?), sensitivity (how do the sizes of swing
                deviations in polls compare to those in an actual election? - it is in fact found that polling swing deviations
                usually overestimate those in the actual result, but more so in some states than others),
                and spread in the error (after taking those two factors into account, how far off are the results?)
            </p>
            <p>
                A similar process is run for elections without taking into account polls at all - in terms of how does
                the <i>overall swing</i> predict state swings. In this case the "bias" represents trends over time
                and the "sensitivity" represents whether the state swings more or less than the national average. These
                results are used both for regions which don't have polling (for federal elections, usually Tasmania, ACT and NT)
                or mixed with the poll-based deviations for polling that is some time out from the election.
            </p>
            <p>
                In any given election simulation, each region has its own swing deviation calculated from the
                patterns observed in the polled swing deviation and/or the base deviation, including random variation. The
                deviation is then adjusted so that the total of all swing deviations, weighted by population, is equal to zero,
                as it is desired that these swings do not change the national TPP from the election sample. Finally the swing
                deviations are added to the election sample's national swing to give the regional swing for the simulation.
            </p>
            <h5 id="two-party-seat">Two-party seat vote</h5>
            <p>
                Following the generation of each region's TPP swings, the next step of the seat simulation is to generate a
                two-party-preferred result for each seat. (This is done even for seats where the the final two were not
                the major parties.) The regional two-party swing is applied to the existing margin
                in the seat (accounting for the redistributed margin according
                to <ExtLink href="https://antonygreen.com.au/category/redistribution/">Antony Green's estimates</ExtLink>,
                including for draft redistributions). This is then adjusted based on statistics calculated from the seat's
                history, specifically its <i>elasticity</i> - whether it tends to swing more or less than the regional
                average - and <i>trend</i> - its long term tendency to move towards one party or another. The analysis
                of these variables includes previous seats covering a similar area with a different name, and if the seat
                is new the statistics from other seats are used.
            </p>
            <p>
                The TPP for each seat is also adjusted for candidate factors - such as retirements, and the
                "sophomore surge" where newly elected candidates and parties do better than the region average
                for their second election. (Sophomore effects for new candidates and parties are treated as
                separate, with both added together when a candidate takes a seat from the opposing party).
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
            <p>
                <ExtLink href="https://armariuminterreta.com/2021/08/05/australian-economy-electoral-impact/">this analysis 
                    by Armarium Interreta</ExtLink>
            </p>
        </>
    );
}

export default MethodologyPollTrend;