import React, {useState} from 'react';

import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import info from './assets/info.png';
import warning from './assets/warning.png'

import styles from './NowcastAlert.module.css';

const NowcastAlert = props => {
    const [show, setShow] = useState(props.showInitially === undefined || props.showInitially);
    // Obviously, the 'See this FAQ' should actually be linked to the relevant answer when it's made!
    if (show) {
        return (
            <Alert variant="warning"
                   className={styles.nowcastAlert}
                   dismissible={true}
                   onClose={() => setShow(false)}
                >
                <div className={styles.firstPara}>
                    <img className={styles.largeWarning} src={warning} alt='Information symbol'/>
                    <div>
                        This a <strong>nowcast</strong> report, not a forecast for the actual election.
                        This means it is an estimate of what the {props.forecast.electionName} might be like <strong>if it were held today</strong>.
                        The election result may be quite different when it is actually held.
                        See this FAQ answer for more information.
                        (For a forecast for the election when it is held, see the&nbsp;
                        <Link to={"/forecast/" + props.code + "/regular"}>regular forecast</Link>.)
                    </div>
                </div>
                <hr />
                <p>
                    It is based on publically available election, polling, and candidate information,
                    and is this site's best guess as to the probability of hypothetical election results based on this information.
                    For more information on how these nowcasts are constructed, check 
                    the <Link to={"/faq"}>FAQ&nbsp;page</Link>,
                    the <Link to={"/methodology"}>methodology&nbsp;page</Link> or
                    the <a href="https://github.com/d-j-hirst/aus-polling-analyser">source code on Github</a>.
                </p>
                <hr />
                <p>
                    <img className={styles.infoIcon} src={info} alt='Information symbol'/> icons below
                    can be clicked for explanations of what each part of the report means.<br />
                    <img className={styles.warningIcon} src={warning} alt='Warning symbol'/> icons mark parts of the
                    report that are included for completeness but should be interpreted with caution - 
                    click the icons to read the warning.
                </p>
            </Alert>
        )
    }
    else return <Button onClick={() => setShow(true)} variant="warning">Show introduction alert ▼</Button>
}

export default NowcastAlert;