// PM-AJAY Livelihood Intelligence Platform (LIP) - Service Worker
// Offline Caching for Low-Connectivity & Village Field Use

const CACHE_NAME = "lip-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/interview",
  "/passport",
  "/pathways",
  "/journey",
  "/help",
  "/field",
  "/manifest.json",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[LIP SW] Pre-caching static assets for offline readiness");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[LIP SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network first, falling back to cache if offline
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Default fallback for html navigation
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/interview");
          }
        });
      })
  );
});
