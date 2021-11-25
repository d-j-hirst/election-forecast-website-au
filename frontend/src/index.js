import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from 'config/app';

// This file should be kept minimal, just boilerplate for loading
// the app component into the DOM and leaving the rest of the
// implementation to other files.

ReactDOM.render(
  // Strict mode helps with identifying various issues in development.
  // Has no effect in production.
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  // Standard line, specify the element that React should render
  // the app into
  document.getElementById('root')
);
