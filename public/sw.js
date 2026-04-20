/* BondGame service worker — light caching + push handling */
const VERSION = "bg-sw-v1";
const SHELL = [
  "/",
  "/home",
  "/tasks",
  "/challenges",
  "/shop",
  "/profile",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL).catch(() => null)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for API + server-action requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request) || new Response("", { status: 503 })),
    );
    return;
  }

  // Stale-while-revalidate for app shell pages
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      const networkPromise = fetch(request)
        .then((res) => {
          if (res.ok && (request.destination === "document" || request.destination === "script" || request.destination === "style" || request.destination === "image")) {
            cache.put(request, res.clone()).catch(() => null);
          }
          return res;
        })
        .catch(() => cached || new Response("Offline", { status: 503 }));
      return cached || networkPromise;
    }),
  );
});

// Push handler — neutral copy for spicy
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {}
  const title = data.title || "BondGame";
  const body = data.body || "У вас есть новое обновление";
  const url = data.url || "/home";
  const tag = data.tag || "bondgame";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag,
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/home";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(url) && "focus" in w) return w.focus();
      }
      return clients.openWindow(url);
    }),
  );
});
