import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import InfoIcon from '../../../General/InfoIcon';
import {ExtLink} from '../../../../utils/extlink.js';
import {isOutlook} from '../../../../utils/outlook.js';

import quantityMarkerExample from './assets/quantity-marker-example.png';
import categoryMarkerExample from './assets/category-marker-example.png';
import styles from './ForecastAlert.module.css';

const oldElections = [
  '2022sa',
  '2022fed',
  '2022vic',
  '2023nsw',
  '2024qld',
  '2025wa',
  '2025fed',
];
const oldElectionsLinks = {
  '2022sa': 'https://www.ecsa.sa.gov.au/elections/2022-state-election/results',
  '2022fed': 'https://results.aec.gov.au/27966/Website/HouseDefault-27966.htm',
  '2022vic':
    'https://www.vec.vic.gov.au/results/state-election-results/2022-state-election-results',
  '2023nsw': 'https://vtr.elections.nsw.gov.au/SG2301',
  '2024qld': 'https://results.elections.qld.gov.au/SGE2024',
  '2025fed': 'https://results.aec.gov.au/31496/Website/HouseDefault-31496.htm',
  '2026sa': 'https://result.ecsa.sa.gov.au/',
};
const oldLiveText = {
  '2022sa': 'at the end of election night',
  '2022fed': 'after most (but not all) counting of votes',
  '2022vic': 'after most (but not all) counting of votes',
  '2023nsw': 'at the end of election night',
  '2024qld':
    'at about 10:20 p.m. on election night (ended early due to issues with comparing prepoll and postal votes)',
};
const liveAlertStorageKey = 'liveForecastAlertClosed';

const ForecastAlert = props => {
  const isNowcast = props.mode === 'nowcast';
  const isLive = props.mode === 'live';
  const isRegular = props.mode === 'regular';
  const isArchive = props.isArchive === true;
  const isThisOutlook = isOutlook(props.code);
  const oldElec = oldElections.includes(props.code);
  const current = !(oldElec || isArchive);
  const isWarning = isNowcast || isLive || isThisOutlook || props.isArchive;
  const alertVariant = isWarning ? 'warning' : 'info';
  const defaultShow = props.showInitially === undefined || props.showInitially;
  const getShowState = () =>
    isLive
      ? defaultShow && localStorage.getItem(liveAlertStorageKey) !== 'true'
      : defaultShow;
  const [show, setShow] = useState(getShowState);

  useEffect(() => {
    setShow(getShowState());
  }, [defaultShow, isLive]);

  const closeAlert = () => {
    if (isLive) localStorage.setItem(liveAlertStorageKey, 'true');
    setShow(false);
  };

  if (show) {
    return (
      <Alert
        variant={alertVariant}
        className={isWarning ? styles.nowcastAlert : styles.forecastAlert}
        dismissible={true}
        onClose={closeAlert}
      >
        <div className={styles.firstPara}>
          <InfoIcon size="large" inactive={true} warning={isWarning} />
          {isRegular && (
            <>
              <div>
                This {oldElec && (isArchive ? 'is an ' : 'was the final ')}
                {!oldElec && (isArchive || isThisOutlook ? 'is an ' : 'is a ')}
                <strong>
                  {isArchive ? 'archived ' : ''}
                  {isThisOutlook ? 'outlook' : 'general forecast '}
                </strong>{' '}
                report for the {props.forecast.electionName}. It
                {isThisOutlook ? (!current ? ' showe' : ' show') : ' estimate'}
                {!current ? 'd ' : 's '}
                {isThisOutlook ? 'a range of possibilities for ' : ''}
                how the election might
                {oldElec ? ' have played' : ' play'} out{' '}
                <strong>when it {oldElec ? 'was' : 'is'} held</strong>
                {oldElec ? ' based on information available at the time' : ''}.
                {isThisOutlook
                  ? ' As there is a long time from this outlook to the election, the display is designed to emphasise the uncertainty of the outcome and the range of possible outcomes.'
                  : ''}
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
                ongoing and may contain inaccuracies.
                {props.code === '2026sa' && (
                  <>
                    <hr />
                    <p>
                      This live forecast extrapolates the differences between
                      known results and the prior expected results to estimate
                      the likely outcome of the election. For example, if
                      polling places in some seats are reporting results, those
                      will be used to update the forecast for other seats.
                    </p>
                    <br />
                    <p>
                      The forecast is aware of the different categories of
                      polling places, such as early voting centres and postal
                      votes. It takes into account that each category may have
                      correlated differences in voting behaviour when running
                      the simulations. If the forecast sees that a particular
                      category is reporting significantly different results to
                      the expected results, it will use that information to
                      update the forecast for polling places in that category.
                    </p>
                    <br />
                    <p>Known potential issues:</p>
                    <ul>
                      <li>
                        There is little historical partial-count data from
                        previous elections for seats where One Nation performs
                        very strongly, so it is hard to calibrate how the model
                        uses that data. The model&apos;s assumptions may be
                        incorrect.
                      </li>
                      <li>
                        The model does not know which polling places within a
                        seat are stronger for One Nation unless the party ran
                        there in the previous election. This may cause a
                        temporary overestimation of One Nation support in some
                        seats if their stronger rural polling places report
                        results first.
                      </li>
                      <li>
                        There is a very large increase in early voting compared
                        to the previous election due to changes in rules and
                        availability. While the forecast is in theory set up to
                        handle this, the scale of change is unprecedented and
                        may lead to unforeseen issues.
                      </li>
                      <li>
                        The forecast may struggle with seats where there are two
                        separate competitive independents. It will convert the
                        second independent into &quot;Others&quot; for the
                        purpose of distributing preferences, which may not be
                        accurate.
                      </li>
                      <li>
                        A bug was fixed at around midday on 23 March 2026 that
                        caused the forecast not to include Family First first
                        preference votes among &quot;Others&quot;. This mostly
                        affected first preference projections but the fix did
                        somewhat increase One Nation&apos;s win chance in the
                        seat of Light, along with other slight changes.
                      </li>
                    </ul>
                  </>
                )}
                {oldElec && !isArchive && (
                  <>
                    <hr />
                    This was the final such forecast made{' '}
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
          <Link to={'/methods'}>methods&nbsp;page</Link> or the{' '}
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
