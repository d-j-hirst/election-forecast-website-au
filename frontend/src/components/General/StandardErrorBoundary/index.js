import {ErrorBoundary} from 'react-error-boundary'

const ErrorFallback = props => <div style={{textAlign: 'center'}}>Something went wrong displaying this section.</div>

const StandardErrorBoundary = props => <ErrorBoundary FallbackComponent={ErrorFallback}>{props.children}</ErrorBoundary>

export default StandardErrorBoundary;