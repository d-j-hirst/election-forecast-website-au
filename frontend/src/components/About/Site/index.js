import React from 'react';

import InfoIcon from '../../General/InfoIcon';
import { ExtLink } from '../../../utils/extlink.js';

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
                    the source code for the <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser">forecast generation</ExtLink>
                    {" "}and the <ExtLink href="https://github.com/d-j-hirst/election-forecast-website-au">website</ExtLink>.
                </li>
            </ul>
        </>
    );
}

export default AboutTheSite;