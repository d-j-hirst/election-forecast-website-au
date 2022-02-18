import React from 'react';

import { Link } from 'react-router-dom';

import { useUserRequired } from 'utils/hooks';
import { Header, GuideHeader, InfoIcon } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Guide.module.css';

const Guide = () => {
    // Putting this here instructs the frontend to only display this page
    // if a valid user is logged in. As always, don't trust the client
    // and protect on the backend as well!
    useUserRequired();
    const windowDimensions = useWindowDimensions();

    return (
        <>
            <Header windowWidth={windowDimensions.width} page={"guide"} />
            <div className={styles.content}>
                <GuideHeader />
                <div className={styles.mainText}>
                    <p>
                        This page is a guide to using and interpreting the forecast. All parts of the
                        forecast are explained briefly on the <Link to={"/forecast"}>forecast page</Link> itself, shown
                        by clicking the
                        the <InfoIcon inactive={true} /> and <InfoIcon inactive={true} warning={true} /> icons.
                        This page is reserved for some topics that deserve a more in-depth discussion.
                    </p>
                    <p><h4 id="purpose">Site purpose</h4></p>
                    <p>
                        The purpose of this site is to provide carefully designed probabilistic
                        forecasts for elections in Australia. This is done by analysing recent
                        political history and building a model for projecting known information
                        (such as opinion polling) to possible election results.
                    </p>
                    <p>
                        Why is this valuable? People or businesses may be significantly affected by
                        the consequences of an election outcome, either financially or in some other way.
                        Having well-designed forecasts allows for rational preparation for these
                        consequences, without either excessively focusing on unlikely outcomes or
                        ignoring potential possibilities.
                    </p>
                    <p>
                        Unfortunately, a lot of media reports and public discussion regarding potential
                        future election results are subjective or poorly informed, allowing for
                        cognitive biases to affect expectation. For example:
                    </p>
                    <ul>
                        <li>
                            "Party X is well ahead in the polls, so party Y can't win." This is an
                            example of overconfidence. It is not unusual for parties to come back
                            from even quite large polling deficits over time.
                        </li>
                        <li>
                            "The polls were wrong last time, so they don't mean anything." This is an
                            example of a hasty generalisation. In fact, in the vast majority of Australian elections
                            were a party was leading in the polls immediately before the election, they go on to
                            form government after the election.
                        </li>
                        <li>
                            "Everyone I know is voting for party X, so they will surely win" This is an
                            example of a different kind of hasty generalisation. Most people tend to socialise with
                            and (especially) discuss politics with others with who are similar to themselves,
                            including having similar political opinions. As a result, this isn't strong evidence that
                            the wider population shares those opinions.
                        </li>
                    </ul>
                    <p>
                        Creating forecasts objectively based on historic precedent allows more accurate expectations
                        for future election results. In particular, this site focuses on measuring uncertainty,
                        estimating not only the most likely outcome, but also how realistic other possibilities are.
                        Even if a forecast gives both sides equal chance of winning, it is still useful for
                        someone who had previously believed that the result was clear.
                    </p>
                    <p><h4 id="nowcast-q">Nowcast</h4></p>
                    <p>
                        To be added
                    </p>
                </div>
            </div>
        </>
    );
};

export default Guide;
