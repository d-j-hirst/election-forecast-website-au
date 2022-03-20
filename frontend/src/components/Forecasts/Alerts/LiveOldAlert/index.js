import React, {useState} from 'react';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';

import styles from './LiveOldAlert.module.css';

const LiveOldAlert = props => {
    const [show, setShow] = useState(props.showInitially === undefined || props.showInitially);
    if (show) {
        return (
            <Alert variant="warning"
                   className={styles.nowcastAlert}
                   dismissible={true}
                   onClose={() => setShow(false)}
                >
                <div className={styles.firstPara}>
                    <InfoIcon size="large" inactive={true} warning={true}/>
                    <div>
                        This was a <strong>live forecast</strong> of the {props.forecast.electionName} made at the end of election
                        night, visible for historical purposes only. It represents the apparent state of play at the end of
                        election night, and has not and will not be updated further from there.
                    </div>
                </div>
            </Alert>
        )
    }
    else return <Button onClick={() => setShow(true)} variant="warning">Show introduction alert ▼</Button>
}

export default LiveOldAlert;