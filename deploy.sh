#!/usr/bin/env bash
# Build and publish to GitHub Pages (https://kaskel87-a11y.github.io/baan/)
set -e
cd "$(dirname "$0")"
npm run build
cd dist && touch .nojekyll && rm -rf .git && git init -q -b gh-pages && git add -A
git -c user.name=kaskel87-a11y -c user.email=kaskel87-a11y@users.noreply.github.com commit -qm "Deploy $(date -Iseconds)"
git push -qf https://github.com/kaskel87-a11y/baan.git gh-pages
rm -rf .git
echo "Deployed: https://kaskel87-a11y.github.io/baan/"
