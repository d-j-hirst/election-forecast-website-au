import React from 'react';

import { Header, Footer, AboutHeader, AboutTheSite } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './About.module.css';

const About = () => {
    const windowDimensions = useWindowDimensions();
    document.title = `AEF - About`;

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"about"} />
            <main className={styles.content}>
                <AboutHeader />
                <div className={styles.mainText}>
                    <AboutTheSite />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default About;
