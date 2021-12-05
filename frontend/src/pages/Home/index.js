import React, { useContext, useCallback, useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';

import { LOGIN_URL } from 'config/urls';
import { useUserRequired } from 'utils/hooks';
// import { getMeApi, isLoggedIn } from 'utils/user';
import { UserContext, Layout } from 'components';
import { logout } from './sdk';
import { getDirect } from 'utils/sdk';
import styles from './Home.module.css';
// import axios from 'axios'

// const { REACT_APP_BASE_BACKEND_URL } = process.env;

const Home = () => {
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  const history = useHistory();
  const { user, setUser } = useContext(UserContext);
  const [ electionList, setElectionList ] = useState([])

  // const getUserInfo = () => {
  //   return getMeApi().then(resp => {return resp.data;});
  // }

  // const getProtectedForecast = () => {
  //   return getDirect('forecast-api/protected').then(resp => {return resp.data;});
  // }

  // const getRestrictedForecast = () => {
  //   return getDirect('forecast-api/restricted').then(resp => {return resp.data;});
  // }

  const getElectionList = () => {
    return getDirect('forecast-api/election-list').then(
      resp => {
        if (!resp.ok) throw Error("Couldn't find election list");
        return resp.data;
      }
    );
  }

  useEffect(() => {
    const fetchElectionList = () => {
      getElectionList().then(
        data => {
          console.log(data)
          setElectionList(data);
        }
      ).catch(
        e => {
          console.log(e);
        }
      );
    }
    fetchElectionList();
  }, []);

  const handleLogout = useCallback(() => {
    logout().then(() => {
      setUser(null);
      history.push(LOGIN_URL);
    });
  }, [setUser, history]);

  if (!user) {
    return null;
  }

  // const hitPublicEndpoint = async () => {
  //   console.log("Hitting the public endpoint")
  //   const response = await axios.get(`${REACT_APP_BASE_BACKEND_URL}/forecast-api/public`);
  //   console.log(response)
  // };

  // const whoAmI = async () => {
  //   console.log("Getting current user")
  //   getUserInfo().then(data => {console.log('User request data'); console.log(data);});
  // };

  // const loginStatus = async () => {
  //   console.log("Getting login status")
  //   isLoggedIn().then(val => {console.log(val);})
  // };

  // const hitProtectedEndpoint = async () => {
  //   console.log("Find the protected page");
  //   getProtectedForecast().then(data => {console.log('Protected page check'); console.log(data);});
  // };

  // const hitRestrictedEndpoint = async () => {
  //   console.log("Find the restricted page");
  //   getRestrictedForecast().then(data => {console.log('Restricted page check'); console.log(data);});
  // };

  const listItems = electionList.map(d => <Link to={`/forecast/${d[0]}`}><button className={styles.otherBtn} >{d[1]}</button></Link>)

  return (
    <Layout className={styles.content}>
      <h1 className={styles.pageHeader}>
        You are successfully logged in to the Australian&nbsp;Election&nbsp;Forecasts
        testing website!
        <br/>
        <br/>
        You are logged in as <strong>{user.email}</strong>
        <br/>
        <br/>
        Elections:
        <br/>
        <br/>
        {listItems}
      </h1>
      <button className={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
      {/*
      <br/>
      <br/>
      <button className={styles.otherBtn} onClick={hitPublicEndpoint}>
        Public endpoint
      </button>
      <br/>
      <br/>
      <button className={styles.otherBtn} onClick={whoAmI}>
        Who am I?
      </button>
      <br/>
      <br/>
      <button className={styles.otherBtn} onClick={loginStatus}>
       Login status
      </button>
      <br/>
      <br/>
      <button className={styles.otherBtn} onClick={hitProtectedEndpoint}>
        Protected endpoint
      </button>
      <br/>
      <br/>
      <button className={styles.otherBtn} onClick={hitRestrictedEndpoint}>
        Restricted endpoint
      </button>
      */}
    </Layout>
  );
};

export default Home;
