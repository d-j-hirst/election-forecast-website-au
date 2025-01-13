import {getDirect} from 'utils/sdk';

const modeTitles = {RF: 'General Forecast', NC: 'Nowcast', LF: 'Live Forecast'};

const partyReplace = (array, oldItem, newItem) => {
  const onPos = array.partyAbbr.findIndex(e => e[1] === oldItem);
  if (onPos !== -1) {
    array.partyAbbr[onPos][1] = newItem;
  }
  if (array.polls[oldItem] !== undefined) {
    array.polls[newItem] = array.polls[oldItem];
    delete array.polls[oldItem];
  }
};

const returnUsingData = (resp, settings) => {
  if (!resp.ok) throw Error("Couldn't find election data");
  return {
    settings: settings,
    data: resp.data,
  };
};

const getElectionSummary = settings => {
  let requestUri = `forecast-api/election-summary/${settings.code}/${settings.mode}`;
  const cached_id = localStorage.getItem('cachedForecastId');
  if (
    cached_id !== null &&
    settings.code === localStorage.getItem('cachedForecastCode')
  ) {
    requestUri += `/${cached_id}`;
  }
  return getDirect(requestUri).then(a => returnUsingData(a, settings));
};

const getArchiveSummary = settings => {
  // This is slightly simplified as archives can't be cached
  const url = `forecast-api/election-archive/${settings.code}/${settings.archiveId}`;
  return getDirect(url).then(a => returnUsingData(a, settings));
};

const getElectionResults = settings => {
  let requestUri = `forecast-api/election-results/${settings.code}`;
  const cached_id = localStorage.getItem('cachedResultsVersion');
  if (
    cached_id !== null &&
    settings.code === localStorage.getItem('cachedResultsCode')
  ) {
    requestUri += `/${cached_id}`;
  }
  return getDirect(requestUri).then(a => returnUsingData(a, settings));
};

const checkForCachedForecast = settings => {
  if (
    settings.code === localStorage.getItem('cachedForecastCode') &&
    settings.mode === localStorage.getItem('cachedForecastMode')
  ) {
    const tempForecast = JSON.parse(localStorage.getItem('cachedForecast'));
    settings.setForecast(tempForecast);
    const modeTitle = modeTitles[tempForecast.reportMode];
    document.title = `AEF - ${tempForecast.electionName} ${modeTitle}`;
    settings.setForecastValid(true);
  }
};

const checkForCachedResults = settings => {
  if (settings.code === localStorage.getItem('cachedResultsCode')) {
    const tempResults = JSON.parse(localStorage.getItem('cachedResults'));
    settings.setResults(tempResults);
    settings.setResultsValid(true);
  }
};

const integrateNewResults = input => {
  const settings = input.settings;
  const data = input.data;
  if (data.new && data.results.length === 0) {
    // No results available
    return;
  }
  if (data.new === false) {
    data['results'] = JSON.parse(localStorage.getItem('cachedResults'));
  } else {
    localStorage.setItem('cachedResults', JSON.stringify(data.results));
    localStorage.setItem('cachedResultsVersion', String(data.version));
    localStorage.setItem('cachedResultsCode', String(settings.code));
  }
  settings.setResults(data.results);
  settings.setResultsValid(true);
};

const integrateNewForecast = input => {
  const settings = input.settings;
  const data = input.data;
  if (data.new === false) return;
  partyReplace(data.report, 'ONP', 'ON');
  // No system currently set up to cache archived forecasts
  if (data.archiveId === undefined) {
    if (data.new === false) {
      data['report'] = JSON.parse(localStorage.getItem('cachedForecast'));
    } else {
      localStorage.setItem('cachedForecast', JSON.stringify(data.report));
      localStorage.setItem('cachedForecastId', String(data.id));
      localStorage.setItem('cachedForecastCode', String(settings.code));
      localStorage.setItem('cachedForecastMode', String(settings.mode));
    }
  }
  settings.setForecast(data.report);
  const modeTitle = modeTitles[data.report.reportMode];
  document.title = `AEF - ${data.report.electionName} ${modeTitle}`;
  settings.setForecastValid(true);
};

export const fetchReport = settings => {
  settings.setForecastValid(false);
  settings.setResultsValid(false);

  checkForCachedResults(settings);

  if (settings.archiveId !== undefined) {
    getArchiveSummary(settings)
      .then(integrateNewForecast)
      .catch(e => {
        console.log(e);
      });
  } else {
    // Archived forecasts aren't currently cached,
    // so only check if we're fetching the latest forecast
    checkForCachedForecast(settings);

    getElectionSummary(settings)
      .then(integrateNewForecast)
      .catch(e => {
        console.log(e);
      });
  }

  getElectionResults(settings)
    .then(integrateNewResults)
    .catch(e => {
      console.log(e);
    });
};
