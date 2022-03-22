import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import styles from './LoadingMarker.module.css';

const LoadingMarker = props => (
    <div className={styles.summary}>
        <Spinner animation="border" role="status" size="sm"/>
        &nbsp;{props.text === undefined ? "Loading report" : props.text}
    </div>
)

export default LoadingMarker;