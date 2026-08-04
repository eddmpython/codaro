// landingPyproc.js - 랜딩 1회성 실행 셀용 경량 pyproc 부팅 래퍼.
// editor의 browserPythonRuntime(검증·FS·evidence 계약)과 달리 코드 실행 + stdout/stderr 수집만 한다.
// pyproc 자산은 같은 origin의 /codaro/run/ 산출물을 재사용한다(기본 BASE_URL/run/pyproc-assets.json).
// 동적 import로 첫 페인트 번들에서 분리되고, SSR(prerender) 시에는 부팅하지 않는다.
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
