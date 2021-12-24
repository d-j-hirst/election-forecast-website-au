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
        padding: '0px',
        margin: '0px 0px 0px 8px'
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
                                pluralNoun={props.pluralNoun}
                                valType={props.valType}
                                thresholdLevels={props.thresholdLevels}
                    />
            })}
        </div>
    )
}

export default ProbBarDist;