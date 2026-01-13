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

const oldElections = ['2022sa', '2022fed', '2022vic', '2023nsw', '2024qld'];
const oldElectionsLinks = {
  '2022sa': 'https://www.ecsa.sa.gov.au/elections/2022-state-election/results',
  '2022fed': 'https://results.aec.gov.au/27966/Website/HouseDefault-27966.htm',
  '2022vic':
    'https://www.vec.vic.gov.au/results/state-election-results/2022-state-election-results',
  '2023nsw': 'https://vtr.elections.nsw.gov.au/SG2301',
  '2024qld': 'https://results.elections.qld.gov.au/SGE2024',
};
const oldLiveText = {
  '2022sa': 'at the end of election night',
  '2022fed': 'after most (but not all) counting of votes',
  '2022vic': 'after most (but not all) counting of votes',
  '2023nsw': 'at the end of election night',
  '2024qld':
    'at about 10:20 p.m. on election night (ended early due to issues with comparing prepoll and postal votes)',
};

const ForecastAlert = props => {
  const [show, setShow] = useState(
    props.showInitially === undefined || props.showInitially
  );
  const isNowcast = props.mode === 'nowcast';
  const isLive = props.mode === 'live';
  const isRegular = props.mode === 'regular';
  const isArchive = props.isArchive === true;
  const isOutlook = isOutlook(props.code);
  const oldElec = oldElections.includes(props.code);
  const current = !(oldElec || isArchive);
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
                This {oldElec && (isArchive ? 'is an ' : 'was the final ')}
                {!oldElec && (isArchive ? 'is an ' : 'is a ')}
                <strong>
                  {isArchive ? 'archived ' : ''}
                  {isOutlook ? 'outlook' : 'general forecast '}
                </strong>{' '}
                report for the {props.forecast.electionName}. It estimate
                {!current ? 'd' : 's'} how the election might{' '}
                {oldElec ? 'have turned' : 'turn'} out{' '}
                <strong>when it {oldElec ? 'was' : 'is'} held</strong>
                {oldElec ? ' based on information available at the time' : ''}.
                {current && (
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
                {oldElec && (
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
                This {oldElec && (isArchive ? 'is an ' : 'was the final ')}
                {!oldElec && (isArchive ? 'is an ' : 'is a ')}
                <strong>{isArchive ? 'archived ' : ''}nowcast</strong> report,
                not a forecast for the actual election. This means it{' '}
                {oldElec ? 'was' : 'is'} an estimate of what the{' '}
                {props.forecast.electionName} might
                {!current ? ' have been' : ' be'} like{' '}
                <strong>
                  if it were held {!current ? 'at that time' : 'now'}
                </strong>
                . The election result {oldElec ? 'might have been ' : 'may be '}{' '}
                quite different when it {oldElec ? 'was' : 'is'} actually held.
                See{' '}
                <Link to={'/guide#nowcast'}>
                  this section of the forecast guide
                </Link>{' '}
                for more information.
                {current && (
                  <>
                    {' '}
                    (For a forecast of the actual election when it
                    {oldElec ? ' was ' : ' is '}
                    expected to be held, see the&nbsp;
                    <Link to={'/forecast/' + props.code + '/regular'}>
                      regular forecast
                    </Link>
                    .)
                  </>
                )}
              </div>
            </>
          )}
          {isLive && (
            <>
              <div>
                This {oldElec ? 'was' : 'is'} an{' '}
                {isArchive ? <strong>archived</strong> : ''} experimental{' '}
                <strong>live forecast</strong> of the{' '}
                {props.forecast.electionName}, incorporating official election
                results as they {oldElec ? 'were' : 'are'} reported. Please be
                aware that the development of this live forecasting process is
                incomplete, and as a result it may contain significant
                inaccuracies.
                {oldElec && !isArchive && (
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
          This report {oldElec ? 'was' : 'is'} based on publicly available
          election, polling, and candidate information, and{' '}
          {oldElec ? 'was' : 'is'} this site&apos;s best guess as to the
          probability of eventual election results based on this information.
          For more information on how these forecasts are constructed, check the{' '}
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
  mode: PropTypes.string.isRequired,
  forecast: PropTypes.object.isRequired,
  results: PropTypes.object,
  isArchive: PropTypes.bool,
  showInitially: PropTypes.bool,
};

export default ForecastAlert;
