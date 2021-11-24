
## New Readme (if restarting from the current repository) for the frontend server

For local development:

Make sure you are using a compatible version of node.js; the most recent version does not work as of 24-11-2021. Version 16.13.0 should work fine. NVM (Node Version Manager) is recommended to make sure you run the correct versions. Run `npm install` in the `frontend` folder to install the packages.

The `.env` file needs to be created (use the `.env.example` file as a temple). At least the Google Client ID needs to be filled in under REACT_APP_GOOGLE_CLIENT_ID. CHOKIDAR_USEPOLLING is required for automatic restarts under WSL2, if you are not using that then you may not need it. REACT_APP_BASE_BACKEND_URL should be the URL of whatever backend you are using, Django's development server defaults to http://localhost:8000

Similarly, copy the `jsconfig.json.example` file to `jsconfig.jscon`. It shouldn't need any further edits.

Make sure to load http://localhost:3000/login or you will see a blank screen.

Make sure that you have Google Cloud Platform Credentials set up. Once you have registered your application, look under the navigation menu (hamburger button, top left) -> APIs & Services -> Credentials -> + Create Credentials -> OAuth client ID. Then follow the instructions, once you have a web application created fill in the following fields:
*Authorized JavaScript origins: http://localhost:3000
#Authorized redirect URIs: http://localhost:8000/api/v1/auth/login/google/
Replace the domains as appropriate for you front/backend.
You may also need to add users for testing under "OAuth consent screen" (left menu) then "Test Users".

Finally, run `npm start` to actually run the frontend server.

## Old Readme (keeping it around until all config stuff is sorted out)
Old readme is here: https://github.com/HackSoftware/Django-React-GoogleOauth2-Example/blob/main/client/README.md
