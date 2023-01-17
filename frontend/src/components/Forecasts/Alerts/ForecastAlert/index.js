import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';
import {ExtLink} from '../../../../utils/extlink.js';

import quantityMarkerExample from './assets/quantity-marker-example.png';
import categoryMarkerExample from './assets/category-marker-example.png';
import styles from './ForecastAlert.module.css';

const oldElections = ['2022sa', '2022fed', '2022vic'];
const oldElectionsLinks = {
  '2022sa': 'https://www.ecsa.sa.gov.au/elections/2022-state-election/results',
  '2022fed': 'https://results.aec.gov.au/27966/Website/HouseDefault-27966.htm',
  '2022vic':
    'https://www.vec.vic.gov.au/results/state-election-results/2022-state-election-results',
};
const oldLiveText = {
  '2022sa': 'at the end of election night',
  '2022fed': 'after most (but not all) counting of votes',
  '2022vic': 'after most (but not all) counting of votes',
};

const ForecastAlert = props => {
  const [show, setShow] = useState(
    props.showInitially === undefined || props.showInitially
  );
  const isNowcast = props.forecast.reportMode === 'NC';
  const isLive = props.forecast.reportMode === 'LF';
  const isRegular = props.forecast.reportMode === 'RF';
  const isArchive = props.isArchive === true;
  const old = isArchive || oldElections.includes(props.code);
  const isWarning = isNowcast || isLive || props.isArchive;
  const alertVariant = isWarning ? 'warning' : 'info';
  if (show) {
    return (
      <Alert
        variant={alertVariant}
        className={isWarning ? styles.nowcastAlert : styles.forecastAlert}
        dismissible={true}
        onClose={() => setShow(false)}
      >
        <div className={styles.firstPara}>
          <InfoIcon size="large" inactive={true} warning={isWarning} />
          {isRegular && (
            <>
              <div>
                This {old && (isArchive ? 'is an ' : 'was the final ')}
                {!old && (isArchive ? 'is an ' : 'is a ')}
                <strong>
                  {isArchive ? 'archived ' : ''}general forecast
                </strong>{' '}
                report for the {props.forecast.electionName}. It estimate
                {old ? 'd' : 's'} how the election might{' '}
                {old ? 'have turned' : 'turn'} out{' '}
                <strong>when it {old ? 'was' : 'is'} held</strong>
                {old ? ' based on information available at the time' : ''}.
                {!old && (
                  <>
                    {' '}
                    For an estimate of how the election would appear if held
                    now, see the&nbsp;
                    <Link to={'/forecast/' + props.code + '/nowcast'}>
                      nowcast
                    </Link>
                    .
                  </>
                )}
                {old && (
                  <>
                    {' '}
                    View the official results{' '}
                    <ExtLink href={oldElectionsLinks[props.code]}>here</ExtLink>
                    .
                  </>
                )}
              </div>
            </>
          )}
          {isNowcast && (
            <>
              <div>
                This {old && (isArchive ? 'is an' : 'was the final')}
                {!old && (isArchive ? 'is an' : 'is a')}
                <strong>{isArchive ? 'archived ' : ''}nowcast</strong> report,
                not a forecast for the actual election. This means it{' '}
                {old ? 'was' : 'is'} an estimate of what the{' '}
                {props.forecast.electionName} might be like{' '}
                <strong>if it were held {old ? 'at that time' : 'now'}</strong>.
                The election result {old ? 'might have been ' : 'may be '} quite
                different when it {old ? 'was' : 'is'} actually held. See{' '}
                <Link to={'/guide#nowcast'}>
                  this section of the forecast guide
                </Link>
                for more information. (For a forecast for the election when it{' '}
                {old ? 'was' : 'is'} expected to be held, see the&nbsp;
                <Link to={'/forecast/' + props.code + '/regular'}>
                  regular forecast
                </Link>
                .)
              </div>
            </>
          )}
          {isLive && (
            <>
              <div>
                This {old ? 'was' : 'is'} an{' '}
                {isArchive ? <strong>archived</strong> : ''} experimental{' '}
                <strong>live forecast</strong> of the{' '}
                {props.forecast.electionName}, incorporating official election
                results as they {old ? 'were' : 'are'} reported. Please be aware
                that the development of this live forecasting process is
                incomplete, and as a result it may contain significant
                inaccuracies.
                {old && !isArchive && (
                  <>
                    <hr />
                    This was the the final such forecast made{' '}
                    {oldLiveText[props.code]}, visible for historical purposes
                    only. It represents the apparent state of play at that time,
                    and has not and will not be updated further from there.
                  </>
                )}{' '}
                View the official results{' '}
                <ExtLink href={oldElectionsLinks[props.code]}>here</ExtLink>.
              </div>
            </>
          )}
        </div>
        {props.results && (
          <>
            <hr />
            <div>
              The <strong>final results</strong> for this election have been
              published, and to ease comparison, the elements below have been
              marked to indicate the final result.
              <br />
              For estimates of particular quantities (such as vote share or seat
              totals) this will take the form of a marker showing the position
              of the official results, for example:
              <img src={quantityMarkerExample} alt="Quantity marker example" />
              <br />
              For categorical predictions (such as the winner of a seat) the
              final result is indicated by a thick border:
              <img src={categoryMarkerExample} alt="Category marker example" />
            </div>
          </>
        )}
        <hr />
        <p>
          This report {old ? 'was' : 'is'} based on publicly available election,
          polling, and candidate information, and {old ? 'was' : 'is'} this
          site&apos;s best guess as to the probability of eventual election
          results based on this information. For more information on how these
          forecasts are constructed, check the{' '}
          <Link to={'/guide'}>forecast guide</Link>, the{' '}
          <Link to={'/methodology'}>methodology&nbsp;page</Link> or the{' '}
          <ExtLink href="https://github.com/d-j-hirst/aus-polling-analyser">
            source code on Github
          </ExtLink>
          .
        </p>
        <hr />
        <p>
          <InfoIcon inactive={true} /> icons below can be clicked for
          explanations of what each part of the report means.
          <br />
          <InfoIcon inactive={true} warning={true} /> icons mark parts of the
          report that are included for completeness but should be interpreted
          with caution - click the icons to read the warning.
        </p>
      </Alert>
    );
  } else {
    return (
      <Button onClick={() => setShow(true)} variant={alertVariant}>
        Show introduction alert ▼
      </Button>
    );
  }
};
ForecastAlert.propTypes = {
  code: PropTypes.string.isRequired,
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  isArchive: PropTypes.bool,
  showInitially: PropTypes.bool,
};

export default ForecastAlert;
