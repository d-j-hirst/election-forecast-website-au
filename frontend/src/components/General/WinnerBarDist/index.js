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
    
    console.log(props.forecast);
    console.log(props.forecast.seatCandidateNames[props.index]);
    const candidateNames = props.freqSet.map(
        e => ("seatCandidateNames" in props.forecast ?
            (
                props.forecast.seatCandidateNames.length > 0 ? jsonMap(props.forecast.seatCandidateNames[props.index], e[0], null) : ''
            )
            : null
        )
    );

    let bars = undefined;
    let currentPercent = 0;
    const namedIndependentExists = props.freqSet.filter(a => jsonMap(props.forecast.partyAbbr, a[0]) === "IND").length > 1;
    console.log(namedIndependentExists);
    bars = props.freqSet.map((freq, index) => {
        const left = Math.ceil(chartWidth * currentPercent * 0.01);
        const width = Math.ceil(chartWidth * freq[1] * 0.01);
        currentPercent += freq[1];
        const abbr = freq[0] === -2 ? 'indx' : jsonMap(props.forecast.partyAbbr, freq[0]);
        const name = freq[0] === -2 ? (namedIndependentExists ? 'Any other independent' :'Any indepdendent') :
            jsonMap(props.forecast.partyName, freq[0]);
        console.log(name);
        return {
            candidateName: candidateNames[index],
            eventualWinner: props.result !== null ? props.result === abbr : false,
            partyAbbr: abbr,
            partyName: name,
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