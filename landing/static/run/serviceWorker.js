/* Codaro local shell cache.
 * Navigation must be network-first because editor builds use hashed _app assets.
 * If an old index.html is served from cache after a rebuild, the browser asks for
 * deleted JS/CSS chunks and receives HTML/404 instead of a module or stylesheet.
 */
const SCOPE_URL = new URL(self.registration.scope);
const SCOPE_PATH = SCOPE_URL.pathname.endsWith("/") ? SCOPE_URL.pathname : `${SCOPE_URL.pathname}/`;
const SHELL_CACHE = `codaro-shell-v3:${SCOPE_PATH}`;
const RUNTIME_CACHE = `codaro-runtime-v3:${SCOPE_PATH}`;
const LEGACY_CACHE_KEYS = new Set(["codaro-shell-v2", "codaro-runtime-v2"]);
const LEGACY_CACHE_PREFIXES = ["codaro-static-", "workbox-"];
const scopedPath = (path) => new URL(path.replace(/^\/+/, ""), SCOPE_URL).pathname;
const SHELL_ASSETS = [scopedPath("manifest.json"), scopedPath("favicon.png"), scopedPath("favicon.svg")];

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
            .filter((key) => (
              LEGACY_CACHE_KEYS.has(key)
              || LEGACY_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))
            ))
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

  if (url.pathname.startsWith(scopedPath("api/")) || url.pathname.startsWith(scopedPath("ws/"))) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }
  if (url.pathname.startsWith(scopedPath("_app/"))) {
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
      cache.put(scopedPath("index.html"), response.clone());
    }
    return response;
  } catch (error) {
    const fallback = await caches.match(scopedPath("index.html"));
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
