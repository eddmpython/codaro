// preflight.js - Layer 0: 환경 진단. "그냥 import하면 되나?"의 정직한 답.
// pyproc의 기본 표면(boot/run/enableReactive)은 특별한 준비 없이 Chromium에서 돈다. 그러나
// 프로세스 OS(PyProc: fork/map/interrupt), IPC, 소켓 블로킹 recv는 두 플랫폼 능력을 요구한다:
//   - crossOriginIsolated (SharedArrayBuffer) : 페이지에 COOP/COEP 헤더가 있어야 열린다.
//   - JSPI (WebAssembly.Suspending)           : Chrome 137+ 기본. subprocess/블로킹 input/recv의 전제.
// 이 파일은 표준 브라우저 전역만 읽어(UA 스니핑 대신 능력 감지) 무엇이 준비됐는지, 안 됐으면
// 정확히 무엇을 어떻게 고치는지 구조화해 돌려준다. 준비 안 된 능력을 실제로 쓰면 requireCoi가
// 암호 같은 실패(SharedArrayBuffer is not defined) 대신 실행 가능한 에러를 던진다.

import { PyProcError } from "./errors.js";

const HEADER_SNIPPET =
  "Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Embedder-Policy: require-corp";
const SETUP_URL = "https://github.com/eddmpython/pyproc#setup";

function hasCrossOriginIsolation() {
  return typeof globalThis.crossOriginIsolated === "boolean" ? globalThis.crossOriginIsolated : false;
}
function hasSharedArrayBuffer() {
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
      why: "PyProc (snapshot-fork / map / interrupt), IPC (pipe / shm / lock), and blocking socket recv all use SharedArrayBuffer.",
      fix: "Serve the page with these two response headers:\n  " + HEADER_SNIPPET +
        "\nOn static hosting that cannot set headers, register pyprocSw.js with ?coi=1 and reload once (virtual COI). Details: " + SETUP_URL,
    });
  }
  if (!jspi) {
    issues.push({
      code: "no-jspi",
      need: "JSPI (WebAssembly.Suspending)",
      why: "subprocess, blocking input, and blocking socket recv suspend Python through JSPI.",
      fix: "Use Chromium or Edge 137+ (JSPI ships on by default there). On an older build, update to the current Chrome or Edge. Details: " + SETUP_URL,
    });
  }

  return { ok: issues.length === 0, crossOriginIsolated, sharedArrayBuffer, jspi, issues };
}

// 능력 사용 지점의 가드: crossOriginIsolated가 아니면 암호 에러 대신 실행 가능한 에러를 던진다.
// feature = 안내에 쓸 능력 이름(예: "PyProc (process OS)"). 메시지는 영문이다: 이 문장은
// 소비자가 읽는 표면이고 README/api.md와 같은 언어라야 온보딩 장치로 실제 작동한다.
export function requireCoi(feature) {
  if (hasCrossOriginIsolation() && hasSharedArrayBuffer()) return;
  throw new PyProcError(
    "PYPROC_ENV_UNSUPPORTED",
    `${feature} needs SharedArrayBuffer (crossOriginIsolated). This page has crossOriginIsolated=${hasCrossOriginIsolation()}.\n` +
    "Serve the page with these headers:\n  " + HEADER_SNIPPET + "\n" +
    "On hosting that cannot set headers, register pyprocSw.js with ?coi=1 (virtual COI). The base surface (boot / run / history) works without them. Details: " + SETUP_URL,
  );
}

// JSPI 가드. 이 능력이 없으면 파이썬 서스펜드가 성립하지 않으므로, 실패를 엔진 깊은 곳의
// 암호 같은 트랩이 아니라 여기서 실행 가능한 문장으로 만든다(COI 가드와 같은 규율).
export function requireJspi(feature) {
  if (hasJspi()) return;
  throw new PyProcError(
    "PYPROC_ENV_UNSUPPORTED",
    `${feature} needs JSPI (WebAssembly.Suspending), which this browser does not expose.\n` +
    "Use Chromium or Edge 137+ (JSPI ships on by default there). Details: " + SETUP_URL,
  );
}
