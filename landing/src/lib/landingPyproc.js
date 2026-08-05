// landingPyproc.js - 랜딩 1회성 실행 셀용 경량 pyproc 부팅 래퍼.
// editor의 browserPythonRuntime(검증·FS·evidence 계약)과 달리 코드 실행 + stdout/stderr 수집만 한다.
// pyproc 자산은 같은 origin의 /codaro/run/ 산출물을 재사용한다(기본 BASE_URL/run/pyproc-assets.json).
// 동적 import로 첫 페인트 번들에서 분리되고, SSR(prerender) 시에는 부팅하지 않는다.
// 클라이언트 hydrate 뒤에는 idle에 warmLandingRuntime()으로 같은 싱글턴을 미리 올려
// 첫 실행 버튼 지연을 줄인다. React state는 건드리지 않는다(하이드레이션 계약).
// pyproc 단일 boot 경로는 SharedArrayBuffer/COOP-COEP가 필요 없어 정적 호스팅에서도 돈다.

let runtimePromise = null;
let assetIntegrityPromise = null;
const stdoutBuffer = [];
const stderrBuffer = [];

function assetIntegrityUrl() {
  const envUrl = import.meta.env.VITE_PYPROC_ASSET_INTEGRITY_URL;
  if (typeof envUrl === "string" && envUrl.trim()) return envUrl;
  const appBase = import.meta.env.BASE_URL || "/";
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const baseHref = new URL(appBase, origin).href;
  const manifestUrl = new URL("run/pyproc-assets.json", baseHref);
  return `${manifestUrl.pathname}${manifestUrl.search}${manifestUrl.hash}`;
}

async function loadAssetIntegrity() {
  if (!assetIntegrityPromise) {
    assetIntegrityPromise = fetch(assetIntegrityUrl(), { cache: "no-store", credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
  }
  return assetIntegrityPromise;
}

export async function ensureLandingRuntime() {
  if (!runtimePromise) {
    runtimePromise = import("pyproc/runtime")
      .then(async (module) => {
        const { bootRuntime } = module;
        const assetIntegrity = await loadAssetIntegrity();
        return bootRuntime({
          stdout: (line) => stdoutBuffer.push(line),
          stderr: (line) => stderrBuffer.push(line),
          ...(assetIntegrity ? { assetIntegrity } : {}),
        });
      })
      .catch((error) => {
        runtimePromise = null;
        throw error;
      });
  }
  return runtimePromise;
}

/** hydrate 이후 idle에 pyproc를 미리 올린다. UI 상태 변경 없음. */
export function warmLandingRuntime() {
  if (typeof window === "undefined") return () => {};
  let cancelled = false;
  const start = () => {
    if (cancelled) return;
    void ensureLandingRuntime().catch(() => {
      // idle warm 실패는 조용히 둔다. 다음 실행이 다시 시도한다.
    });
  };
  let idleId;
  let timeoutId;
  if (typeof window.requestIdleCallback === "function") {
    idleId = window.requestIdleCallback(start, { timeout: 1500 });
  } else {
    timeoutId = window.setTimeout(start, 0);
  }
  return () => {
    cancelled = true;
    if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleId);
    }
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  };
}

export async function runLandingCode(code) {
  const runtime = await ensureLandingRuntime();
  stdoutBuffer.length = 0;
  stderrBuffer.length = 0;
  try {
    await runtime.runAsync(code);
  } catch (error) {
    stderrBuffer.push(String(error?.message || error));
  }
  return { stdout: stdoutBuffer.join("\n"), stderr: stderrBuffer.join("\n") };
}
