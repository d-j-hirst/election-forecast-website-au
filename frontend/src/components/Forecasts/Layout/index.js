import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import {Helmet} from 'react-helmet-async';

import {useWindowDimensions} from '../../../utils/window.js';
import {fetchReport, fetchResults} from '../../../utils/report_manager.js';
import {isOutlook} from '../../../utils/outlook.js';

import {
  Footer,
  ForecastAlert,
  ForecastsNav,
  ForecastHeader,
  FormationOfGovernment,
  Header,
  History,
  LoadingMarker,
  MainContent,
  MethodsChangesAlert,
  Seats,
  SeatTotals,
  StandardErrorBoundary,
  VoteTotals,
} from 'components';

import styles from './Layout.module.css';

const ForecastLayout = props => {
  const code = props.code;
  const id = props.id;
  const inputMode = props.mode;
  const {live} = props;
  const automated = Boolean(live);
  const replay = Boolean(live?.replay);
  const publication = live?.publication;
  const [storedForecast, setForecast] = useState({});
  const [storedForecastValid, setForecastValid] = useState(false);
  const [results, setResults] = useState({});
  const [resultsValid, setResultsValid] = useState(false);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    // Automated pages already receive their report and history from the
    // run poller. Only official forecasts can display final-result markers.
    if (automated) {
      if (!replay) fetchResults({code, setResults, setResultsValid});
      return;
    }
    fetchReport({
      code: code,
      mode: inputMode,
      archiveId: id,
      setForecast: setForecast,
      setForecastValid: setForecastValid,
      setResults: setResults,
      setResultsValid: setResultsValid,
    });
  }, [code, id, inputMode, automated, replay]);

  const forecast = automated ? publication?.report : storedForecast;
  const forecastValid = automated ? Boolean(forecast) : storedForecastValid;
  const modeNames = {RF: 'regular', NC: 'nowcast', LF: 'live'};
  const mode = automated ? 'live' : modeNames[forecast.reportMode];

  const effectiveResults =
    !replay && forecast?.reportMode !== 'NC' && resultsValid ? results : null;

  return (
    <div className={styles.site}>
      {(props.isArchive || replay) && (
        <Helmet>
          {/* Archived forecasts shouldn't be indexed by search engines etc.,
            they're for people specifically looking at the historical performance
            of the AEF forecast and not for more general searches */}
          <meta name="robots" content="noindex" />
        </Helmet>
      )}
      <Header windowWidth={windowDimensions.width} page="forecast" />
      {/* Navigation follows the requested mode even while its data is loading.
        Archived reports have no current mode selected in the summary links. */}
      <ForecastsNav
        election={code}
        mode={props.isArchive || replay ? 'other' : inputMode}
      />
      {/* These state objects keep their identity until a load replaces the data;
        unlike inline render objects, they reset failed sections only on delivery. */}
      <MainContent
        className={styles.content}
        title={`${
          replay
            ? 'Live replay'
            : props.isArchive
            ? 'Archived forecast'
            : 'Forecast'
        }: ${code}`}
        resetKeys={[code, id, inputMode, forecast, results]}
      >
        <StandardErrorBoundary>
          {live?.error && <p role="status">{live.error}</p>}
          {forecastValid && (
            <>
              <ForecastHeader
                archive={props.isArchive}
                forecast={forecast}
                mode={mode}
                sourceTime={publication?.source_time}
                timeZone={publication?.run.timezone}
                replayName={replay ? publication?.run.display_name : undefined}
              />
              <ForecastAlert
                code={code}
                forecast={forecast}
                isArchive={props.isArchive}
                mode={mode}
                results={effectiveResults}
                runKind={publication?.run.kind}
              />
              <MethodsChangesAlert
                isArchive={props.isArchive}
                mode={mode}
                reportDate={forecast.reportDate}
              />
              {!isOutlook(code) && (
                <StandardErrorBoundary>
                  <FormationOfGovernment
                    election={code}
                    forecast={forecast}
                    mode={mode}
                    windowWidth={windowDimensions.width}
                  />
                </StandardErrorBoundary>
              )}
              <StandardErrorBoundary>
                <VoteTotals
                  election={code}
                  forecast={forecast}
                  isArchive={props.isArchive}
                  automated={automated}
                  mode={mode}
                  results={effectiveResults}
                  windowWidth={windowDimensions.width}
                />
              </StandardErrorBoundary>
              {(!automated || forecast.seatCountFrequencies?.length > 0) && (
                <StandardErrorBoundary>
                  <SeatTotals
                    election={code}
                    forecast={forecast}
                    mode={mode}
                    results={effectiveResults}
                    windowWidth={windowDimensions.width}
                  />
                </StandardErrorBoundary>
              )}
              {isOutlook(code) && (
                /* move this downward to deemphasise when in outlook mode */
                <StandardErrorBoundary>
                  <FormationOfGovernment
                    election={code}
                    forecast={forecast}
                    mode={mode}
                    windowWidth={windowDimensions.width}
                  />
                </StandardErrorBoundary>
              )}
              {live?.summary && (
                <StandardErrorBoundary>{live.summary}</StandardErrorBoundary>
              )}
              <StandardErrorBoundary>
                <History
                  election={code}
                  forecast={forecast}
                  mode={mode}
                  windowWidth={windowDimensions.width}
                  runPoints={publication?.points}
                  timeZone={publication?.run.timezone}
                />
              </StandardErrorBoundary>
              <StandardErrorBoundary>
                <Seats
                  archiveId={id}
                  election={code}
                  forecast={forecast}
                  mode={mode}
                  results={effectiveResults}
                  windowWidth={windowDimensions.width}
                  seatLink={live?.seatLink}
                />
              </StandardErrorBoundary>
            </>
          )}
          {!forecastValid && !live?.error && (
            <LoadingMarker
              text={
                publication ? 'Waiting for the first count update.' : undefined
              }
            />
          )}
        </StandardErrorBoundary>
      </MainContent>
      <Footer />
    </div>
  );
};
ForecastLayout.propTypes = {
  isArchive: PropTypes.bool,
  code: PropTypes.string.isRequired,
  id: PropTypes.number,
  mode: PropTypes.string,
  live: PropTypes.object,
};

export default ForecastLayout;
