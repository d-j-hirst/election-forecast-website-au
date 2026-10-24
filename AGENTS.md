# Project guidance

This file describes the project and the boundaries for contributing to its public
repository. Apply it alongside the user's instructions for the current task.

## Project overview

Australian Election Forecasts presents election forecasts, seat details,
historical reports, results and commentary. The repository is publicly available
for transparency about the forecasts and is maintained for the project's own
deployment and publishing workflow. It is not intended as a general website
framework or a service for many concurrent report submitters.

- `frontend/` contains the React website, routing, charts and browser caches.
- `backend/` contains the Django/REST APIs, administration, forecast storage,
  derived history, results importing and commentary. The current setup uses
  SQLite and a database-backed cache.
- Forecast calculations are produced in the separate Polling Analyser project.
  Its report exporter and Python uploader form the publishing interface to this
  website. Website work does not imply changes to that project's analysis,
  calibration or simulation process.
- `backend/README.md` and `frontend/README.md` describe setup and operation;
  `requirements.txt`, `frontend/package.json` and `backend_environment.txt`
  describe dependencies and the local environment selection.

Public pages do not require login. Retain authentication needed by the report
uploader and Django administration. Pre-release login systems, including Google
sign-in, are retired: do not restore them. Inspect any surviving legacy code only
far enough to identify an activation path and plan its removal within the task's
scope; exclude confirmed inactive code from further review.

## Public repository and internal material

Treat tracked files and repository history as public. Public documentation should
explain implemented behavior, architecture, usage and suitable reproduction or
verification steps. Keep it useful to readers without exposing internal work.

- Keep internal plans, priorities, work notes and unfinished investigations in
  the gitignored `docs/internal/` directory, or avoid writing them to disk.
- Keep review prompts, unresolved issue reports, security findings and associated
  remediation notes in the gitignored `docs/code-reviews/` directory. Use
  `docs/internal/` for unresolved reports outside the review suite.
- Do not copy internal findings into tracked documentation, code comments,
  fixtures, public issue/PR descriptions or other public output. Public documents
  must not link to or depend on internal files. Describe completed changes and
  verification with appropriate, sanitized detail when public documentation is
  needed; resolving an issue does not make its entire internal report public.
- Avoid copying credentials, tokens, private keys, real user information,
  production database dumps or sensitive logs into this repository. Prefer
  synthetic or redacted examples. If a task needs local sensitive material, keep
  the minimum necessary in an appropriate private location or a verified ignored
  file; an ignore rule is not a security boundary or permission to expose it in
  command output. Environment examples must contain safe placeholders or values
  deliberately intended to be public, never real secrets.
- Keep machine-specific paths and private external file layouts out of tracked
  files. Store any necessary local agent instructions in ignored local guidance.
- Before creating an internal artifact, check its destination with
  `git check-ignore` and confirm it is not tracked with `git ls-files`. Add a
  narrowly scoped ignore rule when needed; do not force-add internal files.
  Ignoring a path does not untrack existing files or remove published history.
  Flag any existing exposure and address it within the authorized task; do not
  rewrite repository history without an explicit request.

The rest of `docs/` is not automatically private. Choose the destination according
to the content, and keep public documentation outside the ignored directories.

## Working conventions

- At session start, read `docs/internal/local-agent-guidance.md` if present.
  This optional local guidance must remain untracked.
- Follow the current task's scope. For review-only work, record findings and
  proposed fixes without changing application code or deployed resources.
- Preserve unrelated working-tree changes. Do not stage or unstage files unless
  requested, and do not treat a request for code changes as a deployment request.
- Explain the purpose, lifecycle and ownership of substantive code through clear
  structure, names and concise contextual comments. Keep exceptional recovery
  paths understandable without obscuring normal operation.
- Use checks appropriate to the change. Isolate test databases, caches and
  external requests from real data; consult the backend README for the isolated
  test settings. Distinguish source inspection and local tests from verification
  of deployed configuration, real browser behavior or production data.
