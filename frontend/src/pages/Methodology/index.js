import React from 'react';

import { useUserRequired } from 'utils/hooks';
import { Header, MethodologyHeader, MethodologyIntro, MethodologyOutline,
    MethodologyPollTrend, MethodologyProjection } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Methodology.module.css';

const Methodology = () => {
    // Putting this here instructs the frontend to only display this page
    // if a valid user is logged in. As always, don't trust the client
    // and protect on the backend as well!
    useUserRequired();
    const windowDimensions = useWindowDimensions();
    
    console.log("something");
    document.title = `AEF - Methodology`;

    return (
        <>
            <Header windowWidth={windowDimensions.width} page={"methodology"} />
            <div className={styles.content}>
                <MethodologyHeader />
                <div className={styles.mainText}>
                    <MethodologyIntro />
                    <MethodologyOutline />
                    <MethodologyPollTrend />
                    <MethodologyProjection />
                </div>
            </div>
        </>
    );
};

export default Methodology;
