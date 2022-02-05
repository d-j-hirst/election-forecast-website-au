import React from 'react';

import TooltipWrapper from '../TooltipWrapper'

const TooltipPercentage = props => {
    const label = props.label === undefined ? "" : props.label + ": ";
    const text = label + Number((props.value)).toFixed(3) + '%';
    return (
        <TooltipWrapper tooltipText={text}>
            {Number((props.value)).toFixed(1) + '%'}
        </TooltipWrapper>
    )
}

export default TooltipPercentage;