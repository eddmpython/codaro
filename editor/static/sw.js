const CACHE_NAME = "codaro-v1";
const SHELL_ASSETS = [
  "/",
  "/assets/manifest.json",
  "/assets/favicon.ico",
  "/assets/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (
            response.status === 200 &&
            response.type === "basic" &&
            (request.url.endsWith(".js") ||
              request.url.endsWith(".css") ||
              request.url.endsWith(".html") ||
              request.url.endsWith(".png") ||
              request.url.endsWith(".ico") ||
              request.url.endsWith(".woff2"))
          ) {
            const toCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, toCache);
            });
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("", { status: 503 });
        });
    })
  );
});
