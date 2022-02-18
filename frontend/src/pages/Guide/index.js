import React from 'react';

import { useUserRequired } from 'utils/hooks';
import { Header, GuideHeader, GuideIntro, GuidePurpose, GuideNowcast } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Guide.module.css';

const Guide = () => {
    // Putting this here instructs the frontend to only display this page
    // if a valid user is logged in. As always, don't trust the client
    // and protect on the backend as well!
    useUserRequired();
    const windowDimensions = useWindowDimensions();

    return (
        <>
            <Header windowWidth={windowDimensions.width} page={"guide"} />
            <div className={styles.content}>
                <GuideHeader />
                <div className={styles.mainText}>
                    <GuideIntro />
                    <GuidePurpose />
                    <GuideNowcast />
                </div>
            </div>
        </>
    );
};

export default Guide;
