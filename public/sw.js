/* Takes over as soon as a new copy arrives, and never answers a page from an old cache. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const shell = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/sw.js");
  if (!shell) return;
  event.respondWith(fetch(req, { cache: "no-store" }));
});
