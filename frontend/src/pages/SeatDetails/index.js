import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Footer, ForecastAlert, ForecastsNav, ForecastHeader,
    LoadingMarker, SeatDetailBody, StandardErrorBoundary } from 'components';

import { getIndexFromSeatUrl } from 'utils/seaturls';
import { useWindowDimensions } from '../../utils/window.js';
import { fetchReport } from '../../utils/report_manager.js';

import styles from './SeatDetails.module.css';


const SeatDetails = () => {
    const { code, mode, seat } = useParams();
    const [ forecast, setForecast] = useState({});
    // -2 means "haven't got around to checking the forecast yet"
    // -1 means "didn't find a matching seat"
    const [ seatIndex, setSeatIndex] = useState(-2);
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
        window.scrollTo(0, 0);
    }, [code, mode]);

    useEffect(() => {
        if (forecastValid) {
            const tempSeatIndex = getIndexFromSeatUrl(forecast.seatNames, seat);
            setSeatIndex(tempSeatIndex);
            if (tempSeatIndex === -1) return;
            document.title = `AEF - ${forecast.seatNames[tempSeatIndex]} ${forecast.electionName} ${forecast.reportMode === "NC" ? "nowcast" : "forecast"}`;
        }
    }, [forecastValid, forecast, seat]);

    const effectiveResults = forecast.reportMode !== "NC" && resultsValid ? results : null;
    
    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"forecast"} />
            <ForecastsNav election={code} mode={mode} />
            <StandardErrorBoundary>
                <div className={styles.content}>
                    {forecastValid && seatIndex >= 0 &&
                        <>
                            <ForecastHeader mode={mode} forecast={forecast} />
                            {
                                <ForecastAlert forecast={forecast} code={code} results={effectiveResults} />
                            }
                            <StandardErrorBoundary>
                                <SeatDetailBody forecast={forecast}
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
                            Couldn't find a seat matching name: {seat}.
                            Make sure the seat is spelled correctly and any groups of spaced and other
                            special characters are replaced with single hyphens.
                        </>
                    }
                    {forecastValid && seatIndex === -2 &&
                      <LoadingMarker />
                    }
                    {!forecastValid &&
                      <LoadingMarker />
                    }
                </div>
            </StandardErrorBoundary>
            <Footer />
        </div>
    );
};

export default SeatDetails;
