import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
    LoadingMarker, VoteTotals, SeatTotals, ForecastAlert, Seats, StandardErrorBoundary } from 'components';
import { getDirect } from 'utils/sdk';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Archive.module.css';

const Archive = () => {
    const { code, id } = useParams();
    const [ forecast, setForecast] = useState({});
    const [ forecastValid, setForecastValid] = useState(false);
    const [ results, setResults] = useState({});
    const [ resultsValid, setResultsValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        setForecastValid(false);
        setResultsValid(false);

        const getArchive = () => {
            const url = `forecast-api/election-archive/${code}/${id}`;
            return getDirect(url).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find election data");
                    return resp.data;
                }
            );
        }

        const getElectionResults = () => {
            let requestUri = `forecast-api/election-results/${code}`;
            const cached_id = localStorage.getItem('cachedResultsVersion');
            if (cached_id !== null) requestUri += `/${cached_id}`;
            return getDirect(requestUri).then(
                resp => {
                    if (!resp.ok) throw Error("Couldn't find election results data");
                    return resp.data;
                }
            );
        }

        const fetchArchive = () => {

            if (code === localStorage.getItem('cachedResultsCode')) {
                const tempResults = JSON.parse(localStorage.getItem('cachedResults'));
                setResults(tempResults);
                setResultsValid(true);
            }

            getArchive().then(
                data => {
                    setForecast(data.report);
                    const modeNames = {RF: "general forecast", NC: "nowcast", LF: "live forecast"};
                    document.title = `AEF - Archived ${data.report.electionName} ${modeNames[data.report.reportMode]}`;
                    setForecastValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );

            getElectionResults().then(
                data => {
                    if (data.new && data.results.length === 0) {
                        // No results available
                        return;
                    }
                    if (data.new === false) {
                        data['results'] = JSON.parse(localStorage.getItem('cachedResults'));
                    } else {
                        localStorage.setItem('cachedResults', JSON.stringify(data.results));
                        localStorage.setItem('cachedResultsVersion', String(data.version));
                        localStorage.setItem('cachedResultsCode', String(code));
                    }
                    setResults(data.results);
                    setResultsValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }

        fetchArchive();
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
                        <ForecastAlert forecast={forecast} code={code} isArchive={true} />
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
