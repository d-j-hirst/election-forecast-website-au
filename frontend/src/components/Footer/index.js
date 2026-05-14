import React from 'react';

import {Link} from 'react-router-dom';

import {SUPPORT_URL} from 'config/urls';

import styles from './Footer.module.css';

const Footer = () => (
  <>
    <footer className={styles.footer}>
      Copyright ©2025 Australian Election Forecasts. Give attribution for ideas
      from the site. Not financial advice.{' '}
      <Link to={SUPPORT_URL}>Support the site</Link>.
    </footer>
  </>
);

export default Footer;
