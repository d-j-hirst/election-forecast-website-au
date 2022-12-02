import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
    
import { useWindowDimensions } from '../../../utils/window.js';
import { fetchReport } from '../../../utils/report_manager.js';

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
    LoadingMarker, VoteTotals, SeatTotals, ForecastAlert, Seats, StandardErrorBoundary } from 'components';
    
import styles from './Layout.module.css';

const ForecastLayout = props => {
    const code = props.code;
    const id = props.id;
    const inputMode = props.mode;
    const [ forecast, setForecast] = useState({});
    const [ forecastValid, setForecastValid] = useState(false);
    const [ results, setResults] = useState({});
    const [ resultsValid, setResultsValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        fetchReport({
            code: code,
            mode: inputMode,
            archiveId: id,
            setForecast: setForecast,
            setForecastValid: setForecastValid,
            setResults: setResults,
            setResultsValid: setResultsValid
        });
    }, [code, id, inputMode]);

    const modeNames = {RF: "regular", NC: "nowcast", LF: "live"};
    const mode = forecastValid ? modeNames[forecast.reportMode] : "";

    const effectiveResults = forecast.reportMode !== "NC" && resultsValid ? results : null;

    return (
        <div className={styles.site}>
            {props.isArchive &&
                <Helmet>   
                    {/* Archived forecasts shouldn't be indexed by search engines etc., they're
                        for people specifically looking at the history performance of the AEF forecast
                        and not for more general searches */}
                    <meta name="robots" content="noindex" />
                </Helmet>
            }
            <Header windowWidth={windowDimensions.width} page={"archive"} />
            {/* Even though the archived forecast is still in some mode,
                it's needed to set the mode to "other" here as that will
                keep the links clickable */}
            <ForecastsNav election={code} mode={props.isArchive ? "other" : mode} />
            <div className={styles.content}>
                <StandardErrorBoundary>
                    {forecastValid &&
                        <>
                            <ForecastHeader mode={mode}
                                            forecast={forecast}
                                            archive={props.isArchive}
                            />
                            <ForecastAlert forecast={forecast}
                                           code={code}
                                           isArchive={props.isArchive}
                                           results={effectiveResults} />
                            <StandardErrorBoundary>
                                <FormationOfGovernment election={code}
                                                       mode={mode}
                                                       forecast={forecast}
                                                       windowWidth={windowDimensions.width}
                                />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <VoteTotals election={code}
                                            mode={mode}
                                            forecast={forecast}
                                            windowWidth={windowDimensions.width}
                                            results={effectiveResults}
                                            isArchive={props.isArchive}
                                />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <SeatTotals election={code}
                                            mode={mode}
                                            forecast={forecast}
                                            windowWidth={windowDimensions.width}
                                            results={effectiveResults}
                                />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <Seats election={code}
                                       mode={mode}
                                       forecast={forecast}
                                       archiveId={id}
                                       windowWidth={windowDimensions.width}
                                       results={effectiveResults}
                                />
                            </StandardErrorBoundary>
                        </>
                    }
                    {(!forecastValid) &&
                        <LoadingMarker />
                    }
                </StandardErrorBoundary>
            </div>
            <Footer />
        </div>
    );
};

export default ForecastLayout;