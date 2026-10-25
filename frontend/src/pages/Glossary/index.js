import React from 'react';

import {
  Header,
  Footer,
  MainContent,
  GlossaryHeader,
  GlossaryIntro,
  GlossaryIndex,
  GlossaryItems,
  StandardErrorBoundary,
} from 'components';
import {useWindowDimensions} from '../../utils/window.js';

import styles from './Glossary.module.css';

const Glossary = () => {
  const windowDimensions = useWindowDimensions();
  document.title = `AEF - Glossary`;

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page="glossary" />
      <MainContent className={styles.content}>
        <GlossaryHeader />
        <StandardErrorBoundary>
          <div className={styles.mainText}>
            <GlossaryIntro />
            <GlossaryIndex />
            <GlossaryItems />
          </div>
        </StandardErrorBoundary>
      </MainContent>
      <Footer />
    </div>
  );
};

export default Glossary;
