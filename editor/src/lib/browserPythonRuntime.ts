// browserPythonRuntime.ts - pyproc(브라우저 파이썬 프로세스 OS) 소비 세임.
// codaro가 공용 런타임 pyproc을 실제 import하는 첫 지점 = SSOT 성립의 증명점.
// 실행 SSOT는 로컬 Python 불변이고, 이 브라우저 티어는 보조(Chromium/Edge + crossOriginIsolated).
// 설계 근거: mainPlan/codaro-anywhere/18-pyproc-repo-extraction.md, 14-architecture.md.
import { boot, PyProc } from "pyproc";
import type { BootOptions, PyProcBootInfo, Runtime } from "pyproc";

export interface BrowserPythonSession {
  readonly runtime: Runtime;
  run(code: string): unknown;
}

/** 브라우저 파이썬 런타임을 부팅한다. Chromium/Edge + crossOriginIsolated 필요. */
export async function createBrowserPythonSession(opts?: BootOptions): Promise<BrowserPythonSession> {
  const runtime = await boot(opts);
  return {
    runtime,
    run: (code: string) => runtime.run(code),
  };
}

export interface ProcessPool {
  readonly pool: PyProc;
  readonly info: PyProcBootInfo;
}

/** 프로세스 OS 풀을 spawn한다(스냅샷-fork 병렬, 독립 GIL N개 = N코어). */
export async function spawnProcessPool(n: number): Promise<ProcessPool> {
  const pool = new PyProc();
  const info = await pool.boot(n);
  return { pool, info };
}
