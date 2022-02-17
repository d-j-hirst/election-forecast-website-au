import React from 'react';

import styles from './GuideHeader.module.css';

const GuideHeader = props => {
    return (
        <>
            <div className={styles.guideTitle}>
                Forecast Guide
            </div>
        </>
    );
}

export default GuideHeader;