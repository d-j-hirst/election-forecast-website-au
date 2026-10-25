import React from 'react';
import PropTypes from 'prop-types';

import Spinner from 'react-bootstrap/Spinner';

import styles from './LoadingMarker.module.css';

const LoadingMarker = props => (
  <div className={styles.summary} role="status">
    {/* The message belongs to the live region; the animated shape is decorative. */}
    <Spinner animation="border" aria-hidden="true" size="sm" />
    &nbsp;{props.text === undefined ? 'Loading report' : props.text}
  </div>
);
LoadingMarker.propTypes = {
  text: PropTypes.string,
};

export default LoadingMarker;
