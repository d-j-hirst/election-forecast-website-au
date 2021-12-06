import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

//import { LOGIN_URL } from 'config/urls';
import { useUserRequired } from 'utils/hooks';
import { Layout } from 'components';
import { getDirect } from 'utils/sdk';
import styles from './Forecast.module.css';

const Forecast = () => {
  const { code } = useParams();
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  //const history = useHistory();
  const [ electionName, setElectionName ] = useState('')
  const [ reportDate, setReportDate ] = useState('')
  const [ reportDesc, setReportDesc ] = useState('')
  const [ overallWinPc, setOverallWinPc ] = useState([50, 50, 0])

  const getElectionSummary = () => {
    return getDirect('forecast-api/election-summary/2022fed').then(
      resp => {
        if (!resp.ok) throw Error("Couldn't find election data");
        return resp.data;
      }
    );
  }

  const parseDateData = raw => {
    const datetime = new Date(Date.parse(raw)).toLocaleString('en-AU');
    const parts = datetime.split(',');
    const dateParts = parts[0].split('/');
    const newDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}, ${parts[1]}`;
    console.log(newDate);
    return newDate;
  }

  useEffect(() => {
    const fetchElectionSummary = () => {
      getElectionSummary().then(
        data => {
          console.log(data);
          setElectionName(data.name);
          setReportDate(parseDateData(data.date));
          setReportDesc(data.description);
          setOverallWinPc([data.alp_overall_win_pc,
            data.lnp_overall_win_pc,
            data.oth_overall_win_pc]);
        }
      ).catch(
        e => {
          console.log(e);
        }
      );
    }
    fetchElectionSummary();
  }, []);

  return (
    <Layout className={styles.content}>
      <h1 className={styles.pageHeader}>
        Election code: <strong>{code}</strong>
        <br/>
        <br/>
        Viewing election: <strong>{electionName}</strong>
        <br/>
        <br/>
        Report date: <strong>{reportDate}</strong>
        <br/>
        <br/>
        Report description: <strong>{reportDesc}</strong>
        <br/>
        <br/>
        ALP overall win rate: <strong>{(overallWinPc[0]).toFixed(1)}%</strong>
        <br/>
        <br/>
        LNP overall win rate: <strong>{(overallWinPc[1]).toFixed(1)}%</strong>
        <br/>
        <br/>
        Other parties overall win rate: <strong>{(overallWinPc[2]).toFixed(1)}%</strong>
      </h1>
      <Link to='/'>
        <button className={styles.otherBtn}>
          Return to Home Page
        </button>
      </Link>
    </Layout>
  );
};

export default Forecast;
