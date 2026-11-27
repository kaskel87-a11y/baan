# Old-address redirect

Baan moved from `https://kaskel87-a11y.github.io/baan/` to `https://learnthaibaan.github.io/`.
`../deploy-legacy.sh` publishes these files to the `gh-pages` branch of `kaskel87-a11y/baan`:

- `index.html` (also copied to `404.html`): packs this browser's `baan.*` localStorage keys into
  `#migrate=z.<base64url deflate-raw JSON>` (or `j.` uncompressed when CompressionStream is missing), keeps a
  deep link as `&to=/scene/cafe`, unregisters only Baan's old service worker (scope `/baan/`), then
  `location.replace`s to the new home. Other apps on `kaskel87-a11y.github.io` are not touched.
- `sw.js`: replaces the old worker, clears only caches whose name contains "baan", loads pages past the HTTP cache (so a stale cached old app cannot come back)
  and reloads open Baan tabs. The redirect page then unregisters it.

The new app imports the payload in `src/lib/migrate.ts`, only when it has no progress yet.
Old progress stays in the old browser storage, so nothing is deleted.
