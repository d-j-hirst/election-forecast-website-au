import React from 'react';

import Alert from 'react-bootstrap/Alert';

import InfoIcon from '../../General/InfoIcon';

import styles from '../../Forecasts/Alerts/ForecastAlert/ForecastAlert.module.css';

const GlossaryAlert = props => {
  return (
    <Alert variant="info" className={styles.forecastAlert}>
      <div className={styles.firstPara}>
        <InfoIcon size="large" inactive={true} warning={false} />
        <div>
          This term is no longer actively used on this website, as the method it
          was once used for is obsolete and has been replaced. This entry is
          maintained for historical reasons.
        </div>
      </div>
    </Alert>
  );
};

export default GlossaryAlert;
