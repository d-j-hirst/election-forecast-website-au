import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import { LOGIN_URL, HOME_URL } from 'config/urls';

import { Login, Home } from 'pages';

const Routes = () => {
  return (
    // Based on the current route, use the appropriate component
    // for the page: either login or home page
    <BrowserRouter>
      <Switch>
        <Route path={LOGIN_URL} component={Login} />
        <Route path={HOME_URL} component={Home} />
        {/* Redirect to home page if nothing else works */}
        <Route path="*">
          <Redirect to={HOME_URL} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
