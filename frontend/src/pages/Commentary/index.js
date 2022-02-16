import React from 'react';

import { useUserRequired } from 'utils/hooks';
import { Header, CommentaryHeader } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Commentary.module.css';

const Commentary = () => {
    // Putting this here instructs the frontend to only display this page
    // if a valid user is logged in. As always, don't trust the client
    // and protect on the backend as well!
    useUserRequired();
    const windowDimensions = useWindowDimensions();

    return (
        <>
            <Header windowWidth={windowDimensions.width} page={"commentary"} />
            <div className={styles.content}>
                <CommentaryHeader />
            </div>
        </>
    );
};

export default Commentary;
