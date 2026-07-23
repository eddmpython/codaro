// assets.js - Layer 0: 소비 제품이 같은 오리진에 배포해야 하는 실행 자산 manifest.
// 브라우저 Worker/SharedWorker/Service Worker는 same-origin 경계가 강하고, import 그래프는 런타임에
// 브라우저가 직접 가져간다. 따라서 제품은 "어떤 파일이 실행 자산인가"를 문서 추측이 아니라
// 공개 계약으로 받아야 한다. 실제 SRI 해시 봉인은 배포 파이프라인 단계가 담당하고, 이 모듈은
// 경로/역할/스코프를 고정한다. pyproc-assets CLI가 만든 SRI manifest를 주면 런타임은 Worker를
// 만들기 전에 해당 graph의 실제 바이트를 SHA-256으로 검증할 수 있다.

export const PYPROC_ASSET_MANIFEST_VERSION = 1;

const ASSETS = Object.freeze([
  Object.freeze({
    role: "processWorker",
    path: "src/processOs/worker.js",
    kind: "module-worker",
    sameOrigin: true,
    usedBy: ["PyProc", "SyscallBridge"],
    reason: "프로세스 OS 워커와 subprocess 워커 엔트리포인트",
  }),
  Object.freeze({
    role: "sharedKernelHost",
    path: "src/processOs/sharedKernelHost.js",
    kind: "shared-worker",
    sameOrigin: true,
    usedBy: ["SharedKernel"],
    reason: "탭 밖 공유 커널 SharedWorker 엔트리포인트",
  }),
  Object.freeze({
    role: "machineWorker",
    path: "src/processOs/machineWorker.js",
    kind: "module-worker",
    sameOrigin: true,
    usedBy: ["MachineContainer"],
    reason: "컨테이너 커널과 중첩 컨테이너 워커 엔트리포인트",
  }),
  Object.freeze({
    role: "wasiWorker",
    path: "src/runtime/engines/wasi/wasiWorker.js",
    kind: "module-worker",
    sameOrigin: true,
    usedBy: ["WasiSession"],
    reason: "non-Pyodide CPython WASI 세션 워커 엔트리포인트",
  }),
  Object.freeze({
    role: "pyprocServiceWorker",
    path: "src/capabilities/pyprocSw.js",
    kind: "service-worker",
    sameOrigin: true,
    usedBy: ["VirtualOrigin", "COI bootstrap", "offline core cache"],
    reason: "가상 오리진, COOP/COEP 주입, 오프라인 코어 캐시 서비스 워커",
  }),
]);

function packageRootFrom(metaUrl) {
  return new URL("../../", metaUrl).href;
}

function normalizeRoot(baseURL) {
  if (!baseURL) return packageRootFrom(import.meta.url);
  const raw = String(baseURL);
  if (raw.startsWith("/")) return raw.endsWith("/") ? raw : raw + "/";
  const root = new URL(raw, packageRootFrom(import.meta.url));
  return root.href.endsWith("/") ? root.href : root.href + "/";
}

function joinAssetURL(root, path) {
  if (root.startsWith("/") || root.startsWith("./") || root.startsWith("../")) return root + path;
  return new URL(path, root).href;
}

function base64FromBytes(bytes) {
  if (typeof btoa === "function") {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  throw new Error("assetIntegrity: base64 인코더가 없다");
}

async function sha256Sri(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) throw new Error("assetIntegrity: crypto.subtle이 필요하다");
  return "sha256-" + base64FromBytes(new Uint8Array(await subtle.digest("SHA-256", bytes)));
}

function parseSri(value) {
  return String(value || "").trim().split(/\s+/).filter((v) => v.startsWith("sha256-"));
}

function matchesSelection(file, roleSet, pathSet) {
  if (pathSet && pathSet.has(file.path)) return true;
  if (!roleSet) return !pathSet;
  const roles = Array.isArray(file.roles) ? file.roles : [];
  return roles.some((r) => roleSet.has(r));
}

function serviceWorkerFile(manifest) {
  const files = Array.isArray(manifest?.files) ? manifest.files : [];
  const selected = files.filter((file) => Array.isArray(file.roles) && file.roles.includes("pyprocServiceWorker"));
  if (!selected.length) throw new Error("assetIntegrity: pyprocServiceWorker 파일이 없다");
  const exact = selected.find((file) => file.path === "src/capabilities/pyprocSw.js");
  return exact || selected[0];
}

function applyServiceWorkerQuery(url, opts) {
  const base = globalThis.location?.href || "https://pyproc.invalid/";
  const u = new URL(url, base);
  const setParam = (name, value) => {
    if (value === undefined || value === null || value === false) return;
    u.searchParams.set(name, value === true ? "1" : String(value));
  };
  setParam("cache", opts.cache);
  setParam("asgi", opts.asgi);
  setParam("coi", opts.coi);
  setParam("cdn", opts.cdn);
  setParam("coreIntegrity", opts.coreIntegrity);
  if (opts.coreRequired === false) u.searchParams.set("coreRequired", "0");
  else setParam("coreRequired", opts.coreRequired);
  setParam("asgiTimeout", opts.asgiTimeout);
  const query = opts.query;
  if (query instanceof URLSearchParams) {
    for (const [key, value] of query) setParam(key, value);
  } else if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) setParam(key, value);
  }
  if (globalThis.location) return u.href;
  return `${u.pathname}${u.search}${u.hash}`;
}

/**
 * pyproc 실행 자산 manifest.
 *
 * 반환값은 제품 배포 파이프라인이 복사/해시/SRI manifest를 만들 때 쓰는 정본이다. `assets[].url`은
 * `baseURL` 기준으로 계산된다. 기본값은 현재 패키지의 실제 ESM 위치다.
 */
export function getPyProcAssetManifest(opts = {}) {
  const root = normalizeRoot(opts.baseURL);
  return {
    version: PYPROC_ASSET_MANIFEST_VERSION,
    packageRoot: root,
    policy: {
      sameOriginRequired: true,
      preserveRelativeImports: true,
      runtimePreflight: true,
      note: "src/ 트리의 상대 import 구조를 보존해 같은 오리진에 배포한다. Worker/SW 엔트리포인트만 CDN 교차 오리진으로 두면 실패한다.",
    },
    assets: ASSETS.map((asset) => ({ ...asset, url: joinAssetURL(root, asset.path) })),
  };
}

/**
 * pyproc-assets CLI가 만든 SRI manifest를 실제 배포 바이트와 대조한다.
 *
 * 브라우저는 module Worker의 하위 import에 SRI 속성을 직접 걸 수 없다. 그래서 이 함수는 Worker를
 * 만들기 전에 graph 전체를 fetch + SHA-256으로 검증하는 preflight다. 같은 오리진의 불변 배포 자산을
 * 전제로 하며, 검증 실패나 manifest 누락은 실행 전에 예외로 막는다.
 */
export async function verifyPyProcAssetIntegrity(manifest, opts = {}) {
  if (!manifest) return null;
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (!files.length) throw new Error("assetIntegrity: pyproc-assets manifest의 files 배열이 필요하다");
  const roleSet = opts.roles ? new Set(opts.roles) : null;
  const pathSet = opts.paths ? new Set(opts.paths) : null;
  const selected = files.filter((file) => matchesSelection(file, roleSet, pathSet));
  if (!selected.length) {
    const label = opts.roles ? `roles=${[...roleSet].join(",")}` : `paths=${[...pathSet].join(",")}`;
    if (opts.required === false) return { verified: 0, bytes: 0, files: [] };
    throw new Error(`assetIntegrity: 검증 대상 없음(${label})`);
  }
  const fetchFn = opts.fetch || globalThis.fetch;
  if (typeof fetchFn !== "function") throw new Error("assetIntegrity: fetch가 필요하다");
  let total = 0;
  const verified = [];
  for (const file of selected) {
    if (!file || !file.path || !file.url) throw new Error("assetIntegrity: file.path/url 누락");
    const expected = parseSri(file.integrity);
    if (!expected.length) throw new Error(`assetIntegrity: ${file.path}의 sha256 SRI 값이 없다`);
    const resp = await fetchFn(file.url, {
      cache: opts.cache || "no-store",
      credentials: opts.credentials || "same-origin",
    });
    if (!resp || !resp.ok) throw new Error(`assetIntegrity: ${file.path} 로드 실패(${resp ? resp.status : "no response"})`);
    const data = await resp.arrayBuffer();
    const actual = await sha256Sri(data);
    if (!expected.includes(actual)) throw new Error(`assetIntegrity: ${file.path} 해시 불일치(expected ${expected[0].slice(0, 19)}..., actual ${actual.slice(0, 19)}...)`);
    total += data.byteLength;
    verified.push(file.path);
  }
  return { verified: verified.length, bytes: total, files: verified };
}

/**
 * pyproc Service Worker 자산을 SRI 검증한 뒤 manifest에 기록된 URL로 등록한다.
 *
 * 소비자가 별도 문자열로 register 경로를 만들면 "검증한 파일"과 "등록한 파일"이 갈라질 수 있다.
 * 이 helper는 pyproc-assets 산출물의 pyprocServiceWorker role을 먼저 검증하고, 같은 file.url만
 * register에 넘긴다. query 옵션은 pyprocSw.js의 cache/asgi/coi 모드를 켜는 공개 계약이다.
 */
export async function registerPyProcServiceWorker(manifest, opts = {}) {
  const nav = opts.navigator || globalThis.navigator;
  if (!nav?.serviceWorker?.register) throw new Error("pyprocServiceWorker: navigator.serviceWorker.register가 필요하다");
  const file = serviceWorkerFile(manifest);
  const integrity = await verifyPyProcAssetIntegrity(manifest, {
    roles: ["pyprocServiceWorker"],
    fetch: opts.fetch,
    cache: opts.verifyCache,
    credentials: opts.credentials,
  });
  const url = applyServiceWorkerQuery(file.url, opts);
  const registrationOptions = {};
  if (opts.scope) registrationOptions.scope = opts.scope;
  if (opts.updateViaCache) registrationOptions.updateViaCache = opts.updateViaCache;
  const registration = await nav.serviceWorker.register(url, registrationOptions);
  return { registration, integrity, url, file: file.path };
}
