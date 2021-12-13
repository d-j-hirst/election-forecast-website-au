import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useUserRequired } from 'utils/hooks';
import { Header, ForecastsNav, ForecastSummary } from 'components';
import { getDirect } from 'utils/sdk';
import './Forecast.module.css';

const Forecast = () => {
  const { code, mode } = useParams();
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  const [ forecast, setForecast] = useState({})

  const parseDateData = raw => {
    const datetime = new Date(Date.parse(raw)).toLocaleString('en-AU');
    const parts = datetime.split(',');
    const dateParts = parts[0].split('/');
    const newDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}, ${parts[1]}`;
    console.log(newDate);
    return newDate;
  }

  useEffect(() => {

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
          const forecast = {
            name: data.name,
            date: parseDateData(data.date),
            description: data.description,
            overallWinPercent: {alp: data.alp_overall_win_pc,
                                lnp: data.lnp_overall_win_pc,
                                oth: data.oth_overall_win_pc}
          };
          setForecast(forecast);
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
      <ForecastSummary election={code} mode={mode} forecast={forecast} />
    </>
  );
};

export default Forecast;
