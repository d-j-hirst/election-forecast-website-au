import React from 'react';
import PropTypes from 'prop-types';

import TooltipWrapper from '../TooltipWrapper';

import {coalitionAbbreviation} from '../../../utils/coalition.js';

import styles from './PartyBadge.module.css';

export const AlpBadge = props => {
  const classes = `${styles['party-badge']} ${styles['alp-badge']}`;
  return (
    <TooltipWrapper tooltipText="Australian Labor Party">
      <span className={classes}>ALP</span>
    </TooltipWrapper>
  );
};

export const GrnBadge = props => {
  const classes = `${styles['party-badge']} ${styles['grn-badge']}`;
  return (
    <TooltipWrapper tooltipText="The Greens">
      <span className={classes}>GRN</span>
    </TooltipWrapper>
  );
};

export const IndBadge = props => {
  const classes = `${styles['party-badge']} ${styles['ind-badge']}`;
  const tooltipText =
    'Independent - This independent candidate has a sufficiently high ' +
    'profile to model their vote separately.';
  return (
    <TooltipWrapper tooltipText={tooltipText}>
      <span className={classes}>IND</span>
    </TooltipWrapper>
  );
};

export const IndXBadge = props => {
  const classes = `${styles['party-badge']} ${styles['indx-badge']}`;
  const tooltipText =
    'Independent (unnamed) - Any independent candidate (current or future) ' +
    'for this seat not named elsewhere. This might be because they have a ' +
    "low profile, haven't announced their candidacy yet, or there is another " +
    'more notable independent.';
  return (
    <TooltipWrapper tooltipText={tooltipText}>
      <span className={classes}>IND*</span>
    </TooltipWrapper>
  );
};

export const KapBadge = props => {
  const classes = `${styles['party-badge']} ${styles['kap-badge']}`;
  return (
    <TooltipWrapper tooltipText="Katter's Australian Party">
      <span className={classes}>KAP</span>
    </TooltipWrapper>
  );
};

export const LnpBadge = props => {
  const classes = `${styles['party-badge']} ${styles['lnp-badge']}`;
  return (
    <TooltipWrapper tooltipText={coalitionName(props.termCode)}>
      <span className={classes}>{coalitionAbbreviation(props.termCode)}</span>
    </TooltipWrapper>
  );
};
LnpBadge.propTypes = {
  termCode: PropTypes.string,
};

export const LibBadge = props => {
  const classes = `${styles['party-badge']} ${styles['lib-badge']}`;
  return (
    <TooltipWrapper tooltipText="Liberal Party">
      <span className={classes}>LIB</span>
    </TooltipWrapper>
  );
};

export const NatBadge = props => {
  const classes = `${styles['party-badge']} ${styles['nat-badge']}`;
  return (
    <TooltipWrapper tooltipText="National Party">
      <span className={classes}>NAT</span>
    </TooltipWrapper>
  );
};

export const OnBadge = props => {
  const classes = `${styles['party-badge']} ${styles['on-badge']}`;
  return (
    <TooltipWrapper tooltipText="One Nation">
      <span className={classes}>ON</span>
    </TooltipWrapper>
  );
};

export const OthBadge = props => {
  const classes = `${styles['party-badge']} ${styles['oth-badge']}`;
  const text = props.text !== undefined ? props.text : 'OTH';
  const tooltipText =
    props.tooltipText === undefined ? 'Others' : props.tooltipText;
  return (
    <TooltipWrapper tooltipText={tooltipText}>
      <span className={classes}>{text}</span>
    </TooltipWrapper>
  );
};
OthBadge.propTypes = {
  text: PropTypes.string,
  tooltipText: PropTypes.string,
};

export const EOthBadge = props => {
  const tooltipText =
    'Emerging Parties - Represents possible votes and wins by current or ' +
    'future parties that may emerge, but are not yet getting significant ' +
    'results in polls';
  return (
    <OthBadge
      text={props.text === undefined ? '???' : props.text}
      tooltipText={tooltipText}
    />
  );
};
EOthBadge.propTypes = {
  text: PropTypes.string,
  tooltipText: PropTypes.string,
};

export const CaBadge = props => {
  const classes = `${styles['party-badge']} ${styles['on-badge']}`;
  return (
    <TooltipWrapper tooltipText="Centre Alliance">
      <span className={classes}>CA</span>
    </TooltipWrapper>
  );
};

export const SabBadge = props => {
  const classes = `${styles['party-badge']} ${styles['on-badge']}`;
  return (
    <TooltipWrapper tooltipText="SA Best">
      <span className={classes}>SAB</span>
    </TooltipWrapper>
  );
};

export const UapBadge = props => {
  const classes = `${styles['party-badge']} ${styles['uap-badge']}`;
  return (
    <TooltipWrapper tooltipText="United Australia Party">
      <span className={classes}>UAP</span>
    </TooltipWrapper>
  );
};

export const SsfBadge = props => {
  const classes = `${styles['party-badge']} ${styles['kap-badge']}`;
  return (
    <TooltipWrapper tooltipText="Shooters, Fishers and Farmers">
      <span className={classes}>SFF</span>
    </TooltipWrapper>
  );
};

export const SmartBadge = props => {
  const partyName = props.party.toLowerCase();
  if (partyName === 'alp') return <AlpBadge />;
  if (partyName === 'grn') return <GrnBadge />;
  if (partyName === 'ind')
    return <IndBadge text={props.text} tooltipText={props.tooltipText} />;
  if (partyName === 'indx') return <IndXBadge text={props.text} />;
  if (partyName === 'kap') return <KapBadge />;
  if (partyName === 'sff') return <SsfBadge />;
  if (partyName === 'ca') return <CaBadge />;
  if (partyName === 'sab') return <SabBadge />;
  if (partyName === 'lnp') return <LnpBadge termCode={props.termCode} />;
  if (partyName === 'lib') return <LibBadge />;
  if (partyName === 'nat') return <NatBadge />;
  if (partyName === 'on') return <OnBadge />;
  if (partyName === 'uap') return <UapBadge />;
  if (partyName === 'eoth') return <EOthBadge text={props.text} />;
  return <OthBadge text={props.text} tooltipText={props.tooltipText} />;
};
SmartBadge.propTypes = {
  party: PropTypes.string.isRequired,
  termCode: PropTypes.string,
  text: PropTypes.string,
  tooltipText: PropTypes.string,
};
