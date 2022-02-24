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
                Following the generation of each region's TPP swingsThe first step of the seat simulation is to generate a two-party-preferred result for each
                seat. There are several parts to this. First the general two-party swing is applied, obtained
                from comparing the 
            </p>
            <p>
                <ExtLink href="https://armariuminterreta.com/2021/08/05/australian-economy-electoral-impact/">this analysis 
                    by Armarium Interreta</ExtLink>
            </p>
        </>
    );
}

export default MethodologyPollTrend;