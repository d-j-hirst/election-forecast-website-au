import React from 'react';

import styles from './Item.module.css';

const GlossaryItem = props => {
    let labelClass = null;
    if (props.type === "general") labelClass = styles.generalDef;
    if (props.type === "site") labelClass = styles.siteDef;
    return (
        <>
            <hr />
            <p>
                <span className={labelClass}>{props.title}</span>
            </p>
            {props.children}
        </>
    );
}

export default GlossaryItem;