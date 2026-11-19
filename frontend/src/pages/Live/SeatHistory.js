import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import HistoryPeriodDropdown from 'components/Forecasts/History/HistoryPeriodDropdown';
import {
  ELECTION_NIGHT_MS,
  historyTimeAxis,
} from 'components/Forecasts/History/timeAxis';
import styles from 'components/Forecasts/History/History.module.css';
import SeatWinHistory from './SeatWinHistory';
import SeatVoteHistory from './SeatVoteHistory';

const measures = {
  wins: 'Win probability',
  fp: 'First preference vote',
  tcp: 'Two-candidate preferred vote',
};

export default function SeatHistory({points, parties, zone, tcpScenarios}) {
  const [measure, setMeasure] = useState('wins');
  const [eveningOnly, setEveningOnly] = useState(true);
  const samples = points.map(([time, wins, fp = [], tcp = []]) => ({
    unixDate: Date.parse(time),
    wins,
    fp,
    tcp,
  }));
  // Match the election history's first 12 hours. Candidate and pairing
  // choices still come from the latest publication, regardless of this window.
  const current = samples.at(-1);
  const start = samples[0]?.unixDate;
  const displayed = eveningOnly
    ? samples.filter(sample => sample.unixDate < start + ELECTION_NIGHT_MS)
    : samples;
  const axis =
    current &&
    historyTimeAxis(
      start,
      displayed.at(-1).unixDate,
      eveningOnly ? 'live' : 'liveEx',
      zone
    );

  return (
    <Card className={styles.summary}>
      <Card.Header as="h2" className={styles.historyTitle}>
        Seat Forecast History
      </Card.Header>
      <Card.Body className={styles.historyBody}>
        <ListGroup className={styles.historyList}>
          <ListGroup.Item className={styles.historyOptions}>
            <DropdownButton
              id="seat-history-measure"
              title={`Display: ${measures[measure]}`}
              variant="secondary"
            >
              {Object.entries(measures).map(([value, label]) => (
                <Dropdown.Item
                  as="button"
                  key={value}
                  active={value === measure}
                  onClick={() => setMeasure(value)}
                >
                  {label}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <HistoryPeriodDropdown
              id="seat-history-period"
              eveningOnly={eveningOnly}
              onChange={setEveningOnly}
            />
          </ListGroup.Item>
        </ListGroup>
        {!current && (
          <p className="m-2">Seat history is unavailable for this run.</p>
        )}
        {current && measure === 'wins' && (
          <SeatWinHistory
            samples={displayed}
            axis={axis}
            parties={parties}
            zone={zone}
          />
        )}
        {current && measure !== 'wins' && (
          <SeatVoteHistory
            key={measure}
            samples={displayed}
            axis={axis}
            current={current[measure]}
            measure={measure}
            tcpScenarios={tcpScenarios}
            parties={parties}
            zone={zone}
          />
        )}
      </Card.Body>
    </Card>
  );
}

SeatHistory.propTypes = {
  points: PropTypes.array.isRequired,
  parties: PropTypes.object.isRequired,
  zone: PropTypes.string.isRequired,
  tcpScenarios: PropTypes.array,
};
