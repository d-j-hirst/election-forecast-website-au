import React from 'react';

import GlossaryLink from '../GlossaryLink';

const GuideNowcast = props => {
  return (
    <>
      <h4 id="outline">Outline</h4>
      <p>
        The overall approach involves analysing data relating to a future
        election—primarily public opinion polling and recent election results—
        and comparing it to historical data to simulate possible future election
        outcomes. This is achieved through the following process:
      </p>
      <ul>
        <li>
          Identify the best fitting trend in{' '}
          <GlossaryLink word="voting intention" /> polling for the current
          election cycle using publicly available opinion{' '}
          <GlossaryLink word="polls" />. This results in{' '}
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
          After creating poll trends for previous elections, examine how these
          trends correlated with actual election results. Then, use these
          correlations to project the current poll trends into probability
          distributions of vote shares for a future election.
        </li>
        <li>
          Randomly sample vote shares from these distributions to simulate
          various hypothetical election results, taking into account historical
          factors and current region- and seat-specific information.
        </li>
        <li>
          Aggregate these simulations into probabilities and/or probability
          distributions for different outcomes, including whole parliament
          results, overall vote shares, <GlossaryLink word="seat" /> totals, and
          individual seat results.
        </li>
      </ul>
    </>
  );
};

export default GuideNowcast;
