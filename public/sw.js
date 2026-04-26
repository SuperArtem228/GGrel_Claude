/* BondGame service worker v3 — push + static-only cache (no HTML caching, fixes iOS redirect error) */
const VERSION = "bg-sw-v3";

// Only cache truly static assets — NOT HTML pages (they have auth redirects that break iOS Safari)
const STATIC = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      Promise.all(
        STATIC.map((url) =>
          fetch(url)
            .then((res) => { if (res.ok) cache.put(url, res); })
            .catch(() => null),
        ),
      ),
    ),
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

  // Only intercept same-origin requests
  if (url.origin !== self.location.origin) return;

  // ── HTML / navigation → always network, never cache ──────────────────
  // This prevents iOS "Response served by service worker has redirections" error.
  // Next.js pages are server-rendered with auth redirects — caching them breaks everything.
  if (request.destination === "document" || request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/manifest.webmanifest").then(() =>
          new Response("<h1>Нет соединения</h1><p>Проверь интернет и обнови страницу.</p>", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
            status: 503,
          }),
        ),
      ),
    );
    return;
  }

  // ── Next.js hashed static chunks → cache-first (safe, content-hashed) ─
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone()).catch(() => null);
        return res;
      }),
    );
    return;
  }

  // ── Icons / manifest → cache-first ────────────────────────────────────
  if (STATIC.some((s) => url.pathname === s)) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone()).catch(() => null);
        return res;
      }),
    );
    return;
  }

  // ── Everything else (API etc.) → network only ─────────────────────────
  // Don't cache — just pass through.
});

// ── Push notifications ────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.title || "BondGame";
  const body  = data.body  || "У вас есть новое обновление";
  const url   = data.url   || "/home";
  const tag   = data.tag   || "bondgame";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  "/icons/icon-192.png",
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
