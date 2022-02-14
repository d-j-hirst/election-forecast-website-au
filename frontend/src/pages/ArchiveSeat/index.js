import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useUserRequired } from 'utils/hooks';
import { Header, ForecastsNav, ForecastHeader,
  LoadingMarker, ArchiveAlert, SeatDetailBody } from 'components';

import { getDirect } from 'utils/sdk';
import { getIndexFromSeatUrl } from 'utils/seaturls';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './ArchiveSeat.module.css';


const SeatDetails = () => {
  const { code, id, seat } = useParams();
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  const [ forecast, setForecast] = useState({});
  const [ seatIndex, setSeatIndex] = useState(-1);
  const [ forecastValid, setForecastValid] = useState(false);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    setForecastValid(false);

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
    }

    fetchElectionSummary();
  }, [code, id, seat]);

  const mode = forecastValid ? (forecast.reportMode === "NC" ? "nowcast" : "regular") : ""

  return (
    <>
      <Header />
      {/* Even though the archived forecast is still in some mode,
          it's needed to set the mode to "other" here as that will
          keep the links clickable */}
      <ForecastsNav election={code} mode="other" />
      <div className={styles.content}>
        {forecastValid && seatIndex >= 0 &&
          <>
            <ForecastHeader mode={mode} forecast={forecast} archive={true} />
            <ArchiveAlert forecast={forecast} code={code} mode={mode} showInitially={false} />
            <SeatDetailBody forecast={forecast}
                            election={code}
                            mode={mode}
                            index={seatIndex}
                            windowWidth={windowDimensions.width}
            />
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
    </>
  );
};

export default SeatDetails;
