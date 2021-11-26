import { useContext, useEffect } from 'react';

import { getApi } from 'utils/sdk';
import { UserContext } from 'components';

export const getMe = () => getApi('users/me');

// Client-side hook to prevent components from being accessed
// without a registered user. Remember, don't trust the client
// and still protect the API by requiring permissions!
export const useUserRequired = () => {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      getMe().then(resp => {console.log(resp.data); setUser(resp.data);});
    }
  }, [user, setUser]);
};
