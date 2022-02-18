import React, {useState} from 'react';

import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../InfoIcon';

import styles from './ForecastAlert.module.css';

const ForecastAlert = props => {
    const [show, setShow] = useState(props.showInitially === undefined || props.showInitially);
    // Obviously, the 'See this FAQ' should actually be linked to the relevant answer when it's made!
    if (show) {
        return (
            <Alert variant="info"
                   className={styles.forecastAlert}
                   dismissible={true}
                   onClose={() => setShow(false)}
            >
                <div className={styles.firstPara}>
                    <InfoIcon size="large" inactive={true}/>
                    <div>
                        This is a <strong>general forecast</strong> report for the {props.forecast.electionName}.
                        It estimates how the election might turn out <strong>when it is held</strong>.
                        (For an estimate of how the election would appear if held now, see the&nbsp;
                        <Link to={"/forecast/" + props.code + "/nowcast"}>nowcast</Link>.)
                    </div>
                </div>
                <hr />
                <p>
                    This report is based on publicly available election, polling, and candidate information,
                    and is this site's best guess as to the probability of eventual election results based on this information.
                    For more information on how these forecasts are constructed, check
                    the <Link to={"/guide"}>forecast guide</Link>, 
                    the <Link to={"/methodology"}>methodology&nbsp;page</Link> or
                    the <a href="https://github.com/d-j-hirst/aus-polling-analyser">source code on Github</a>.
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
    else return <Button onClick={() => setShow(true)} variant="info">Show introduction alert ▼</Button>
}

export default ForecastAlert;