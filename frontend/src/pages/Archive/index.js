import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useUserRequired } from 'utils/hooks';
import { Header, Footer, ForecastsNav, ForecastHeader, FormationOfGovernment,
  LoadingMarker, VoteTotals, SeatTotals, ArchiveAlert, Seats } from 'components';
import { getDirect } from 'utils/sdk';
import { useWindowDimensions } from '../../utils/window.js';

import styles from './Archive.module.css';

const Archive = () => {
  const { code, id } = useParams();
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  const [ forecast, setForecast] = useState({});
  const [ forecastValid, setForecastValid] = useState(false);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    setForecastValid(false);

    const getArchive = () => {
      const url = `forecast-api/election-archive/${code}/${id}`;
      console.log(url);
      return getDirect(url).then(
        resp => {
          if (!resp.ok) throw Error("Couldn't find election data");
          return resp.data;
        }
      );
    }

    const fetchArchive = () => {
      getArchive().then(
        data => {
          setForecast(data.report);
          document.title = `AEF - Archived ${data.report.electionName} ${data.report.reportMode === "NC" ? "nowcast" : "general forecast"}`;
          setForecastValid(true);
        }
      ).catch(
        e => {
          console.log(e);
        }
      );
    }

    fetchArchive();
  }, [code, id]);

  const mode = forecastValid ? (forecast.reportMode === "NC" ? "nowcast" : "regular") : ""

  return (
    <div className={styles.site}>
      <Header />
      {/* Even though the archived forecast is still in some mode,
          it's needed to set the mode to "other" here as that will
          keep the links clickable */}
      <ForecastsNav election={code} mode="other" />
      <div className={styles.content}>
        {forecastValid &&
          <>
            <ForecastHeader mode={mode} forecast={forecast} archive={true} />
            <ArchiveAlert forecast={forecast} code={code} />
            <FormationOfGovernment election={code} mode={mode} forecast={forecast} />
            <VoteTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
            <SeatTotals election={code} mode={mode} forecast={forecast} windowWidth={windowDimensions.width} />
            <Seats election={code} mode={mode} forecast={forecast} archiveId={id} windowWidth={windowDimensions.width} />
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

export default Archive;
