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

  const getElectionSummary = () => {
    return getDirect('forecast-api/election-summary/2022fed').then(
      resp => {
        if (!resp.ok) throw Error("Couldn't find election data");
        return resp.data;
      }
    );
  }

  useEffect(() => {
    const fetchElectionSummary = () => {
      getElectionSummary().then(
        data => {
          console.log(data);
          setElectionName(data.name);
          setReportDate(data.date);
          setReportDesc(data.description);
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
