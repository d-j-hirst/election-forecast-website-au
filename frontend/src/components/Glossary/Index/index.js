import React from 'react';
import PropTypes from 'prop-types';

import {HashLink as Link} from 'react-router-hash-link';

import styles from './Index.module.css';

const GlossaryLink = props => {
  const linkUrl = '#' + props.term.toLowerCase().replaceAll(' ', '-');
  let labelClass = null;
  if (props.type === 'general') labelClass = styles.generalDef;
  if (props.type === 'site') labelClass = styles.siteDef;
  return (
    <div className={styles.indexGridItem}>
      <Link to={linkUrl}>
        <span className={labelClass}>{props.term}</span>
      </Link>
    </div>
  );
};
GlossaryLink.propTypes = {
  term: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const GlossaryIndex = props => {
  return (
    <>
      <h4 id="introduction">Index</h4>
      <div className={styles.indexGrid}>
        <GlossaryLink term="Anchoring pollster" type="site" />
        <GlossaryLink term="Bias" type="general" />
        <GlossaryLink term="First preference vote" type="general" />
        <GlossaryLink term="House effect" type="general" />
        <GlossaryLink term="Hung parliament" type="general" />
        <GlossaryLink term="Live forecast" type="site" />
        <GlossaryLink term="Major party" type="general" />
        <GlossaryLink term="Margin" type="general" />
        <GlossaryLink term="Minor party" type="general" />
        <GlossaryLink term="Nowcast" type="site" />
        <GlossaryLink term="Poll" type="general" />
        <GlossaryLink term="Pollster" type="general" />
        <GlossaryLink term="Poll trend" type="site" />
        <GlossaryLink term="Preferential voting" type="general" />
        <GlossaryLink term="Previous election preferences" type="general" />
        <GlossaryLink term="Regular forecast" type="general" />
        <GlossaryLink term="Respondent allocated preferences" type="general" />
        <GlossaryLink term="Seat" type="general" />
        <GlossaryLink term="Sophomore surge" type="general" />
        <GlossaryLink term="Swing" type="general" />
        <GlossaryLink term="Tactical voting" type="general" />
        <GlossaryLink term="Two-candidate-preferred vote" type="general" />
        <GlossaryLink term="Two-party-preferred vote" type="general" />
        <GlossaryLink term="Voting intention" type="general" />
      </div>
    </>
  );
};

export default GlossaryIndex;
