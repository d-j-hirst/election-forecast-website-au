import React from 'react';

import ProbBar from '../ProbBar';

const ProbBarDist = props => {
    const midThreshold = Math.floor(props.thresholds.length / 2);
    const chartWidth = 300;
    const scalingFactor = chartWidth / (props.maxVoteTotal - props.minVoteTotal);
    const visualOffset = props.minVoteTotal;
    const voteDistStyle = {
        width: chartWidth.toString() + 'px',
        position: 'relative',
        height: '10px',
        padding: '8px 0px'
    };

    return (
        <div style={voteDistStyle}>
            {props.thresholds.map(th => {
                return <ProbBar thresholds={th}
                                freqSet={props.freqSet}
                                partyAbbr={props.partyAbbr}
                                scalingFactor={scalingFactor}
                                visualOffset={visualOffset}
                                midThreshold={midThreshold}
                                thresholdLevels={props.thresholdLevels}
                    />
            })}
        </div>
    )
}

export default ProbBarDist;