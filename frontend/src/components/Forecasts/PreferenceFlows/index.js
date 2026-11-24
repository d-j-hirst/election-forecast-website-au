import React from 'react';
import useStoredString from 'pages/Live/useStoredString';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import {coalitionAbbreviation, seriesPartyCode} from 'utils/coalition';
import {distributionBounds} from 'utils/distributionBounds';
import VoteShareRow from '../VoteTotals/VoteShareRow';
import styles from '../VoteTotals/VoteTotals.module.css';
import historyStyles from '../History/History.module.css';

// The optional live table uses the same 15 ordered percentiles as vote totals.
export function flowOptions(forecast) {
  const {statewidePreferenceFlows, partyAbbr, voteTotalThresholds} = forecast;
  if (
    !Array.isArray(statewidePreferenceFlows) ||
    !Array.isArray(partyAbbr) ||
    !Array.isArray(voteTotalThresholds) ||
    voteTotalThresholds.length !== 15
  )
    return [];

  const parties = new Map(partyAbbr);
  const label = party =>
    party === 'LNPx'
      ? 'LNP'
      : party === 'LNP'
      ? coalitionAbbreviation(forecast.termCode)
      : party;
  const options = [];

  for (const flow of statewidePreferenceFlows) {
    if (!flow) continue;
    const {sourceParty, destinationParty, otherFinalist, percentiles} = flow;
    const ids = [sourceParty, destinationParty, otherFinalist];
    const [source, destination, other] = ids.map(id =>
      seriesPartyCode(parties.get(id), id, partyAbbr, forecast.termCode)
    );
    if (
      ![source, destination, other].every(
        party => typeof party === 'string' && party
      ) ||
      new Set(ids).size !== ids.length ||
      !Array.isArray(percentiles) ||
      percentiles.length !== voteTotalThresholds.length ||
      !percentiles.every(
        (value, index) =>
          Number.isFinite(value) &&
          value >= 0 &&
          value <= 100 &&
          (index === 0 || value >= percentiles[index - 1])
      )
    )
      continue;

    // A lower percentile for one finalist is an upper percentile for the
    // other. Both bars describe the very same selection of source ballots.
    const complement = percentiles.map(value => 100 - value).reverse();
    options.push({
      key: ids.join('/'),
      label: `${label(source)} → ${label(destination)} vs ${label(other)}`,
      rows: [
        {partyAbbr: destination, freqSet: [destinationParty, percentiles]},
        {partyAbbr: other, freqSet: [otherFinalist, complement]},
      ],
    });
  }

  return options;
}

export default function PreferenceFlows({forecast, windowWidth}) {
  const [key, setKey] = useStoredString('forecast:preference-flow', '');
  const options = flowOptions(forecast);
  if (!options.length) return null;

  // The selected flow survives new publications while its three parties
  // are still offered. Both finalists share one horizontal scale.
  const selected = options.find(option => option.key === key) || options[0];
  const bounds = distributionBounds(selected.rows.map(row => row.freqSet[1]));

  return (
    <Card className={styles.summary}>
      <Card.Header
        role="heading"
        aria-level={2}
        className={styles.voteTotalsTitle}
      >
        <strong>Preference Flows</strong>
      </Card.Header>
      <Card.Body className={styles.voteTotalsBody}>
        <ListGroup className={styles.voteTotalsList}>
          <ListGroup.Item className={historyStyles.historyOptions}>
            <DropdownButton
              id="preference-flow-dropdown"
              title={`Flow: ${selected.label}`}
              variant="secondary"
            >
              {options.map(option => (
                <Dropdown.Item
                  as="button"
                  key={option.key}
                  active={option.key === selected.key}
                  onClick={() => setKey(option.key)}
                >
                  {option.label}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </ListGroup.Item>
          {selected.rows.map(row => (
            <VoteShareRow
              key={row.freqSet[0]}
              forecast={forecast}
              windowWidth={windowWidth}
              pluralNoun="preference flows"
              {...row}
              {...bounds}
            />
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

PreferenceFlows.propTypes = {
  forecast: PropTypes.object.isRequired,
  windowWidth: PropTypes.number.isRequired,
};
