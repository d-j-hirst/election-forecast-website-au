import React from 'react';

import {
  Header,
  Footer,
  GuideHeader,
  GuideIntro,
  GuidePurpose,
  GuideNowcast,
  GuideTcpScenarios,
  GuideSwingFactors,
  StandardErrorBoundary,
} from 'components';
import {useWindowDimensions} from '../../utils/window.js';

import styles from './Guide.module.css';

const Guide = () => {
  const windowDimensions = useWindowDimensions();
  document.title = `AEF - Forecast Guide`;

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page="guide" />
      <div className={styles.content}>
        <GuideHeader />
        <StandardErrorBoundary>
          <div className={styles.mainText}>
            <GuideIntro />
            <GuidePurpose />
            <GuideNowcast />
            <GuideTcpScenarios />
            <GuideSwingFactors />
          </div>
        </StandardErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

export default Guide;
