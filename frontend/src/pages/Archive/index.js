import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
    LoadingMarker, VoteTotals, SeatTotals, ArchiveAlert, Seats, StandardErrorBoundary } from 'components';
import { getDirect } from 'utils/sdk';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Archive.module.css';

const Archive = () => {
    const { code, id } = useParams();
    const [ forecast, setForecast] = useState({});
    const [ forecastValid, setForecastValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    

    useEffect(() => {
        setForecastValid(false);

        const getArchive = () => {
            const url = `forecast-api/election-archive/${code}/${id}`;
            console.log(url);
            return getDirect(url).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find election data");
                    return resp.data;
                }
            );
        }

        const fetchArchive = () => {
            getArchive().then(
                data => {
                    setForecast(data.report);
                    const modeNames = {FC: "general forecast", NC: "nowcast", LF: "live forecast"};
                    document.title = `AEF - Archived ${data.report.electionName} ${modeNames[data.report.reportMode]}`;
                    setForecastValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }

        fetchArchive();
    }, [code, id]);

    
    const modeNames = {FC: "regular", NC: "nowcast", LF: "live"};
    const mode = forecastValid ? modeNames[forecast.reportMode] : ""

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"archive"} />
            {/* Even though the archived forecast is still in some mode,
                it's needed to set the mode to "other" here as that will
                keep the links clickable */}
            <ForecastsNav election={code} mode="other" />
            <div className={styles.content}>
                {forecastValid &&
                    <>
                        <ForecastHeader mode={mode} forecast={forecast} archive={true} />
                        <ArchiveAlert forecast={forecast} code={code} />
                        <StandardErrorBoundary>
                            <FormationOfGovernment election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                        </StandardErrorBoundary>
                        <StandardErrorBoundary>
                            <VoteTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                        </StandardErrorBoundary>
                        <StandardErrorBoundary>
                            <SeatTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                        </StandardErrorBoundary>
                        <StandardErrorBoundary>
                            <Seats election={code} mode={mode} forecast={forecast} archiveId={id} windowWidth={windowDimensions.width} />
                        </StandardErrorBoundary>
                    </>
                }
                {!forecastValid &&
                    <LoadingMarker />
                }
            </div>
            <Footer />
        </div>
    );
};

export default Archive;
