import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet-async";

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
    LoadingMarker, VoteTotals, SeatTotals, ForecastAlert, Seats, StandardErrorBoundary } from 'components';
    
import { useWindowDimensions } from '../../utils/window.js';
import { fetchReport } from '../../utils/report_manager.js';

import styles from './Archive.module.css';

const Archive = () => {
    const { code, id } = useParams();
    const [ forecast, setForecast] = useState({});
    const [ forecastValid, setForecastValid] = useState(false);
    const [ results, setResults] = useState({});
    const [ resultsValid, setResultsValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        fetchReport({
            code: code,
            archiveId: id,
            setForecast: setForecast,
            setForecastValid: setForecastValid,
            setResults: setResults,
            setResultsValid: setResultsValid
        });
    }, [code, id]);
    
    const modeNames = {RF: "regular", NC: "nowcast", LF: "live"};
    const mode = forecastValid ? modeNames[forecast.reportMode] : ""
    
    const effectiveResults = forecast.reportMode !== "NC" && resultsValid ? results : null;

    return (
        <div className={styles.site}>
            <Helmet>
                <meta name="robots" content="noindex" />
            </Helmet>
            <Header windowWidth={windowDimensions.width} page={"archive"} />
            {/* Even though the archived forecast is still in some mode,
                it's needed to set the mode to "other" here as that will
                keep the links clickable */}
            <ForecastsNav election={code} mode="other" />
            <div className={styles.content}>
                {forecastValid &&
                    <>
                        <ForecastHeader mode={mode} forecast={forecast} archive={true} />
                        <ForecastAlert forecast={forecast} code={code} isArchive={true} results={effectiveResults} />
                        <StandardErrorBoundary>
                            <FormationOfGovernment election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
                        </StandardErrorBoundary>
                        <StandardErrorBoundary>
                            <VoteTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} results={effectiveResults} isArchive={true} />
                        </StandardErrorBoundary>
                        <StandardErrorBoundary>
                            <SeatTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} results={effectiveResults} />
                        </StandardErrorBoundary>
                        <StandardErrorBoundary>
                            <Seats election={code} mode={mode} forecast={forecast} archiveId={id} windowWidth={windowDimensions.width} results={effectiveResults} />
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
