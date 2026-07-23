// sharedKernelHost.js - SharedWorker 커널 호스트: 머신이 특정 탭 밖에서 산다.
// 같은 (URL, name)으로 연결한 모든 탭이 하나의 파이썬 상태를 공유한다(탭 = 화면).
// sharedKernel.js가 같은 폴더의 이 파일을 new URL 상대경로로 연다(위치 = 계약).
// 실측(tests/attempts/pythonMachine/sharedKernelProbe): 상태 공유·동시 요청 정합·JSPI ok.
// 벽: SharedWorker는 crossOriginIsolated=false(플랫폼 제약) = SAB 불가
//     -> interrupt/스냅샷-fork는 이 커널에서 불가. 실행/상태 공유 프리미티브가 v1 스코프.
// indexURL은 클라이언트가 쿼리로 반드시 싣는다(이 파일에 기본값 없음: 정의처는 runtime.js).
const INDEX = new URL(self.location.href).searchParams.get("index");

let bootP = null;
let connections = 0;
const ensure = () => bootP || (bootP = (async () => {
  if (!INDEX) throw new Error("sharedKernelHost: index 쿼리 누락(클라이언트 계약 위반)");
  const t0 = performance.now();
  const mod = await import(INDEX + "pyodide.mjs");
  const py = await mod.loadPyodide({ indexURL: INDEX });
  return { py, bootMs: Math.round(performance.now() - t0) };
})());

const norm = (r) => (r === undefined ? null : (typeof r === "object" && r && r.toJs ? r.toJs() : r));

self.onconnect = (e) => {
  const port = e.ports[0];
  connections++;
  port.onmessage = async (m) => {
    const { id, type, code, name, value } = m.data;
    try {
      const k = await ensure();
      if (type === "run") {
        port.postMessage({ id, ok: true, result: norm(k.py.runPython(code)) });
      } else if (type === "runAsync") {
        port.postMessage({ id, ok: true, result: norm(await k.py.runPythonAsync(code)) });
      } else if (type === "setGlobal") {
        k.py.globals.set(name, value);
        port.postMessage({ id, ok: true, result: null });
      } else if (type === "status") {
        port.postMessage({ id, ok: true, result: {
          bootMs: k.bootMs, connections,
          jspi: typeof WebAssembly.Suspending === "function",
          crossOriginIsolated: self.crossOriginIsolated === true,
        } });
      } else {
        port.postMessage({ id, ok: false, error: `알 수 없는 메시지 type: ${type}` });
      }
    } catch (err) {
      port.postMessage({ id, ok: false, error: String(err).slice(-300) });
    }
  };
};
