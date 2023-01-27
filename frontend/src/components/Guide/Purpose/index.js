import React from 'react';

const GuideIntro = props => {
  return (
    <>
      <h4 id="purpose">Site purpose</h4>
      <p>
        The purpose of this site is to provide carefully designed probabilistic
        forecasts for elections in Australia. This is done by analysing recent
        political history and building a model for projecting known information
        (such as opinion polling) to possible election results.
      </p>
      <p>
        Why is this valuable? People or businesses may be significantly affected
        by the consequences of an election outcome, either financially or in
        some other way. Having well-designed forecasts allows for rational
        preparation for these consequences, without either excessively focusing
        on unlikely outcomes or ignoring potential possibilities.
      </p>
      <p>
        Unfortunately, a lot of media reports and public discussion regarding
        potential future election results are subjective or poorly informed,
        allowing for cognitive biases to affect expectation. For example:
      </p>
      <ul>
        <li>
          &quot;Party X is well ahead in the polls, so party Y can&apos;t
          win.&quot; This is an example of overconfidence. It is not unusual for
          parties to come back from even quite large polling deficits over time.
        </li>
        <li>
          &quot;The polls were wrong last time, so they don&apos;t mean
          anything.&quot; This is an example of a hasty generalisation. In fact,
          in the vast majority of Australian elections where a party was leading
          in the polls immediately before the election, they go on to form
          government after the election.
        </li>
        <li>
          &quot;Everyone I know is voting for party X, so they will surely
          win&quot; This is an example of a different kind of hasty
          generalisation. Most people tend to socialise with and (especially)
          discuss politics with others with who are similar to themselves,
          including having similar political opinions. As a result, this
          isn&apos;t strong evidence that the wider population shares those
          opinions.
        </li>
      </ul>
      <p>
        Creating forecasts objectively based on historic precedent allows more
        accurate expectations for future election results. In particular, this
        site focuses on measuring uncertainty, estimating not only the most
        likely outcome, but also how realistic other possibilities are. Even if
        a forecast gives both sides equal chance of winning, it is still useful
        for someone who had previously believed that the result was clear.
      </p>
    </>
  );
};

export default GuideIntro;
