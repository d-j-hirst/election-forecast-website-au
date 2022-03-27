import React, { useState, useEffect } from 'react';

import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import StandardErrorBoundary from '../../General/StandardErrorBoundary';
import InfoIcon from '../../General/InfoIcon';
import LoadingMarker from '../../General/LoadingMarker';

import { getDirect } from 'utils/sdk';

import styles from './VoteTotals.module.css';

const MainExplainer = props => {
    return (
        <Alert variant="info" className={styles.alert}>
            <p>
                Placeholder alert.
            </p>
        </Alert>
    )
}

const History = props => {
    const [showExplainer, setShowExplainer] = useState(false);
    const [ history, setHistory] = useState({});
    const [ historyValid, setHistoryValid] = useState(false);
    // const windowDimensions = useWindowDimensions();

    useEffect(() => {
        setHistoryValid(false);

        const getElectionSummary = () => {
            let requestUri = `forecast-api/election-timeseries/${props.election}/${props.mode}/`;
            if (props.election === localStorage.getItem('cachedHistoryCode')
                    && props.mode === localStorage.getItem('cachedHistoryMode')) {
                const cached_id = localStorage.getItem('cachedHistoryVersion');
                if (cached_id !== null) requestUri += `${cached_id}/`;
            }
            return getDirect(requestUri).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find election data");
                    return resp.data;
                }
            );
        }

        const fetchElectionSummary = () => {
            if (props.election === localStorage.getItem('cachedHistoryCode')
                    && props.mode === localStorage.getItem('cachedHistoryMode')) {
                const tempHistory = JSON.parse(localStorage.getItem('cachedHistory'));
                setHistory(tempHistory);
                setHistoryValid(true);
            }
            getElectionSummary().then(
                data => {
                    if (data.new === false) {
                        data['timeseries'] = JSON.parse(localStorage.getItem('cachedHistory'));
                    } else {
                        localStorage.setItem('cachedHistory', JSON.stringify(data.timeseries));
                        localStorage.setItem('cachedHistoryVersion', String(data.version));
                        localStorage.setItem('cachedHistoryCode', String(props.election));
                        localStorage.setItem('cachedHistoryMode', String(props.mode));
                    }
                    setHistory(data.timeseries);
                    setHistoryValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }

        fetchElectionSummary();
    }, [props.election, props.mode]);

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.historyTitle}>
                <strong>
                    Forecast History
                    &nbsp;<InfoIcon onClick={() => setShowExplainer(!showExplainer)} />
                </strong>
            </Card.Header>
            <Card.Body className={styles.historyBody}>
                <ListGroup className={styles.historyList}>
                    {
                        showExplainer && <MainExplainer />
                    }
                    {historyValid &&
                        <StandardErrorBoundary>
                            <LoadingMarker text="Done loading, this is a placeholder ..."/>
                        </StandardErrorBoundary>
                    }
                    {!historyValid &&
                        <LoadingMarker text="Loading history"/>
                    }
                </ListGroup>
            </Card.Body>
        </Card>
    );
}

export default History;