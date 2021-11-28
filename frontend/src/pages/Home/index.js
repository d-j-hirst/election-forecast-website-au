import React, { useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { LOGIN_URL } from 'config/urls';
import { useUserRequired, getMeApi, isLoggedIn } from 'utils/hooks';
import { UserContext, Layout } from 'components';
import { logout } from './sdk';
import { getDirect } from 'utils/sdk';
import styles from './Home.module.css';
import axios from 'axios'

const { REACT_APP_BASE_BACKEND_URL } = process.env;

const Home = () => {
  // Putting this here instructs the frontend to only display this page
  // if a valid user is logged in. As always, don't trust the client
  // and protect on the backend as well!
  useUserRequired();
  const history = useHistory();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = useCallback(() => {
    logout().then(() => {
      setUser(null);
      history.push(LOGIN_URL);
    });
  }, [setUser, history]);

  if (!user) {
    return null;
  }

  const getUserInfo = () => {
    return getMeApi().then(resp => {return resp.data;});
  }

  const getProtectedForecast = () => {
    return getDirect('forecasts/protected').then(resp => {return resp.data;});
  }

  const getRestrictedForecast = () => {
    return getDirect('forecasts/restricted').then(resp => {return resp.data;});
  }

  const hitPublicEndpoint = async () => {
    console.log("Hitting the public endpoint")
    const response = await axios.get(`${REACT_APP_BASE_BACKEND_URL}/forecasts/public`);
    console.log(response)
  };

  const whoAmI = async () => {
    console.log("Getting current user")
    getUserInfo().then(data => {console.log('User request data'); console.log(data);});
  };

  const loginStatus = async () => {
    console.log("Getting login status")
    isLoggedIn().then(val => {console.log(val);})
  };

  const hitProtectedEndpoint = async () => {
    console.log("Find the protected page");
    getProtectedForecast().then(data => {console.log('Protected page check'); console.log(data);});
  };

  const hitRestrictedEndpoint = async () => {
    console.log("Find the restricted page");
    getRestrictedForecast().then(data => {console.log('Restricted page check'); console.log(data);});
  };

  return (
    <Layout className={styles.content}>
      <h1 className={styles.pageHeader}>
        You are successfully logged in to the Australian Election Forecasts
        testing website!
        <br/>
        <br/>
        You are logged in as <strong>{user.email}</strong>
      </h1>
      <button className={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
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
    </Layout>
  );
};

export default Home;
