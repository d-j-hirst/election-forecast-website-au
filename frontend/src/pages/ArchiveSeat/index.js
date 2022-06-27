import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet";

import { Header, Footer, ForecastsNav, ForecastHeader,
    LoadingMarker, ArchiveAlert, SeatDetailBody, StandardErrorBoundary } from 'components';

import { getDirect } from 'utils/sdk';
import { getIndexFromSeatUrl } from 'utils/seaturls';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './ArchiveSeat.module.css';


const SeatDetails = () => {
    const { code, id, seat } = useParams();
    const [ forecast, setForecast] = useState({});
    const [ seatIndex, setSeatIndex] = useState(-1);
    const [ forecastValid, setForecastValid] = useState(false);
    const [ results, setResults] = useState({});
    const [ resultsValid, setResultsValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        setForecastValid(false);
        setResultsValid(false);

        const getElectionSummary = () => {
            const url = `forecast-api/election-archive/${code}/${id}`;
            console.log(url);
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

        const fetchElectionSummary = () => {
            getElectionSummary().then(
                data => {
                    setForecast(data.report);
                    const seatIndexTemp = getIndexFromSeatUrl(data.report.seatNames, seat);
                    setSeatIndex(seatIndexTemp);
                    document.title = `AEF - ${data.report.seatNames[seatIndexTemp]} archived ${data.report.electionName} ${data.report.reportMode === "NC" ? "nowcast" : "forecast"}`;
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

        fetchElectionSummary();
    }, [code, id, seat]);

    const mode = forecastValid ? (forecast.reportMode === "NC" ? "nowcast" : "regular") : ""
    
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
                {forecastValid && seatIndex >= 0 &&
                    <>
                        <ForecastHeader mode={mode} forecast={forecast} archive={true} />
                        <ArchiveAlert forecast={forecast} code={code} mode={mode} showInitially={false} />
                        <StandardErrorBoundary>
                            <SeatDetailBody archive={id}
                                            forecast={forecast}
                                            election={code}
                                            mode={mode}
                                            index={seatIndex}
                                            results={effectiveResults}
                                            windowWidth={windowDimensions.width}
                            />
                        </StandardErrorBoundary>
                    </>
                }
                {forecastValid && seatIndex === -1 &&
                    <>
                        Couldn't find a seat matching name: {seat}. Make sure the seat is spelled correctly and any groups of spaced and other special characters are replaced with single hyphens.
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

export default SeatDetails;
