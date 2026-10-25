import React from 'react';
import PropTypes from 'prop-types';

import TooltipWrapper from '../TooltipWrapper';
import ProbBar from '../ProbBar';
import {distributionBounds} from '../../../utils/distributionBounds';

const adjustFreqs = (freqs, thresholds) => {
  const lowerObjs = [];
  const upperObjs = [];
  let medianObj = undefined;
  for (let i = 0; i < thresholds.length; ++i) {
    const threshold = thresholds[i];
    const obj = {
      fLow: freqs[threshold[0]],
      fHigh: freqs[threshold[1]],
      tPos: threshold[2],
      vLow: freqs[threshold[0]],
      vHigh: freqs[threshold[1]],
      tLow: threshold[0],
      tHigh: threshold[1],
    };
    if (i === (thresholds.length - 1) / 2) {
      medianObj = obj;
    } else if (i < (thresholds.length - 1) / 2) {
      lowerObjs.unshift(obj);
    } else if (i > (thresholds.length - 1) / 2) {
      upperObjs.push(obj);
    }
  }

  for (let index = lowerObjs.length - 1; index >= 0; --index) {
    if (lowerObjs[index].fLow === medianObj.fLow) {
      medianObj.tLow = Math.min(medianObj.tLow, lowerObjs[index].tLow);
      lowerObjs.splice(index, 1);
    }
  }
  for (let index = upperObjs.length - 1; index >= 0; --index) {
    if (upperObjs[index].fHigh === medianObj.fHigh) {
      medianObj.tHigh = Math.max(medianObj.tHigh, upperObjs[index].tHigh);
      upperObjs.splice(index, 1);
    }
  }
  medianObj.vLow = Math.max(0, medianObj.fLow - 0.5);
  medianObj.vHigh = medianObj.fHigh + 0.5;
  const finalObjs = [medianObj];

  let vHighLimit = medianObj.vLow;
  while (lowerObjs.length > 0) {
    let thisObj = lowerObjs.shift();
    for (let index = lowerObjs.length - 1; index >= 0; --index) {
      if (
        lowerObjs[index].fLow === thisObj.fLow ||
        lowerObjs[index].fLow >= thisObj.fHigh - 1
      ) {
        thisObj.tLow = Math.min(thisObj.tLow, lowerObjs[index].tLow);
        lowerObjs.splice(index, 1);
      }
    }
    thisObj.vLow = Math.max(0, thisObj.fLow - 0.5);
    thisObj.vHigh = Math.min(vHighLimit, thisObj.fHigh + 0.5);
    --thisObj.fHigh;
    vHighLimit = thisObj.vLow;
    finalObjs.push(thisObj);
  }
  let vLowLimit = medianObj.vHigh;
  while (upperObjs.length > 0) {
    let thisObj = upperObjs.shift();
    for (let index = upperObjs.length - 1; index >= 0; --index) {
      if (
        upperObjs[index].fHigh === thisObj.fHigh ||
        upperObjs[index].fHigh <= thisObj.fLow + 1
      ) {
        thisObj.tHigh = Math.max(thisObj.tHigh, upperObjs[index].tHigh);
        upperObjs.splice(index, 1);
      }
    }
    thisObj.vHigh = thisObj.fHigh + 0.5;
    thisObj.vLow = Math.max(vLowLimit, thisObj.fLow - 0.5);
    ++thisObj.fLow;
    vLowLimit = thisObj.vHigh;
    finalObjs.push(thisObj);
  }
  return finalObjs;
};

const ProbBarResult = props => {
  const width = 2;
  const left = Math.floor(
    props.pixelOffset +
      (props.result - props.visualOffset) * props.scalingFactor -
      width / 2
  );
  const leftVal = left.toString() + 'px';
  const widthVal = width.toString() + 'px';
  const altLeftVal = (left - 3).toString() + 'px';
  const altWidthVal = (width + 6).toString() + 'px';
  const thisStyle = {
    height: '10px',
    width: widthVal,
    left: leftVal,
    top: '10px',
    position: 'absolute',
    backgroundColor: 'black',
    border: '1px solid black',
    boxSizing: 'border-box',
  };
  const topStyle = {...thisStyle};
  topStyle.left = altLeftVal;
  topStyle.width = altWidthVal;
  topStyle.height = '6px';
  topStyle.top = '4px';
  const bottomStyle = {...topStyle};
  bottomStyle.top = '20px';
  // this class and its div works around a difficulty in CSS: the tooltip is placed at the
  // closest positioned ancestor, but an absolute-position div is not considered "positioned"
  // for this purpose, so this style creates a "dummy" div that covers exactly the same area
  // but with relative positioning that the tooltip can attach to
  const tooltipHolderStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };
  const isPercentage =
    props.valType === undefined || props.valType === 'percentage';
  const tooltipText = `Final result: ${Number(props.result).toFixed(
    isPercentage ? 2 : 0
  )}${isPercentage ? '%' : ''}`;
  return (
    <>
      <div style={thisStyle}></div>
      <div style={topStyle}>
        <TooltipWrapper tooltipText={tooltipText} placement="top">
          <div style={tooltipHolderStyle} />
        </TooltipWrapper>
      </div>
      <div style={bottomStyle}>
        <TooltipWrapper tooltipText={tooltipText} placement="bottom">
          <div style={tooltipHolderStyle} />
        </TooltipWrapper>
      </div>
    </>
  );
};
ProbBarResult.propTypes = {
  result: PropTypes.number.isRequired,
  visualOffset: PropTypes.number.isRequired,
  scalingFactor: PropTypes.number.isRequired,
  pixelOffset: PropTypes.number.isRequired,
  valType: PropTypes.string.isRequired,
};

const ProbBarDist = props => {
  const midThreshold = Math.floor(props.thresholds.length / 2);
  const chartWidth = props.width !== undefined ? props.width : 300;
  // Reserve room for the eight-pixel result caps at either endpoint. The
  // forecast and result share this inset; results are never clamped to a bar.
  const pixelOffset = 4;
  const frequencies = props.freqSet[1];
  if (
    !Number.isFinite(chartWidth) ||
    chartWidth <= pixelOffset * 2 ||
    !props.thresholds.length ||
    !props.thresholds.every(
      ([low, high]) =>
        Number.isFinite(frequencies?.[low]) &&
        Number.isFinite(frequencies?.[high])
    )
  ) {
    return null;
  }
  const voteDistStyle = {
    width: chartWidth.toString() + 'px',
    position: 'relative',
    height: '30px',
    padding: '0px',
    margin: '0px auto',
  };

  let bars = undefined;
  if (props.adjust) {
    bars = adjustFreqs(props.freqSet[1], props.thresholds);
  } else {
    bars = props.thresholds.map(th => {
      return {
        fLow: props.freqSet[1][th[0]],
        fHigh: props.freqSet[1][th[1]],
        tPos: th[2],
        vLow: props.freqSet[1][th[0]],
        vHigh: props.freqSet[1][th[1]],
        tLow: th[0],
        tHigh: th[1],
      };
    });
  }

  // Callers supply group bounds. Include this row's visual endpoints as well
  // so a standalone bar also handles point distributions and integer padding.
  const {minVoteTotal, maxVoteTotal} = distributionBounds(
    [
      [props.minVoteTotal, props.maxVoteTotal],
      bars.flatMap(bar => [bar.vLow, bar.vHigh]),
    ],
    [props.result]
  );
  const scalingFactor =
    (chartWidth - pixelOffset * 2) / (maxVoteTotal - minVoteTotal);
  const visualOffset = minVoteTotal;

  return (
    <div style={voteDistStyle}>
      {bars.map((bar, index) => {
        return (
          <ProbBar
            bar={bar}
            key={index}
            midThreshold={midThreshold}
            partyAbbr={props.partyAbbr}
            pluralNoun={props.pluralNoun}
            scalingFactor={scalingFactor}
            pixelOffset={pixelOffset}
            thresholdLevels={props.thresholdLevels}
            valType={props.valType}
            visualOffset={visualOffset}
          />
        );
      })}
      {Number.isFinite(props.result) && (
        <ProbBarResult
          result={props.result}
          scalingFactor={scalingFactor}
          pixelOffset={pixelOffset}
          valType={props.valType}
          visualOffset={visualOffset}
        />
      )}
    </div>
  );
};
ProbBarDist.propTypes = {
  result: PropTypes.number,
  valType: PropTypes.string.isRequired,
  partyAbbr: PropTypes.string.isRequired,
  pluralNoun: PropTypes.string.isRequired,
  thresholds: PropTypes.array.isRequired,
  freqSet: PropTypes.array.isRequired,
  thresholdLevels: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  minVoteTotal: PropTypes.number.isRequired,
  maxVoteTotal: PropTypes.number.isRequired,
  adjust: PropTypes.bool,
};

export default ProbBarDist;
