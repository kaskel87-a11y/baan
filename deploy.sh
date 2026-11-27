#!/usr/bin/env bash
# Build and publish to GitHub Pages: https://learnthaibaan.github.io/
# (repo learnthaibaan/learnthaibaan.github.io, branch main). The old address
# https://kaskel87-a11y.github.io/baan/ is a redirect published by ./deploy-legacy.sh.
set -e
cd "$(dirname "$0")"
npm run build
cd dist && touch .nojekyll && rm -rf .git && git init -q -b main && git add -A
git -c user.name=kaskel87-a11y -c user.email=kaskel87-a11y@users.noreply.github.com commit -qm "Deploy $(date -Iseconds)"
git push -qf https://github.com/learnthaibaan/learnthaibaan.github.io.git main
rm -rf .git
echo "Deployed: https://learnthaibaan.github.io/"
