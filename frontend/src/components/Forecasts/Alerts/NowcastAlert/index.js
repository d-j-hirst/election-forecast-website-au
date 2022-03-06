import React, {useState} from 'react';

import { HashLink as Link } from 'react-router-hash-link';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';
import { ExtLink } from '../../../../utils/extlink.js';

import styles from './NowcastAlert.module.css';

const NowcastAlert = props => {
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
                        This a <strong>nowcast</strong> report, not a forecast for the actual election.
                        This means it is an estimate of what the {props.forecast.electionName} might be like <strong>if it were held today</strong>.
                        The election result may be quite different when it is actually held.
                        See <Link to={"/guide#nowcast"}>this section of the forecast guide</Link> for more information.
                        (For a forecast for the election when it is held, see the&nbsp;
                        <Link to={"/forecast/" + props.code + "/regular"}>regular forecast</Link>.)
                    </div>
                </div>
                <hr />
                <p>
                    It is based on publicly available election, polling, and candidate information,
                    and is this site's best guess as to the probability of hypothetical election results based on this information.
                    For more information on how these nowcasts are constructed, check 
                    the <Link to={"/guide"}>forecast guide</Link>,
                    the <Link to={"/methodology"}>methodology&nbsp;page</Link> or
                    the <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser">source code on Github</ExtLink>.
                </p>
                <hr />
                <p>
                    <InfoIcon inactive={true}/> icons below
                    can be clicked for explanations of what each part of the report means.<br />
                    <InfoIcon inactive={true} warning={true}/> icons mark parts of the
                    report that are included for completeness but should be interpreted with caution - 
                    click the icons to read the warning.
                </p>
            </Alert>
        )
    }
    else return <Button onClick={() => setShow(true)} variant="warning">Show introduction alert ▼</Button>
}

export default NowcastAlert;