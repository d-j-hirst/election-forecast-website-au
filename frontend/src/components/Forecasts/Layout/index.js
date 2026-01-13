import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import {Helmet} from 'react-helmet-async';

import {useWindowDimensions} from '../../../utils/window.js';
import {fetchReport} from '../../../utils/report_manager.js';
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
  OnPrefsAlert,
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
  const [forecast, setForecast] = useState({});
  const [forecastValid, setForecastValid] = useState(false);
  const [results, setResults] = useState({});
  const [resultsValid, setResultsValid] = useState(false);
  const windowDimensions = useWindowDimensions();

  useEffect(() => {
    fetchReport({
      code: code,
      mode: inputMode,
      archiveId: id,
      setForecast: setForecast,
      setForecastValid: setForecastValid,
      setResults: setResults,
      setResultsValid: setResultsValid,
    });
  }, [code, id, inputMode]);

  const modeNames = {RF: 'regular', NC: 'nowcast', LF: 'live'};
  const mode = forecastValid ? modeNames[forecast.reportMode] : '';

  const effectiveResults =
    forecast.reportMode !== 'NC' && resultsValid ? results : null;

  return (
    <div className={styles.site}>
      {props.isArchive && (
        <Helmet>
          {/* Archived forecasts shouldn't be indexed by search engines etc.,
            they're for people specifically looking at the historical performance
            of the AEF forecast and not for more general searches */}
          <meta name="robots" content="noindex" />
        </Helmet>
      )}
      <Header
        windowWidth={windowDimensions.width}
        page={props.isArchive ? 'archive' : 'forecast'}
      />
      {/* Even though the archived forecast is still in some mode,
        it's needed to set the mode to "other" here as that will
        keep the links clickable */}
      <ForecastsNav election={code} mode={props.isArchive ? 'other' : mode} />
      <div className={styles.content}>
        <StandardErrorBoundary>
          {forecastValid && (
            <>
              <ForecastHeader
                archive={props.isArchive}
                forecast={forecast}
                mode={mode}
              />
              <ForecastAlert
                code={code}
                forecast={forecast}
                isArchive={props.isArchive}
                mode={mode}
                results={effectiveResults}
              />
              <OnPrefsAlert
                code={code}
                isArchive={props.isArchive}
                mode={mode}
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
                  mode={mode}
                  results={effectiveResults}
                  windowWidth={windowDimensions.width}
                />
              </StandardErrorBoundary>
              <StandardErrorBoundary>
                <SeatTotals
                  election={code}
                  forecast={forecast}
                  mode={mode}
                  results={effectiveResults}
                  windowWidth={windowDimensions.width}
                />
              </StandardErrorBoundary>
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
              <StandardErrorBoundary>
                <History
                  election={code}
                  forecast={forecast}
                  mode={mode}
                  windowWidth={windowDimensions.width}
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
                />
              </StandardErrorBoundary>
            </>
          )}
          {!forecastValid && <LoadingMarker />}
        </StandardErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};
ForecastLayout.propTypes = {
  isArchive: PropTypes.bool,
  code: PropTypes.string.isRequired,
  id: PropTypes.number,
  mode: PropTypes.string,
};

export default ForecastLayout;
