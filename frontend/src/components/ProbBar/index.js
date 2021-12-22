import React from 'react';

import { bgClass, midBgClass, lightBgClass, xLightBgClass, xxLightBgClass, xxxLightBgClass } from '../../utils/partyclass.js'

import { intMap } from '../../utils/intmap.js'

const ProbBar = props => {
    const lt = props.thresholds[0];
    const rt = props.thresholds[1];
    const pos = props.thresholds[2];
    const freq = props.freqSet[1];
    const classes = [[0, bgClass(props.partyAbbr)],
                     [1, midBgClass(props.partyAbbr)],
                     [2, lightBgClass(props.partyAbbr)],
                     [3, xLightBgClass(props.partyAbbr)],
                     [4, xxLightBgClass(props.partyAbbr)],
                     [5, xxxLightBgClass(props.partyAbbr)]];
    const leftVal = Math.floor(freq[lt] * props.scalingFactor).toString() + 'px';
    const widthVal = Math.floor((freq[rt] - freq[lt]) * props.scalingFactor + 1).toString() + 'px';
    const thisStyle = {
        height: '10px',
        width: widthVal,
        left: leftVal,
        position: 'absolute'
    }
    const distanceFromMid = Math.abs(pos - props.midThreshold);
    const barClass = intMap(classes, distanceFromMid);
    return <div style={thisStyle} className={barClass}/>
}

export default ProbBar;