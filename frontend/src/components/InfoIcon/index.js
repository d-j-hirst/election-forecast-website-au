import React, {useState} from 'react';

import infoImage from './assets/info.png';
import infoHighlightImage from './assets/info_highlight.png';
import warningImage from './assets/warning.png';
import warningHighlightImage from './assets/warning_highlight.png';

import TooltipWrapper from '../TooltipWrapper'

import styles from './InfoIcon.module.css';

const InfoIcon = props => {
    const [highlight, setHighlight] = useState(false);
    let text = props.tooltipText;
    if (text === undefined) {
        if (!highlight) text = (props.warning ? "This part of the forecast should be treated with more caution. " : "") + "Click for more information";
        else text = "Click to hide the " + (props.warning ? "warning" : "explanation") + ".";
    } 
    let img = undefined;
    if (props.warning) img = highlight ? warningHighlightImage : warningImage;
    else img = highlight ? infoHighlightImage : infoImage;
    return (
        <TooltipWrapper tooltipText={text}>
            <button onClick={() => {setHighlight(!highlight); if (props.onClick() !== undefined) props.onClick();}} className={styles.infoIconBack}>
                <img src={img} alt={props.warning ? "Warning" : "Information"} className={styles.infoIcon} />
            </button>
        </ TooltipWrapper>
    )
}

export default InfoIcon;