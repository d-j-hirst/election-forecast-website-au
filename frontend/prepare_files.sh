#!/usr/bin/env bash
set -euo pipefail

# Django renders index.html, collectstatic consumes static/, and WhiteNoise
# serves the remaining public files from root/. Require a completed build
# before moving anything, and propagate any failed move to the update script.
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
[[ -f build/index.html && -d build/static ]]
mkdir -p build/root
shopt -s nullglob
for file in build/*; do
    case "$file" in
        build/index.html|build/static|build/root) continue ;;
    esac
    mv -- "$file" build/root/
done
