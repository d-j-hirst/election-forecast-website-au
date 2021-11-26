import { notifyError } from 'utils/notifications';

export const BASE_BACKEND_URL = `${process.env.REACT_APP_BASE_BACKEND_URL}`;
export const BASE_API_URL = `${BASE_BACKEND_URL}/api/v1`;

// creates a default configuration for all fetch commands
// which includes headers that should always be included
// for a given method
const getBaseConfig = method => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
});

// Notify user if the user can't be authenticated.
// This uses a standard react-toastify toast.
const handle401 = resp => {
  if (resp.status === 401) {
    notifyError('Unauthenticated.');
  }
  return resp;
};

// convert the response to straight data, removing any extraneous information
// by convert text to parsed JSON if that's possible, and then passing
// it on along with the status code and whether request was ok
const serializeResponse = response => {
  return response
    .text()
    .then(text => {
      return text ? JSON.parse(text) : {};
    })
    .then(data => ({ status: response.status, ok: response.ok, data }));
};

// Generic function for using GET from a given (relative) url from the API.
// additional fetch() options can be given using an object for the
// "options" parameter
export const getApi = (url, options) =>
  fetch(`${BASE_API_URL}/${url}`, { ...getBaseConfig('get'), ...options })
    .then(serializeResponse)
    .then(handle401);

// Generic function for using GET from a given (relative) url from the API.
// additional fetch() options can be given using an object for the
// "options" parameter
export const get = (url, options) =>
  fetch(`${BASE_BACKEND_URL}/${url}`, { ...getBaseConfig('get'), ...options })
    .then(serializeResponse)
    .then(handle401);

// Generic function for using POST from a given (relative) url from the API.
// additional fetch() options can be given using an object for the
// "options" parameter
export const post = (url, data, options) =>
  fetch(`${BASE_API_URL}/${url}`, {
    ...getBaseConfig('post'),
    ...options,
    body: JSON.stringify(data)
  })
    .then(serializeResponse)
    .then(handle401);
