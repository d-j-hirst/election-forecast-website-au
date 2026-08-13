import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';
import {
  DISMISSED_METHOD_CHANGES_KEY,
  formatMethodChangeDate,
  getApplicableRecentMethodChanges,
  methodChangeKey,
  methodsChanges,
  parseDismissedMethodChangeKeys,
} from '../../../../config/methodsChanges.js';

import styles from './MethodsChangesAlert.module.css';

const getDismissedKeys = () => {
  try {
    return parseDismissedMethodChangeKeys(
      localStorage.getItem(DISMISSED_METHOD_CHANGES_KEY)
    );
  } catch (error) {
    return [];
  }
};

const MethodsChangesAlert = props => {
  const [dismissedKeys, setDismissedKeys] = useState(getDismissedKeys);
  const [showDismissedAlert, setShowDismissedAlert] = useState(false);
  const applicableChanges = getApplicableRecentMethodChanges({
    changes: props.changes,
    mode: props.mode,
    reportDate: props.reportDate,
    now: props.now,
  });
  const hasUnseenChange = applicableChanges.some(
    change => !dismissedKeys.includes(methodChangeKey(change))
  );

  const closeAlert = () => {
    const nextDismissedKeys = [
      ...new Set([...dismissedKeys, ...applicableChanges.map(methodChangeKey)]),
    ];
    setDismissedKeys(nextDismissedKeys);
    setShowDismissedAlert(false);
    try {
      localStorage.setItem(
        DISMISSED_METHOD_CHANGES_KEY,
        JSON.stringify(nextDismissedKeys)
      );
    } catch (error) {
      // Component state still dismisses the alert when storage is unavailable.
    }
  };

  if (props.isArchive || applicableChanges.length === 0) return null;

  if (!hasUnseenChange && !showDismissedAlert) {
    return (
      <Button onClick={() => setShowDismissedAlert(true)} variant="info">
        Show recent major methods changes ▼
      </Button>
    );
  }

  return (
    <Alert
      variant="info"
      className={styles.methodsChangesAlert}
      dismissible={true}
      onClose={closeAlert}
    >
      <div className={styles.firstPara}>
        <InfoIcon size="large" inactive={true} warning={false} />
        <div>
          <p className={styles.centeredText}>
            The following recent major methods changes have affected this
            report:
          </p>
          <div>
            {applicableChanges.map(change => (
              <p key={methodChangeKey(change)} className={styles.centeredText}>
                <strong>{formatMethodChangeDate(change.date)}:</strong>{' '}
                {change.shortDescription}
              </p>
            ))}
          </div>
          <p className={styles.detailsLine}>
            Read the full details on the{' '}
            <Link to="/methods#recent-methods-changes">methods page</Link>.
          </p>
        </div>
      </div>
    </Alert>
  );
};

MethodsChangesAlert.defaultProps = {
  changes: methodsChanges,
};

MethodsChangesAlert.propTypes = {
  changes: PropTypes.array,
  isArchive: PropTypes.bool,
  mode: PropTypes.string.isRequired,
  now: PropTypes.instanceOf(Date),
  reportDate: PropTypes.string,
};

export default MethodsChangesAlert;
