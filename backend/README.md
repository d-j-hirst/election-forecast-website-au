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

Run the authentication, routing and forecast regression tests without reading local
credentials or using the normal database/cache, from `backend/`:

```sh
python3 manage.py test core accounts forecast_api --settings=core.test_settings
```

## Public route dispatch

Public page deep links load the React shell, which handles unknown page addresses.
Unmatched paths within `auth-api`, `forecast-api` and `commentary-api` return a
JSON 404 instead of HTML. Registered endpoint paths retain their slash conventions;
with `APPEND_SLASH` enabled, adding a slash redirects only to a registered endpoint.

## Forecast publication and response caching

### Automated live forecasts and local replays

Apply the forecast migrations before using the automated uploader. Its
`/forecast-api/live/v1/capabilities` handshake, run registration and forecast
submissions coexist with the one-off report uploader. Registration and
publication use the same JWT and submit permission described above. The
database retains a digest of the exact upload, the compressed numerical report
and the compact mechanical and commentary data. Keep the frozen originals with
Polling Analyser if the retention rules need to be reapplied later.

The publisher can designate a registered public live run with
`--select-official RUN_ID` and the usual destination flags. This requires the
forecast submit permission. Repeating the command selects the same run. Use
Django admin to switch away from an already-selected run. Before any timestamped
feed arrives, the official page can show the uploaded start-of-counting reference.
The first timestamped report starts the history and supersedes the reference.

For a local rehearsal, set `DJANGO_LOCAL_REPLAY=1` with development settings
and restart Django. Use a loopback-only development server and a local
database. Run the Analyser watcher for a replay, start its reporting worker with
`--watch <run-directory> --local`, and step its archived feed. Open
`/<election>/replays/<run-id>` on localhost. Both public and private replays
open without signing in when the development backend receives a loopback
request addressed to localhost. The seat links follow that run. The pages
refresh while visible and display the source observation in the election timezone.
When the last intended forecast has arrived, use the **Mark selected replays as
complete** action under Live runs in Django admin. The replay keeps every
published snapshot, including quiet updates. Completed pages stop background
checks and still support First, Back and Forward. A new publication automatically
reopens the replay. An already-open completed page picks it up on navigation or
refresh. Replay responses use gzip when supported by the client. When you
reopen a completed replay or visit it in another tab, the browser checks
with the local server before reusing its copy of the report and chart history.
A new publication or a history rebuild makes the next request fetch fresh data.
The Analyser upload manager can also mark a replay complete remotely with
`--complete-replay RUN_ID` and the usual destination flags. The authenticated
server checks that it holds every publication in the local run, including
matching checksums, before it marks the replay complete.

The Modes bar offers **Live Replay** only for elections listed in
`DJANGO_PUBLIC_REPLAY_ELECTIONS` (a comma-separated list, defaulting to `2026sa,2022vic`). An explicit empty list
turns off public replay access. Enable further elections after uploading a replay
registered with public visibility.
The link opens the series whose first counted forecast was published most
recently. An origin alone does not qualify. Older public series keep their URLs.
Private registrations remain local. Hosted readers see observation times and
Highlights; local diagnostic references and the expanded movement list are
available in the loopback rehearsal view.

For public live service, register a public run of kind `live`. In Django
admin select its Live run record and use **Select one public live run as
official**. The forecast and seat pages then use this run. Clearing its
official selection restores the legacy source for that election. Both actions
preserve every stored publication.

Seat histories are derived automatically. To reconstruct a single run after a
chart-format change, run `python manage.py rebuild_live_seat_history <run-id>`.
The command publishes the rebuilt blocks together in one transaction.
Run this once for existing win-only histories to populate the vote-share charts
from their retained reports. Each seat stores first-preference vote shares for
every candidate with reported intervals, plus conditional vote shares for up to
four final pairings occurring in more than 0.1% of simulations at that update.
The three stored figures are the 5th, 50th and 95th percentiles, rounded to one
decimal place. Chart selectors follow the current update. Gaps mark earlier
observations where the selected candidate or pairing had no retained interval.

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

For a routine PythonAnywhere update, activate the same virtual environment as
the one configured for the web application, then run `. routine_update.sh`
from the repository root. Sourcing runs the update in a child Bash shell so a
failure preserves the interactive console's directory and shell options.
`bash routine_update.sh` also works, including with the script's full path from
another directory.
The script uses the selected `python` for both dependency installation and Django
commands. The local `backend_environment.txt` launcher preference does not change
the hosting console's environment.

The script requires a fast-forward Git update and stops on the first failed
installation, build, file-preparation or management command, returning a nonzero
exit status. It prints a success message only after static collection finishes.
If it stops, resolve the reported failure before reloading; completed steps are
not rolled back. Schema changes still require their documented backup and
publication-pause procedure above.

After a successful update, use **Reload** for the intended application on
PythonAnywhere's Web tab, then check its public pages and administration. The
script leaves this activation step to the operator.

The release-script checks run without installing dependencies or touching a
working database: `bash tests/test_routine_update.sh` from the repository root.

### Publish human-written Commentary

The Analyser upload manager can create or revise an article in the site's
top-menu Commentary section. Apply the Commentary migration with
`python manage.py migrate`. Grant the uploader's Django account **Can add
commentary** and **Can change commentary** for this operation. Existing forecast
publication permissions are independent.

Send a UTF-8 plain-text file with a stable article key, a title when creating
the article, and optional tags. The authenticated endpoint is
`PUT /commentary-api/publish/<key>/`. It acknowledges the key and the numeric
article ID on that server. Reusing the key updates the existing public URL and
preserves the original publication date. Omitted titles and tags are preserved.
Paragraphs and line breaks are displayed as written, and HTML in the uploaded
text is shown literally. Articles edited directly in Django retain their usual
formatting. To attach a key to an existing admin article, specify its exact
unique title in `existing_title`.
