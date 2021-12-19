import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import styles from './LoadingMarker.module.css';

const LoadingMarker = () => (
    <div className={styles.summary}>
    <Spinner animation="border" role="status" size="sm">
        <span className="visually-hidden">Loading...</span>
    </Spinner>
    Loading forecast
    </div>
)

export default LoadingMarker;