import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";

import { Header, Footer, ForecastsNav, ForecastHeader,
    LoadingMarker, ForecastAlert, SeatDetailBody, StandardErrorBoundary } from 'components';

import { getIndexFromSeatUrl } from 'utils/seaturls';
import { useWindowDimensions } from '../../../utils/window.js';
import { fetchReport } from '../../../utils/report_manager.js';

import styles from './SeatDetails.module.css';

const SeatDetails = props => {
    const code = props.code;
    const id = props.id;
    const seat = props.seat;
    const inputMode = props.mode;
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
            archiveId: id,
            mode: inputMode,
            setForecast: setForecast,
            setForecastValid: setForecastValid,
            setResults: setResults,
            setResultsValid: setResultsValid
        });
    }, [code, id, inputMode, seat]);

    useEffect(() => {
        if (forecastValid) {
            const tempSeatIndex = getIndexFromSeatUrl(forecast.seatNames, seat);
            setSeatIndex(tempSeatIndex);
            if (tempSeatIndex === -1) return;
            document.title = `AEF - ${forecast.seatNames[tempSeatIndex]} ${forecast.electionName} ${forecast.reportMode === "NC" ? "nowcast" : "forecast"}`;
        }
    }, [forecastValid, forecast, seat]);

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
            <Header windowWidth={windowDimensions.width} page={props.isArchive ? "archive" : mode} />
            {/* Even though the archived forecast is still in some mode,
                it's needed to set the mode to "other" here as that will
                keep the links clickable */}
            <ForecastsNav election={code} mode={props.isArchive ? "other" : mode} />
            <StandardErrorBoundary>
                <div className={styles.content}>
                    {forecastValid && seatIndex >= 0 &&
                        <>
                            <ForecastHeader mode={mode}
                                            forecast={forecast}
                                            archive={props.isArchive}
                            />
                            <ForecastAlert forecast={forecast}
                                        code={code}
                                        mode={mode}
                                        showInitially={props.isArchive !== true}
                                        results={effectiveResults}
                            />
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
                <Footer />
            </StandardErrorBoundary>
        </div>
    )
}

export default SeatDetails;