/* Codaro local shell cache.
 * Navigation must be network-first because editor builds use hashed _app assets.
 * If an old index.html is served from cache after a rebuild, the browser asks for
 * deleted JS/CSS chunks and receives HTML/404 instead of a module or stylesheet.
 */
const SCOPE_URL = new URL(self.registration.scope);
const SCOPE_PATH = SCOPE_URL.pathname.endsWith("/") ? SCOPE_URL.pathname : `${SCOPE_URL.pathname}/`;
const SHELL_CACHE = `codaro-shell-v3:${SCOPE_PATH}`;
const RUNTIME_CACHE = `codaro-runtime-v3:${SCOPE_PATH}`;
const scopedPath = (path) => new URL(path.replace(/^\/+/, ""), SCOPE_URL).pathname;
const LEGACY_CACHE_MANIFEST_PATH = scopedPath("serviceWorkerLegacyCaches.json");
const MIGRATION_RECEIPT_PATH = scopedPath(".codaro/service-worker-migration-receipt.json");
const SHELL_ASSETS = [
  scopedPath("manifest.json"),
  scopedPath("favicon.png"),
  scopedPath("favicon.svg"),
  LEGACY_CACHE_MANIFEST_PATH,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    migrateOwnedLegacyCaches()
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

async function migrateOwnedLegacyCaches() {
  const availableCacheKeys = await caches.keys();
  try {
    const manifest = await loadLegacyCacheManifest();
    const ownedCacheKeys = new Set(manifest.ownedCacheKeys);
    const matchedCacheKeys = availableCacheKeys.filter((key) => ownedCacheKeys.has(key));
    const deletionResults = await Promise.all(
      matchedCacheKeys.map(async (cacheKey) => ({
        cacheKey,
        deleted: await caches.delete(cacheKey),
      })),
    );
    const deletedCacheKeys = deletionResults
      .filter((result) => result.deleted)
      .map((result) => result.cacheKey);
    await writeMigrationReceipt({
      schemaVersion: 1,
      migrationId: manifest.migrationId,
      scopePath: SCOPE_PATH,
      status: deletedCacheKeys.length === matchedCacheKeys.length ? "completed" : "partial",
      examinedCacheCount: availableCacheKeys.length,
      unmatchedCacheCount: availableCacheKeys.length - matchedCacheKeys.length,
      matchedCacheKeys,
      deletedCacheKeys,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    await writeMigrationReceipt({
      schemaVersion: 1,
      migrationId: "unavailable",
      scopePath: SCOPE_PATH,
      status: "skipped",
      examinedCacheCount: availableCacheKeys.length,
      unmatchedCacheCount: availableCacheKeys.length,
      matchedCacheKeys: [],
      deletedCacheKeys: [],
      completedAt: new Date().toISOString(),
      failure: error instanceof Error ? error.message : String(error),
    });
  }
}

async function loadLegacyCacheManifest() {
  const shellCache = await caches.open(SHELL_CACHE);
  const response = await shellCache.match(LEGACY_CACHE_MANIFEST_PATH);
  if (!response) throw new Error("legacy cache manifest is unavailable");
  const manifest = await response.json();
  if (
    !manifest
    || manifest.schemaVersion !== 1
    || typeof manifest.migrationId !== "string"
    || !manifest.migrationId
    || !Array.isArray(manifest.ownedCacheKeys)
    || !manifest.ownedCacheKeys.length
    || manifest.ownedCacheKeys.some((key) => typeof key !== "string" || !key)
    || new Set(manifest.ownedCacheKeys).size !== manifest.ownedCacheKeys.length
    || manifest.ownedCacheKeys.includes(SHELL_CACHE)
    || manifest.ownedCacheKeys.includes(RUNTIME_CACHE)
  ) {
    throw new Error("legacy cache manifest is invalid");
  }
  return manifest;
}

async function writeMigrationReceipt(receipt) {
  const shellCache = await caches.open(SHELL_CACHE);
  await shellCache.put(
    MIGRATION_RECEIPT_PATH,
    new Response(JSON.stringify(receipt), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    }),
  );
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
