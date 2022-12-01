import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
    LoadingMarker, VoteTotals, SeatTotals, ForecastAlert,
    History, Seats, StandardErrorBoundary } from 'components';

import { useWindowDimensions } from '../../utils/window.js';
import { fetchReport } from '../../utils/report_manager.js';

import styles from './Forecast.module.css';

const Forecast = () => {
    const { code, mode } = useParams();
    const [ forecast, setForecast] = useState({});
    const [ forecastValid, setForecastValid] = useState(false);
    const [ results, setResults] = useState({});
    const [ resultsValid, setResultsValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        fetchReport({
            code: code,
            mode: mode,
            setForecast: setForecast,
            setForecastValid: setForecastValid,
            setResults: setResults,
            setResultsValid: setResultsValid
        });
    }, [code, mode]);

    // This section prevents the leftover UI from the previous forecast 
    // being displayed just after a new one has been clicked.
    const modeNames = {RF: "regular", NC: "nowcast", LF: "live"};
    let showForecast = true;
    if (forecast.reportMode !== undefined && modeNames[forecast.reportMode] !== mode) {
        showForecast = false;
    }
    const effectiveResults = forecast.reportMode !== "NC" && resultsValid ? results : null;

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"forecast"} />
            <ForecastsNav election={code} mode={mode} />
            <div className={styles.content}>
                <StandardErrorBoundary>
                    {forecastValid && showForecast &&
                        <>
                            <ForecastHeader mode={mode} forecast={forecast} />
                            <ForecastAlert forecast={forecast} code={code} results={effectiveResults} />
                            <StandardErrorBoundary>
                                <FormationOfGovernment election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <VoteTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} results={effectiveResults} />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <SeatTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} results={effectiveResults} />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <History election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                            </StandardErrorBoundary>
                            <StandardErrorBoundary>
                                <Seats election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} results={effectiveResults} />
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
