import React, {useState} from 'react';

import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import info from './assets/info.png';
import warning from './assets/warning.png';

import styles from './ForecastAlert.module.css';

const ForecastAlert = props => {
    const [show, setShow] = useState(true);
    // Obviously, the 'See this FAQ' should actually be linked to the relevant answer when it's made!
    if (show) {
        return (
            <Alert variant="info"
                   className={styles.forecastAlert}
                   dismissible={true}
                   onClose={() => setShow(false)}
            >
                <div className={styles.firstPara}>
                    <img className={styles.largeInfo} src={info} alt='Information symbol'/>
                    <div>
                        This is a <strong>general forecast</strong> for the {props.forecast.electionName}.
                        It estimates how the election might turn out <strong>when it is held</strong>.
                        (For an estimate of how the election would appear if held now, see the&nbsp;
                        <Link to={"/forecast/" + props.code + "/nowcast"}>nowcast</Link>.)
                    </div>
                </div>
                <hr />
                <p>
                    The forecast is based on publically available election, polling, and candidate information,
                    and is this site's best guess as to the probability of the election outcome based on this information.
                    For more information on how the forecasts are constructed, check the FAQ&nbsp;page, methodology&nbsp;page or
                    the <a href="https://github.com/d-j-hirst/aus-polling-analyser">source code on Github</a>.
                </p>
                <hr />
                <p>
                    <img className={styles.infoIcon} src={info} alt='Information symbol'/> icons below
                    can be clicked or hovered over for explanations of what each part of the report means.<br />
                    <img className={styles.warningIcon} src={warning} alt='Warning symbol'/> icons mark parts of the
                        forecast that are included for completeness but should be interpreted with caution - 
                        click or hover over the icons to read the warning.
                </p>
            </Alert>
        )
    }
    else return <Button onClick={() => setShow(true)} variant="info">Show introduction alert ▼</Button>
}

export default ForecastAlert;