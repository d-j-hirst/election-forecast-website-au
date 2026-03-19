import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';

import styles from './OnPrefsAlert.module.css';

const OnPrefsAlert = props => {
  const [show, setShow] = useState(
    props.showInitially === undefined || props.showInitially
  );
  const isLive = props.mode === 'live';
  if (props.isArchive === true || isLive || props.code !== '2025fed') {
    return null;
  }
  if (show) {
    return (
      <Alert
        variant="info"
        className={styles.onPrefsAlert}
        dismissible={true}
        onClose={() => setShow(false)}
      >
        <div className={styles.firstPara}>
          <InfoIcon size="large" inactive={true} warning={false} />
          <div>
            On election night, a <strong>live forecast</strong> will be run,
            updated using the latest official election results as they come in.
            On election night, choose &quot;Live Forecast&quot; from the
            &quot;Modes&quot; menu to view the live forecast. It will continue
            to be updated throughout the night and most likely during further
            counting in the following days.
          </div>
        </div>
      </Alert>
    );
  } else {
    return (
      <Button onClick={() => setShow(true)} variant="info">
        Show ON preferences notice ▼
      </Button>
    );
  }
};
OnPrefsAlert.propTypes = {
  code: PropTypes.string.isRequired,
  isArchive: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  showInitially: PropTypes.bool,
};

export default OnPrefsAlert;
