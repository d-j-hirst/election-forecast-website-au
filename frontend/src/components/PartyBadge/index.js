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
    const partyName = props.party.toLowerCase();
    if (partyName === "alp") return <AlpBadge/>
    if (partyName === "grn") return <GrnBadge/>
    if (partyName === "kap") return <KapBadge/>
    if (partyName === "lnp" || partyName === "lib") return <LnpBadge/>
    if (partyName === "onp") return <OnpBadge/>
    if (partyName === "uap") return <UapBadge/>
    return <OthBadge text={props.text}/>
}