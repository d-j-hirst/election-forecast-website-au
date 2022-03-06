import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
  LoadingMarker, VoteTotals, SeatTotals, NowcastAlert, ForecastAlert, Seats } from 'components';
import { getDirect } from 'utils/sdk';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Forecast.module.css';

const Forecast = () => {
  const { code, mode } = useParams();
  const [ forecast, setForecast] = useState({});
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
          document.title = `AEF - ${data.report.electionName} ${data.report.reportMode === "NC" ? "nowcast" : "general forecast"}`;
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
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page={"forecast"} />
      <ForecastsNav election={code} mode={mode} />
      <div className={styles.content}>
        {forecastValid &&
          <>
            <ForecastHeader mode={mode} forecast={forecast} />
            {
              mode === "regular" &&
              <ForecastAlert forecast={forecast} code={code} />
            }
            {
              mode === "nowcast" &&
              <NowcastAlert forecast={forecast} code={code} />
            }
            <FormationOfGovernment election={code} mode={mode} forecast={forecast} />
            <VoteTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
            <SeatTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
            <Seats election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
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

export default Forecast;
