// preflight.js - Layer 0: 환경 진단. "그냥 import하면 되나?"의 정직한 답.
// pyproc의 기본 표면(boot/run/enableReactive)은 특별한 준비 없이 Chromium에서 돈다. 그러나
// 프로세스 OS(PyProc: fork/map/interrupt), IPC, 소켓 블로킹 recv는 두 플랫폼 능력을 요구한다:
//   - crossOriginIsolated (SharedArrayBuffer) : 페이지에 COOP/COEP 헤더가 있어야 열린다.
//   - JSPI (WebAssembly.Suspending)           : Chrome 137+ 기본. subprocess/블로킹 input/recv의 전제.
// 이 파일은 표준 브라우저 전역만 읽어(UA 스니핑 대신 능력 감지) 무엇이 준비됐는지, 안 됐으면
// 정확히 무엇을 어떻게 고치는지 구조화해 돌려준다. 준비 안 된 능력을 실제로 쓰면 requireCoi가
// 암호 같은 실패(SharedArrayBuffer is not defined) 대신 실행 가능한 에러를 던진다.

const HEADER_SNIPPET =
  "Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Embedder-Policy: require-corp";
const SETUP_URL = "https://github.com/eddmpython/pyproc#setup";

export function hasCrossOriginIsolation() {
  return typeof globalThis.crossOriginIsolated === "boolean" ? globalThis.crossOriginIsolated : false;
}
export function hasSharedArrayBuffer() {
  return typeof globalThis.SharedArrayBuffer === "function";
}
export function hasJspi() {
  return typeof WebAssembly !== "undefined" && "Suspending" in WebAssembly;
}

// 환경 진단. 반환: { ok, crossOriginIsolated, sharedArrayBuffer, jspi, issues }.
// ok=true면 모든 능력(프로세스 OS 포함)이 가능하다. 기본 표면만 쓸 거면 issues를 무시해도 된다
// (issues는 "이걸 안 고치면 프로세스 OS/소켓이 막힌다"는 안내지, boot 자체를 막는 게 아니다).
// 각 issue: { code, need, why, fix }.
export function checkEnvironment() {
  const crossOriginIsolated = hasCrossOriginIsolation();
  const sharedArrayBuffer = hasSharedArrayBuffer();
  const jspi = hasJspi();
  const issues = [];

  if (!crossOriginIsolated || !sharedArrayBuffer) {
    issues.push({
      code: "no-cross-origin-isolation",
      need: "SharedArrayBuffer (crossOriginIsolated)",
      why: "PyProc(스냅샷-fork/map/interrupt), IPC(pipe/shm/lock), 소켓 블로킹 recv가 SAB를 쓴다.",
      fix: "페이지를 서빙하는 응답에 다음 두 헤더를 달아라:\n  " + HEADER_SNIPPET +
        "\n헤더를 못 다는 정적 호스팅이면 pyprocSw.js를 ?coi=1로 등록하고 1회 새로고침(가상 COI). 상세: " + SETUP_URL,
    });
  }
  if (!jspi) {
    issues.push({
      code: "no-jspi",
      need: "JSPI (WebAssembly.Suspending)",
      why: "subprocess/블로킹 input/소켓 블로킹 recv가 JSPI로 파이썬을 서스펜드한다.",
      fix: "Chromium/Edge 137+ 를 쓰라(JSPI 기본 출시). 구버전이면 최신 Chrome/Edge로 갱신. 상세: " + SETUP_URL,
    });
  }

  return { ok: issues.length === 0, crossOriginIsolated, sharedArrayBuffer, jspi, issues };
}

// 능력 사용 지점의 가드: crossOriginIsolated가 아니면 암호 에러 대신 실행 가능한 에러를 던진다.
// feature = 안내에 쓸 능력 이름(예: "PyProc(프로세스 OS)").
export function requireCoi(feature) {
  if (hasCrossOriginIsolation() && hasSharedArrayBuffer()) return;
  throw new Error(
    `${feature}는 SharedArrayBuffer(crossOriginIsolated)가 필요하다. 지금 페이지는 crossOriginIsolated=${hasCrossOriginIsolation()}다.\n` +
    "페이지 응답에 다음 헤더를 달아라:\n  " + HEADER_SNIPPET + "\n" +
    "헤더를 못 다는 호스팅이면 pyprocSw.js를 ?coi=1로 등록(가상 COI). 기본 표면(boot/run/enableReactive)은 헤더 없이도 된다. 상세: " + SETUP_URL,
  );
}
