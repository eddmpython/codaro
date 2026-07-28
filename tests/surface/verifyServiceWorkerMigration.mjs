import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const workerSource = fs.readFileSync(path.join(root, "editor/public/serviceWorker.js"), "utf8");
const legacyManifest = JSON.parse(
  fs.readFileSync(path.join(root, "editor/public/serviceWorkerLegacyCaches.json"), "utf8"),
);
const scopePath = "/codaro/run/";
const shellCacheKey = `codaro-shell-v3:${scopePath}`;
const runtimeCacheKey = `codaro-runtime-v3:${scopePath}`;
const foreignCacheKeys = [
  "codaro-static-foreign",
  "unrelated-product-cache",
  "workbox-precache-v2-foreign-project",
];
const cacheKeys = new Set([
  shellCacheKey,
  runtimeCacheKey,
  ...legacyManifest.ownedCacheKeys,
  ...foreignCacheKeys,
]);
const deletedCacheKeys = [];
let activationPromise = null;
let migrationReceipt = null;

const shellCache = {
  async addAll() {},
  async match(request) {
    const url = String(request);
    if (url.endsWith("/serviceWorkerLegacyCaches.json")) {
      return new Response(JSON.stringify(legacyManifest), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return undefined;
  },
  async put(request, response) {
    assert.equal(
      String(request),
      `${scopePath}.codaro/service-worker-migration-receipt.json`,
      "migration receipt must stay inside the active product scope",
    );
    migrationReceipt = JSON.parse(await response.text());
  },
};

const context = {
  Array,
  Date,
  Error,
  JSON,
  Promise,
  Response,
  Set,
  String,
  URL,
  caches: {
    async delete(cacheKey) {
      deletedCacheKeys.push(cacheKey);
      return cacheKeys.delete(cacheKey);
    },
    async keys() {
      return [...cacheKeys];
    },
    async match() {
      return undefined;
    },
    async open(cacheKey) {
      assert.equal(cacheKey, shellCacheKey);
      return shellCache;
    },
  },
  console,
  fetch: async () => {
    throw new Error("network access is not part of cache migration");
  },
  self: {
    clients: {
      async claim() {},
      async matchAll() {
        return [];
      },
    },
    location: { origin: "https://example.test" },
    registration: { scope: `https://example.test${scopePath}` },
    addEventListener(type, listener) {
      if (type !== "activate") return;
      listener({
        waitUntil(promise) {
          activationPromise = promise;
        },
      });
    },
  },
};

vm.runInNewContext(workerSource, context, { filename: "serviceWorker.js" });
assert.ok(activationPromise, "service worker activate handler did not register migration work");
await activationPromise;

assert.deepEqual(
  deletedCacheKeys.sort(),
  [...legacyManifest.ownedCacheKeys].sort(),
  "migration must delete only exact cache keys recorded in the Codaro ownership manifest",
);
for (const cacheKey of foreignCacheKeys) {
  assert.ok(cacheKeys.has(cacheKey), `foreign cache was deleted: ${cacheKey}`);
}
assert.ok(cacheKeys.has(shellCacheKey));
assert.ok(cacheKeys.has(runtimeCacheKey));
assert.equal(migrationReceipt?.status, "completed");
assert.equal(migrationReceipt?.migrationId, legacyManifest.migrationId);
assert.equal(migrationReceipt?.scopePath, scopePath);
assert.deepEqual(
  [...(migrationReceipt?.deletedCacheKeys ?? [])].sort(),
  [...legacyManifest.ownedCacheKeys].sort(),
);
assert.equal(migrationReceipt?.unmatchedCacheCount, foreignCacheKeys.length + 2);

console.log(
  `ok: service worker deleted ${deletedCacheKeys.length} exact Codaro caches and retained ${foreignCacheKeys.length} foreign caches`,
);
