import React from 'react';

import InfoIcon from '../../General/InfoIcon';
import { ExtLink } from '../../../utils/extlink.js';
import Email from '../../General/Email';

const AboutTheSite = props => {
    return (
        <>
            <h4 id="introduction">About the Site</h4>
            <p>
                This site is dedicated to the forecasting of elections in Australia.
                Statistical methods are used to analyse past trends in election results
                and use them to project likely and possible outcomes for future elections.
                This project began as an Excel spreadsheet for the 2010 Federal Election
                and has been adjusted and improved over the years, finally published
                in 2022.
                The approach to forecasting is along these lines:
            </p>
            <ul>
                <li>
                    The forecasts are <i>probabilistic</i>. This site doesn't try to
                    predict exact outcomes, but it will instead show likely and
                    unlikely possibilities. 
                </li>
                <li>
                    The forecasts aim to be <i>objective</i> where possible, using past
                    results and quantifiable present data to inform future projections.
                    For some areas where past history has little to say, judgment calls
                    may be necessary about how to design the forecast, but these are
                    kept to a minimum.
                </li>
                <li>
                    The forecasts aim to be as <i>comprehensive</i> as practical. Results for
                    all significant candidates and prominent independents are forecast for
                    each seat. Unlikely but plausible events, such as new minor parties appearing
                    and winning seats, are accounted for (with a suitably low probability).
                    Furthermore, where possible, forecasting will begin well ahead of future elections.
                    Even though present indicators (such as polling) may not be very
                    predictive a long way out from an election, this site will aim to show that
                    through the numbers - and use whatever predictive power there is as well as it can.
                </li>
                <li>
                    The forecast process is <i>transparent</i>. The <InfoIcon inactive={true}/> and 
                    {" "}<InfoIcon inactive={true} warning={true}/> buttons reveal brief inline explanations
                    for parts of the forecasts, with the latter drawing attention to parts that are
                    easy to misinterpret. A step-by-step description of the methodology for producing
                    a forecast is given on the <a href="/methodology">methodology page</a>. As this
                    is quite complex, the methodology page does not describe every detail of the
                    technical implementation, so those wanting to know the full details can check
                    the source code and data for the <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser">forecast generation</ExtLink>
                    {" "}and the <ExtLink href="https://github.com/d-j-hirst/election-forecast-website-au">website</ExtLink>.
                    These contain all the information required to replicate the forecasts.
                </li>
            </ul>
            <p>
                Follow on <ExtLink href="https://twitter.com/aeforecasts">Twitter</ExtLink> for
                notifications when new forecasts are released.
            </p>
            <h4 id="introduction">About the Author</h4>
            <p>
                The author of this site is based in Melbourne, is interested in politics as
                well as forecasting in various disciplines, and has a PhD in biochemistry.
                He has never been a member of, or associated with, a political party, but tends to vote for parties
                to the left of the political centre, and is an occasional commenter on
                political sites under the nickname "dendrite". If you have any questions about the 
                website, forecasting or Australian political system in general, feel free
                to <Email>email</Email> him.
            </p>
            <h4 id="introduction">Acknowledgements</h4>
            <p>
                This site and its analysis procedures are constructed largely independently but
                the work of others in this field has been very helpful and is greatly appreciated - in no
                particular order <ExtLink href="https://kevinbonham.blogspot.com/">Kevin&nbsp;Bonham</ExtLink>,
                {" "}<ExtLink href="https://www.pollbludger.net/">The&nbsp;Poll&nbsp;Bludger</ExtLink>,
                {" "}<ExtLink href="https://marktheballot.blogspot.com/">Mark&nbsp;The&nbsp;Ballot</ExtLink>,
                {" "}<ExtLink href="https://armariuminterreta.com/">Armarium&nbsp;Interreta</ExtLink> and
                {" "}<ExtLink href="https://www.tallyroom.com.au/">The&nbsp;Tally&nbsp;Room</ExtLink>.

            </p>
        </>
    );
}

export default AboutTheSite;