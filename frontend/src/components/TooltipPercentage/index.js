import React from 'react';

import TooltipText from '../TooltipText'

const TooltipPercentage = props => (
    <TooltipText 
        mainText={Number((props.value)).toFixed(1) + '%'}
        tooltipText={Number((props.value)).toFixed(3) + '%'}
    />
);

export default TooltipPercentage;