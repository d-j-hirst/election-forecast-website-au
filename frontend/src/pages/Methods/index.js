import React from 'react';

import {
  Header,
  Footer,
  MethodsHeader,
  MethodsIntro,
  MethodsOutline,
  MethodsPollTrend,
  MethodsProjection,
  MethodsSimulation,
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
      <div className={styles.content}>
        <MethodsHeader />
        <StandardErrorBoundary>
          <div className={styles.mainText}>
            <MethodsIntro />
            <MethodsOutline />
            <MethodsPollTrend />
            <MethodsProjection />
            <MethodsSimulation />
          </div>
        </StandardErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

export default Methods;
