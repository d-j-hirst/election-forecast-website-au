import React from 'react';
import PropTypes from 'prop-types';
import {ErrorBoundary} from 'react-error-boundary';

const ErrorFallback = props => (
  <div style={{textAlign: 'center'}}>
    Something went wrong displaying this section.
  </div>
);

const StandardErrorBoundary = props => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    {props.children}
  </ErrorBoundary>
);
StandardErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StandardErrorBoundary;
