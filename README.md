# Baan — Learn Thai

Our own copy of Baan, originally built in Grok's app builder. It's a static site that runs entirely in the browser.

```bash
npm install
npm run dev          # local dev server
npm run build        # type-check + production build into dist/
npm run check:data   # sanity checks on the Thai data (tones vs romanization, etc.)
npm run smoke        # headless Chrome walk-through (needs ./serve.sh or a server on :4321)
./serve.sh [--build] # (re)start the static server on :4321 and a Cloudflare quick tunnel, print the URL
```

- Data: `src/data/` (scenes, vocab, tones, minimal sets, letters, glossary)
- Logic: `src/lib/` (store `baan.v1`, audio, speech, Thai helpers, tone trainer, router)
- Screens: `src/screens/`
- Plans: `ROADMAP.md`. History: `CHANGELOG.md`. Original review/spec: `/workspace/baan/REVIEW.md`.

## Hosting

Live at **https://learnthaibaan.github.io/**. `./deploy.sh` builds and force-pushes `dist/` to the `main` branch of
`learnthaibaan/learnthaibaan.github.io` (GitHub Pages, org site). Source stays in this repo.

The old address `https://kaskel87-a11y.github.io/baan/` (this repo's `gh-pages` branch) is a small redirect from
`legacy-redirect/`, published with `./deploy-legacy.sh`. It packs the browser's `baan.*` progress into the link, retires the
old service worker, and forwards deep links (`#/scene/cafe`). The new site imports that progress only when it has none
of its own (`src/lib/migrate.ts`). Test: `node scripts/test-migrate.mjs` (two local origins, see the file header).

### Local tunnel

`serve.sh` serves `dist/` on localhost:4321 and opens a Cloudflare quick tunnel (no account needed). Things to know:

- Quick-tunnel URLs are random and **change every time the tunnel restarts**.
- Progress is saved per browser **and per address**, so a new tunnel URL starts with empty progress.
- Quick tunnels need outbound port 7844. This box's network blocks it (see `.run/tunnel.log`), so the tunnel can't connect from here.

Because `dist/` is plain static files, a permanent host (GitHub Pages, Cloudflare Pages, Netlify) is the better long-term option, and it keeps progress on one stable address.
