import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useUserRequired } from 'utils/hooks';
import { Header, ForecastsNav, ForecastHeader, FormationOfGovernment, LoadingMarker, VoteTotals } from 'components';
import { getDirect } from 'utils/sdk';

import styles from './Forecast.module.css';

const Forecast = () => {
  const { code, mode } = useParams();
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  const [ forecast, setForecast] = useState({});
  const [ forecastValid, setForecastValid] = useState(false);

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
          setForecastValid(true);
        }
      ).catch(
        e => {
          console.log(e);
        }
      );
    }

    fetchElectionSummary();
  }, [code, mode]);

  return (
    <>
      <Header />
      <ForecastsNav election={code} mode={mode} />
      <div className={styles.content}>
        {forecastValid &&
          <>
            <ForecastHeader mode={mode} forecast={forecast} />
            <FormationOfGovernment election={code} mode={mode} forecast={forecast} />
            <VoteTotals election={code} mode={mode} forecast={forecast} />
          </>
        }
        {!forecastValid &&
          <LoadingMarker />
        }
      </div>
    </>
  );
};

export default Forecast;
