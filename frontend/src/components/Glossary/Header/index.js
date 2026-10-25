import React from 'react';

import styles from './Header.module.css';

const GlossaryHeader = props => {
  return (
    <>
      <h1 className={`${styles.glossaryTitle} page-heading`}>Glossary</h1>
    </>
  );
};

export default GlossaryHeader;
