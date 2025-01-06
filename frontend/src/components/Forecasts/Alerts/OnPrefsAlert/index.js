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
        className={styles.OnPrefsAlert}
        dismissible={true}
        onClose={() => setShow(false)}
      >
        <div className={styles.firstPara}>
          <InfoIcon size="large" inactive={true} warning={false} />
          <div>
            As of 6 January 2025, the estimated preference flow from One Nation
            to the Coalition has been adjusted to be stronger, based on changes
            observed in the 2024 Queensland state election and Fadden
            by-election.
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
