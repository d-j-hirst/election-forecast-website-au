import { useContext, useEffect } from 'react';

import { getChecked, getDirect } from 'utils/sdk';
import { UserContext } from 'components';

export const getMeApi = () => getDirect('api/v1/users/me');

const getMe = () => getChecked('users/me');

export const isLoggedIn = () => getDirect('api/v1/users/me').then(resp => {return resp.status === 200;});

// Client-side hook to prevent components from being accessed
// without a registered user. Remember, don't trust the client
// and still protect the API by requiring permissions!
export const useUserRequired = () => {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      getMe().then(resp => {setUser(resp.data);});
    }
  }, [user, setUser]);
};