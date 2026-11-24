import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import InfoIcon from 'components/General/InfoIcon';
import seatTotalsStyles from 'components/Forecasts/SeatTotals/SeatTotals.module.css';
import {SmartBadge} from 'components/General/PartyBadge';
import {calledPartyCodes} from 'utils/calledParty';
import {Link} from 'react-router-dom';
import Commentary from './Commentary';
import {countTime} from 'utils/date';
import styles from 'components/Forecasts/History/History.module.css';
import MechanicalChanges, {Counts} from './MechanicalChanges';
import RecentChangesSection from './RecentChangesSection';
import useStoredString from './useStoredString';

const labels = {
  previous: 'Previous Update',
  '15m': '15 minutes',
  '1h': '1 hour',
  '3h': '3 hours',
  today: 'Today',
  '24h': '24 hours',
  yesterday: 'Yesterday’s results',
  since_start: 'Since the start',
};
const displayLabels = {numbers: 'Numbers', text: 'Text'};

function RecentChangesHelp() {
  return (
    <Alert variant="info" className={styles.alert}>
      <p>
        Choose a period to see how the forecast changed between two updates. The
        times shown are the count observations used in the comparison.
      </p>
      <hr />
      <p>
        <strong>Numbers</strong> highlights changes in seat win chances,
        government outcomes and projected vote shares. A rise from 40% to 45% is
        a rise of 5 percentage points. The count percentages use the forecast’s
        estimate of the total formal vote.
      </p>
      <hr />
      <p>
        The booth list shows selected new or revised counts. Choose{' '}
        <strong>Text</strong> for a commentary summary when one is available.
      </p>
    </Alert>
  );
}

// Use the actual reference time as the recency of a period. Several windows
// can start at the same forecast, so prefer the more recent requested cutoff
// and then the usual menu order.
function availablePeriods(windows, sourceTime, yesterday) {
  const available = Object.keys(windows).filter(
    name => windows[name]?.comparison?.available
  );
  const order = Object.keys(labels);
  const rank = name => {
    const comparison = windows[name].comparison;
    const end = name === 'yesterday' ? yesterday?.source_time : sourceTime;
    return [
      Date.parse(comparison.reference_source_time) || -Infinity,
      Date.parse(comparison.requested_reference_time) ||
        (Number.isFinite(comparison.requested_seconds)
          ? Date.parse(end) - comparison.requested_seconds * 1000
          : -Infinity),
      order.includes(name) ? order.indexOf(name) : order.length,
    ];
  };
  return available.sort((a, b) => {
    if (a === 'previous') return -1;
    if (b === 'previous') return 1;
    const [startA, requestedA, indexA] = rank(a);
    const [startB, requestedB, indexB] = rank(b);
    return startB - startA || requestedB - requestedA || indexA - indexB;
  });
}

export default function UpdateSummary({data, seatLink}) {
  const [choice, setChoice] = useStoredString(
    'liveRecentChanges:period',
    'previous'
  );
  const [displayChoice, setDisplay] = useStoredString(
    'liveRecentChanges:display',
    'numbers'
  );
  const [showHelp, setShowHelp] = useState(false);
  const display = Object.hasOwn(displayLabels, displayChoice)
    ? displayChoice
    : 'numbers';
  const available = availablePeriods(
    data.windows,
    data.source_time,
    data.yesterday
  );
  const choiceAvailable = available.includes(choice);
  const selected = choiceAvailable ? choice : available[0];

  // Retire a period once a new snapshot stops offering it. The menu can
  // display the first available window while Previous Update is missing.
  useEffect(() => {
    if (!choiceAvailable && choice !== 'previous') setChoice('previous');
  }, [choice, choiceAvailable, setChoice]);
  const entry = data.windows[selected];
  const w = entry?.comparison;
  const callChanges =
    entry?.commentary?.seat_call_changes ?? w?.seat_call_changes;
  const callList = Boolean(callChanges?.length) && (
    <ul>
      {callChanges.map(({action, party, seats, others}) => (
        <li key={action + party}>
          {action === 'called' ? 'Called for ' : 'Call withdrawn for '}
          {calledPartyCodes(data.report, party, seats).map((code, i) => (
            <React.Fragment key={code}>
              {i > 0 && '/'}
              <SmartBadge party={code} text={code} termCode={data.run.election} />
            </React.Fragment>
          ))}
          {' — '}
          {seats.map((seat, i) => (
            <React.Fragment key={seat}>
              {i > 0 && ', '}
              <Link to={seatLink(seat)}>{seat}</Link>
            </React.Fragment>
          ))}
          {others > 0 &&
            (seats.length ? ' and ' : '') +
              others +
              (seats.length ? ' other' : '') +
              (others === 1 ? ' seat' : ' seats')}
          .
        </li>
      ))}
    </ul>
  );
  const yesterday = selected === 'yesterday' && data.yesterday;
  const zone =
    w?.reporting_timezone ||
    (yesterday && yesterday.timezone) ||
    data.schedule.timezone ||
    data.run.timezone;
  const diagnostics = data.local_diagnostics === true;
  const count = yesterday
    ? w?.statewide?.after?.countProgress
    : data.report.countProgress ?? w?.statewide?.after?.countProgress;
  return (
    <Card className={styles.summary}>
      <Card.Header
        role="heading"
        aria-level={2}
        className={seatTotalsStyles.seatTotalsTitle}
      >
        <strong>
          Recent Changes&nbsp;
          <InfoIcon onClick={() => setShowHelp(!showHelp)} />
        </strong>
      </Card.Header>
      <Card.Body className={styles.historyBody}>
        <ListGroup variant="flush" className={styles.historyList}>
          {showHelp && <RecentChangesHelp />}
          {available.length > 0 && (
            <ListGroup.Item className={styles.historyOptions}>
              <DropdownButton
                id="update-period-dropdown"
                title={`Period: ${labels[selected] || selected}`}
                variant="secondary"
              >
                {available.map(period => (
                  <Dropdown.Item
                    as="button"
                    key={period}
                    active={period === selected}
                    onClick={() => setChoice(period)}
                  >
                    {labels[period] || period}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
              <DropdownButton
                id="update-display-dropdown"
                title={`Display: ${displayLabels[display]}`}
                variant="secondary"
              >
                {Object.entries(displayLabels).map(([value, label]) => (
                  <Dropdown.Item
                    as="button"
                    key={value}
                    active={value === display}
                    onClick={() => setDisplay(value)}
                  >
                    {label}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </ListGroup.Item>
          )}

          {w && (
            <ListGroup.Item className="text-center">
              {yesterday && <div>Reporting day {yesterday.report_date}</div>}
              <div>
                {countTime(w.reference_source_time, zone)} to{' '}
                {countTime(yesterday?.source_time || data.source_time, zone)}
                {Number.isFinite(w.actual_seconds) &&
                  ' (' + Math.round(w.actual_seconds / 60) + ' min)'}
                {diagnostics &&
                  w.reference_forecast_id &&
                  ' · Reference ' + w.reference_forecast_id}
                {w.input_revision_changed && ' · Forecast inputs changed'}
              </div>
            </ListGroup.Item>
          )}
          <RecentChangesSection title="Counting Progress">
            <Counts progress={count} />
          </RecentChangesSection>
          {display === 'numbers' && callList && (
            <RecentChangesSection title="Seat calls">
              {callList}
            </RecentChangesSection>
          )}
          {!w && <ListGroup.Item>No comparison available.</ListGroup.Item>}
          {w && display === 'numbers' && (
            <MechanicalChanges
              comparison={w}
              partyAbbr={data.report.partyAbbr}
              code={data.run.election}
              diagnostics={diagnostics}
              seatLink={seatLink}
            />
          )}
          {w && display === 'text' && (
            <RecentChangesSection title="Commentary">
              {callList && (
                <section aria-label="Seat calls">
                  <h4 className="h6">Seat calls</h4>
                  {callList}
                </section>
              )}
              <Commentary
                item={entry.commentary}
                parties={data.report.partyAbbr}
                seatLink={seatLink}
                code={data.run.election}
              />
              <small className="text-muted d-block mt-3">
                <strong>Glossary</strong> · pp = percentage point · FP = first
                preference (primary vote)
                {' · '}TCP = two-candidate preferred
              </small>
            </RecentChangesSection>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

UpdateSummary.propTypes = {
  data: PropTypes.object.isRequired,
  seatLink: PropTypes.func.isRequired,
};
