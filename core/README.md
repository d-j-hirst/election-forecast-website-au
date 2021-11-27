## Setting up the backend server
* This project is designed for the latest Python version (3.9 as of writing). Earlier versions might work but don't count on it.
* Set up a virtual environment in the parent folder using (under Linux/WSL2, consult Python docs for other OSs):
 - python3 venv -m env
 - source env/bin/activate
 - pip install -r requirements.txt
* Go into the first /core folder (this should have a second /core folder inside it, don't go into that). Copy the .env.example file to a new file called .env and fill out the fields according to your local setup.
 - DJANGO_SECRET_KEY - a secret key for the Django server. Can be generated from django.core.management.utils.get_random_secret_key(). Keep this secret!
 - GOOGLE_OAUTH_ID - the complete Google client id for your application registered in the Google Cloud Platform. (Find it under top left menu -> APIs and Services -> Credentials -> Create Credentials (if not already done for the frontend) / OAuth 2.0 Client IDs, and select your web client)
 - GOOGLE_OAUTH_SECRET - The OAuth Client Secret, found in the same place. Keep this secret!
 - DEBUG - should normally be 1 for development and 0 for production
 - DJANGO_JWT_EXPIRATION_DELTA - How long before the JWT runs out.
* Migrations need to be completed. The default commands for this do not find all migrations, in particular user accounts are not automatically created. Use `python3 manage.py makemigrations users` to solve this, then `python3 manage.py makemigrations` to make any others and then `python3 manage.py migrate` to actually complete the migration. (Some OSs might need to use `python` command instead of `python3` for each of these.)
* Use `python3 manage.py createsuperuser` to create a super user which can assign permissions for other users. You'll need to enter an email address and password for this user.

### For development:

* Load the backend using `python3 manage.py runserver` which will open a backend server on port 8000 by default.

### For production:

* The exact procedure for initiating the server will depend on the hosting platform, but in all cases we'll need to collect static files. Make sure to do this after the frontend server has been built and its files sorted using `prepare_files.sh` (see the frontend readme). To collect the static files just run `python3 manage.py collect`.