import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {ErrorBoundaryResetContext} from '../General/StandardErrorBoundary';
import styles from './MainContent.module.css';

// Every public page keeps this landmark outside its render boundaries. It is the
// stable target for the skip link, page navigation and successful render retries.
const MainContent = ({children, className, title, resetKeys = []}) => (
  <main
    id="main-content"
    tabIndex={-1}
    className={classnames(styles.main, className)}
  >
    {/* Data pages have several visual headings and need an identity while loading. */}
    {title && <h1 className="visually-hidden">{title}</h1>}
    <ErrorBoundaryResetContext.Provider value={resetKeys}>
      {children}
    </ErrorBoundaryResetContext.Provider>
  </main>
);

MainContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  resetKeys: PropTypes.array,
};

export default MainContent;
