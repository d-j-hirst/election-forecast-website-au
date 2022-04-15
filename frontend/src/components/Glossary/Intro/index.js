import React from 'react';

import styles from './Intro.module.css';

const GlossaryIntro = props => {
    return (
        <>
            <h4 id="introduction">Introduction</h4>
            <p>
                This page is for defining and explaining terms used in the discussion of Australian elections.
                Terms are distinguished between those that are used more broadly in election analysis (marked
                in <span className={styles.generalDef}>blue</span>)
                and those used in a specific way on this site (marked
                in <span className={styles.siteDef}>green</span>).
            </p>
        </>
    );
}

export default GlossaryIntro;