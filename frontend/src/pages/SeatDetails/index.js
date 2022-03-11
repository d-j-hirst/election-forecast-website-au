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
      return getDirect(`forecast-api/election-summary/${code}/${mode}`).then(
        resp => {
          if (!resp.ok) throw Error("Couldn't find election data");
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
                mode === "regular" &&
                <ForecastAlert forecast={forecast} code={code} showInitially={false} />
              }
              {
                mode === "nowcast" &&
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
              Couldn't find a seat matching name: {seat}. Make sure the seat is spelled correctly and any groups of spaced and other special characters are replaced with single hyphens.
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
