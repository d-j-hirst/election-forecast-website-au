import React from 'react';

import {
  Header,
  Footer,
  MainContent,
  MethodsHeader,
  MethodsIntro,
  MethodsOutline,
  MethodsPollTrend,
  MethodsProjection,
  MethodsSimulation,
  RecentMethodsChanges,
  StandardErrorBoundary,
} from 'components';
import {useWindowDimensions} from '../../utils/window.js';

import styles from './Methods.module.css';

const Methods = () => {
  const windowDimensions = useWindowDimensions();

  document.title = `AEF - Methods`;

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page="methods" />
      <MainContent className={styles.content}>
        <MethodsHeader />
        <StandardErrorBoundary>
          <div className={styles.mainText}>
            <RecentMethodsChanges />
            <MethodsIntro />
            <MethodsOutline />
            <MethodsPollTrend />
            <MethodsProjection />
            <MethodsSimulation />
          </div>
        </StandardErrorBoundary>
      </MainContent>
      <Footer />
    </div>
  );
};

export default Methods;
