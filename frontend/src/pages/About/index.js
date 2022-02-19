import React from 'react';

import { useUserRequired } from 'utils/hooks';
import { Header, AboutHeader } from 'components';
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
        <>
            <Header windowWidth={windowDimensions.width} page={"about"} />
            <div className={styles.content}>
                <AboutHeader />
            </div>
        </>
    );
};

export default About;
