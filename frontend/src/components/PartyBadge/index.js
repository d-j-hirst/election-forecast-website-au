import React from 'react';

import styles from './PartyBadge.module.css';

export const AlpBadge = props => {
    const classes = `${styles['party-badge']} ${styles['alp-badge']}`;
    return <span className={classes}>ALP</span>
};

export const GrnBadge = props => {
    const classes = `${styles['party-badge']} ${styles['grn-badge']}`;
    return <span className={classes}>GRN</span>
};

export const KapBadge = props => {
    const classes = `${styles['party-badge']} ${styles['kap-badge']}`;
    return <span className={classes}>KAP</span>
};

export const LnpBadge = props => {
    const classes = `${styles['party-badge']} ${styles['lnp-badge']}`;
    return <span className={classes}>LNP</span>
};

export const OnpBadge = props => {
    const classes = `${styles['party-badge']} ${styles['onp-badge']}`;
    return <span className={classes}>ONP</span>
};

export const OthBadge = props => {
    const classes = `${styles['party-badge']} ${styles['oth-badge']}`;
    const text = props.text !== undefined ? props.text : 'OTH';
    return <span className={classes}>{text}</span>
};

export const UapBadge = props => {
    const classes = `${styles['party-badge']} ${styles['uap-badge']}`;
    return <span className={classes}>UAP</span>
};

export const SmartBadge = props => {
    if (props.party.toLowerCase() === "alp") return <AlpBadge/>
    if (props.party.toLowerCase() === "grn") return <GrnBadge/>
    if (props.party.toLowerCase() === "kap") return <KapBadge/>
    if (props.party.toLowerCase() === "lnp") return <LnpBadge/>
    if (props.party.toLowerCase() === "onp") return <OnpBadge/>
    if (props.party.toLowerCase() === "uap") return <UapBadge/>
    return <OthBadge text={props.text}/>
}