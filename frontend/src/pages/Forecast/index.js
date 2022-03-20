import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
  LoadingMarker, VoteTotals, SeatTotals, NowcastAlert, ForecastAlert,
  LiveOldAlert, Seats, StandardErrorBoundary } from 'components';
import { getDirect } from 'utils/sdk';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Forecast.module.css';

const Forecast = () => {
  const { code, mode } = useParams();
  const location = useLocation();
  const [ forecast, setForecast] = useState({});
  const [ forecastValid, setForecastValid] = useState(false);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    setForecastValid(false);
  }, [location]);

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
          const modeTitles = {FC: "General Forecast", NC: "Nowcast", LF: "Live Forecast"};
          const modeTitle = modeTitles[data.report.reportMode];
          document.title = `AEF - ${data.report.electionName} ${modeTitle}`;
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

  // This section prevents the leftover UI from the previous forecast 
  // being displayed just after a new one has been clicked.
  const modeNames = {RF: "regular", NC: "nowcast", LF: "live"};
  let showForecast = true;
  if (forecast.reportMode !== undefined && modeNames[forecast.reportMode] !== mode) {
    showForecast = false;
  }

  return (
    <div className={styles.site}>
      <Header windowWidth={windowDimensions.width} page={"forecast"} />
      <ForecastsNav election={code} mode={mode} />
      <div className={styles.content}>
        <StandardErrorBoundary>
          {forecastValid && showForecast &&
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
              {
                mode === "live" &&
                <LiveOldAlert forecast={forecast} code={code} />
              }
              <StandardErrorBoundary>
                <FormationOfGovernment election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
              </StandardErrorBoundary>
              <StandardErrorBoundary>
                <VoteTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
              </StandardErrorBoundary>
              <StandardErrorBoundary>
                <SeatTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
              </StandardErrorBoundary>
              <StandardErrorBoundary>
                <Seats election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
              </StandardErrorBoundary>
            </>
          }
          {(!forecastValid || !showForecast) &&
            <LoadingMarker />
          }
        </StandardErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

export default Forecast;
