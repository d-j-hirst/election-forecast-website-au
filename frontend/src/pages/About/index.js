import React from 'react';

import { Header, Footer, AboutHeader, AboutTheSite, StandardErrorBoundary } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './About.module.css';

const About = () => {
    const windowDimensions = useWindowDimensions();
    document.title = `AEF - About`;

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"about"} />
            <main className={styles.content}>
                <StandardErrorBoundary>
                    <AboutHeader />
                    <div className={styles.mainText}>
                        <StandardErrorBoundary>
                            <AboutTheSite />
                        </StandardErrorBoundary>   
                    </div>
                </StandardErrorBoundary>   
            </main>
            <Footer />
        </div>
    );
};

export default About;
