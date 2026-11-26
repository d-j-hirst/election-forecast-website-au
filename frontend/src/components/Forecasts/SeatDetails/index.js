import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet-async';

import {
  Header,
  Footer,
  ForecastsNav,
  ForecastHeader,
  LoadingMarker,
  MainContent,
  ForecastAlert,
  SeatDetailBody,
  StandardErrorBoundary,
} from 'components';

import {getIndexFromSeatUrl} from 'utils/seaturls';
import {useWindowDimensions} from '../../../utils/window.js';
import {fetchReport, fetchResults} from '../../../utils/report_manager.js';

import VictorianLiveAnnouncement from '../Alerts/VictorianLiveAnnouncement';
import styles from './SeatDetails.module.css';
import seatLayout from '../Seats/Seats.module.css';

const SeatDetails = props => {
  const code = props.code;
  const id = props.id;
  const seat = props.seat;
  const inputMode = props.mode;
  const {live} = props;
  const [countingElection, setCountingElection] = useState(null);
  const announceLive =
    code === '2026vic' &&
    !props.isArchive &&
    ['regular', 'nowcast'].includes(inputMode);
  const automated = Boolean(live);
  const replay = Boolean(live?.replay);
  const publication = live?.publication;
  const [storedForecast, setForecast] = useState({});
  const [storedForecastValid, setForecastValid] = useState(false);
  const [results, setResults] = useState({});
  const [resultsValid, setResultsValid] = useState(false);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    if (automated) {
      if (!replay) fetchResults({code, setResults, setResultsValid});
      return;
    }
    fetchReport({
      code: code,
      archiveId: id,
      mode: inputMode,
      setForecast: setForecast,
      setForecastValid: setForecastValid,
      setResults: setResults,
      setResultsValid: setResultsValid,
    });
  }, [code, id, inputMode, seat, automated, replay]);

  const forecast = automated ? publication?.report : storedForecast;
  const forecastValid = automated ? Boolean(forecast) : storedForecastValid;
  const seatIndex = forecastValid
    ? getIndexFromSeatUrl(forecast.seatNames, seat)
    : -1;
  useEffect(() => {
    if (!automated && seatIndex >= 0) {
      document.title = `AEF - ${forecast.seatNames[seatIndex]} ${
        forecast.electionName
      } ${forecast.reportMode === 'NC' ? 'nowcast' : 'forecast'}`;
    }
  }, [automated, forecast, seatIndex]);

  const modeNames = {RF: 'regular', NC: 'nowcast', LF: 'live'};
  const mode = automated ? 'live' : modeNames[forecast.reportMode];

  const effectiveResults =
    !replay && forecast?.reportMode !== 'NC' && resultsValid ? results : null;

  return (
    <div className={styles.site}>
      {(props.isArchive || replay) && (
        <Helmet>
          {/* Archived forecasts shouldn't be indexed by search engines etc., they're
              for people specifically looking at the history performance of the AEF forecast
              and not for more general searches */}
          <meta name="robots" content="noindex" />
        </Helmet>
      )}
      <Header windowWidth={windowDimensions.width} page="forecast" />
      {/* Navigation follows the requested mode even while its data is loading.
        Archived reports have no current mode selected in the summary links. */}
      <ForecastsNav
        election={code}
        onCountStatus={announceLive ? setCountingElection : undefined}
        mode={replay ? 'replay' : props.isArchive ? 'other' : inputMode}
      />
      {/* Stable loaded-state identities also recover nested sections after a new
        report/results delivery; route identity covers changes before it arrives. */}
      <MainContent
        className={styles.content}
        title={`Seat details: ${seat} (${code})`}
        resetKeys={[code, id, inputMode, seat, forecast, results]}
      >
        <StandardErrorBoundary>
          {live?.error && <p role="status">{live.error}</p>}
          {live?.navigation}
          {forecastValid && seatIndex >= 0 && (
            <>
              <ForecastHeader
                mode={mode}
                forecast={forecast}
                archive={props.isArchive}
                sourceTime={publication?.source_time}
                timeZone={publication?.run.timezone}
                replay={replay}
                replaySnapshotId={
                  replay && publication?.local_diagnostics === true
                    ? publication.forecast_id
                    : undefined
                }
              />
              {announceLive && (
                <VictorianLiveAnnouncement
                  counting={countingElection === code}
                  seat={seat}
                />
              )}
              <ForecastAlert
                forecast={forecast}
                code={code}
                mode={mode}
                isArchive={props.isArchive}
                showInitially={props.isArchive !== true}
                results={effectiveResults}
                runKind={publication?.run.kind}
              />
              <StandardErrorBoundary>
                <SeatDetailBody
                  archive={id}
                  forecast={forecast}
                  election={code}
                  mode={mode}
                  index={seatIndex}
                  results={effectiveResults}
                  windowWidth={windowDimensions.width}
                  returnUrl={live?.returnUrl}
                  automated={automated}
                />
              </StandardErrorBoundary>
              {forecast.possibleBoothErrors?.[forecast.seatNames[seatIndex]]
                ?.length > 0 && (
                <section
                  className={`card card-body my-2 ${seatLayout.detailWidth}`}
                >
                  <h2 className="h5">Possible booth errors</h2>
                  <p>
                    Confidence is how often the model applies a correction
                    because the reported preference split looks unusual compared
                    with other booths.
                  </p>
                  <ul className="mb-0">
                    {forecast.possibleBoothErrors[
                      forecast.seatNames[seatIndex]
                    ].map((row, i) => (
                      <li key={i}>
                        <strong>{row.booth}</strong> â€” {row.level} confidence
                        ({row.confidencePercent.toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {live?.history && (
                <StandardErrorBoundary>{live.history}</StandardErrorBoundary>
              )}
            </>
          )}
          {forecastValid && seatIndex === -1 && (
            <>
              Couldn&apos;t find a seat matching name: {seat}. Make sure the
              seat is spelled correctly and any groups of spaced and other
              special characters are replaced with single hyphens.
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
SeatDetails.propTypes = {
  mode: PropTypes.string,
  code: PropTypes.string.isRequired,
  id: PropTypes.number,
  seat: PropTypes.string.isRequired,
  isArchive: PropTypes.bool,
  live: PropTypes.object,
};

export default SeatDetails;
