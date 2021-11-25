import React, { useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { LOGIN_URL } from 'config/urls';
import { useUserRequired } from 'utils/hooks';
import { UserContext, Layout } from 'components';
import { logout } from './sdk';
import styles from './Home.module.css';

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
    </Layout>
  );
};

export default Home;
