import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
    LoadingMarker, VoteTotals, SeatTotals, NowcastAlert, ForecastAlert,
    LiveOldAlert, History, Seats, StandardErrorBoundary } from 'components';
import { getDirect } from 'utils/sdk';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Forecast.module.css';

const Forecast = () => {
    const { code, mode } = useParams();
    const [ forecast, setForecast] = useState({});
    const [ forecastValid, setForecastValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        setForecastValid(false);

        const getElectionSummary = () => {
            let requestUri = `forecast-api/election-summary/${code}/${mode}`;
            const cached_id = localStorage.getItem('cachedForecastId');
            if (cached_id !== null) requestUri += `/${cached_id}`;
            return getDirect(requestUri).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find election data");
                    return resp.data;
                }
            );
        }

        const fetchElectionSummary = () => {
            const modeTitles = {FC: "General Forecast", NC: "Nowcast", LF: "Live Forecast"};
            if (code === localStorage.getItem('cachedForecastCode')
                    && mode === localStorage.getItem('cachedForecastMode')) {
                const tempForecast = JSON.parse(localStorage.getItem('cachedForecast'));
                setForecast(tempForecast);
                const modeTitle = modeTitles[tempForecast.reportMode];
                document.title = `AEF - ${tempForecast.electionName} ${modeTitle}`;
                setForecastValid(true);
            }
            getElectionSummary().then(
                data => {
                    if (data.new === false) {
                        data['report'] = JSON.parse(localStorage.getItem('cachedForecast'));
                    } else {
                        localStorage.setItem('cachedForecast', JSON.stringify(data.report));
                        localStorage.setItem('cachedForecastId', String(data.id));
                        localStorage.setItem('cachedForecastCode', String(code));
                        localStorage.setItem('cachedForecastMode', String(mode));
                    }
                    setForecast(data.report);
                    const modeTitle = modeTitles[data.report.reportMode];
                    document.title = `AEF - ${data.report.electionName} ${modeTitle}`;
                    setForecastValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }

        fetchElectionSummary();
    }, [code, mode]);

    // This section prevents the leftover UI from the previous forecast 
    // being displayed just after a new one has been clicked.
    const modeNames = {RF: "regular", NC: "nowcast", LF: "live"};
    let showForecast = true;
    if (forecast.reportMode !== undefined && modeNames[forecast.reportMode] !== mode) {
        showForecast = false;
    }

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"forecast"} />
            <ForecastsNav election={code} mode={mode} />
            <div className={styles.content}>
                <StandardErrorBoundary>
                    {forecastValid && showForecast &&
                        <>
                            <ForecastHeader mode={mode} forecast={forecast} />
                            {
                                mode === "regular" &&
                                <ForecastAlert forecast={forecast} code={code} />
                            }
                            {
                                mode === "nowcast" &&
                                <NowcastAlert forecast={forecast} code={code} />
                            }
                            {
                                mode === "live" && code == "2022sa" &&
                                <LiveOldAlert forecast={forecast} code={code} />
                            }
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
                                <History election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <Seats election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                            </StandardErrorBoundary>
                        </>
                    }
                    {(!forecastValid || !showForecast) &&
                        <LoadingMarker />
                    }
                </StandardErrorBoundary>
            </div>
            <Footer />
        </div>
    );
};

export default Forecast;
