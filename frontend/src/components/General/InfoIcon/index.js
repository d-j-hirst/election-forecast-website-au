import React, {useState} from 'react';
import PropTypes from 'prop-types';

import infoImage from './assets/info.png';
import infoHighlightImage from './assets/info_highlight.png';
import warningImage from './assets/warning.png';
import warningHighlightImage from './assets/warning_highlight.png';

import TooltipWrapper from '../TooltipWrapper';

import styles from './InfoIcon.module.css';

const InfoIcon = props => {
  const [highlight, setHighlight] = useState(false);

  let img = undefined;
  if (props.warning) img = highlight ? warningHighlightImage : warningImage;
  else img = highlight ? infoHighlightImage : infoImage;
  const imgClass =
    props.size === 'large' ? styles.infoIconLarge : styles.infoIcon;
  const altText = props.warning ? 'Warning' : 'Information';
  if (props.inactive === true) {
    return <img src={img} alt={altText} className={imgClass} />;
  }

  let text = props.tooltipText;
  if (text === undefined) {
    if (!highlight) {
      text =
        (props.warning
          ? 'This part of the forecast should be treated with more caution. '
          : '') + 'Click for more information';
    } else {
      text =
        'Click to hide the ' +
        (props.warning ? 'warning' : 'explanation') +
        '.';
    }
  }

  const clickAction = () => {
    if (props.noToggle) return;
    setHighlight(!highlight);
    if (props.onClick() !== undefined) props.onClick();
  };

  return (
    <TooltipWrapper tooltipText={text}>
      <button onClick={clickAction} className={styles.infoIconBack}>
        <img src={img} alt={altText} className={imgClass} />
      </button>
    </TooltipWrapper>
  );
};
InfoIcon.propTypes = {
  warning: PropTypes.bool,
  inactive: PropTypes.bool,
  noToggle: PropTypes.bool,
  size: PropTypes.string,
  tooltipText: PropTypes.string,
  onClick: PropTypes.func,
};

export default InfoIcon;
