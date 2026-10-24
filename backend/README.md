## Project scope

This repository is published for transparency about the election forecasts, rather
than as a reusable website framework. It is maintained for the project's own
deployment and workflow; people who choose to adapt or deploy it elsewhere do so
at their own risk.

Forecast reports are submitted one at a time in normal operation. The backend
therefore protects the data integrity needed by that workflow, but it does not
aim to optimise for many concurrent report submitters or arbitrary third-party
administration patterns.

## Setting up the backend server
* This project currently runs on Python 3.13. Earlier versions might work but are not part of the tested deployment setup.
* Set up a virtual environment in the parent folder using (under Linux/WSL2, consult Python docs for other OSs):
  - python3.13 -m venv env313
  - source env313/bin/activate
  - pip install -r requirements.txt
* `backend_environment.txt` records which virtual environment local launcher scripts should activate. Update it when replacing the environment for a future Python upgrade.
* Go into the /backend folder. Copy the .env.example file to a new file called .env and fill out the fields according to your local setup.
  - DJANGO_SECRET_KEY - a secret key for the Django server. Can be generated from django.core.management.utils.get_random_secret_key(). Keep this secret!
  - DEBUG - should normally be 1 for development and 0 for production
  - DJANGO_JWT_EXPIRATION_DELTA - How long (in seconds) before the JWT runs out.
  - DJANGO_BASE_BACKEND_URL - Base backend URL. For development, should be something like http://localhost:8000 while for production should be something like https://my.domain.name - note no trailing slash
  - DJANGO_BASE_FRONTEND_URL - Base frontend URL. For development, should be something like http://localhost:8000 while for production should be the same as DJANGO_BASE_BACKEND_URL something like https://my.domain.name - note no trailing slash
* Migrations need to be completed. The default commands for this do not find all migrations, in particular user accounts are not automatically created. Use `python3 manage.py makemigrations users` to solve this, then `python3 manage.py makemigrations` to make any others and then `python3 manage.py migrate` to actually complete the migration. (Some OSs might need to use `python` command instead of `python3` for each of these.)
* Use `python3 manage.py createsuperuser` to create a super user which can assign permissions for other users. You'll need to enter an email address and password for this user.

## Authentication

The uploader posts its email and password to `/auth-api/v1/auth/login/`, extracts
the `jwt_token` response cookie, then sends `Authorization: JWT <token>` on its
API calls. `Bearer <token>` is also accepted. The cookie is kept in login responses
for uploader compatibility; sending that cookie back does not authenticate an API
request. API logout also requires the header and revokes all of that user's JWTs.

Browser administration uses `/admin/` with Django's own session and CSRF
protection. Google sign-in and account-init have been removed. No Google OAuth
configuration is required, and old Google environment values have no effect.
Existing user records and permissions are retained.

Run the authentication and forecast regression tests without reading local
credentials or using the normal database/cache, from `backend/`:

```sh
python3 manage.py test accounts forecast_api --settings=core.test_settings
```

## Forecast publication and response caching

Public summary, archive-list, history and results requests first read the
election's current revision from the database. Response bodies are cached under
keys containing the election identity, response scope and that revision, with a
one-hour lifetime. Expiry controls retention; the database revision determines
which body can be served. Cache failures fall back to database reads. Requests
whose data changes repeatedly during loading return HTTP 503 with `Retry-After: 1`.

Report submission, reconstruction and forecast deletion advance
`Election.report_revision` in the same transaction as their source changes.
History retains its per-mode versions; results publication updates only its body
and version in one database statement. Publication does not depend on cache
deletion. Reads inside a database transaction bypass the shared response cache
so uncommitted data cannot be reused after a rollback.

Use the submission endpoints for normal publication. After direct report or
election-name edits, run the existing history reconstruction endpoint for the
affected mode(s) to publish the corresponding history and report revision. A
cache reset alone does not complete that workflow. Publish results through the
results update endpoint, and regenerate history through reconstruction instead
of editing the history JSON/version fields directly.

When upgrading to migration `0017_election_report_revision`, take the normal
database backup and pause publishing, reconstruction and admin edits. Apply
`python3 manage.py migrate`, then replace/drain all application workers before
resuming writes. SQLite rebuilds the Election table for this migration; allow
space and time for copying its history/results blobs. Forecast rows and public
IDs are preserved. Old workers do not maintain the new report revision and must
not remain active writers alongside the new code.

After replacing the workers, clear the server cache through the existing
authenticated reset operation to reclaim obsolete entries. New readers ignore
the old keys, but those entries had no expiry. Also clear cached responses when
restoring an older database backup. Browser routes, response shapes and client
ID/version conventions do not change with this server-cache upgrade. Verify the
upgrade on the test application before public deployment.

### For development:

* Load the backend using `python3 manage.py runserver` which will open a backend server on port 8000 by default.

### For production:

* The exact procedure for initiating the server will depend on the hosting platform, but in all cases we'll need to collect static files. Make sure to do this after the frontend server has been built and its files sorted using `prepare_files.sh` (see the frontend readme). To collect the static files just run `python3 manage.py collectstatic` and type `yes` when prompted.
