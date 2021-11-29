import React, { useCallback } from 'react';

import GoogleButton from 'react-google-button';

import { Layout } from 'components';

import styles from './Login.module.css';

const { REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_BASE_BACKEND_URL } = process.env;

const Login = () => {

  // Defines the procedure when the user clicks on the Google Login button
  const openGoogleLoginPage = useCallback(() => {
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const redirectUri = 'auth-api/v1/auth/login/google/';

    // We don't really need to know anything other than the email
    // address, so don't ask for it
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');

    // Parameters for the login request sent to Google
    const params = {
      response_type: 'code',
      client_id: REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: `${REACT_APP_BASE_BACKEND_URL}/${redirectUri}`,
      prompt: 'select_account',
      access_type: 'offline',
      scope
    };

    // Turn the above into a string to be appended to the URL
    const urlParams = new URLSearchParams(params).toString();

    // Make the URL and send the user there for authentication
    window.location = `${googleAuthUrl}?${urlParams}`;
  }, []);

  return (
    <Layout className={styles.content}>
      <h1 className={styles.pageHeader}>
        Welcome to the Australian Election Forecasting Website!
        <br/>
        <br/>
        This site is currently under construction and only authorized testers can access.
        <br/>
        <br/>
        If you are such a tester, click the button below to sign in with your Google account.
      </h1>

      {/* Disable the button if there is no value for the Google client id */}
      <GoogleButton
        onClick={openGoogleLoginPage}
        label="Sign in with Google"
        disabled={!REACT_APP_GOOGLE_CLIENT_ID}
      />
    </Layout>
  );
};

export default Login;
