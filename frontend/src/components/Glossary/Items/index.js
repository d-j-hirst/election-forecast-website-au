import React from 'react';

import { HashLink as Link } from 'react-router-hash-link';

import GlossaryItem from '../Item'

const GlossaryItems = props => {
    return (
        <>
            <GlossaryItem type="site" title="Anchoring pollster">
                <p>
                    The <Link to="#poll-trend">poll trend</Link> that forms the basis of forecasts on this
                    site includes the assumption that
                    pollsters' <Link to="#house-effect">house effects</Link> sum
                    to zero for the <Link to="#two-party-preferred-vote">two-party-preferred</Link> vote and each
                    party's <Link to="#first-preference-vote">first-preference vote</Link>.
                    (Note that this is not an assumption that the
                    combined <Link to="#bias">bias</Link> of <Link to="#poll">polls</Link> sums
                    to zero, an adjustment
                    is made for possible bias later on.) This assumption is necessary in order to create a
                    standardised polling trend analysis method that can be compared and analysed
                    across elections. However, not all <Link to="#pollster">pollsters</Link> are made
                    equal and some have more transparency, more experience, or a more substantial track
                    record that gives more confidence in their results having little or no systemic bias
                    across multiple elections. As a result, in each election certain pollsters are assigned
                    to be <i>anchoring pollsters</i> based on their confidence rating (more details on
                    the <Link to="/methodology#poll-data-used">methodology page</Link>).
                    The forecasts calibrates the calculation of the poll trend such that the anchoring
                    pollsters' house effects sum to zero. Other pollsters are still used as they may be
                    a useful indication of trend changes, but also not so reliable as regards the absolute
                    level of <Link to="#voting-intention">voting intention</Link>.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Bias">
                <p>
                    This word is used in many contexts, but on this site it means the difference, including
                    direction, between a <Link to="#poll">poll</Link> or average of polls and the actual election result. This
                    is distinct from a <Link to="#house-effect">house effect</Link>, which measures the difference between pollsters.
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
                    voter gives their first preference to (marks with 1 on their ballot paper).
                    Generally this is the voter's most preferred party (but
                    see <Link to="#tactical-voting">Tactical Voting</Link> for
                    why this might be otherwise).
                </p>
                <p>
                    When talking about election results, this term is more often used as a shorthand
                    for the share of all voters giving a party or candidate their first preference.
                    (For example, "the Greens' first preference vote was 10.4% in 2019".) If a candidate's
                    first preference share is more than 50% of total formal votes, then they will
                    be elected. However, with fewer than 50% they can still lose, even if they have more
                    first preference votes than any other party, as other parties can overtake them
                    by getting more preferences (see <Link to="#preferential-voting">Preferential Voting</Link>).
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="House effect">
                <p>
                    Sometimes also known as a <strong>partisan lean</strong> or
                    just <strong>lean.</strong> A
                    house effect is a persistent difference in the results of
                    a <Link to="#pollster">pollster</Link> relative to
                    the results of other pollsters. For example, a <Link to="#poll">poll</Link> may
                    record <Link to="#voting-intention">voting intention</Link> results
                    for a particular party that is higher than other pollsters refer to; this
                    pollster would then be considered to have a house effect toward this party. (Depending
                    on the party, this might be known as a pro-Labor, pro-Coalition, pro-Green house
                    effect, and so on.) It must be emphasised that a house effect is not the same as
                    <Link to="#bias">bias</Link>: a poll showing a house effect may in fact turn out to be accurate,
                    in which cases the other polls would have a bias.
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
                    counted and winners assigned to <Link to="#seat">seats</Link>, no party or pre-existing coalition has a majority
                    of seats, usually requiring a party to gain support from minor parties or independents
                    to form a minority government. In some cases the hung parliament can be resolved
                    quickly as enough of the non-major candidates are clearly aligned with
                    one <Link to="#major-party">major party</Link> over the other,
                    but in other cases (such as the 2010 federal election) it can mean
                    that negotiations proceed for weeks to determine which party will eventually form
                    government.
                </p>
            </GlossaryItem>
            <GlossaryItem type="site" title="Live forecast">
                <p>
                    The <strong>live forecast</strong> on this site updates the general forecast with
                    actual election results as they come in on election night and afterwards. Results are not
                    only incorporated into the forecast as is but also extrapolated according to historical
                    trends and correlations between <Link to="#seat">seats</Link> and polling places.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Major party">
                <p>
                    The term "major party" is most often used to refer to those parties with a significant
                    chance of forming government in the short to medium term. At present this refers to
                    either Labor (ALP) or the Coalition and its members (Liberals, Nationals, the Liberal
                    National party and the Country Liberal party). This as as opposed to other parties known
                    as <Link to="#minor-party">minor parties</Link>.
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
                    In Australian politics, this term usually refers to the proportion of the
                    total <Link to="#two-candidate-preferred-vote">two-candidate-preferred</Link> vote
                    that an incumbent can lose before they lose the election.
                    For example, if incumbent Party A is leading challenger Party B by 54% to 46% then
                    the margin is 4%. (If Party A more than 4% of the two-candidate-preferred vote,
                    then they lose the <Link to="#seat">seat</Link> as the two values always add up to 100% by definition, so
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
                    A minor party is any party not considered a <Link to="#major-party">major party</Link>.
                    As far as this site is concerned, this includes the Greens,
                    the (present-day) United Australia Party,
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
                    election held immediately after the last <Link to="#poll">poll</Link> was taken.
                    Thus despite the name it
                    only really represents "now" immediately after an update for a recent poll. It should not
                    be used for any situation where a result at the actual election is desired, but
                    is valuable for assessing the current situation and how it might translate to
                    <Link to="#seat">seats</Link> in parliament.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Poll">
                <p>
                    A poll can be used to refer to any survey of public opinion, but for the purposes
                    of this site it mainly refers to surveys that attempt to
                    measure <Link to="#voting-intention">voting intention</Link>.
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
                    focus is on pollsters that attempt to measure <Link to="#voting-intention">voting intention</Link>.
                    Most pollsters also perform other kinds of market research in addition to political polling.
                </p>
                <p>
                    Pollsters may conduct <Link to="#poll">polls</Link> for their own publicity,
                    in partnership with media
                    organisations, or for private customers (including parties and candidates).
                    Polling for private customers is often treated with more suspicion as the
                    customer may choose only to publish favourable polls, result in survivorship bias.
                </p>
                <p>
                    The moodelling on this site assesses pollsters both on the lean of their results
                    relative to the average ("<Link to="#house-effect">house effects</Link>")
                    and the level of confidence that can be
                    held in their polling ("poll confidence rating"). These are reflections only of
                    their voting intention specifically and do not reflect on their other
                    market research or even political issues polling outside of voting intention.
                </p>
            </GlossaryItem>
            <GlossaryItem type="site" title="Poll trend">
                <p>
                    The forecasts on this site are based on the calculation of a <Link to="#poll">poll</Link> trend
                    that analyses
                    movements in the polls. The poll trend represents the calculation of the most likely
                    <Link to="#voting-intention">voting intention</Link> assuming
                    that the <Link to="#house-effect">house effects</Link> and
                    <Link to="#bias">bias</Link> of the <Link to="#anchoring-pollster">anchoring pollsters</Link>
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
                    This is one of the methods by which
                    a <Link to="#two-party-preferred-vote">two-party-preferred</Link> result
                    is calculated
                    from <Link to="#first-preference-vote">first-preference</Link> <Link to="#voting-intention">voting intention</Link> results
                    in a poll (the other is
                    using <Link to="#respondent-allocated-preferences">respondent allocated preferences.</Link>)
                    By this method, the votes of non-major parties
                    are assigned as preferences to the major parties at the same rates as occurred at
                    the previous election. Historically this method is often quite accurate, as preference
                    flows don't change drastically between elections, and when they do it is usually in
                    an election with optional <Link to="#preferential-voting">preferential voting</Link> and/or
                    large <Link to="#swing">swings</Link> in first-preference votes.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Redistribution">
                <p>
                    Electoral commissions in Australia periodically
                    undertake <strong>redistributions</strong>, which are rearrangements of the
                    boundaries of <Link to="#seat">seats</Link> to ensure that all seats are approximately equal in population.
                    Changing the boundaries of a seat can change the position of a party in that seat for
                    the next election, so electoral experts calculate
                    new <strong>notional</strong> <Link to="#margin">margins</Link> that
                    aim to represent the true state of the seat under the new boundaries. Once
                    calculated, these notional margins are usually used for subsequent analysis and
                    forecast for the next election.
                </p>
            </GlossaryItem>
            <GlossaryItem type="site" title="Regular forecast">
                <p>
                    Each <strong>regular forecast</strong> on this site is intended to forecast the actual
                    election at the time it is held. The uncertainty (and some other parameters) in the
                    regular forecast accounts for the length of time before the election.
                    This is in contrast with the <Link to="#nowcast">nowcast</Link>, which projects
                    to a hypothetical election immediately after the most recent <Link to="#poll">poll</Link>.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Respondent allocated preferences">
                <p>
                    This is one of the methods by which
                    a <Link to="#two-party-preferred-vote">two-party-preferred</Link> result
                    is calculated from <Link to="#first-preference-vote">first-preference</Link> voting
                    intention results in a <Link to="#poll">poll</Link> (the other is
                    using <Link to="#previous-election-preferences">previous election preferences</Link>.)
                    By this method, poll respondents are asked during the
                    poll which of the major parties they would give a higher preference to, and
                    assigned accordingly. Using this method has a very mixed history in Australian polling,
                    notably leading Newspoll to give a final tied result in the 2004 federal election
                    when a previous election preferences calculation would have been much more accurate
                    (giving the Coalition a comfortable win). 
                <p>
                </p>
                    There is little evidence that respondent-allocated preferences improve results
                    vs previous election preferences, even in those elections where preferences do shift.
                    However they do have a place in <Link to="#seat">seat</Link> polls when
                    the <Link to="#two-candidate-preferred-vote">two-candidate-preferred</Link> vote
                    is not between the major parties - in that case there
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
                    a member of parliament (MP) using <Link to="#preferential-voting">preferential voting</Link>.
                    Seats may be considered as marginal (with a significant chance of changing hands) or
                    safe (if the seat changing party is very unlikely).
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Sophomore surge">
                <p>
                    Incumbency is generally an advantage in Australian elections for various reasons. Among
                    major parties the advantage is generally small, but it can be much larger for independents
                    and <Link to="#minor-party">minor party</Link> members of parliament. When a party wins
                    a <Link to="#seat">seats</Link> from an opposing party,
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
                    A swing, in Australian politics, is the change in the vote of a candidate or party
                    (in percentage terms) from one election to the next. For <Link to="#seat">seats</Link> that have been
                    redistributed (or being contested for the first time this election), the swing
                    is calculated comparing to the estimated notional vote after the redistribution.
                    Swings can be calculated for either
                    the <Link to="#first-preference-vote">first preference</Link> vote
                    or <Link to="#two-candidate-preferred-vote">two-candidate-preferred</Link> vote.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Tactical voting">
                <p>
                    Tactical voting generally refers to voting where voters vote in some way other than
                    the "natural" method for their voting system, usually by predicting other voters'
                    behaviour to some degree. This site focuses on Australian lower house elections
                    using <Link to="#preferential-voting">preferential voting</Link>, in which
                    the <i>natural</i> method of voting is to number the
                    candidates in order of preference with 1 being the most preferred candidate. As such,
                    tactical voting involves ordering candidates in some other order.
                </p>
                <p>
                    The most common example is when a prominent independent is running in a <Link to="#seat">seat</Link>. In
                    particular, independents running against Coalition incumbents is a common theme of
                    the 2022 federal election and other recent elections, so that will be used here as
                    an example. Consider a seat where, after all other candidates are excluded, the
                    vote shares would be as follows:
                </p>
                <ul>
                    <li>Coalition: 40%</li>
                    <li>Labor: 35%</li>
                    <li>Independent: 25%</li>
                </ul>
                <p>
                    Suppose that of the voters for the independent, 60% preference the Coalition and
                    40% preference Labor. As things stand, the independent will be eliminated and their votes
                    will be reassigned to the <Link to="#major-party">major party</Link> candidates accordingly:
                    15% of total vote to the Coalition and the other 10% to Labor. This results in the Coalition
                    winning 55-45% over Labor in
                    the <Link to="#two-candidate-preferred-vote">two-candidate-preferred</Link> vote.
                </p>
                <p>
                    However, consider that some Labor voters know they cannot win, and vote for the
                    independent instead. A 10% shift from Labor to independent looks like this:
                </p>
                <ul>
                    <li>Coalition: 40%</li>
                    <li>Labor: 25%</li>
                    <li>Independent: 35%</li>
                </ul>
                <p>
                    Now suppose a much higher preference flow from the remaining Labor voters: 
                    80% of them preference the Independent and 20% preference Liberal.
                    Then Labor is eliminated and 5% of the total vote is reassigned to the Coalition
                    while the other 20% is reassigned to the Independent. This results in the Independent
                    winning 55-45% over the Coalition in the two-candidate-preferred vote.
                </p>
                <p>
                    In this case, Labor supporters instead voting for the independent allowed the
                    independent to overtake the Labor candidate to get into second place, and then
                    the independent candidate won from the improved preference flow from Labor whereas
                    the Labor candidate would have lost had the independent candidate been eliminated.
                </p>
                <p>
                    More generally, tactical voting of this type involves voting for a non-preferred
                    candidate who is more likely to win (due to better preference flows) in order to
                    maximise the chance that another candidate does not win. Tactical voting can
                    be risky if the voter misjudges which candidate is more likely to win, but for
                    Independent/major party contests a prominent centrist independent almost always does better
                    against the opposing major party than one's preferred major party.
                </p>
            </GlossaryItem>
            <GlossaryItem type="general" title="Two-candidate-preferred vote">
                <p>
                    Often abbreviated to <strong>TCP</strong>.
                    Under <Link to="#preferential-voting">preferential voting</Link> for
                    a particular <Link to="#seat">seat</Link>, candidates are excluded until
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
                    give a higher preference to one <Link to="#major-party">major party</Link> than the other.
                    This is useful on an election-wide basis as it indicates the likely size
                    of <Link to="#swing">swings</Link> in
                    the majority of <Link to="#seat">seats</Link> where the final two candidates
                    under <Link to="#preferential-voting">preferential voting</Link> are
                    from the major parties.
                    In these seats the two-party-preferred vote is identical to
                    the <Link to="#two-candidate-preferred-vote">two-candidate-preferred</Link> vote;
                    however, in seats where one or (rarely) both of the candidates in the final two
                    is not from the major parties the two-party-preferred vote for that particular seat
                    indicates the underlying support for the major parties
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
                    or candidate at a given time. Political <Link to="#poll">polls</Link> attempt to measure this by surveying
                    voters and asking them who they think they will vote for. Voting intention polling
                    may also attempt to estimate the <Link to="#two-party-preferred-vote">two-party-preferred</Link> vote either by asking
                    for a voter's preference directly
                    (<Link to="#respondent-allocated-preferences">respondent allocated preferences.</Link>) or
                    by using rates observed in previous elections
                    (<Link to="#previous-election-preferences">previous election preferences</Link>).
                </p>
            </GlossaryItem>
        </>
    );
}

export default GlossaryItems;