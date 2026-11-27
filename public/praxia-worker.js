const cacheName = "praxia-shell-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      const response = await fetch("/");
      if (!response.ok) throw Error("No se pudo preparar la aplicación");
      const html = await response.clone().text();
      await cache.put("/", response);
      const assets = [
        ...html.matchAll(
          /(?:src|href)="(\/_next\/static\/[^"?]+(?:\?[^" ]*)?)"/g,
        ),
      ].map((x) => x[1].replaceAll("&amp;", "&"));
      await cache.addAll([
        ...new Set([
          ...assets,
          "/pharmacy-illustration.webp",
          "/praxia-192.png",
          "/praxia-512.png",
        ]),
      ]);
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      await Promise.all(
        (await caches.keys())
          .filter((k) => k.startsWith("praxia-shell-") && k !== cacheName)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  const r = event.request,
    u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;
  if (r.mode === "navigate") {
    event.respondWith(fetch(r).catch(() => caches.match("/")));
    return;
  }
  if (u.pathname.startsWith("/_next/static/") || u.pathname.endsWith(".webp"))
    event.respondWith(
      (async () => {
        const cache = await caches.open(cacheName),
          cached = await cache.match(r);
        if (cached) return cached;
        const res = await fetch(r);
        if (res.ok) await cache.put(r, res.clone());
        return res;
      })(),
    );
});
