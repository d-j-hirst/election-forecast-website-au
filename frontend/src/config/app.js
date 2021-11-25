import React, { useState } from 'react';

import { UserContext } from 'components';
import Routes from 'config/routes';

function App() {
  // The current user (or lack thereof) determines access
  // to the entire app, so its state belongs here.
  const [user, setUser] = useState(null);
  
  return (
    // Several parts of the app need to use the "user" state
    // and directly passing the setUser function to the login
    // page is convoluted, so create a UserContext so they
    // can be used without directly passing them around
    <UserContext.Provider value={{ user, setUser }}>
      <Routes />
    </UserContext.Provider>
  );
}

export default App;
