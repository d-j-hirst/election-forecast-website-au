import React from 'react';

import TooltipWrapper from '../TooltipWrapper'
import { bgClass, midBgClass, lightBgClass, xLightBgClass, xxLightBgClass, xxxLightBgClass } from '../../utils/partyclass.js'

import { intMap } from '../../utils/intmap.js'

const formatWholeOrFixed = num => {
    let formatted = Number(num).toFixed(1);
    console.log(formatted);
    if (formatted.slice(-2) === ".0") formatted = formatted.slice(0, -2);
    return formatted;
}

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
    const leftVal = Math.floor((freq[lt] - props.visualOffset) * props.scalingFactor).toString() + 'px';
    const widthVal = Math.floor((freq[rt] - freq[lt]) * props.scalingFactor + 1).toString() + 'px';
    const thisStyle = {
        height: '10px',
        width: widthVal,
        left: leftVal,
        position: 'absolute'
    }
    // this class and its div works around a difficulty in CSS: the tooltip is placed at the
    // closest positioned ancestor, but an absolute-position div is not considered "positioned"
    // for this purpose, so this style creates a "dummy" div that covers exactly the same area
    // but with relative positioning that the tooltip can attach to
    const tooltipHolderStyle = {
        position: 'relative',
        width: "100%",
        height: "100%"
    }
    const offsetFromMid = pos - props.midThreshold;
    const barClass = intMap(classes, Math.abs(offsetFromMid));
    let tooltipText = Number((freq[lt])).toFixed(1) + "% - " +
                        Number((freq[rt])).toFixed(1) + "%\nPercentile " + 
                        formatWholeOrFixed(props.thresholdLevels[lt]) + " - " +
                        formatWholeOrFixed(props.thresholdLevels[rt]) + "\n";
    if (offsetFromMid === 0) {
        tooltipText += "This range covers the vote totals that are most expected given the current situation.";
    }
    else if (Math.abs(offsetFromMid) === 1) {
        tooltipText += "This range covers vote totals that are somewhat " +
            (offsetFromMid > 0 ? "higher" : "lower") + " than expected, but not unusually so given the current situation.";
    }
    else if (Math.abs(offsetFromMid) === 2) {
        tooltipText += "This range covers vote totals that are unusually " +
            (offsetFromMid > 0 ? "high" : "low") + " given the current situation.";
    }
    else if (Math.abs(offsetFromMid) >= 3) {
        tooltipText += "This range covers vote totals that are exceptionally " +
            (offsetFromMid > 0 ? "high" : "low") + ", and should only happen rarely given the current situation.";
    }

    return (
        <div style={thisStyle} className={barClass}>
            <TooltipWrapper tooltipText={tooltipText} placement="top">
                <div style={tooltipHolderStyle} />
            </TooltipWrapper>
        </div>
    )
}

export default ProbBar;