#!/usr/bin/env bash
# Publish the old-address redirect (legacy-redirect/) to https://kaskel87-a11y.github.io/baan/
# Usage: ./deploy-legacy.sh [--local DIR] [NEW_HOME]   (default NEW_HOME https://learnthaibaan.github.io/)
set -e
cd "$(dirname "$0")"
LOCAL=""
if [[ "${1:-}" == "--local" ]]; then LOCAL="$2"; shift 2; fi
HOME_URL="${1:-https://learnthaibaan.github.io/}"
OUT="$(mktemp -d)"
for f in index.html sw.js; do sed "s#__NEW_HOME__#${HOME_URL}#g" "legacy-redirect/$f" >"$OUT/$f"; done
cp "$OUT/index.html" "$OUT/404.html"
cp public/apple-touch-icon.png public/icon-192.png public/icon-512.png public/favicon.svg "$OUT/"
touch "$OUT/.nojekyll"
if [[ -n "$LOCAL" ]]; then rm -rf "$LOCAL"; mkdir -p "$LOCAL"; cp -a "$OUT/." "$LOCAL/"; rm -rf "$OUT"; echo "Built into $LOCAL"; exit 0; fi
cd "$OUT" && git init -q -b gh-pages && git add -A
git -c user.name=kaskel87-a11y -c user.email=kaskel87-a11y@users.noreply.github.com commit -qm "Redirect to ${HOME_URL} $(date -Iseconds)"
git push -qf https://github.com/kaskel87-a11y/baan.git gh-pages
cd / && rm -rf "$OUT"
echo "Old address now redirects: https://kaskel87-a11y.github.io/baan/ -> ${HOME_URL}"
