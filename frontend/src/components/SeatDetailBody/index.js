import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import TooltipPercentage from '../TooltipPercentage';
import ProbStatement from '../ProbStatement';
import ProbBarDist from '../ProbBarDist';
import WinnerBarDist from '../WinnerBarDist';
import { SmartBadge } from '../PartyBadge';

import { jsonMap } from '../../utils/jsonmap.js';
import { deepCopy } from '../../utils/deepcopy.js';

import styles from './SeatDetailBody.module.css';
import { standardiseParty } from 'utils/partyclass';

const partyCategory = (party, forecast) => {
    const sp = standardiseParty(party).toLowerCase();
    if (sp === 'grn') return -2;
    if (sp === 'alp') return -1;
    if (sp === 'kap') return 1;
    if (sp === 'lnp') return 2;
    if (sp === 'onp') return 3;
    if (sp === 'uap') return 3;
    return 0;
}

const SeatSummary = props => {

    const incumbentIndex = props.forecast.seatIncumbents[props.index];
    const incumbentAbbr = jsonMap(props.forecast.partyAbbr, incumbentIndex);
    const margin = props.forecast.seatMargins[props.index];

    const freqs = deepCopy(props.forecast.seatPartyWinFrequencies[props.index]);
    freqs.sort((a, b) => {
        const aName = jsonMap(props.forecast.partyAbbr, a[0]);
        const bName = jsonMap(props.forecast.partyAbbr, b[0]);
        return partyCategory(aName) - partyCategory(bName);
    });

    // const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
    return (
        <ListGroup.Item className={styles.seatsItem}>
            <div className={styles.seatsTopLeft}>
                Held by <SmartBadge party={incumbentAbbr} /> with margin {Number(margin).toFixed(1)}%
                <br/>
            </div>
            <WinnerBarDist forecast={props.forecast}
                           freqSet={freqs}
            />
        </ListGroup.Item>
    );
}

const SeatFpSection = props => {
  const seatName = props.forecast.seatNames[props.index];
  // create deep copy of the fp probability bands
  const fpFreqs = deepCopy(props.forecast.seatFpBands[props.index]);
  const sortedFreqs = fpFreqs
      .sort((el1, el2) => el2[1][7] - el1[1][7]);
  const maxFpTotal = Math.max(...sortedFreqs.map(el => Math.max(...el[1])));
  return (
      <>
          <ListGroup.Item className={styles.seatsSubheading} key={props.index}>

              <strong>First preference projection</strong> for {seatName}
          </ListGroup.Item>
          {
              sortedFreqs.map((freqSet, index) =>
                  <SeatFpRow forecast={props.forecast}
                              freqSet={freqSet}
                              maxVoteTotal={maxFpTotal}
                              minVoteTotal={0}
                              key={index}
                  />
              )
          }
      </>
  )
}

const SeatFpRow = props => {
  const partyAbbr = jsonMap(props.forecast.partyAbbr, props.freqSet[0]);
  const thresholds = [[0,2,0],[2,4,1],[4,6,2],[6,8,3],[8,10,4],[10,12,5],[12,14,6]];
  return (
      <ListGroup.Item className={styles.seatsSubitem}>
          <SmartBadge party={partyAbbr} /> - <TooltipPercentage value={props.freqSet[1][4]} />
          {" - "}{<strong><TooltipPercentage value={props.freqSet[1][7]} /></strong>}
          {" - "}{<TooltipPercentage value={props.freqSet[1][10]} />}
          <ProbBarDist freqSet={props.freqSet}
                       thresholds={thresholds}
                       partyAbbr={partyAbbr}
                       minVoteTotal={props.minVoteTotal}
                       maxVoteTotal={props.maxVoteTotal}
                       thresholdLevels={props.forecast.voteTotalThresholds}
                       pluralNoun="vote totals"
                       valType="percentage"
          />
      </ListGroup.Item>
  );
}

const SeatTcpSection = props => {
  const seatName = props.forecast.seatNames[props.index];
  const tcpFreqs = deepCopy(props.forecast.seatTcpBands[props.index]);
  const sortedTcpFreqs = tcpFreqs
      .map((e, i) => e.concat(props.forecast.seatTcpScenarios[props.index][i][1]))
      .sort((e1, e2) => e2[2] - e1[2]);
  return (
      <>
          <ListGroup.Item className={styles.seatsSubheading} key={props.index}>
              <strong>Two-candidate preferred scenarios</strong> for {seatName}
          </ListGroup.Item>
          {
              sortedTcpFreqs.map((freqSet, index) =>
                  <SeatTcpRowPair forecast={props.forecast}
                                  freqSet={freqSet}
                                  key={index}
                  />
              )
          }
      </>
  )
}

const SeatTcpRowPair = props => {
  const freqSet0 = [props.freqSet[0][0], props.freqSet[1]];
  const freqSet1 = [props.freqSet[0][1], props.freqSet[1].map(a => 100 - a).reverse()];
  const maxVoteTotal = Math.max(Math.max(...freqSet0[1]), Math.max(...freqSet1[1]));
  const minVoteTotal = Math.min(Math.min(...freqSet0[1]), Math.min(...freqSet1[1]));

  const partyAbbr0 = jsonMap(props.forecast.partyAbbr, freqSet0[0]);
  const partyAbbr1 = jsonMap(props.forecast.partyAbbr, freqSet1[0]);
  return (
      <>
          <ListGroup.Item className={styles.seatsTcpScenarioHeading} key={props.index}>
              <SmartBadge party={partyAbbr0} />
              { } vs { }
              <SmartBadge party={partyAbbr1} />
              { } - probability this scenario occurs: { }
              <strong><TooltipPercentage value={props.freqSet[2] * 100} /></strong>
          </ListGroup.Item>
          <SeatFpRow forecast={props.forecast}
                  freqSet={freqSet0}
                  minVoteTotal={minVoteTotal}
                  maxVoteTotal={maxVoteTotal}
          />
          <SeatFpRow forecast={props.forecast}
                  freqSet={freqSet1}
                  minVoteTotal={minVoteTotal}
                  maxVoteTotal={maxVoteTotal}
          />
      </>
  );
}

const SeatWinsSection = props => {
  const seatName = props.forecast.seatNames[props.index];

  const freqs = deepCopy(props.forecast.seatPartyWinFrequencies[props.index]);
  const sortedFreqs = freqs
      .sort((a, b) => b[1] - a[1]);
  return (
      <>
          <ListGroup.Item className={styles.seatsSubheading} key={props.index}>
              <strong>Win Probabilities</strong> for {seatName}
          </ListGroup.Item>
          <ListGroup.Item className={styles.seatsMore} key={props.index+1000}>
              {
                  sortedFreqs.map(
                      (a, index) => {
                          let text = "Independent";
                          const party = a[0];
                          if (party === -3) text = "An emerging party";
                          if (party === -2) text = "An emerging independent";
                          return (
                              <>
                                  <div className={styles.seatsWinStatement} key={index}>
                                      <ProbStatement forecast={props.forecast}
                                                  party={a[0]}
                                                  prob={a[1]}
                                                  text={text}
                                                  outcome={"win " + seatName}
                                                  key={index}
                                      />
                                  </div>
                              </>
                          )
                      }
                  )
              }
          </ListGroup.Item>
      </>
  )
}

const SeatDetailBody = props => {
    const seatName = props.forecast.seatNames[props.index];

    return (
        <Card className={styles.summary}>
            <Card.Header className={styles.seatsTitle}>
                Seat details for {seatName}
            </Card.Header>
            <Card.Body className={styles.seatTotalsBody}>
                <SeatSummary forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
                <SeatWinsSection forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
                <SeatFpSection forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
                <SeatTcpSection forecast={props.forecast}
                            election={props.election}
                            mode={props.mode}
                            index={props.index}
                />
            </Card.Body>
        </Card>
    );
}

export default SeatDetailBody;