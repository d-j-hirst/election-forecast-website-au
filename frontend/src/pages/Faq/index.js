import React from 'react';

import { useUserRequired } from 'utils/hooks';
import { Header, FaqHeader } from 'components';
import { getDirect } from 'utils/sdk';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Faq.module.css';

const Faq = () => {
    // Putting this here instructs the frontend to only display this page
    // if a valid user is logged in. As always, don't trust the client
    // and protect on the backend as well!
    useUserRequired();
    const windowDimensions = useWindowDimensions();

    return (
        <>
            <Header windowWidth={windowDimensions.width} page={"faq"} />
            <div className={styles.content}>
                <FaqHeader />
            </div>
        </>
    );
};

export default Faq;
