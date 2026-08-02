// rpcChannel.js - Layer 0: Worker RPC 상관의 단일 보관소(순수 배관, 의존은 errors.js뿐).
// reqId 발급 + pending 맵 + 사망 시 전건 명시 reject(영원히 매달리는 Promise 금지)를
// 한 곳에 둔다. pyProc(태스크 워커), machineContainer/machineWorker(컨테이너 커널),
// syscallBridge(subprocess 레인)가 같은 계약을 소비한다. 두 레이어의 소비자가 만나는
// 지점이라 Layer 0이다(heapDelta와 같은 근거). kernelElection(BroadcastChannel +
// outcome unknown 의미론)과는 계약이 달라 대상이 아니다.
//
// 의미론(pyProc 2026-07-12 수리 계약의 승계):
//   - 응답은 reqId로 상관시킨다(pid/cid가 아니라). 같은 워커에 요청이 겹쳐도 교차 수신 0.
//   - 모르는 응답(취소된 요청의 늦은 응답)은 버린다.
//   - fail(err) 시 pending 전건이 그 오류로 즉시 reject되고, 이후 request는
//     PYPROC_PROCESS_UNAVAILABLE로 즉시 reject된다.
//   - { type: "error" } 응답은 fromErrorPayload로 복원해 code/retryable/pyExcType을 보존한다.
import { PyProcError, fromErrorPayload } from "./errors.js";

export function createRpcPort(worker, opts = {}) {
  const label = opts.label || "rpc";
  const pending = new Map();
  let reqSeq = 0;
  let deadError = null;

  worker.addEventListener("message", (e) => {
    const p = pending.get(e.data.reqId);
    if (!p) return; // 취소/타임아웃된 요청의 늦은 응답
    pending.delete(e.data.reqId);
    if (e.data.type === "error") p.reject(fromErrorPayload(e.data)); else p.resolve(e.data);
  });
  worker.addEventListener("error", (e) => {
    fail(new PyProcError("PYPROC_WORKER_CRASHED", `${label} crashed: ${e.message || "unknown"}`, { retryable: true }));
  });
  worker.addEventListener("messageerror", () => {
    fail(new PyProcError("PYPROC_WORKER_CRASHED", `${label} failed to deserialize a message`, { retryable: true }));
  });

  function fail(err) {
    if (deadError) return;
    deadError = err instanceof PyProcError
      ? err
      : new PyProcError("PYPROC_WORKER_CRASHED", String((err && err.message) || err), { retryable: true });
    for (const p of pending.values()) p.reject(deadError);
    pending.clear();
    if (typeof opts.onDead === "function") opts.onDead(deadError);
  }

  // 요청 1건 발신. 취소가 필요한 호출자(map 타임아웃)는 cancel()로 등록을 지운다.
  function request(msg, transfer = []) {
    const reqId = ++reqSeq;
    const promise = new Promise((resolve, reject) => {
      if (deadError) return reject(new PyProcError("PYPROC_PROCESS_UNAVAILABLE", `${label} is dead`, { cause: deadError }));
      pending.set(reqId, { resolve, reject });
      worker.postMessage({ ...msg, reqId }, transfer);
    });
    return { reqId, promise, cancel: () => pending.delete(reqId) };
  }

  return {
    request,
    call: (msg, transfer = []) => request(msg, transfer).promise,
    fail,
    isDead: () => deadError !== null,
    pendingCount: () => pending.size,
  };
}
