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

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Baan", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Baan";
  const options = {
    body: data.body || "",
    icon: "/baan/apple-touch-icon.png",
    badge: "/baan/apple-touch-icon.png",
    data: data.data || {},
    lang: "th",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const id = (event.notification.data && event.notification.data.id) || "";
  event.notification.close();
  const url = new URL(self.registration.scope);
  url.hash = id ? `/word/${encodeURIComponent(id)}` : "/path";
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of all) {
      if ("focus" in client) {
        await client.focus();
        client.postMessage({ type: "open-word", id });
        return;
      }
    }
    await self.clients.openWindow(url.href);
  })());
});
