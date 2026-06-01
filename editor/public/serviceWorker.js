/* Codaro local shell cache.
 * Navigation must be network-first because editor builds use hashed _app assets.
 * If an old index.html is served from cache after a rebuild, the browser asks for
 * deleted JS/CSS chunks and receives HTML/404 instead of a module or stylesheet.
 */
const SHELL_CACHE = "codaro-shell-v2";
const RUNTIME_CACHE = "codaro-runtime-v2";
const LEGACY_CACHE_PREFIXES = ["codaro-static-", "codaro-runtime-", "workbox-"];
const SHELL_ASSETS = ["/manifest.json", "/favicon.png", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .filter((key) => LEGACY_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => refreshWindows()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/ws/")) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }
  if (url.pathname.startsWith("/_app/")) {
    event.respondWith(assetCacheFirst(request));
    return;
  }
  event.respondWith(shellCacheFirst(request));
});

async function shellCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    throw error;
  }
}

async function assetCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function navigationNetworkFirst(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put("/index.html", response.clone());
    }
    return response;
  } catch (error) {
    const fallback = await caches.match("/index.html");
    if (fallback) return fallback;
    throw error;
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function refreshWindows() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  await Promise.all(
    clients.map((client) => {
      if ("navigate" in client) {
        return client.navigate(client.url).catch(() => undefined);
      }
      return Promise.resolve();
    }),
  );
}
