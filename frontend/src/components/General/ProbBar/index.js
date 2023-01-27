import React from 'react';
import PropTypes from 'prop-types';

import TooltipWrapper from '../TooltipWrapper';
import {
  bgClass,
  midBgClass,
  lightBgClass,
  xLightBgClass,
  xxLightBgClass,
  xxxLightBgClass,
} from '../../../utils/partyclass.js';

import {jsonMap} from '../../../utils/jsonmap.js';

const formatWholeOrFixed = num => {
  let formatted = Number(num).toFixed(1);
  if (formatted.slice(-2) === '.0') formatted = formatted.slice(0, -2);
  return formatted;
};

const ProbBar = props => {
  const lt = props.bar.tLow;
  const rt = props.bar.tHigh;
  const pos = props.bar.tPos;
  const lf = props.bar.fLow;
  const rf = props.bar.fHigh;
  const lv = props.bar.vLow;
  const rv = props.bar.vHigh;
  const classes = [
    [0, bgClass(props.partyAbbr)],
    [1, midBgClass(props.partyAbbr)],
    [2, lightBgClass(props.partyAbbr)],
    [3, xLightBgClass(props.partyAbbr)],
    [4, xxLightBgClass(props.partyAbbr)],
    [5, xxxLightBgClass(props.partyAbbr)],
  ];
  const leftVal =
    Math.floor((lv - props.visualOffset) * props.scalingFactor).toString() +
    'px';
  const widthVal =
    Math.floor((rv - lv) * props.scalingFactor + 1).toString() + 'px';
  const thisStyle = {
    height: '10px',
    width: widthVal,
    left: leftVal,
    top: '10px',
    position: 'absolute',
  };
  // this class and its div works around a difficulty in CSS: the tooltip is placed at the
  // closest positioned ancestor, but an absolute-position div is not considered "positioned"
  // for this purpose, so this style creates a "dummy" div that covers exactly the same area
  // but with relative positioning that the tooltip can attach to
  const tooltipHolderStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };
  const offsetFromMid = pos - props.midThreshold;
  const barClass = jsonMap(classes, Math.abs(offsetFromMid));

  let tooltipText = '';
  if (props.valType === undefined || props.valType === 'percentage') {
    tooltipText =
      Number(lf).toFixed(1) +
      '% - ' +
      Number(rf).toFixed(1) +
      '%\nPercentile ' +
      formatWholeOrFixed(props.thresholdLevels[lt]) +
      ' - ' +
      formatWholeOrFixed(props.thresholdLevels[rt]) +
      '\n';
  } else if (props.valType === 'integer') {
    tooltipText =
      lf +
      ' - ' +
      rf +
      '\nPercentile ' +
      formatWholeOrFixed(props.thresholdLevels[lt]) +
      ' - ' +
      formatWholeOrFixed(props.thresholdLevels[rt]) +
      '\n';
  }

  if (offsetFromMid === 0) {
    tooltipText +=
      'This range covers the ' +
      props.pluralNoun +
      ' that are most expected based on current information.';
  } else if (Math.abs(offsetFromMid) === 1) {
    tooltipText +=
      'This range covers ' +
      props.pluralNoun +
      ' that are somewhat ' +
      (offsetFromMid > 0 ? 'higher' : 'lower') +
      ' than expected, but not unusually so based on current information.';
  } else if (Math.abs(offsetFromMid) === 2) {
    tooltipText +=
      'This range covers ' +
      props.pluralNoun +
      ' that are unusually ' +
      (offsetFromMid > 0 ? 'high' : 'low') +
      ' based on current information.';
  } else if (Math.abs(offsetFromMid) >= 3) {
    tooltipText +=
      'This range covers ' +
      props.pluralNoun +
      ' that are exceptionally ' +
      (offsetFromMid > 0 ? 'high' : 'low') +
      ', and should only happen rarely based on current information.';
  }

  return (
    <div style={thisStyle} className={barClass}>
      <TooltipWrapper tooltipText={tooltipText} placement="top">
        <div style={tooltipHolderStyle} />
      </TooltipWrapper>
    </div>
  );
};
ProbBar.propTypes = {
  bar: PropTypes.object.isRequired,
  partyAbbr: PropTypes.string.isRequired,
  pluralNoun: PropTypes.string.isRequired,
  valType: PropTypes.string,
  visualOffset: PropTypes.number.isRequired,
  scalingFactor: PropTypes.number.isRequired,
  midThreshold: PropTypes.number.isRequired,
  thresholdLevels: PropTypes.array.isRequired,
};

export default ProbBar;
