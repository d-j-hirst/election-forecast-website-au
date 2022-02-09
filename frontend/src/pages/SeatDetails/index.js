import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useUserRequired } from 'utils/hooks';
import { Header, ForecastAlert, ForecastsNav, ForecastHeader,
  LoadingMarker, NowcastAlert, SeatDetailBody } from 'components';

import { getDirect } from 'utils/sdk';
import { getIndexFromSeatUrl } from 'utils/seaturls';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './SeatDetails.module.css';


const SeatDetails = () => {
  const { code, mode, seat } = useParams();
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
          setForecast(data);
          setSeatIndex(getIndexFromSeatUrl(data.seatNames, seat));
          setForecastValid(true);
        }
      ).catch(
        e => {
          console.log(e);
        }
      );
    }

    fetchElectionSummary();
  }, [code, mode, seat]);

  return (
    <>
      <Header />
      <ForecastsNav election={code} mode={mode} />
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
