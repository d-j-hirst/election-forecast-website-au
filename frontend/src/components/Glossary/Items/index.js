import React from 'react';

import GlossaryItem from '../Item'

const GlossaryItems = props => {
    return (
        <>
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
            <GlossaryItem type="site" title="Site item">
                Site item definition
            </GlossaryItem>
        </>
    );
}

export default GlossaryItems;