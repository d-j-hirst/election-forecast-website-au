import { useContext, useEffect } from 'react';

import { get } from 'utils/sdk';
import { UserContext } from 'components';

const getMe = () => get('users/me');

// Client-side hook to prevent components from being accessed
// without a registered user. Remember, don't trust the client
// and still protect the API by requiring permissions!
export const useUserRequired = () => {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      getMe().then(resp => setUser(resp.data));
    }
  }, [user, setUser]);
};
