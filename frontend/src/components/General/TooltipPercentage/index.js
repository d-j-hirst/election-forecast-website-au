import React from 'react';
import PropTypes from 'prop-types';

import TooltipWrapper from '../TooltipWrapper';

const TooltipPercentage = props => {
  const label =
    props.label === undefined || props.label === '' ? '' : props.label + ': ';
  const suffix = props.label === undefined ? ' of simulations' : '';
  const text = label + Number(props.value).toFixed(3) + '%' + suffix;
  return (
    <TooltipWrapper tooltipText={text}>
      {Number(props.value).toFixed(1) + '%'}
    </TooltipWrapper>
  );
};
TooltipPercentage.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string,
};

export default TooltipPercentage;
