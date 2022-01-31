import React from 'react';

import info from './assets/info.png';

import styles from './InfoIcon.module.css';

const InfoIcon = props => {
    return (
        <button onClick={props.onClick} className={styles.infoIconBack}>
            <img src={info} alt="Information" className={styles.infoIcon} />
        </button>
    )
}

export default InfoIcon;