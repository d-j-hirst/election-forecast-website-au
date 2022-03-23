import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Footer, ForecastAlert, ForecastsNav, ForecastHeader,
    LoadingMarker, NowcastAlert, SeatDetailBody, StandardErrorBoundary } from 'components';

import { getDirect } from 'utils/sdk';
import { getIndexFromSeatUrl } from 'utils/seaturls';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './SeatDetails.module.css';


const SeatDetails = () => {
    const { code, mode, seat } = useParams();
    const [ forecast, setForecast] = useState({});
    const [ seatIndex, setSeatIndex] = useState(-1);
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
            if (code === localStorage.getItem('cachedForecastCode')
                    && mode === localStorage.getItem('cachedForecastMode')) {
                const tempForecast = JSON.parse(localStorage.getItem('cachedForecast'));
                setForecast(tempForecast);
                const seatIndexTemp = getIndexFromSeatUrl(tempForecast.seatNames, seat);
                setSeatIndex(seatIndexTemp);
                document.title = `AEF - ${tempForecast.seatNames[seatIndexTemp]} ${tempForecast.electionName} ${tempForecast.reportMode === "NC" ? "nowcast" : "forecast"}`;
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
                    const seatIndexTemp = getIndexFromSeatUrl(data.report.seatNames, seat);
                    setSeatIndex(seatIndexTemp);
                    document.title = `AEF - ${data.report.seatNames[seatIndexTemp]} ${data.report.electionName} ${data.report.reportMode === "NC" ? "nowcast" : "forecast"}`;
                    setForecastValid(true);
                }
            ).catch(
                e => {
                    console.log(e);
                }
            );
        }

        fetchElectionSummary();
    }, [code, mode, seat, seatIndex]);
    
    console.log(`forecastValid: ${forecastValid}`);

    return (
        <div className={styles.site}>
            <Header windowWidth={windowDimensions.width} page={"forecast"} />
            <ForecastsNav election={code} mode={mode} />
            <StandardErrorBoundary>
                <div className={styles.content}>
                    {forecastValid && seatIndex >= 0 &&
                        <>
                            <ForecastHeader mode={mode} forecast={forecast} />
                            {mode === "regular" &&
                                <ForecastAlert forecast={forecast} code={code} showInitially={false} />
                            }
                            {mode === "nowcast" &&
                                <NowcastAlert mode={mode} forecast={forecast} showInitially={false} />
                            }
                            <StandardErrorBoundary>
                                <SeatDetailBody forecast={forecast}
                                                election={code}
                                                mode={mode}
                                                index={seatIndex}
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
