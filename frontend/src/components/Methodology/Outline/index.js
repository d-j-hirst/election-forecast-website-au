import React from 'react';

import GlossaryLink from '../GlossaryLink';

const GuideNowcast = props => {
  return (
    <>
      <h4 id="outline">Outline</h4>
      <p>
        The approach involves analyzing data related to an upcoming election—
        primarily public opinion polling and recent election results—and
        comparing it with historical data to simulate possible outcomes.
      </p>
      <ul>
        <li>
          Determine the best-fitting trend in{' '}
          <GlossaryLink word="voting intention" /> polling for the current
          election cycle using publicly available <GlossaryLink word="polls" />.
          This results in{' '}
          <i>
            <GlossaryLink word="poll trends" />
          </i>{' '}
          (including uncertainty levels) for both{' '}
          <GlossaryLink word="first-preference (FP)" /> votes and{' '}
          <GlossaryLink word="two-party-preferred (2PP)" /> votes. These poll
          trends track poll results over time while minimising the influence of
          sampling variation and differences between{' '}
          <GlossaryLink word="pollsters" />.
        </li>
        <li>
          Using poll trends from previous elections, analyze how these trends
          correlated with actual election results. Use these correlations to
          transform current poll trends into probability distributions of vote
          shares for the upcoming election.
        </li>
        <li>
          Generate hypothetical election results by randomly sampling vote
          shares from these distributions, factoring in past election data and
          current region- and seat-specific information.
        </li>
        <li>
          Aggregate these simulations into probability distributions for various
          outcomes, including overall parliament composition, vote shares,
          <GlossaryLink word="seat" /> totals, and individual seat results.
        </li>
      </ul>
    </>
  );
};

export default GuideNowcast;
