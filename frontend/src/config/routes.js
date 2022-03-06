import { React} from 'react';

import { createBrowserHistory } from 'history';
import { Router, Route, Switch, Redirect } from 'react-router-dom';

import { LOGIN_URL, HOME_URL, FORECAST_URL, BASIC_FORECAST_URL, DEFAULT_FORECAST_URL,
  SEAT_DETAILS_URL, ARCHIVE_LIST_URL, ARCHIVE_URL, ARCHIVE_SEAT_URL, 
 GUIDE_URL, METHODOLOGY_URL, COMMENTARY_URL, COMMENTARY_SINGLE_URL, ABOUT_URL} from 'config/urls';

import { Login, Home, Forecast, SeatDetails, ArchiveList, Archive, ArchiveSeat, 
  Guide, Methodology, Commentary, CommentarySingle, About } from 'pages';

export const history = createBrowserHistory();

const Routes = () => {

  return (
    // Based on the current route, use the appropriate component
    // for the page: either login or home page
    <Router history={history}>
      <Switch>
        <Route path={LOGIN_URL} component={Login} />
        <Route path={ARCHIVE_LIST_URL} component={ArchiveList} />
        <Route path={ARCHIVE_SEAT_URL} component={ArchiveSeat} />
        <Route path={ARCHIVE_URL} component={Archive} />
        <Route path={FORECAST_URL} component={Forecast} />
        <Route path={GUIDE_URL} component={Guide} />
        <Route path={METHODOLOGY_URL} component={Methodology} />
        <Route path={COMMENTARY_SINGLE_URL} component={CommentarySingle} />
        <Route path={COMMENTARY_URL} component={Commentary} />
        <Route path={ABOUT_URL} component={About} />
        <Route path={BASIC_FORECAST_URL} component={Forecast}>
          <Redirect to={DEFAULT_FORECAST_URL} />
        </Route>
        <Route path={SEAT_DETAILS_URL} component={SeatDetails} />
        {/* Keep this last so that other pages don't get replaced by it */}
        <Route path={HOME_URL} component={Home} />
        {/* Redirect to home page if nothing else works */}
        <Route path="*">
          <Redirect to={HOME_URL} />
        </Route>
      </Switch>
    </Router>
  );
};

export default Routes;
