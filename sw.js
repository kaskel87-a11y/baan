/* Baan moved to https://learnthaibaan.github.io/. This replaces the old Baan service worker at this address.
   It takes over at once, clears only Baan's own caches, and reloads open Baan tabs. Page loads go
   to the network past the browser cache, so a stale copy of the old app can't come back; the
   redirect page (which carries progress over) then unregisters this worker. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const ready = (async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => /baan/i.test(k)).map((k) => caches.delete(k)));
    } catch {}
    await self.clients.claim();
  })();
  event.waitUntil(ready);
  // Reload open Baan tabs after activation (not inside waitUntil, so a slow tab can't hold the worker up).
  ready.then(async () => {
    const tabs = await self.clients.matchAll({ type: "window" });
    const scope = self.registration.scope;
    for (const tab of tabs) {
      if (tab.url.startsWith(scope) && "navigate" in tab) tab.navigate(tab.url).catch(() => {});
    }
  }).catch(() => {});
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.mode !== "navigate") return;
  event.respondWith(fetch(req, { cache: "reload" }).catch(() => fetch(req)));
});
