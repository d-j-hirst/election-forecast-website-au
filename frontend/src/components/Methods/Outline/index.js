import React from 'react';

import GlossaryLink from '../GlossaryLink';

const GuideNowcast = props => {
  return (
    <>
      <h4 id="outline">Outline</h4>
      <p>
        The approach involves analysing data from upcoming elections – primarily
        public opinion polls and recent election results – and comparing these
        with historical data to simulate possible outcomes. The key steps are:
      </p>
      <ul>
        <li>
          <strong>Poll Trend Determination:</strong> Identify the best-fitting
          trend in <GlossaryLink word="voting intention" /> for the current
          election cycle using publicly available <GlossaryLink word="polls" />.
          This produces{' '}
          <i>
            <GlossaryLink word="poll trends" />
          </i>{' '}
          (with uncertainty bands) for both{' '}
          <GlossaryLink word="first-preference (FP)" /> votes and{' '}
          <GlossaryLink word="two-party-preferred (2PP)" /> votes, tracking poll
          results over time while minimising the influence of sampling variation
          and differences between <GlossaryLink word="pollsters" />.
        </li>
        <li>
          <strong>Vote Share Projection:</strong> Examine how poll trends from
          previous elections corresponded with actual results, and use these
          relationships to transform current poll trends into probability
          distributions of vote shares for the upcoming election.
        </li>
        <li>
          <strong>Simulation Generation:</strong> Generate hypothetical election
          results by randomly sampling vote shares from these distributions,
          incorporating historical election data as well as current region- and
          seat-specific information.
        </li>
        <li>
          <strong>Outcome Aggregation:</strong> Combine the simulations to
          produce probability distributions for various outcomes, including
          overall parliament composition, vote shares,{' '}
          <GlossaryLink word="seat" /> totals, and individual seat results.
        </li>
      </ul>
    </>
  );
};

export default GuideNowcast;
