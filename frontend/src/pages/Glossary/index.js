import React from 'react';

import { Header, Footer, GlossaryHeader, GlossaryIntro, GlossaryItems, StandardErrorBoundary } from 'components';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Glossary.module.css';

const Glossary = () => {
    const windowDimensions = useWindowDimensions();
    document.title = `AEF - Glossary`;

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"glossary"} />
            <div className={styles.content}>
                <GlossaryHeader />
                <StandardErrorBoundary>
                    <div className={styles.mainText}>
                        <GlossaryIntro />
                        <GlossaryItems />
                    </div>
                </StandardErrorBoundary>
            </div>
            <Footer />
        </div>
    );
};

export default Glossary;
