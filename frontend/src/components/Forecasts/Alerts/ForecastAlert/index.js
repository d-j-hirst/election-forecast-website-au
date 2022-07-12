import React, {useState} from 'react';

import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';
import { ExtLink } from '../../../../utils/extlink.js';

import styles from './ForecastAlert.module.css';

const old_elections = ['2022sa', '2022fed']
const old_elections_links = {
    '2022sa': 'https://www.ecsa.sa.gov.au/elections/2022-state-election/results',
    '2022fed': 'https://tallyroom.aec.gov.au/HouseDivisionalResults-27966.htm'
}
const old_live_text = {
    '2022sa': 'at the end of election night',
    '2022fed': 'after most (but not all) counting of votes'
}

const ForecastAlert = props => {
    const [show, setShow] = useState(props.showInitially === undefined || props.showInitially);
    const isNowcast = props.forecast.reportMode === "NC";
    const isLive = props.forecast.reportMode === "LF";
    const isRegular = props.forecast.reportMode === "RF";
    const isArchive = props.isArchive === true;
    const old = isArchive || old_elections.includes(props.code);
    const isWarning = isNowcast || isLive || props.isArchive;
    const alertVariant = isWarning ? "warning" : "info";
    if (show) {
        return (
            <Alert variant={alertVariant}
                   className={isWarning ? styles.nowcastAlert : styles.forecastAlert}
                   dismissible={true}
                   onClose={() => setShow(false)}
            >
                <div className={styles.firstPara}>
                    <InfoIcon size="large" inactive={true} warning={isWarning}/>
                    {isRegular &&
                    <>
                        <div>
                            This {old && !isArchive ? 'was the final' : (isArchive ? 'is an' : 'is a')} <strong>{isArchive ? 'archived ' : ''}general
                            forecast</strong> report for the {props.forecast.electionName}.
                            It estimate{old ? 'd' : 's'} how the election might {old ? 'have turned' : 'turn'} out <strong>when
                            it {old ? 'was' : 'is'} held</strong>{old ? ' based on information available at the time' : ''}.
                            {!old && 
                                <>
                                    {' '}(For an estimate of how the election would appear if held now, see the&nbsp;
                                    <Link to={"/forecast/" + props.code + "/nowcast"}>nowcast</Link>.)
                                </>
                                
                            }
                            {old && 
                                <>
                                    {' '}View the official results <ExtLink href={old_elections_links[props.code]}>here</ExtLink>.
                                </>
                            }
                        </div>
                    </>
                    }
                    {isNowcast &&
                    <>
                        <div>
                            This {old && !isArchive ? 'was the final ' : (isArchive ? 'is an ' : 'is a ')}
                            <strong>{isArchive ? 'archived ' : ''}nowcast</strong> report,
                            not a forecast for the actual election.
                            This means it {old ? 'was' : 'is'} an estimate of what the {props.forecast.electionName} might be
                            like <strong>if it were held {old ? 'at that time' : 'the last time new polling data was published'}</strong>.
                            The election result {old ? 'might have been ' : 'may be '} quite different when it {old ? 'was' : 'is'} actually held.
                            See <Link to={"/guide#nowcast"}>this section of the forecast guide</Link> for more information.
                            (For a forecast for the election when it {old ? 'was' : 'is'} expected to be held, see the&nbsp;
                            <Link to={"/forecast/" + props.code + "/regular"}>regular forecast</Link>.)
                        </div>
                    </>
                    }
                    {isLive &&
                    <>
                        <div>
                            This {old ? 'was' : 'is'} an {isArchive ? <strong>archived</strong> : ''} experimental <strong>live forecast</strong> of
                            the {props.forecast.electionName}, incorporating official election results as
                            they {old ? 'were' : 'are'} reported. Please be aware that the development of this
                            live forecasting process is incomplete, and as a result it may contain significant inaccuracies.
                            {old && !isArchive &&
                            <>
                                <hr />
                                This was the the final such forecast
                                made {old_live_text[props.code]}, visible for historical purposes only.
                                It represents the apparent state of
                                play at that time, and has not and will not be updated further from there.
                            </>
                            }
                            {' '}View the official results <ExtLink href={old_elections_links[props.code]}>here</ExtLink>.
                        </div>
                    </>
                    }
                </div>
                <hr />
                <p>
                    This report {old ? 'was' : 'is'} based on publicly available election, polling, and candidate information,
                    and {old ? 'was' : 'is'} this site's best guess as to the probability of eventual election results based on this information.
                    For more information on how these forecasts are constructed, check
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
    else return <Button onClick={() => setShow(true)} variant={alertVariant}>Show introduction alert ▼</Button>
}

export default ForecastAlert;