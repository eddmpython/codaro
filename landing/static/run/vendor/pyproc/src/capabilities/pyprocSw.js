// pyprocSw.js - pyproc의 Service Worker 계층(소비자가 자기 오리진에서 등록하는 자산).
// virtualOrigin.js와 같은 폴더 고정(자산 경로 계약). 이 파일은 SW 컨텍스트에서 돌므로
// 모듈 import 없이 자기충족이다. 기능은 등록 URL 쿼리로 켠다:
//   pyprocSw.js?cache=1                 - Pyodide CDN 자산 캐시-우선(2차 부팅 네트워크 0).
//   pyprocSw.js?cache=1&coreIntegrity=/pyodide-integrity.json
//                                       - SW가 script/module/wasm/zip 바이트를 캐시 전 SRI 검증.
//   pyprocSw.js?asgi=/pyproc/           - 그 접두 경로 fetch를 페이지 커널 ASGI로 위임(가상 오리진).
//   pyprocSw.js?coi=1                   - COOP/COEP 헤더 주입: 헤더를 못 다는 호스팅(GitHub Pages)에서
//                                         crossOriginIsolated를 성립시켜 SAB(프로세스 OS)를 연다.
//   조합 가능(예: ?cache=1&coi=1). cdn=<접두URL>로 캐시 대상 교체.
// 실측: runtimeParity/swOriginProbe(왕복 3.4ms = dispatch와 동일, SW 오버헤드 0),
//       pythonMachine/swOfflineProbe(2차 부팅 CDN miss 0), pythonMachine/swCoiProbe(COI 주입).
const params = new URL(self.location.href).searchParams;
const CACHE_ON = params.get("cache") === "1";
const ASGI_PREFIX = params.get("asgi"); // 예: "/pyproc/". 없으면 위임 꺼짐.
const COI_ON = params.get("coi") === "1";
const CDN = params.get("cdn") || "https://cdn.jsdelivr.net/pyodide/"; // 기본 엔진 배포 지점(runtime.js DEFAULT_INDEX의 버전 상위 접두)
const CORE_INTEGRITY_URL = params.get("coreIntegrity");
const CORE_REQUIRED = params.get("coreRequired") !== "0";
const CACHE_NAME = "pyprocCore";
// 커널 무응답 상한(ms). 등록 쿼리로 조정: ?asgiTimeout=30000. 커널이 죽었거나 bind() 전이면
// 요청이 영원히 매달리는 대신 504로 정직하게 실패한다.
const ASGI_TIMEOUT_MS = Number(params.get("asgiTimeout") || 10000);

// 커널 클라이언트 등록부(hello). VirtualOrigin.bind()가 보낸다. SW 재시작 시 증발하며,
// 그 경우 아래 dispatch의 폴백(요청 클라이언트 -> 첫 창)과 타임아웃이 안전망이다.
let kernelClientId = null;
let coreIntegrityLoad = null;
self.addEventListener("message", (e) => {
  if (e.data && e.data.pyprocKernelHello && e.source) kernelClientId = e.source.id;
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (CACHE_ON && e.request.url.startsWith(CDN)) return e.respondWith(coreCache(e));
  if (ASGI_PREFIX && url.origin === self.location.origin) {
    const i = url.pathname.indexOf(ASGI_PREFIX);
    if (i !== -1) return e.respondWith(dispatch(e, url.pathname.slice(i + ASGI_PREFIX.length - 1), url.search.slice(1)));
  }
  if (COI_ON) return e.respondWith(coiInject(e));
});

// COI 주입: 문서/워커 응답에 COOP/COEP를, 그 외 응답에 CORP를 실어 재서빙한다.
// 첫 방문은 SW가 장악 전이라 페이지가 등록 후 1회 새로고침해야 한다(부트스트랩은 등록자 몫).
// opaque(cross-origin no-cors) 응답은 헤더 수정이 불가능해 원본 그대로 통과한다:
// CDN이 자체 CORP를 보내야 하며 jsdelivr는 보낸다(swOfflineProbe에서 COEP 하에 동작 실측).
async function coiInject(e) {
  const resp = await fetch(e.request);
  if (resp.type === "opaque" || resp.type === "opaqueredirect" || resp.status === 0) return resp;
  const headers = new Headers(resp.headers);
  const dest = e.request.destination;
  if (dest === "document" || dest === "worker" || dest === "sharedworker") {
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  }
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers });
}

function base64FromBytes(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function sha256Sri(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return "sha256-" + base64FromBytes(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
}

function parseSri(value) {
  return String(value || "").trim().split(/\s+/).filter((v) => v.startsWith("sha256-"));
}

function addIntegrityKey(map, key, value) {
  if (!key || !value) return;
  map.set(String(key), value);
  const u = new URL(key, self.location.href);
  map.set(u.href, value);
  map.set(u.pathname, value);
  map.set(u.pathname.replace(/^\/+/, ""), value);
}

function normalizeIntegrityMap(payload) {
  const map = new Map();
  if (Array.isArray(payload?.files)) {
    for (const file of payload.files) {
      addIntegrityKey(map, file.url, file.integrity);
      addIntegrityKey(map, file.path, file.integrity);
    }
    return map;
  }
  const files = payload?.files && typeof payload.files === "object" ? payload.files : payload;
  for (const [key, value] of Object.entries(files || {})) addIntegrityKey(map, key, value);
  return map;
}

async function coreIntegrityMap() {
  if (!CORE_INTEGRITY_URL) return null;
  if (!coreIntegrityLoad) {
    coreIntegrityLoad = fetch(new URL(CORE_INTEGRITY_URL, self.location.href).href, { cache: "no-store", credentials: "same-origin" })
      .then((resp) => {
        if (!resp.ok) throw new Error(`coreIntegrity manifest 로드 실패(${resp.status})`);
        return resp.json();
      })
      .then(normalizeIntegrityMap);
  }
  return coreIntegrityLoad;
}

async function verifyCoreResponse(requestUrl, resp) {
  const map = await coreIntegrityMap();
  if (!map) return resp;
  const u = new URL(requestUrl);
  const expected = map.get(u.href) || map.get(u.pathname) || map.get(u.pathname.replace(/^\/+/, ""));
  if (!expected) {
    if (CORE_REQUIRED) throw new Error(`coreIntegrity: ${u.pathname} 항목이 없다`);
    return resp;
  }
  if (resp.type === "opaque" || resp.type === "opaqueredirect" || resp.status === 0) {
    throw new Error(`coreIntegrity: ${u.pathname} opaque 응답은 검증할 수 없다`);
  }
  const data = await resp.clone().arrayBuffer();
  const actual = await sha256Sri(data);
  if (!parseSri(expected).includes(actual)) throw new Error(`coreIntegrity: ${u.pathname} 해시 불일치`);
  return resp;
}

function integrityFailure(error) {
  return new Response(String(error instanceof Error ? error.message : error), {
    status: 500,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// 코어 캐시-우선: 한 번 받은 엔진 자산(js/mjs/wasm/zip/lock)은 다시 네트워크에 묻지 않는다.
// coreIntegrity를 주면 script/module import처럼 JS fetch 오버라이드가 못 보는 경로도 SW가 검증한다.
// opaque(no-cors script)는 검증할 수 없으므로 strict 모드에서는 거부한다.
async function coreCache(e) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(e.request.url);
    if (cached) return await verifyCoreResponse(e.request.url, cached);
    const resp = await fetch(e.request);
    await verifyCoreResponse(e.request.url, resp);
    if (resp.ok || resp.type === "opaque") await cache.put(e.request.url, resp.clone());
    return resp;
  } catch (error) {
    return integrityFailure(error);
  }
}

// 가상 오리진: 등록된 커널 클라이언트의 VirtualOrigin 배선으로 위임한다.
// 라우팅 순서 = hello로 등록된 커널 -> 요청을 낸 클라이언트 -> 첫 창. 등록이 있어야
// 가상 오리진에서 서빙된 문서(iframe/딴 탭)의 fetch도 커널에 닿는다(originFidelityProbe 실측).
// 요청 바디는 바이트(Uint8Array) 그대로, 요청 헤더는 [k, v] 배열로 싣는다(바이너리/인증 충실화).
// 참고 벽: SW 합성 응답의 Set-Cookie는 플랫폼이 스트립하므로 쿠키 세션은 불가(토큰 방식 사용).
async function dispatch(e, path, query) {
  let client = kernelClientId ? await self.clients.get(kernelClientId) : null;
  if (!client && e.clientId) client = await self.clients.get(e.clientId);
  if (!client) client = (await self.clients.matchAll({ type: "window" }))[0];
  if (!client) return new Response("pyproc kernel client 없음", { status: 503 });
  const body = e.request.method === "GET" || e.request.method === "HEAD" ? null : new Uint8Array(await e.request.arrayBuffer());
  const headers = [...e.request.headers];
  const ch = new MessageChannel();
  const reply = new Promise((res) => { ch.port1.onmessage = (m) => res(m.data); });
  client.postMessage({ pyprocAsgi: { method: e.request.method, path, query, body, headers } }, body ? [ch.port2, body.buffer] : [ch.port2]);
  const r = await Promise.race([reply, new Promise((res) => setTimeout(() => res(null), ASGI_TIMEOUT_MS))]);
  if (!r) return new Response(`pyproc kernel ${ASGI_TIMEOUT_MS}ms 무응답(VirtualOrigin.bind 미호출 또는 커널 사망)`, { status: 504 });
  if (r.error) return new Response(r.error, { status: 500 });
  const noBody = r.status === 101 || r.status === 204 || r.status === 205 || r.status === 304;
  // 합성 응답은 COI 문서 안에서 살아야 한다: 부모가 COEP(require-corp)면 이 헤더들이 없는
  // iframe 문서/자원은 로드가 차단된다(originFidelityProbe 실측). pyproc은 COI 전제 런타임이므로 기본 탑재.
  const respHeaders = new Headers(r.headers);
  respHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
  respHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  respHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  return new Response(noBody ? null : r.body, { status: r.status, headers: respHeaders });
}
