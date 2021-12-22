import React from 'react';

import TooltipWrapper from '../TooltipWrapper'

const TooltipPercentage = props => (
    <TooltipWrapper tooltipText={Number((props.value)).toFixed(3) + '%'}>
        {Number((props.value)).toFixed(1) + '%'}
    </TooltipWrapper>
);

export default TooltipPercentage;