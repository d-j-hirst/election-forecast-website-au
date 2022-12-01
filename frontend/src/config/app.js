import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AllRoutes from 'config/routes';

function App() {
    
    return (
        <HelmetProvider>
            <AllRoutes />
        </HelmetProvider>
    );
}

export default App;
