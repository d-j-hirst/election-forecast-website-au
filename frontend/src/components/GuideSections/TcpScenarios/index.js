import React from 'react';

const GuideTcpScenarios = props => {
    return (
        <>
            <p><h4 id="tcp-scenarios">Two-candidate preferred (TCP) scenarios and tactical voting</h4></p>
            <p>
                Under Australia's system of preferential voting, elections are decided
                by excluding the candidate with the lowest vote, distributing the preference of
                that candidate's voters to the remaining candidates, and repeating the process
                until one candidate has a majority of preferences. Generally even if a candidate
                reaches a majority earlier, this process is completed further until only
                two parties are left and the resulting comparison between those two parties (the "final two")
                is known as the <strong>two-candidate-preferred vote (TCP)</strong>. The party with
                the higher two-candidate-preferred vote then goes on to win the seat.
            </p>
            <p>
                You might also see the term <strong>two-party-preferred vote (TPP)</strong> (in the
                vote-trend chart, for example). This refers to how voters
                preferred either of the two major parties to each other, i.e.
                gave their preferences to Labor over the Coalition or vice versa. It's the same as the
                TCP vote in seats where Labor and the Coalition are the
                last two candidates remaining, but will be different in seats where that doesn't
                happen. Electoral commissions usually count the TPP vote in seats even
                when one or both of the two major parties don't make the final two candidates, as
                this information is useful in analysis (it's used quite a bit in making the forecasts
                on this site.)
            </p>
            <p>
                One important thing to note for the TCP scenarios is that this site only reports TCP
                results for simulated results where those candidates actually make the final two.
                This means that the results aren't necessarily representative of how voters would
                actually preference in a typical election. For scenarios that are given a very small chance
                of happening, this can be particularly distorting - for, example, in some seats One Nation
                might be shown as beating one or both major parties in the TCP, but this only applies to the very
                unusual sets of circumstances where those minor parties make the final two in the first place,
                and would probably have do significantly worse in that comparison in a more typical election.
            </p>
            <p>
                In seats where more than two parties get a significant amount of votes, voters may engage in
                tactical voting to get a candidate into second place in order to beat another candidate.
                A typical example is that a Labor voter, thinking the Labor candidate has no chance of
                winning, votes instead for an independent candidate in the aim of getting that candidate
                to the final two and winning the TCP against the Coalition. The logic here is that, even though
                the voter prefers the Labor candidate to the independent, they vote for the independent in order
                for that independent to reach the final two where that independent has a much better chance of
                beating the Coalition candidate that the Labor candidate would. (The model accounts for tactical voting
                in its treatment of seats where this might be a factor.)
            </p>
            <p>
                While the TCP scenarios can be interesting it must be stressed that this
                site <strong>does not recommend</strong> using the printed TCP scenarios for deciding
                how to vote tactically. This is because, as explained above, the TCP scenarios come from
                different kinds of elections. For example, consider a seat where the coalition will make the
                final two but the other party may be either Labor or the Greens. A left-leaning voter may want to choose
                whether to put the Labor or Greens candidate first depending on which is most likely to beat the Coalition.
                In most cases, the TCP projection on this site would show Labor with a higher TCP versus the Coalition
                that the Greens do. But this is because the Greens tend to make the final two more often in
                hypothetical elections where Labor is doing poorly and getting fewer first preference votes.
                Our voter, however, is concerned with whether Labor or the Greens will do better in the one election
                that actually takes place, and the TCP scenarios don't help with that decision as they don't compare
                TCPs within the same election.
            </p>
            <p>
                For those who might vote tactically, the main things to note are (these are general observations, not
                outputs of the model):
            </p>
            <ul>
                <li>Independents and centrist parties tend to do better against a major party than the opposing major party does. Consider a tactical vote
                    for a prominent independent or centrist party in seats where your preferred major party is unlikely to win.
                </li>
                <li>Labor and Greens tend to do very similarly against the Coalition. On average the Greens tend to do very slightly
                    better, but sometimes it is the other way around. This sites recommends voters vote for the party that they prefer
                    rather than the one they think most likely to win as that cannot be known in advance.
                </li>
                <li>Other cases not covered by the two points above have few historical results to compare with,
                    but as a general rule: tend towards voting for the candidate you prefer - rather than the
                    one you think might be more likely to beat an opponent - unless there's quite strong
                    evidence that there's a large difference in their chances.
                </li>
            </ul>
        </>
    );
}

export default GuideTcpScenarios;