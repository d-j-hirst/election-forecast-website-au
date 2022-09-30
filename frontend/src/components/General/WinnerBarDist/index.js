import React from 'react';

import WinnerBar from '../WinnerBar';

import { jsonMap } from '../../../utils/jsonmap.js'

const WinnerBarDist = props => {
    const chartWidth = props.width !== undefined ? props.width : 300;
    const voteDistStyle = {
        width: chartWidth.toString() + 'px',
        position: 'relative',
        height: '30px',
        padding: '0px',
        margin: '0px auto',
    };
    
    const candidateNames = props.freqSet.map(
        e => ("seatCandidateNames" in props.forecast ?
            (
                jsonMap(props.forecast.seatCandidateNames[props.index], e[0], null)
            )
            : null
        )
    );

    let bars = undefined;
    let currentPercent = 0;
    bars = props.freqSet.map((freq, index) => {
        const left = Math.ceil(chartWidth * currentPercent * 0.01);
        const width = Math.ceil(chartWidth * freq[1] * 0.01);
        currentPercent += freq[1];
        const abbr = freq[0] === -2 ? 'indx' : jsonMap(props.forecast.partyAbbr, freq[0]);
        return {
            candidateName: candidateNames[freq, index],
            eventualWinner: props.result !== null ? props.result === abbr : false,
            partyAbbr: abbr,
            partyName: jsonMap(props.forecast.partyName, freq[0]),
            winPercent: freq[1],
            xHigh: left + width,
            xLow: left
        }
    })

    return (
        <div style={voteDistStyle}>
            {bars.map((bar, index) => {
                return <WinnerBar bar={bar} key={index} />
            })}
        </div>
    )
}

export default WinnerBarDist;