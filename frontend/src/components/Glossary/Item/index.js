import React from 'react';

import styles from './Item.module.css';

const GlossaryItem = props => {
    let labelClass = null;
    if (props.type === "general") labelClass = styles.generalDef;
    if (props.type === "site") labelClass = styles.siteDef;
    let id = props.title.toLowerCase().replaceAll(' ', '-');
    return (
        <>
            <hr />
            <p>
                <span className={labelClass} id={id}>{props.title}</span>
            </p>
            {props.children}
        </>
    );
}

export default GlossaryItem;