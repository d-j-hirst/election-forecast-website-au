import React, {createContext, useContext} from 'react';
import PropTypes from 'prop-types';
import {ErrorBoundary} from 'react-error-boundary';

// Page owners supply route/data identity once. Nested display boundaries inherit
// it so a replacement report can recover even when their ancestors stayed mounted.
export const ErrorBoundaryResetContext = createContext([]);

const ErrorFallback = ({resetErrorBoundary}) => (
  <div style={{textAlign: 'center'}}>
    <p role="alert">Something went wrong displaying this section.</p>
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      onClick={event => {
        const main = event.currentTarget.closest('main');
        // Retry rendering the available data; this action does not refetch it.
        // Main remains mounted when the retry button disappears on success.
        resetErrorBoundary();
        main?.focus({preventScroll: true});
      }}
    >
      Try displaying this section again
    </button>
  </div>
);
ErrorFallback.propTypes = {
  resetErrorBoundary: PropTypes.func.isRequired,
};

const StandardErrorBoundary = ({children, resetKeys = []}) => {
  const pageResetKeys = useContext(ErrorBoundaryResetContext);
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      resetKeys={[...pageResetKeys, ...resetKeys]}
    >
      {children}
    </ErrorBoundary>
  );
};
StandardErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  resetKeys: PropTypes.array,
};

export default StandardErrorBoundary;
