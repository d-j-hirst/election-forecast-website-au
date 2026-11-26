import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import {publicReplayLinks} from 'config/publicReplayLinks';
import InfoIcon from 'components/General/InfoIcon';
import useStoredBoolean from 'pages/Live/useStoredBoolean';
import styles from './VictorianLiveAnnouncement.module.css';

// The announcement belongs to the current Victorian polling forecast. Its
// disclosure follows the reader between the statewide and district pages.
export default function VictorianLiveAnnouncement({counting, seat}) {
  const [collapsed, setCollapsed] = useStoredBoolean(
    '2026vic:liveAnnouncementCollapsed'
  );
  const livePath = seat
    ? '/seat/2026vic/live/' + seat
    : '/forecast/2026vic/live';
  return (
    <Alert
      variant="info"
      role="region"
      show
      dismissible={!collapsed}
      closeLabel="Collapse live forecast announcement"
      onClose={() => setCollapsed(true)}
      aria-label="Victorian live forecast"
      className={styles.announcement}
    >
      <div className={styles.announcementHeader}>
        <InfoIcon inactive />
        <strong>
          {counting && (
            <Link to={livePath}>Follow the live Victorian forecast</Link>
          )}
          {!counting && 'Live forecast from election night'}
        </strong>
        {collapsed && (
          <button
            type="button"
            aria-label="Show details"
            title="Show details"
            aria-expanded={false}
            aria-controls="vic-live-details"
            className={styles.reopen}
            onClick={() => setCollapsed(false)}
          >
            <span aria-hidden="true">▼</span>
          </button>
        )}
      </div>
      <div id="vic-live-details" hidden={collapsed}>
        <p>
          {counting
            ? 'The live forecast is updating as results come in and will continue through to the end of the count.'
            : 'For the upcoming Victorian election, the live forecast will update as results come in, starting on election night and continuing through to the end of the count.'}
        </p>
        <p>
          The live forecast has been tested by replaying previous elections in
          full. Step through the{' '}
          <Link to={publicReplayLinks['2026sa']}>
            2026 South Australian election replay
          </Link>{' '}
          or the{' '}
          <Link to={publicReplayLinks['2022vic']}>
            2022 Victorian election replay
          </Link>{' '}
          to see how it would have responded as results came in.
        </p>
      </div>
    </Alert>
  );
}

VictorianLiveAnnouncement.propTypes = {
  counting: PropTypes.bool.isRequired,
  seat: PropTypes.string,
};
