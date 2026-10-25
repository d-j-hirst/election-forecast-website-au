import React from 'react';

import styles from './AboutHeader.module.css';

const AboutHeader = props => {
  return (
    <>
      <h1 className={`${styles.aboutTitle} page-heading`}>About</h1>
    </>
  );
};

export default AboutHeader;
