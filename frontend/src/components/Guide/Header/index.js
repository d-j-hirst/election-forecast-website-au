import React from 'react';

import styles from './Header.module.css';

const GuideHeader = props => {
  return (
    <h1 className={`${styles.guideTitle} page-heading`}>Forecast Guide</h1>
  );
};

export default GuideHeader;
