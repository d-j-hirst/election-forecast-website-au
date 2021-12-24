import React from 'react';

import TooltipWrapper from '../TooltipWrapper'

import styles from './PartyBadge.module.css';

export const AlpBadge = props => {
    const classes = `${styles['party-badge']} ${styles['alp-badge']}`;
    return (
        <TooltipWrapper tooltipText="Australian Labor Party">
            <span className={classes}>ALP</span>
        </TooltipWrapper>
    )
};

export const GrnBadge = props => {
    const classes = `${styles['party-badge']} ${styles['grn-badge']}`;
    return (
        <TooltipWrapper tooltipText="The Greens">
            <span className={classes}>GRN</span>
        </TooltipWrapper>
    )
};

export const IndBadge = props => {
    const classes = `${styles['party-badge']} ${styles['oth-badge']}`;
    const text = props.text !== undefined ? props.text : 'IND';
    const tooltipText = props.tooltipText === undefined ? "Independent" : props.tooltipText;
    return (
        <TooltipWrapper tooltipText={tooltipText}>
            <span className={classes}>{text}</span>
        </TooltipWrapper>
    )
};

export const KapBadge = props => {
    const classes = `${styles['party-badge']} ${styles['kap-badge']}`;
    return (
        <TooltipWrapper tooltipText="Katter's Australian Party">
            <span className={classes}>KAP</span>
        </TooltipWrapper>
    )
};

export const LnpBadge = props => {
    const classes = `${styles['party-badge']} ${styles['lnp-badge']}`;
    return (
        <TooltipWrapper tooltipText="Liberal/National Coalition">
            <span className={classes}>LNP</span>
        </TooltipWrapper>
    )
};

export const OnpBadge = props => {
    const classes = `${styles['party-badge']} ${styles['onp-badge']}`;
    return (
        <TooltipWrapper tooltipText="One Nation">
            <span className={classes}>ONP</span>
        </TooltipWrapper>
    )
};

export const OthBadge = props => {
    const classes = `${styles['party-badge']} ${styles['oth-badge']}`;
    const text = props.text !== undefined ? props.text : 'OTH';
    const tooltipText = props.tooltipText === undefined ? "Others" : props.tooltipText;
    return (
        <TooltipWrapper tooltipText={tooltipText}>
            <span className={classes}>{text}</span>
        </TooltipWrapper>
    )
};

export const CaBadge = props => {
    const classes = `${styles['party-badge']} ${styles['onp-badge']}`;
    return (
        <TooltipWrapper tooltipText="Centre Alliance">
            <span className={classes}>CA</span>
        </TooltipWrapper>
    )
};

export const UapBadge = props => {
    const classes = `${styles['party-badge']} ${styles['uap-badge']}`;
    return (
        <TooltipWrapper tooltipText="United Australia Party">
            <span className={classes}>UAP</span>
        </TooltipWrapper>
    )
};

export const SmartBadge = props => {
    const partyName = props.party.toLowerCase();
    if (partyName === "alp") return <AlpBadge/>
    if (partyName === "grn") return <GrnBadge/>
    if (partyName === "ind") return <IndBadge tooltipText={props.tooltipText} />
    if (partyName === "kap") return <KapBadge/>
    if (partyName === "ca") return <CaBadge/>
    if (partyName === "lnp" || partyName === "lib") return <LnpBadge/>
    if (partyName === "onp") return <OnpBadge/>
    if (partyName === "uap") return <UapBadge/>
    return <OthBadge text={props.text} tooltipText={props.tooltipText}/>
}