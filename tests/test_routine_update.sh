#!/usr/bin/env bash
set -euo pipefail

# Exercise the real scripts in a disposable checkout. Every external release
# command is replaced before execution; only synthetic build files are moved.
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
scratch="$(mktemp -d "$repo_dir/.release-script-test.XXXXXX")"
cleanup() {
    cd -- "$repo_dir"
    case "$scratch" in
        "$repo_dir"/.release-script-test.*) rm -rf -- "$scratch" ;;
        *) printf 'Refusing to remove unexpected test directory: %s\n' "$scratch" >&2 ;;
    esac
}
trap cleanup EXIT
fixture="$scratch/checkout with spaces"
mkdir -p "$fixture/frontend" "$fixture/backend" "$scratch/bin" "$scratch/elsewhere"
cp "$repo_dir/routine_update.sh" "$fixture/"
cp "$repo_dir/frontend/prepare_files.sh" "$fixture/frontend/"
export CALL_LOG="$scratch/calls"
export REAL_MV
REAL_MV="$(command -v mv)"

# Fail at the selected stage with a distinct status so the caller must preserve
# the error. Logs also verify interpreter choice, directory and command order.
cat > "$scratch/bin/command-stub" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
tool="${0##*/}"
case "$tool:$*" in
    python:--version) printf 'Python 3.13 (synthetic test executable)\n'; exit 0 ;;
    git:'pull --ff-only') stage=pull ;;
    python:'-m pip install -r requirements.txt') stage=pip ;;
    npm:install) stage=npm-install ;;
    npm:'run build') stage=build ;;
    mv:*) stage=prepare ;;
    python:'manage.py createcachetable') stage=cache ;;
    python:'manage.py migrate --noinput') stage=migrate ;;
    python:'manage.py collectstatic --noinput') stage=collect ;;
    *) printf 'Unexpected test command: %s %s\n' "$tool" "$*" >&2; exit 99 ;;
esac
case "$stage" in
    pull|pip) [[ "$PWD" == "$FIXTURE" ]] ;;
    npm-install|build|prepare) [[ "$PWD" == "$FIXTURE/frontend" ]] ;;
    cache|migrate|collect) [[ "$PWD" == "$FIXTURE/backend" ]] ;;
esac
printf '%s\n' "$stage" >> "$CALL_LOG"
if [[ "${FAIL_STAGE:-}" == "$stage" ]]; then exit 73; fi
if [[ "$stage" == build ]]; then
    mkdir -p build/static/js
    printf '<html>synthetic</html>' > build/index.html
    printf 'fixture asset' > 'build/asset with spaces.txt'
fi
if [[ "$stage" == prepare ]]; then exec "$REAL_MV" "$@"; fi
STUB
chmod +x "$scratch/bin/command-stub"
for tool in git python npm mv; do
    cp "$scratch/bin/command-stub" "$scratch/bin/$tool"
done
export FIXTURE="$fixture"
export PATH="$scratch/bin:$PATH"
cd -- "$scratch/elsewhere"
export EXPECTED_CWD="$PWD"

stages=(pull pip npm-install build prepare cache migrate collect)
checks=0
fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }

# Each failure must be observable, stop later mutations and omit success output.
# Starting in another directory exercises script-relative path resolution too.
for index in "${!stages[@]}"; do
    : > "$CALL_LOG"
    export FAIL_STAGE="${stages[$index]}"
    status=0
    bash "$fixture/routine_update.sh" > "$scratch/output" 2>&1 || status=$?
    [[ "$status" == 73 ]] || fail "$FAIL_STAGE returned $status instead of 73"
    printf '%s\n' "${stages[@]:0:index+1}" > "$scratch/expected"
    cmp -s "$scratch/expected" "$CALL_LOG" || fail "commands continued or ran out of order after $FAIL_STAGE"
    grep -q 'Update stopped while' "$scratch/output" || fail "missing failure context for $FAIL_STAGE"
    if grep -q 'Update completed successfully' "$scratch/output"; then fail "false success after $FAIL_STAGE"; fi
    checks=$((checks + 1))
done

# A successful run can be repeated and leaves the console in its own directory.
unset FAIL_STAGE
for repeat in 1 2; do
    : > "$CALL_LOG"
    bash "$fixture/routine_update.sh" > "$scratch/output" 2>&1
    printf '%s\n' "${stages[@]}" > "$scratch/expected"
    cmp -s "$scratch/expected" "$CALL_LOG" || fail 'successful command sequence'
    grep -q 'Update completed successfully' "$scratch/output" || fail 'missing success message'
    [[ -f "$fixture/frontend/build/root/asset with spaces.txt" ]] || fail 'prepared asset missing'
    [[ -f "$fixture/frontend/build/index.html" ]] || fail 'template moved'
    [[ -d "$fixture/frontend/build/static" ]] || fail 'static directory moved'
    checks=$((checks + 1))
done

# An interrupted build must not be prepared as a release.
rm -- "$fixture/frontend/build/index.html"
printf 'pending' > "$fixture/frontend/build/pending.txt"
if bash "$fixture/frontend/prepare_files.sh"; then fail 'accepted missing template'; fi
[[ -f "$fixture/frontend/build/pending.txt" ]] || fail 'moved files from incomplete build'
checks=$((checks + 1))

# A failed first move must stop preparation even if later files exist.
printf '<html>synthetic</html>' > "$fixture/frontend/build/index.html"
printf 'later' > "$fixture/frontend/build/z-later.txt"
: > "$CALL_LOG"
export FAIL_STAGE=prepare
status=0
bash "$fixture/frontend/prepare_files.sh" > "$scratch/output" 2>&1 || status=$?
[[ "$status" == 73 ]] || fail 'preparation lost move failure status'
[[ "$(cat "$CALL_LOG")" == prepare ]] || fail 'preparation continued after failed move'
[[ -f "$fixture/frontend/build/z-later.txt" ]] || fail 'later file moved after failure'
checks=$((checks + 1))

# A missing checkout directory must stop before running commands elsewhere.
unset FAIL_STAGE
"$REAL_MV" "$fixture/frontend" "$fixture/frontend-unavailable"
: > "$CALL_LOG"
status=0
bash "$fixture/routine_update.sh" > "$scratch/output" 2>&1 || status=$?
[[ "$status" != 0 ]] || fail 'missing frontend directory accepted'
printf 'pull\npip\n' > "$scratch/expected"
cmp -s "$scratch/expected" "$CALL_LOG" || fail 'commands continued after missing directory'
"$REAL_MV" "$fixture/frontend-unavailable" "$fixture/frontend"
checks=$((checks + 1))

# Sourcing remains compatible with an interactive Bash console: the child owns
# errexit, and its failure cannot swallow the subsequent console command.
export FAIL_STAGE=pull
bash -c 'before_options=$-; source "$FIXTURE/routine_update.sh"; result=$?; [[ $result == 73 ]] || exit 98; [[ $PWD == "$EXPECTED_CWD" && $- == "$before_options" ]] || exit 97; printf "console survived\n"' \
    > "$scratch/output" 2>&1
grep -q 'console survived' "$scratch/output" || fail 'sourced script exited console'
checks=$((checks + 1))
unset FAIL_STAGE
bash -c 'before_options=$-; source "$FIXTURE/routine_update.sh"; result=$?; [[ $result == 0 ]] || exit 98; [[ $PWD == "$EXPECTED_CWD" && $- == "$before_options" ]] || exit 97' \
    > "$scratch/output" 2>&1
grep -q 'Update completed successfully' "$scratch/output" || fail 'sourced update did not complete'
checks=$((checks + 1))
printf 'Passed %s release-script checks.\n' "$checks"
