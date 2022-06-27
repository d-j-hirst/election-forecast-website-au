import React from 'react';

import TooltipWrapper from '../TooltipWrapper'
import { bgClass } from '../../../utils/partyclass.js'

const WinnerBar = props => {
    const lt = props.bar.xLow;
    const rt = props.bar.xHigh;
    const barClass = bgClass(props.bar.partyAbbr);
    const leftVal = Math.floor(lt).toString() + 'px';
    const widthVal = Math.floor(rt - lt).toString() + 'px';
    const thisStyle = {
        height: '20px',
        top: '5px',
        width: widthVal,
        left: leftVal,
        position: 'absolute',
        border: props.bar.eventualWinner ? '2px solid black' : 'none',
        zIndex: props.bar.eventualWinner ? 1 : 0
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

    let tooltipText = "";
    tooltipText = props.bar.partyName + " - " + Number(props.bar.winPercent).toFixed(1) + "% chance to win." +
        (props.bar.eventualWinner ? " Ultimately won the seat." : "");

    return (
        <div style={thisStyle} className={barClass}>
            <TooltipWrapper tooltipText={tooltipText} placement="top">
                <div style={tooltipHolderStyle} />
            </TooltipWrapper>
        </div>
    )
}

export default WinnerBar;