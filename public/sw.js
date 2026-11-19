/* Takes over as soon as a new copy arrives, and never answers a page from an old cache.
   Home-screen icons are always fetched from the network. A cached miss is what makes
   Chrome on iPhone draw a letter instead of the house. */
const ICON = /\/(?:apple-touch-icon(?:-precomposed)?|icon(?:-maskable)?-\d+|favicon)\.(?:png|svg|ico)$|\/manifest\.webmanifest$/;

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
  if (ICON.test(url.pathname)) {
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }
  const shell = req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/sw.js");
  if (!shell) return;
  event.respondWith(fetch(req, { cache: "no-store" }));
});
