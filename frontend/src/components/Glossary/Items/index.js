import React from 'react';

import { HashLink as Link } from 'react-router-hash-link';

import GlossaryItem from '../Item'

const GlossaryItems = props => {
    return (
        <>
            <GlossaryItem type="site" title="Anchoring pollster">
                <p>
                    The poll trend that forms the basis of forecasts on this site includes the assumption
                    that pollsters' house effects sum to zero for the two-party-preferred vote and each
                    party's first preference vote. (Note that this is not an assumption
                    that the combined bias of polls sums to zero, an adjustment is made for this
                    later on.) This assumption is necessary in order to create a standardised polling
                    trend analysis method that can be compared and analysed across elections. However,
                    not all pollsters are made equal and some have transparency experience, and a track
                    record that gives more confidence in their results having little or no systemic bias
                    across multiple elections. As a result, in each election certain pollsters are assigned
                    to be "anchoring pollsters" based on their confidence rating (more details on
                    the <Link to="/methodology">methodology page</Link>).
                    The forecasts calibrates the calculation of the poll trend such that the anchoring
                    pollsters' house effects sum to zero. Other pollsters are still used as they may be
                    a useful indication of trend changes, but also not so reliable as regards the absolute
                    level of voting intention.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Bias">
                <p>
                    This word is used in many contexts, but on this site it means the difference, including
                    direction, between a poll or average of polls and the actual election result. This
                    is distinct from a house effect, which measures the difference between pollsters.
                    Adjusting for bias is challenging as the actual bias of a poll can't be known until
                    the result is seen, and the bias can change from one election to another so past
                    elections are not a reliable guide. Using an average across a large
                    number of previous elections can give an indication of what the bias for a current
                    election is more likely to be, but such adjustments should still be used with caution
                    as the factors that caused such a bias may no longer be present.
                </p>
            </GlossaryItem>
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
            <GlossaryItem type="general" title="House effect">
                <p>
                    Sometimes also known as a <strong>partisan lean</strong> or
                    just <strong>lean.</strong> A
                    house effect is a persistent difference in the results of a pollster relative to
                    the results of other pollsters. For example, a poll may record voting intention
                    results for a particular party that is higher than other pollsters refer to; this
                    pollster would then be considered to have a house effect toward this party. (Depending
                    on the party, this might be known as a pro-Labor, pro-Coalition, pro-Green house
                    effect, and so on.) It must be emphasised that a house effect is not the same as
                    bias: a poll showing a house effect may in fact turn out to be accurate, in which cases
                    the other polls would have a bias.
                </p>
                <p>
                    House effects are typically a result to methodological differences between pollsters:
                    sampling and weighting techniques as well as wordings of questions asked. Accurate
                    election analysis will take into account house effects to avoid assessments of voting
                    intention being unduly influenced by the release schedules of pollsters. For example,
                    if there are two pollsters releasing polls every two weeks in an alternating fashion,
                    and these two pollsters have very different house effects, then a naive analysis would
                    result in a volatile, fluctuating vote estimate even if there is no actual underlying
                    change in voting intention. Adjusting for house effects solves this problem, smoothing
                    out the trend and allowing for real changes in voting intention to be identified more
                    easily.
                </p>
                <p>
                    Accounting for house effects is different to accounting for collective bias, where the
                    average result across pollsters has some error in predicting the actual result.
                    House effect adjustment has the effect of adjusting poll results towards the average
                    of all pollsters, but that average can still have a significant error, as in for
                    example the 2019 federal election and the 2018 Victorian state election. Further
                    adjustments may need to be made to account for both long-term collective bias in
                    polling and uncertainty in the collective error for a single election.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Hung parliament">
                <p>
                    The term "hung parliament" is used to describe a situation where, after all votes are
                    counted and winners assigned to seats, no party or pre-existing coalition has a majority
                    of seats, usually requiring a party to gain support from minor parties or independents
                    to form a minority government. In some cases the hung parliament can be resolved
                    quickly as enough of the non-major candidates are clearly aligned with one major party
                    over the other, but in other cases (such as the 2010 federal election) it can mean
                    that negotiations proceed for weeks to determine which party will eventually form
                    government.
                </p>
            </GlossaryItem>
            <GlossaryItem type="site" title="Live forecast">
                <p>
                    The <strong>live forecast</strong> on this site updates the general forecast with
                    actual election results as they come in on election night and afterwards. Results are not
                    only incorporated into the forecast as is but also extrapolated according to historical
                    trends and correlations between seats and polling places.
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
                    are treated separately, because their extensive electoral history allows electoral behaviour
                    to be much more well characterised than in contests involving other ("minor") parties.
                </p>
                <p>
                    Some commentators also refer to the Greens as a "major". However, this site considers the
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
            <GlossaryItem type="site" title="Nowcast">
                <p>
                    Each <strong>nowcast</strong> on this site is intended to forecast a hypothetical
                    election held immediately after the last poll was taken. Thus despite the name it
                    only really represents "now" immediately after an update for a recent poll. It should not
                    be used for any situation where a result at the actual election is desired, but
                    is valuable for assessing the current situation and how it might translate to seats in
                    parliament.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Poll">
                <p>
                    A poll can be used to refer to any survey of public opinion, but for the purposes
                    of this site it mainly refers to surveys that attempt to measure voting intention.
                    For a poll to be usable in forecasting it needs to have a good methodology
                    in regard to sampling of the population. This can be achieved by random sampling
                    of respondents (to avoid self-selection bias) and weighting by demographic groups
                    to account for differing response rates among them.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Pollster">
                <p>
                    Also known as a <strong>polling house</strong>. A company or organisation that
                    undertakes research into public attitudes. For the purposes of this site, the
                    focus is on pollsters that attempt to measure voting intention. Most pollsters
                    also perform other kinds of market research in addition to political polling.
                </p>
                <p>
                    Pollsters may conduct polls for their own publicity, in partnership with media
                    organisations, or for private customers (including parties and candidates).
                    Polling for private customers is often treated with more suspicion as the
                    customer may choose only to publish favourable polls, result in survivorship bias.
                </p>
                <p>
                    The moodelling on this site assesses pollsters both on the lean of their results
                    relative to the average ("house effects") and the level of confidence that can be
                    held in their polling ("poll confidence rating"). These are reflections only of
                    their voting intention specifically and do not reflect on their other
                    market research or even political issues polling outside of voting intention.
                </p>
            </GlossaryItem>
            <GlossaryItem type="site" title="Poll trend">
                <p>
                    The forecasts on this site are based on the calculation of a poll trend that analyses
                    movements in the polls. The poll trend represents the calculation of the most likely
                    voting intention assuming that the house effects and bias of the anchoring pollsters
                    sum to zero. (For more detail see this section of the methodology page.) The latest point on
                    the poll trend is then used as a basis for election simulations after adjustments for
                    historical bias and uncertainty.
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
            </GlossaryItem>
            <GlossaryItem type="general" title="Previous election preferences">
                <p>
                    This is one of the methods by which a two-party-preferred result is calculated from
                    first-preference voting intention results in a poll (the other is using
                    respondent allocated preferences.) By this method, the votes of non-major parties
                    are assigned as preferences to the major parties at the same rates as occurred at
                    the previous election. Historically this method is often quite accurate, as preference
                    flows don't change drastically between elections, and when they do it is usually in
                    an election with optional preferential voting and/or large swings in first preference
                    votes.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Sophomore surge">
                <p>
                    Incumbency is generally an advantage in Australian elections for various reasons. Among
                    major parties the advantage is generally small, but it can be much larger for independents
                    and minor party members of parliament. When a party wins a seat from an opposing party,
                    that party gains incumbency and the opposing party loses it, typically resulting in a
                    boost to the new incumbent known as a <strong>sophomore surge</strong>. On average, the size
                    of this boost depends on the party of the new incumbent and whether the seat is urban or
                    rural. In some cases the advantage is weaker or stronger depending on the personal vote of
                    the old and new members, and may be overwhelmed by other factors so that it can't be seen for
                    an individual seat. A milder form of sophomore surge also occurs when a member retires
                    or otherwise does not recontest a seat, but their party still wins the seat with a different
                    candidate: in this case the new incumbent gets a smaller boost on average.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Swing">
                <p>
                    Electoral commissions in Australia periodically
                    undertake <strong>redistributions</strong>, which are rearrangements of the
                    boundaries of seats to ensure that all seats are approximately equal in population.
                    Changing the boundaries of a seat can change the position of a party in that seat for
                    the next election, so electoral experts calculate new <strong>notional</strong> margins
                    that aim to represent the true state of the seat under the new boundaries. Once
                    calculated, these notional margins are usually used for subsequent analysis and
                    forecast for the next election.
                </p>
            </GlossaryItem>
            <GlossaryItem type="site" title="Regular forecasts">
                <p>
                    Each <strong>regular forecast</strong> on this site is intended to forecast the actual
                    election at the time it is held. The uncertainty (and some other parameters) in the
                    regular forecast accounts for the length of time before the election.
                    This is in contrast with the nowcast.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Respondent allocated preferences">
                <p>
                    This is one of the methods by which a two-party-preferred result is calculated from
                    first-preference voting intention results in a poll (the other is using
                    previous election preferences.) By this method, poll respondents are asked during the
                    poll which of the major parties they would give a higher preference to, and
                    assigned accordingly. Using this method has a very mixed history in Australian polling,
                    notably leading Newspoll to give a final tied result in the 2004 federal election
                    when a previous election preferences calculation would have been much more accurate
                    (giving the Coalition a comfortable win). 
                <p>
                </p>
                    There is little evidence that respondent-allocated preferences improve results
                    vs previous election preferences, even in those elections where preferences do shift.
                    However they do have a place in seat polls when
                    the two-candidate-preferred vote is not between the major parties - in that case there
                    are often no usable historic results and using respondent allocated preferencing is the
                    only way to estimate a result.
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
            <GlossaryItem type="general" title="Swing">
                <p>
                    A swing, in Australian politics, is the change in the vote of a candidate or party
                    (in percentage terms) from one election to the next. For seats that have been
                    redistributed (or being contested for the first time this election), the swing
                    is calculated comparing to the estimated notional vote after the redistribution.
                    Swings can be calculated for either the first preference vote or two-candidate-preferred
                    vote.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Two-candidate-preferred vote">
                <p>
                    Often abbreviated to <strong>TCP</strong>.
                    Under preferential voting for a particular seat, candidates are excluded until
                    there are two remaining and all the other candidates' preferences have been
                    allocated to one of them. The distribution of the votes between these two candidates
                    is known as the two-candidate-preferred vote, as it indicates what proportion of voters
                    preferred each candidate over the other. By definition the two candidates'
                    two-candidate-preferred votes will add to 100%. The candidate with the higher
                    two-candidate-preferred vote wins the seat.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Two-party-preferred vote">
                <p>
                    Often abbreviated to <strong>TPP</strong>. Refers to the proportion of voters who
                    give a higher preference to one major party than the other. This is useful on an
                    election-wide basis as it indicates the likely size of swings in the majority of seats
                    where the final two candidates under preferential voting are from the major parties.
                    In these seats the two-party-preferred vote is identical to the two-candidate-preferred
                    vote; however, in seats where one or (rarely) both of the candidates in the final two
                    is not from the major parties it indicates the underlying support for the major parties
                    in that seat. Even though it is not necessary to determine the result, most
                    electoral commissions do still count the two-party-preferred result in these seats
                    for analysis purposes. This is useful for, among other things, forecasting for
                    the following election if the non-major candidate(s) do not contest or fail to make
                    the final two.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Voting intention">
                <p>
                    The proportion of the population that is intending to vote for a particular party
                    or candidate at a given time. Political polls attempt to measure this by surveying
                    voters and asking them who they think they will vote for. Voting intention polling
                    may also attempt to estimate the two-party-preferred vote either by asking
                    for a voter's preference directly (responsent allocated preferences) or by
                    using rates observed in previous elections (previous election preferences).
                </p>
            </GlossaryItem>
        </>
    );
}

export default GlossaryItems;