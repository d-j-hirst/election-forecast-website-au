import { getDirect } from 'utils/sdk';

export const getMeApi = () => getDirect('auth-api/v1/users/me');

export const isLoggedIn = () => getDirect('auth-api/v1/users/me').then(resp => {return resp.status === 200;});