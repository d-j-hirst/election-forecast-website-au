import React from 'react';

import WinnerBar from '../WinnerBar';

import { intMap } from '../../utils/intmap.js'

const WinnerBarDist = props => {
    const chartWidth = 300;
    const voteDistStyle = {
        width: chartWidth.toString() + 'px',
        position: 'relative',
        height: '10px',
        padding: '0px',
        margin: '0px 0px 0px 8px'
    };

    let bars = undefined;
    let currentPercent = 0;
    bars = props.freqSet.map(freq => {
        const left = Math.ceil(chartWidth * currentPercent * 0.01);
        const width = Math.ceil(chartWidth * freq[1] * 0.01);
        currentPercent += freq[1];
        return {
            xLow: left,
            xHigh: left + width,
            partyAbbr: intMap(props.forecast.partyAbbr, freq[0]),
            partyName: intMap(props.forecast.partyName, freq[0]),
            winPercent: freq[1]
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