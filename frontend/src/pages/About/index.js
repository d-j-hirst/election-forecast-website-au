import React from 'react';

import { useUserRequired } from 'utils/hooks';
import { Header, Footer, AboutHeader, AboutTheSite } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './About.module.css';

const About = () => {
    // Putting this here instructs the frontend to only display this page
    // if a valid user is logged in. As always, don't trust the client
    // and protect on the backend as well!
    useUserRequired();
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
