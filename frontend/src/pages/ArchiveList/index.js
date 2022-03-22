import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import { Header, Footer, ForecastsNav, LoadingMarker, StandardErrorBoundary } from 'components';
import { getDirect } from 'utils/sdk';

import { parseDateStringAsUTC } from '../../utils/date.js'
import { useWindowDimensions } from '../../utils/window.js';

import styles from './ArchiveList.module.css';

const ArchiveRow = props => {
    const modeNames = {FC: "General Forecast", NC: "Nowcast", LF: "Live Forecast"};
    const mode = modeNames[props.item.mode];
    const date = parseDateStringAsUTC(props.item.date);
    const url = "/archive/"
                + props.code + "/"
                + props.item.id

    return (
        <ListGroup.Item className={styles.archiveListItem}>
            <div>
                <Link to={url}>{props.item.label}</Link> - <strong>{mode}</strong>
                <br />
                <small>Report created at {date}</small>
            </div>
        </ListGroup.Item>
    )
}

const ArchiveRowSet = props => {
    return (
        <>
            {props.archiveList.map((item, index) => <ArchiveRow item={item} code={props.code} key={index} />)}
        </>
    )
}

const ArchiveList = () => {
    const { code } = useParams();
    const [ electionName, setElectionName] = useState("");
    const [ archiveList, setArchiveList] = useState({});
    const [ archiveListValid, setArchiveListValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        setArchiveListValid(false);

        const getArchiveList = () => {
            return getDirect(`forecast-api/election-archives/${code}`).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find archives for this election");
                    return resp.data;
                }
            );
        }

        const fetchArchiveList = () => {
            getArchiveList().then(
                data => {
                    setElectionName(data[0]);
                    document.title = `AEF - Archive list for ${data[0]}`;
                    setArchiveList(data[1]);
                    setArchiveListValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }

        fetchArchiveList();
    }, [code]);

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"archive"} />
            <ForecastsNav election={code} mode="archives" />
            <div className={styles.content}>
                {archiveListValid &&
                    <>
                        {
                            <Card className={styles.summary}>
                                <Card.Header className={styles.archiveListTitle}>
                                    <strong>
                                        Archives for {electionName}
                                    </strong>
                                </Card.Header>
                                <Card.Body className={styles.archiveListBody}>
                                    <StandardErrorBoundary>
                                        <ListGroup className={styles.archiveList}>
                                            <ArchiveRowSet archiveList={archiveList} code={code} />
                                        </ListGroup>
                                    </StandardErrorBoundary>
                                </Card.Body>
                            </Card>
                        }
                    </>
                }
                {!archiveListValid &&
                  <LoadingMarker text="Loading archive list" />
                }
            </div>
            <Footer />
        </div>
    );
};

export default ArchiveList;
