import React from 'react';

import GlossaryLink from '../GlossaryLink';

const GuideNowcast = props => {
    return (
        <>
            <h4 id="outline">Outline</h4>
            <p>
                The overall approach is to use data relating to a future election - mainly public opinion
                polling and recent election results - and compare to historical data and results
                in order to simulate possible results for elections in the future. This is done through
                the following process:
            </p>
            <ul>
                <li>
                    Find the most fitting trend in <GlossaryLink word="voting intention" /> polling for the
                    current election cycle, using publicly available opinion <GlossaryLink word="polls" />. This
                    results in <i><GlossaryLink word="poll trends" /></i> (including uncertainty levels)
                    for both <GlossaryLink word="first-preference (FP)" /> votes
                    and <GlossaryLink word="two-party-preferred (TPP)" /> votes that
                    track poll results while minimising the influence of sampling variation
                    and differences between <GlossaryLink word="polling houses" />.
                </li>
                <li>
                    After also creating poll trends for previous elections, study how previous poll trends correlated
                    with their actual election results, and use these correlations to project the currently observed poll trends
                    onto probability distributions of vote shares at a future election.
                </li>
                <li>
                    Randomly sample vote shares from these distributions to simulate various hypothetical election results,
                    accounting for historical factors and current region- and seat-specific information.
                </li>
                <li>
                    Aggregate those simulations into probabilities and/or probability distributions for different
                    results (whole parliament results, overall vote shares, <GlossaryLink word="seat" /> totals, and individual seat results).
                </li>
            </ul>
        </>
    );
}

export default GuideNowcast;