import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Alert from 'react-bootstrap/Alert';
import {HashLink as Link} from 'react-router-hash-link';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../../General/TooltipPercentage';
import {SmartBadge} from '../../General/PartyBadge';
import InfoIcon from '../../General/InfoIcon';

import styles from '../Seats/Seats.module.css';

const SortedTcpSwingRow = props => {
  return (
    <ListGroup.Item className={styles.seatsSubitem}>
      <div style={{width: '100%'}}>
        <strong>
          <TooltipPercentage value={Math.abs(props.swing)} label="" />
        </strong>{' '}
        to <SmartBadge party={props.swing > 0 ? 'alp' : 'lnp'} />
        {' -'} {props.description}
      </div>
    </ListGroup.Item>
  );
};
SortedTcpSwingRow.propTypes = {
  swing: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
};

const SwingFactorsExplainer = props => {
  return (
    <Alert variant="info" className={styles.textLeft}>
      <p>
        These are the key factors that the model is using to estimate the
        two-party-preferred (2PP) swings in this region. These are applied to
        the previous 2PP margin to estimate the new 2PP margin. See{' '}
        <Link to="/guide#tpp-swing-factors">
          this section of the forecast guide
        </Link>{' '}
        for explanations of the different factors that may be applied.
      </p>
      <hr />
      <p>
        There are some scaling and post-processing procecures in the simulations
        in order to maintain consistency between the indiviual seats and the
        overall forecasts, so these swing factors may not line up exactly with
        the estimated margin. Additionally, when some of the
        two-candidate-preferred (TCP) scenarios are not 2PP comparisons, the 2PP
        margins shown as part of those scenarios may not be representative of
        the underlying 2PP in <i>all</i> scenarios.
      </p>
    </Alert>
  );
};

const SeatTcpSwingFactors = props => {
  const [showExplainer, setShowExplainer] = useState(false);
  const seatName = props.forecast.seatNames[props.index];
  const sortedSwingFactors = props.forecast.seatSwingFactors[props.index]
    .map(a => a.split(';'))
    .map(a => [a[0], parseFloat(a[1])])
    .filter(a => Math.abs(a[1]) > 0.01)
    .sort((e1, e2) => Math.abs(e2[1]) - Math.abs(e1[1]));

  return (
    <>
      <ListGroup.Item className={styles.seatsSubheading}>
        <strong>Two-party-preferred swing factors</strong> for {seatName}
        &nbsp;
        <InfoIcon
          onClick={() => setShowExplainer(!showExplainer)}
          warning={false}
        />
      </ListGroup.Item>
      {showExplainer && <SwingFactorsExplainer />}

      {sortedSwingFactors.map(a => (
        <SortedTcpSwingRow description={a[0]} swing={a[1]} key={a[0]} />
      ))}
      <ListGroup.Item className={styles.seatsNote}>
        Swing factors may not precisely add up to expected margins due to
        scaling and post-processing of seat results.
      </ListGroup.Item>
    </>
  );
};
SeatTcpSwingFactors.propTypes = {
  index: PropTypes.number.isRequired,
  forecast: PropTypes.object.isRequired,
};

export default SeatTcpSwingFactors;
