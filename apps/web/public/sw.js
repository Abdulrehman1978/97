// Public assets only. Never cache private API data or route HTML.
const CACHE_NAME = "lip-public-assets-v3";
const STATIC_ASSETS = ["/offline.html", "/manifest.json", "/favicon.ico"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("lip-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || request.headers.has("Authorization") || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || request.headers.has("RSC") || url.searchParams.has("_rsc")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.match("/offline.html")) || new Response("Connection required", { status: 503 })
    ));
    return;
  }
  const isPublicAsset = STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/images/");
  if (!isPublicAsset || url.search) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === "basic" && !/private|no-store/i.test(response.headers.get("Cache-Control") || "")) {
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
