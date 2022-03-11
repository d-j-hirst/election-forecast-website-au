import React from 'react';

import { Header, Footer, MethodologyHeader, MethodologyIntro, MethodologyOutline,
    MethodologyPollTrend, MethodologyProjection, MethodologySimulation, StandardErrorBoundary } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Methodology.module.css';

const Methodology = () => {
    const windowDimensions = useWindowDimensions();
    
    console.log("something");
    document.title = `AEF - Methodology`;

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"methodology"} />
            <div className={styles.content}>
                <MethodologyHeader />
                <StandardErrorBoundary>
                    <div className={styles.mainText}>
                        <MethodologyIntro />
                        <MethodologyOutline />
                        <MethodologyPollTrend />
                        <MethodologyProjection />
                        <MethodologySimulation />
                    </div>
                </StandardErrorBoundary>
            </div>
            <Footer />
        </div>
    );
};

export default Methodology;
