import React from 'react';

import {
  Header,
  Footer,
  MainContent,
  AboutHeader,
  AboutContent,
  StandardErrorBoundary,
} from 'components';
import {useWindowDimensions} from '../../utils/window.js';

import styles from './About.module.css';

const About = () => {
  const windowDimensions = useWindowDimensions();
  document.title = `AEF - About`;

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page="about" />
      <MainContent className={styles.content}>
        <StandardErrorBoundary>
          <AboutHeader />
          <div className={styles.mainText}>
            <StandardErrorBoundary>
              <AboutContent />
            </StandardErrorBoundary>
          </div>
        </StandardErrorBoundary>
      </MainContent>
      <Footer />
    </div>
  );
};

export default About;
