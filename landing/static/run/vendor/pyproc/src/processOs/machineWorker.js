// machineWorker.js - P5 machineContainers: 머신 안의 머신(컨테이너 커널).
// 이 워커는 자기 매니페스트(자기 패키지 세트)로 부팅한 독립 커널이고, 부모(커널 또는 상위
// 컨테이너)의 RPC로 run/kill/exportState를 수행한다. **중첩**: 이 워커가 다시 machineWorker를
// spawn하면 깊이 2의 머신이 된다(도커의 컨테이너-속-컨테이너). 각 층은 단순 postMessage RPC고
// 결과는 층을 거슬러 올라온다. pyProc.js worker.js(태스크 워커)와 다른 계약이라 별도 파일이다.
// 부팅은 bare 스냅샷(부모가 1회 제조해 SAB로 전달)으로 fast fork한다 = 컨테이너 부팅이
// 설치가 아니라 복원(< 1.5s). 스냅샷이 없으면 콜드 부팅으로 폴백한다. Runtime으로 감싸
// 두 번째 글루를 만들지 않는다. machineContainer.js가 같은 폴더의 이 파일을 spawn한다.
import { Runtime } from "../runtime/runtime.js";

let rt = null;
let ownSnapshot = null; // 이 컨테이너가 부팅한 스냅샷(중첩 자식에 물려준다 = fast fork 계승)
const children = new Map(); // childCid -> { worker, pending: Map }
let childSeq = 0;

// 자식(중첩 컨테이너) 워커에 RPC를 보내고 응답을 기다린다.
function callChild(childCid, msg) {
  const child = children.get(childCid);
  if (!child) return Promise.reject(new Error(`machineWorker: 자식 ${childCid} 없음`));
  const reqId = ++childSeq;
  return new Promise((resolve, reject) => {
    child.pending.set(reqId, { resolve, reject });
    child.worker.postMessage({ ...msg, reqId });
  });
}

onmessage = async (e) => {
  const msg = e.data;
  try {
    if (msg.type === "boot") {
      const t0 = performance.now();
      const mod = await import((msg.indexURL || "") + "pyodide.mjs");
      const manifest = msg.manifest || {};
      const opts = { indexURL: msg.indexURL };
      if (manifest.env) opts.env = manifest.env;
      if (msg.snapshot) {
        // fast fork: 부모의 bare 스냅샷을 워커 로컬 버퍼로 1회 복사(SAB 뷰는 TextDecoder가 거부).
        const shared = new Uint8Array(msg.snapshot);
        const copy = new Uint8Array(shared.byteLength); copy.set(shared);
        opts._loadSnapshot = copy;
        ownSnapshot = msg.snapshot; // 중첩 자식에 물려준다
      }
      const py = await mod.loadPyodide(opts);
      if (manifest.packages && manifest.packages.length) await py.loadPackage(manifest.packages);
      rt = new Runtime(py, msg.indexURL);
      if (manifest.setup) rt.run(manifest.setup);
      postMessage({ type: "booted", reqId: msg.reqId, bootMs: Math.round(performance.now() - t0) });
    } else if (msg.type === "run") {
      // 컨테이너 안 코드 실행. runAsync = JSPI 경로(중첩 RPC의 run_sync가 여기서 산다).
      const r = await rt.runAsync(msg.code);
      const result = r && r.toJs ? r.toJs() : (r === undefined ? null : r);
      if (r && r.destroy) r.destroy();
      postMessage({ type: "ran", reqId: msg.reqId, result });
    } else if (msg.type === "spawnChild") {
      // 중첩: 이 컨테이너가 자기 자식 컨테이너를 만든다(깊이 +1).
      const childCid = "c" + ++childSeq;
      const worker = new Worker(new URL("./machineWorker.js", import.meta.url), { type: "module" });
      const pending = new Map();
      worker.addEventListener("message", (ev) => {
        const p = pending.get(ev.data.reqId);
        if (!p) return;
        pending.delete(ev.data.reqId);
        if (ev.data.type === "error") p.reject(new Error(ev.data.error)); else p.resolve(ev.data);
      });
      children.set(childCid, { worker, pending });
      const booted = await callChild(childCid, { type: "boot", indexURL: msg.indexURL, snapshot: ownSnapshot, manifest: msg.manifest });
      postMessage({ type: "spawnedChild", reqId: msg.reqId, childCid, bootMs: booted.bootMs });
    } else if (msg.type === "callChild") {
      const ran = await callChild(msg.childCid, { type: "run", code: msg.code });
      postMessage({ type: "ran", reqId: msg.reqId, result: ran.result });
    } else if (msg.type === "killChild") {
      const child = children.get(msg.childCid);
      if (child) { child.worker.terminate(); children.delete(msg.childCid); }
      postMessage({ type: "killedChild", reqId: msg.reqId });
    } else if (msg.type === "heap") {
      // exportState 근거: 컨테이너 힙 바이트 길이(머신 이미지 크기의 하한 실측용).
      postMessage({ type: "heapLen", reqId: msg.reqId, heapLen: rt.memory.byteLength() });
    }
  } catch (err) {
    postMessage({ type: "error", reqId: msg.reqId, error: String(err).slice(-300) });
  }
};
