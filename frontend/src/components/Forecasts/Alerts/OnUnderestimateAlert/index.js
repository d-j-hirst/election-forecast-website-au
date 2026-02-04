import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';

import styles from './OnUnderestimateAlert.module.css';

const OnUnderestimateAlert = props => {
  const [show, setShow] = useState(
    props.showInitially === undefined || props.showInitially
  );
  const isLive = props.mode === 'live';
  if (props.isArchive === true || isLive) {
    return null;
  }
  if (show) {
    return (
      <Alert
        variant="warning"
        className={styles.onUnderestimateAlert}
        dismissible={true}
        onClose={() => setShow(false)}
      >
        <div className={styles.firstPara}>
          <InfoIcon size="large" inactive={true} warning={true} />
          <div>
            There have been very few polls measuring the level of One Nation
            support in this state. Until more polls are available, it is likely
            that the current forecast will underestimate One Nation support
            based on federal polling.
          </div>
        </div>
      </Alert>
    );
  } else {
    return (
      <Button onClick={() => setShow(true)} variant="info">
        Show ON underestimate notice ▼
      </Button>
    );
  }
};
OnUnderestimateAlert.propTypes = {
  code: PropTypes.string.isRequired,
  isArchive: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  showInitially: PropTypes.bool,
};

export default OnUnderestimateAlert;
