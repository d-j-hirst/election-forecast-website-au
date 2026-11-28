import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ListGroup from 'react-bootstrap/ListGroup';
import {SmartBadge} from 'components/General/PartyBadge';
import InfoIcon from 'components/General/InfoIcon';
import useStoredString from 'pages/Live/useStoredString';
import {seriesPartyCode} from 'utils/coalition';
import {distributionBounds} from 'utils/distributionBounds';
import {partyAliases} from 'utils/partyAliases';
import VoteShareRow from '../VoteTotals/VoteShareRow';
import styles from '../VoteTotals/VoteTotals.module.css';
import historyStyles from '../History/History.module.css';

export const validDeviation = values =>
  Array.isArray(values) &&
  (values.length === 15 || values.length === 1) &&
  values.every(
    (v, i) =>
      Number.isFinite(v) &&
      Math.abs(v) <= 100 &&
      (i === 0 || v >= values[i - 1])
  );

// The table shares its stable category keys with the compact TPP history.
// Old forecasts can lack the entire table or an estimate for one party.
export default function VoteCategoryDeviations({forecast, windowWidth}) {
  const [showHelp, setHelp] = useState(false);
  const [key, setKey] = useStoredString('forecast:vote-category', '');
  if (forecast.voteTotalThresholds?.length !== 15) return null;
  const categories = (forecast.voteCategoryDeviations || [])
    .map(category => {
      const rows = [];
      if (validDeviation(category.tpp)) {
        rows.push({
          partyAbbr: 'ALP',
          rowLabel: 'ALP TPP',
          freqSet: [null, category.tpp],
        });
      }
      for (const [party, abbreviation] of forecast.partyAbbr || []) {
        const values = category.fp?.[party];
        if (!validDeviation(values)) continue;
        const code = partyAliases.get(abbreviation) || abbreviation;
        const partyAbbr = seriesPartyCode(
          code,
          party,
          forecast.partyAbbr,
          forecast.termCode
        );
        rows.push({partyAbbr, freqSet: [party, values]});
      }
      return {...category, rows};
    })
    .filter(category => category.rows.length);
  if (!categories.length) return null;
  const selected =
    categories.find(category => category.key === key) || categories[0];
  const bounds = distributionBounds(
    selected.rows.map(row => row.freqSet[1]),
    [0]
  );
  return (
    <Card className={styles.summary}>
      <Card.Header
        role="heading"
        aria-level={2}
        className={styles.voteTotalsTitle}
      >
        <strong>
          Vote Type Deviations&nbsp;
          <InfoIcon onClick={() => setHelp(!showHelp)} />
        </strong>
      </Card.Header>
      <Card.Body className={styles.voteTotalsBody}>
        <ListGroup className={styles.voteTotalsList}>
          {showHelp && (
            <Alert variant="info" className={styles.alert}>
              The forecast compares swings in each vote type with ordinary
              election-day booths in the same districts. A positive value means
              the category is running further towards the party than its usual
              voting pattern would suggest. The model’s adjustment is expressed
              in percentage points at the party’s projected ordinary vote share.
              The bold estimate is the median. The outer figures cover the
              middle 90% of the estimated category effect.
            </Alert>
          )}
          <ListGroup.Item className={historyStyles.historyOptions}>
            <DropdownButton
              id="vote-category-dropdown"
              title={'Vote type: ' + selected.label}
              variant="secondary"
            >
              {categories.map(category => (
                <Dropdown.Item
                  as="button"
                  key={category.key}
                  active={category.key === selected.key}
                  onClick={() => setKey(category.key)}
                >
                  {category.label}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </ListGroup.Item>
          <ListGroup.Item className={styles.voteTotalsNote}>
            Labor TPP and party FP swings relative to ordinary votes (pp)
          </ListGroup.Item>
          {selected.rows.map(row => {
            if (row.freqSet[1].length === 1)
              return (
                <ListGroup.Item
                  key={row.rowLabel || row.freqSet[0]}
                  className={styles.voteTotalsItem}
                >
                  <div className={styles.rowLeftSection}>
                    {row.rowLabel || (
                      <SmartBadge
                        party={row.partyAbbr}
                        text={row.partyAbbr}
                        termCode={forecast.termCode}
                      />
                    )}
                    &nbsp;<strong>{row.freqSet[1][0].toFixed(1)} pp</strong>
                  </div>
                  <small>Range unavailable</small>
                </ListGroup.Item>
              );
            return (
              <VoteShareRow
                key={row.rowLabel || row.freqSet[0]}
                forecast={forecast}
                windowWidth={windowWidth}
                unit=" pp"
                pluralNoun="category deviations"
                {...row}
                {...bounds}
              />
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
VoteCategoryDeviations.propTypes = {
  forecast: PropTypes.object.isRequired,
  windowWidth: PropTypes.number.isRequired,
};
