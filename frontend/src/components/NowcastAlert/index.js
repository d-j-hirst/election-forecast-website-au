import React from 'react';

import Alert from 'react-bootstrap/Alert';
import warning from './assets/warning.png'

import styles from './NowcastAlert.module.css';

const NowcastAlert = props => {
    // Obviously, the 'See this FAQ' should actually be linked to the relevant answer when it's made!
    return (
        <>
            <Alert variant="warning" className={styles.nowcastAlert}>
                <img className={styles.warningIcon} src={warning} alt='Warning symbol'/>
                This a <strong>now-cast</strong>, not a forecast.
                It is an estimate of what an election is most likely to be if it were held today.
                The election result may be quite different when it is actually held.
                See this FAQ answer for more information.
            </Alert>
        </>
    )
}

export default NowcastAlert;