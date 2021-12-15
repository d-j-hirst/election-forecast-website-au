import React from 'react';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function renderTooltip(props) {
    let tooltipText = ""

    //Sometimes, props.popper.state is undefined. 
    //It runs this function enough times that state gets a value 
    if (props.popper.state) {
        tooltipText = props.popper.state.options.tooltipText
    }

    return (
        <Tooltip id="button-tooltip" {...props}>
            {tooltipText}
        </Tooltip>
    );
}

const TooltipText = props => (
    <>
        <OverlayTrigger
            delay={{ hide: 0, show: 250 }}
            popperConfig={{tooltipText: props.tooltipText}}
            overlay={renderTooltip}
            placement="bottom"
        >
        <span role="button">
            {props.mainText}
        </span>
        </OverlayTrigger>
    </>
);

export default TooltipText;