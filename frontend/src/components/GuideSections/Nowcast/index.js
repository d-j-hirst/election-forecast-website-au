import React from 'react';

const GuideNowcast = props => {
    return (
        <>
            <p><h4 id="nowcast">Nowcast</h4></p>
            <p>
                Nowcasting is a term used in forecasting fields such as meteorology and
                economics to refer to the process of estimating conditions at the 
                present time (or perhaps the immediate future) when it is not possible
                to observe those conditions exactly. On this site, with regard to election
                forecasting, it is used to represent a <strong>snapshot of public opinion
                immediately after the last polling input to the model.</strong> To do this,
                the model is run exactly the same way as a regular forecast except that
                it "pretends" that the election is only a day after the latest poll result.
            </p>
            <p>
                Importantly, this means that the nowcast <strong>is not a forecast</strong> in
                some important ways. It is not an indicator of the actual election
                results, as much can change in the time between current polling and the
                actual election (especially in federal politics), and the nowcast does not take
                this into account. It is also not testable, as
                the hypothetical election it is "predicting" for never actually occurs (except
                when it is run immediately before the real election, of course). Finally, it
                is arguable that the presence of an election campaign would influence the
                polling before an actual election, and that polls at any given point in time
                would actually be saying something different were an election really about to be held.
            </p>
            <p>
                So, why pay attention to a nowcast at all? It's still good as a measure
                of how public opinion is evolving in reaction to new developments. Many media outlets,
                especially those who commission or are partnered with polling agencies, tend to report
                on the results of individual polls as if others don't exist, even if the movements of
                that poll are small enough to have easily been caused by random chance. By aggregating
                many different polls together and accounting for house effects and other confounding
                factors, the signal produced by public events can be distinguished from the noise of
                random sampling. This makes it easier to recognise what kinds of events are really
                impacting on public opinion and voting intention.
            </p>
        </>
    );
}

export default GuideNowcast;