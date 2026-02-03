import React from 'react';

const GuideTcpScenarios = props => {
  return (
    <>
      <h4 id="tcp-scenarios">
        Two-candidate preferred (2CP) scenarios and tactical voting
      </h4>
      <p>
        Under Australia&apos;s system of preferential voting, elections are
        decided by excluding the candidate with the lowest vote, distributing
        the preference of that candidate&apos;s voters to the remaining
        candidates, and repeating the process until one candidate has a majority
        of preferences. Generally even if a candidate reaches a majority
        earlier, this process is completed further until only two parties are
        left and the resulting comparison between those two parties (the
        &quot;final two&quot;) is known as the{' '}
        <strong>two-candidate-preferred vote (2CP)</strong>. The party with the
        higher two-candidate-preferred vote then goes on to win the seat.
      </p>
      <p>
        You might also see the term{' '}
        <strong>two-party-preferred (2PP) vote</strong> (in the vote-trend
        chart, for example). This refers to how voters preferred either of the
        two major parties to each other, i.e. gave their preferences to Labor
        over the Liberal/National Parties or vice versa. It&quot;s the same as
        the TCP vote in seats where Labor and the Liberal/National Parties are
        the last two candidates remaining, but will be different in seats where
        that doesn&apos;t happen. Electoral commissions usually count the 2PP
        vote in seats even when one or both of the two major parties don&apos;t
        make the final two candidates, as this information is useful in analysis
        (it&apos;s used quite a lot in making the forecasts on this site.)
      </p>
      <p>
        One important thing to note for the 2CP scenarios is that this site only
        reports 2CP results for simulated results where, in those simulations,
        those candidates are projected to actually be the final two candidates
        after preferences are distributed. This means that the results
        aren&apos;t necessarily representative of how voters would actually
        preference in a typical election. For scenarios that are given a very
        small chance of happening, this can be particularly distorting - for,
        example, in some seats a minor party might be shown as beating one or
        both major parties in the 2CP, but this only applies to the very unusual
        sets of circumstances where that minor party makes the final two in the
        first place, and would probably have do significantly worse in that
        comparison in a more typical election.
      </p>
      <p>
        In seats where more than two parties get a significant amount of votes,
        voters may engage in tactical voting to get a candidate into second
        place in order to beat another candidate. A typical example is that a
        Labor voter, thinking the Labor candidate has no chance of winning,
        votes instead for an independent candidate in the aim of getting that
        candidate to the final two and winning the 2CP against the Liberal once
        preferences for Labor and any minor parties are distributed. The logic
        here is that, even though the voter prefers the Labor candidate to the
        independent, they vote for the independent in order for that independent
        to reach the final two where that independent has a much better chance
        of beating the Liberal candidate that the Labor candidate would. (The
        model accounts for tactical voting in its treatment of seats where this
        might be a factor.)
      </p>
      <p>
        While the 2CP scenarios can be interesting it must be stressed that this
        site <strong>does not recommend</strong> using the printed 2CP scenarios
        for deciding how to vote tactically. This is because, as explained
        above, the 2CP scenarios come from different kinds of elections. For
        example, consider a seat where the Liberals will make the final two but
        the other party may be either Labor or the Greens. A left-leaning voter
        may want to choose whether to put the Labor or Greens candidate first
        depending on which is most likely to beat the Liberals. In most cases,
        the TCP projection on this site would show Labor with a higher 2CP
        versus the Liberals that the Greens do. But this is because the Greens
        tend to make the final two more often in hypothetical elections where
        Labor is doing poorly and getting fewer first preference votes. Our
        voter, however, is concerned with whether Labor or the Greens will do
        better in the one election that actually takes place, and the 2CP
        scenarios don&apos;t help with that decision as they don&apos;t compare
        TCPs within the same election.
      </p>
    </>
  );
};

export default GuideTcpScenarios;
