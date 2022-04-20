import React from 'react';

import GlossaryItem from '../Item'

const GlossaryItems = props => {
    return (
        <>
            <GlossaryItem type="general" title="First preference vote">
                <p>
                    Also known as the <strong>primary vote</strong>. The candidate that a
                    voter gives their first preference to (marks with 1 on their ballot paper.)
                    Generally this is the voter's most preferred party (but see Tactical Voting
                    for why this might be otherwise).
                </p>
                <p>
                    When talking about election results, this term is more often used as a shorthand
                    for the share of all voters giving a party or candidate their first preference.
                    (For example, "the Greens' first preference vote was 10.4% in 2019".) If a candidate's
                    first preference share is more than 50% of total formal votes, then they will
                    be elected. However, with fewer than 50% they can still lose, even if they have more
                    first preference votes than any other party, as other parties can overtake them
                    by getting more preferences (see Preferential Voting).
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Major party">
                <p>
                    The term "major party" is most often used to refer to those parties with a significant
                    chance of forming government in the short to medium term. At present this refers to
                    either Labor (ALP) or the Coalition and its members (Liberals, Nationals, the Liberal
                    National party and the Country Liberal party).
                </p>
                <p>
                    In this site's analysis these parties
                    are treated separately as their extensive electoral history allows electoral behaviour
                    to be much more well characterised than in contests involving other ("minor") parties.
                </p>
                <p>
                    Some commentators also refer to the Greens as a "major". This site considers the
                    Greens to be a minor party for the purposes of analysis and forecasting.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Margin">
                <p>
                    In Australian politics, this term usually refers to the proportion of the total
                    two-candidate-preferred vote that an incumbent can lose before they lose the election.
                    For example, if incumbent Party A is leading challenger Party B by 54% to 46% then
                    the margin is 4%. (If Party A more than 4% of the two-candidate-preferred vote,
                    then they lose the seat as the two values always add up to 100% by definition, so
                    Party B's vote would rise above 50%.)
                </p>
                <p>
                    Note that this is in contrast to some overseas election analysis where the margin
                    is defined as the incumbent vote minus the challenger vote. The way the
                    two-candidate-preferred vote works means that using the challenger vote in such
                    a way would be redundant.
                </p>
                <p>
                    While a margin can be simply calculated from the previous election's result,
                    if a redistribution has taken place since the previous election the resulting
                    boundary changes in a seat can change its margin, sometimes drastically.
                    If so the margin is recalculated to take into account the changes in the boundary,
                    creating a <i>notional margin</i> that is the best estimate of the actual position
                    of the incumbent. In some cases this notional margin can become negative, meaning
                    that the incumbent must actually gain additional votes to retain the seat.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Minor party">
                <p>
                    A minor party is any party not considered a major party. As far as this site is
                    concerned, this includes the Greens, the (present-day) United Australia Party,
                    One Nation, various parties associated with Nick Xenophon including Center Alliance
                    and SA-Best, Katter's Australian Party, and many other small parties (sometimes
                    called "micro parties" or "micros") that usually get very small portions of the
                    lower house vote. Independent candidates are usually not considered to be minor
                    parties.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Preferential voting">
                <p>
                    The system of voting that Australia uses for most lower house elections
                    (with single-member electorates) is generally known as "preferential
                    voting" locally. In other countries it is more often known as "ranked-choice voting" or
                    "instant-runoff voting".
                </p>
                <p>
                    Voters mark a number for each candidate in order of preference on their ballot papers,
                    starting with 1 for the most preferred candidate, 2 for the next most preferred candidate,
                    and so on until all candidates have been given a preference (but see
                    Optional Preferential Voting). The winner is determined by the following procedure:
                </p>
                <ol>
                    <li>
                        Initially, each candidate is assigned the ballots
                        with 1 (i.e. most preferred) marked next to their name.
                    </li>
                    <li>
                        If the assigned votes for a candidate is an absolute majority
                        of all votes, that candidate is declared elected.
                    </li>
                    <li>
                        Otherwise, the candidate with the lowest number of votes is eliminated from
                        the count. For each of that candidate's assigned votes, the ballot paper
                        is checked and that vote is reassigned to the most preferred (lowest numbered)
                        candidate out of those that have not yet been eliminated. The process then returns
                        to step 2 and is repeated until a candidate has a majority of assigned votes.
                    </li>
                </ol>
                <p>

                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Seat">
                <p>
                    Formally known as an <strong>electorate</strong>. For most lower houses
                    (and in all cases that this site considers), a "seat" is a geographic area within
                    which all voters living in that area vote to elect a single candidate. It is so called
                    because it entitles the winner of the election for the "seat" to an actual seat
                    in Parliament (and by extension, a vote).
                </p>
                <p>
                    In the Australian lower house elections that this site considers, each seat elects
                    a member of parliament (MP) using preferential voting. Seats may be considered as
                    marginal (with a significant chance of changing hands) or safe (if the seat changing
                    party is very unlikely).
                </p>
            </GlossaryItem>
            <GlossaryItem type="site" title="Site item">
                Site item definition
            </GlossaryItem>
        </>
    );
}

export default GlossaryItems;