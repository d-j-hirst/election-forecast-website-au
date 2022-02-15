import React, {useState} from 'react';

import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import info from './assets/info.png';
import warning from './assets/warning.png'

import { parseDateStringAsUTC } from '../../utils/date.js'

import styles from './ArchiveAlert.module.css';

const ArchiveAlert = props => {
    const [show, setShow] = useState(props.showInitially === undefined || props.showInitially);
    const isNowcast = props.forecast.reportMode === "NC";
    // Obviously, the 'See this FAQ' should actually be linked to the relevant answer when it's made!
    if (show) {
        return (
            <Alert variant="warning"
                   className={styles.archiveAlert}
                   dismissible={true}
                   onClose={() => setShow(false)}
                >
                <div className={styles.firstPara}>
                    <img className={styles.largeWarning} src={warning} alt='Information symbol'/>
                    <div>
                        This is an 
                        <strong> archived
                            {isNowcast ? " nowcast " : " forecast "}
                        </strong>
                        for the {props.forecast.electionName} made at {parseDateStringAsUTC(props.forecast.reportDate)}.
                        This means it is an estimate of what the {props.forecast.electionName} was expected to 
                        be like
                        <strong>
                            { isNowcast ? " if it were held at that point in time" :
                                 " at the election, based on information available at that point in time"}
                        </strong>.
                        As an archive, this report does not take into account more recent information.
                        For the most updated report, see the most recent{" "}
                        <Link to={"/forecast/" + props.code + "/regular"}>regular forecast</Link>
                        {" "}or{" "}
                        <Link to={"/forecast/" + props.code + "/nowcast"}>nowcast</Link>
                        .)
                    </div>
                </div>
                <hr />
                <p>
                    This report is based on publically available election, polling, and candidate information,
                    and was this site's best guess as to the probability
                    of {isNowcast ? "hypothetical" : "eventual"} election results based on this information.
                    For more information on how these {isNowcast ? "nowcasts" : "forecasts"} are
                    constructed, check the FAQ&nbsp;page, methodology&nbsp;page or
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

export default ArchiveAlert;