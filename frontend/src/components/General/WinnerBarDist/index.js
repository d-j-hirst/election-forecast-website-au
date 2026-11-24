import React from 'react';
import PropTypes from 'prop-types';

import {calledParty} from 'utils/calledParty';
import styles from './WinnerBarDist.module.css';
import WinnerBar from '../WinnerBar';

import {jsonMap} from '../../../utils/jsonmap.js';
import {seatPartyCode} from 'utils/coalition';
import {getSeatResultPartyCode} from '../../../utils/seatresults.js';

const WinnerBarDist = props => {
  const chartWidth = props.width !== undefined ? props.width : 300;
  const voteDistStyle = {
    width: chartWidth.toString() + 'px',
    position: 'relative',
    height: '30px',
    padding: '0px',
    margin: '0px auto',
  };

  const candidateNames = props.freqSet.map(e =>
    'seatCandidateNames' in props.forecast
      ? props.forecast.seatCandidateNames.length > 0
        ? jsonMap(props.forecast.seatCandidateNames[props.index], e[0], null)
        : ''
      : null
  );

  const call =
    props.forecast.seatCalls?.[props.forecast.seatNames?.[props.index]];
  const label =
    call &&
    calledParty(props.forecast, call.party, [
      props.forecast.seatNames[props.index],
    ]);
  let bars = undefined;
  let currentPercent = 0;
  const namedIndependentExists =
    props.freqSet.filter(a => jsonMap(props.forecast.partyAbbr, a[0]) === 'IND')
      .length > 1;
  bars = props.freqSet.map((freq, index) => {
    const left = Math.ceil(chartWidth * currentPercent * 0.01);
    const width = Math.ceil(chartWidth * freq[1] * 0.01);
    currentPercent += freq[1];
    const abbr =
      freq[0] === -2 ? 'indx' : jsonMap(props.forecast.partyAbbr, freq[0]);
    const seatParty = seatPartyCode(
      abbr,
      props.forecast.termCode,
      props.forecast.seatNames[props.index]
    );
    const name =
      freq[0] === -2
        ? namedIndependentExists
          ? 'Any other independent'
          : 'Any independent'
        : seatParty === 'LNPx'
        ? 'Liberal National Party'
        : seatParty === 'LIB'
        ? 'Liberal Party'
        : jsonMap(props.forecast.partyName, freq[0]);
    return {
      candidateName: candidateNames[index],
      // Compare observed identity before applying display-only party labels.
      eventualWinner:
        props.result != null &&
        props.result ===
          getSeatResultPartyCode(freq[0], props.forecast.partyAbbr),
      partyAbbr: abbr,
      partyName: name,
      winPercent: freq[1],
      xHigh: left + width,
      xLow: left,
    };
  });

  return (
    <div style={voteDistStyle}>
      {bars.map((bar, index) => {
        return <WinnerBar bar={bar} key={index} />;
      })}
      {label && <span className={styles.called}>Called for {label}</span>}
    </div>
  );
};
WinnerBarDist.propTypes = {
  index: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  freqSet: PropTypes.array.isRequired,
  forecast: PropTypes.object.isRequired,
  result: PropTypes.string,
};

export default WinnerBarDist;
