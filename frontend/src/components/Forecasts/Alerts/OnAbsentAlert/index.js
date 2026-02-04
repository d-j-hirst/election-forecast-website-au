import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';

import styles from './OnAbsentAlert.module.css';

const OnAbsentAlert = props => {
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
        className={styles.onAbsentAlert}
        dismissible={true}
        onClose={() => setShow(false)}
      >
        <div className={styles.firstPara}>
          <InfoIcon size="large" inactive={true} warning={true} />
          <div>
            There have been no polls measuring the level of One Nation support
            in this state, so One Nation is not currently included in the
            forecast. When polls are released with estimates of One Nation
            support, the forecast will be updated to include One Nation.
          </div>
        </div>
      </Alert>
    );
  } else {
    return (
      <Button onClick={() => setShow(true)} variant="info">
        Show ON absence notice ▼
      </Button>
    );
  }
};
OnAbsentAlert.propTypes = {
  code: PropTypes.string.isRequired,
  isArchive: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  showInitially: PropTypes.bool,
};

export default OnAbsentAlert;
