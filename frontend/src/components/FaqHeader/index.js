import React from 'react';

import styles from './FaqHeader.module.css';

const FaqHeader = props => {
    return (
        <>
            <div className={styles.faqTitle}>
                FAQs (Frequently Asked Questions)
            </div>
        </>
    );
}

export default FaqHeader;