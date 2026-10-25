import React from 'react';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet-async';
import {Link} from 'react-router-dom';
import {Header, Footer, MainContent} from 'components';
import {DEFAULT_ELECTION_CODE, DEFAULT_FORECAST_URL} from 'config/urls';
import {useWindowDimensions} from '../../utils/window';
import styles from './NotFound.module.css';

// Keep an unrecognized address visible and offer explicit recovery destinations.
// Invalid archive parameters can retain their election's archive-list link.
const NotFound = ({code = DEFAULT_ELECTION_CODE}) => {
  const {width} = useWindowDimensions();
  return (
    <div className={styles.site}>
      <Helmet>
        <title>AEF - Page not found</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header windowWidth={width} page="" />
      <MainContent className={styles.content}>
        <h1>Page not found</h1>
        <p>We couldn&apos;t find a page at this address.</p>
        <p>
          <Link to={DEFAULT_FORECAST_URL}>Browse current forecasts</Link>
        </p>
        <p>
          <Link to={`/forecast/${encodeURIComponent(code)}/archives`}>
            Browse forecast archives
          </Link>
        </p>
      </MainContent>
      <Footer />
    </div>
  );
};
NotFound.propTypes = {code: PropTypes.string};

export default NotFound;
