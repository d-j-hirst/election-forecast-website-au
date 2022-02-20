import React from 'react';

const GuideNowcast = props => {
    return (
        <>
            <p><h4 id="outline">Outline</h4></p>
            <p>
                The overall approach is to use known data - mainly public opinion
                polling and recent election results - and compare to historical election
                data to simulate possible results for elections in the future. In
                practice, this is done through the following process:
            </p>
            <ul>
                <li>Find the most likely trend in voting intention polling for the current election cycle, using publically available opinion polls. This results in <i>poll trends</i> (including uncertainty levels) for both first-preference votes and two-party-preferred votes.</li> 
                <li>After also creating poll trends for previous elections, study how previous poll trends correlate with actual election results and use that to project the current poll trends to probability distributions of vote shares at a future election.</li>
                <li>Randomly sample vote shares from these distributions to simulate various hypothetical elections, accounting for historical factors and some recent seat-specific current information on a region-by-region and seat-by-seat basis.</li>
                <li>Aggregate those simulations into probabilities and/or probability distributions for different results (whole parliament results, overall vote shares, seat totals, and individual seat results).</li>
            </ul>
        </>
    );
}

export default GuideNowcast;