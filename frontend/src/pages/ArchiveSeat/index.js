import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from "react-helmet-async";

import { Header, Footer, ForecastsNav, ForecastHeader,
    LoadingMarker, ForecastAlert, SeatDetailBody, StandardErrorBoundary } from 'components';

import { getIndexFromSeatUrl } from 'utils/seaturls';
import { useWindowDimensions } from '../../utils/window.js';
import { fetchReport } from '../../utils/report_manager.js';

import styles from './ArchiveSeat.module.css';


const SeatDetails = () => {
    const { code, id, seat } = useParams();
    const [ forecast, setForecast] = useState({});
    // -2 means "haven't got around to checking the forecast yet"
    // -1 means "didn't find a matching seat"
    const [ seatIndex, setSeatIndex] = useState(-2);
    const [ forecastValid, setForecastValid] = useState(false);
    const [ results, setResults] = useState({});
    const [ resultsValid, setResultsValid] = useState(false);
    const windowDimensions = useWindowDimensions();

    useEffect(() => {
        setForecastValid(false);
        setResultsValid(false);

        fetchReport({
            code: code,
            archiveId: id,
            setForecast: setForecast,
            setForecastValid: setForecastValid,
            setResults: setResults,
            setResultsValid: setResultsValid
        });
    }, [code, id, seat]);

    useEffect(() => {
        if (forecastValid) {
            const tempSeatIndex = getIndexFromSeatUrl(forecast.seatNames, seat);
            setSeatIndex(tempSeatIndex);
            if (tempSeatIndex === -1) return;
            document.title = `AEF - ${forecast.seatNames[tempSeatIndex]} ${forecast.electionName} ${forecast.reportMode === "NC" ? "nowcast" : "forecast"}`;
        }
    }, [forecastValid, forecast, seat]);

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
                        <ForecastAlert forecast={forecast} code={code} mode={mode} showInitially={false} results={effectiveResults} />
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
