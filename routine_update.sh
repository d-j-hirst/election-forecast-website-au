#!/usr/bin/env bash

# Run in a child shell even when sourced from an interactive console, so a
# failed update cannot exit that console or change its directory/shell options.
if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
    bash "${BASH_SOURCE[0]}" "$@"
    return $?
fi

set -Eeuo pipefail

# Each step owns its failure message. Stop at the first failure; earlier steps
# may have changed files or the database and are not automatically rolled back.
step="locating the checkout"
trap 'status=$?; printf "Update stopped while %s (exit %s). Resolve the failure before reloading the web app.\n" "$step" "$status" >&2; exit "$status"' ERR
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$repo_dir"

step="checking the console tools"
command -v git >/dev/null
command -v npm >/dev/null
# Use the console's selected Python for both pip and Django. On the host,
# activate the same virtualenv selected on the web application's configuration.
python_bin="$(command -v python)"
"$python_bin" --version

step="updating the checkout"
printf '\nUpdating the checkout...\n'
git pull --ff-only

step="installing backend dependencies"
"$python_bin" -m pip install -r requirements.txt

step="entering the frontend directory"
cd -- "$repo_dir/frontend"
step="installing frontend dependencies"
npm install
step="building the frontend"
npm run build
step="preparing frontend files"
bash ./prepare_files.sh

step="entering the backend directory"
cd -- "$repo_dir/backend"
step="creating the database cache table"
"$python_bin" manage.py createcachetable
step="applying database migrations"
"$python_bin" manage.py migrate --noinput
step="collecting static files"
"$python_bin" manage.py collectstatic --noinput

printf '\nUpdate completed successfully. Reload the web app in PythonAnywhere, then check the site.\n'
