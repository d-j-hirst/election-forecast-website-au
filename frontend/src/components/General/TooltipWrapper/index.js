import React from 'react';
import PropTypes from 'prop-types';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function renderTooltip(props) {
  let tooltipText = '';

  //Sometimes, props.popper.state is undefined.
  //It runs this function enough times that state gets a value
  if (props.popper.state) {
    tooltipText = props.popper.state.options.tooltipText;
  }

  return (
    <Tooltip id="button-tooltip" {...props}>
      {tooltipText}
    </Tooltip>
  );
}

const TooltipWrapper = props => {
  const placement = props.placement === undefined ? 'top' : props.placement;
  const offset =
    placement === 'top' ? [0, 2] : placement === 'bottom' ? [0, 10] : [0, 0];
  return (
    <>
      <OverlayTrigger
        delay={{hide: 0, show: 250}}
        popperConfig={{
          tooltipText: props.tooltipText,
          modifiers: [
            {
              // this offset is needed to avoid flickering when the cursor is on the edge of the element
              name: 'offset',
              options: {
                offset: offset,
              },
            },
          ],
        }}
        overlay={renderTooltip}
        placement={props.placement === undefined ? 'top' : props.placement}
      >
        <span role="button">{props.children}</span>
      </OverlayTrigger>
    </>
  );
};
TooltipWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  tooltipText: PropTypes.string.isRequired,
  placement: PropTypes.string,
};

export default TooltipWrapper;
