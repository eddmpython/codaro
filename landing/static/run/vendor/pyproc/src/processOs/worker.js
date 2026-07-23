// worker.js - PyProc의 "프로세스" (Web Worker 안 Pyodide 인터프리터).
// 부팅 3경로: 스냅샷(fast fork) / 콜드 / **리플레이**(결정적 부팅 = forkLive의 전제).
// pyProc.js가 같은 폴더의 이 파일을 new URL 상대경로로 spawn한다(위치 = 계약).
//
// 프로토콜(2026-07-12 수리): 모든 요청은 reqId를 싣고 오고, 모든 응답은 그 reqId를
// 그대로 되돌린다. 커널은 pid가 아니라 reqId로 응답을 상관시키므로 같은 워커에
// 요청이 겹쳐도(harvest 중 task 등) 교차 수신이 없다.
//
// forkLive(살아있는 커널의 진짜 fork(2)) 실측 - pythonMachine/forkLiveProbe 8/8:
//   메인 커널과 워커 커널의 리플레이는 힙 길이는 같아도 **바이트가 다르다**(로더/컨텍스트 차이).
//   워커 대 워커는 **바이트 동일**하다. 그래서 fork는 워커끼리만 성립하고, PyProc은 조율자다.
//   델타 10.3MB 수확 43.6ms, 부모 상태(변수·배열·계산) 전부 생존, 주소공간 독립.
import { installIpc } from "./ipc.js";

const PAGE = 65536;
let py = null;
let interruptView = null;
let cp0 = null; // 리플레이 경계의 힙 사본(fork 델타의 기준). replay 부팅에서만 채워진다.

const heap = () => py._module.HEAPU8;

// 부팅 구간의 비결정 소스를 고정한다(session.js stubEntropy와 같은 3개 소스).
function stubEntropy() {
  const o = { grv: crypto.getRandomValues.bind(crypto), dn: Date.now, pn: performance.now.bind(performance) };
  crypto.getRandomValues = (a) => { new Uint8Array(a.buffer, a.byteOffset, a.byteLength).fill(0x42); return a; };
  Date.now = () => 1750000000000;
  performance.now = () => 12345;
  return () => { crypto.getRandomValues = o.grv; Date.now = o.dn; performance.now = o.pn; };
}

// 복제 고유성: 스냅샷/리플레이로 태어난 프로세스들은 random 모듈 상태(메르센)까지 같다.
// 부팅 직후(리플레이는 cp0 확정 뒤) 실제 엔트로피로 재시드해 프로세스들을 갈라놓는다.
// fork는 예외로 부모 상태를 그대로 물려받는다(fork(2) 의미론. 델타가 이 재시드를 덮는다).
function reseedRandom() {
  py.runPython("import random as _pyprocR\n_pyprocR.seed()\ndel _pyprocR");
}

onmessage = async (e) => {
  const msg = e.data;
  const indexURL = msg.indexURL || "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/";
  try {
    if (msg.type === "boot") {
      const t0 = performance.now();
      const mod = await import(indexURL + "pyodide.mjs");
      const opts = { indexURL };
      if (msg.snapshot) {
        // fast fork. SAB 뷰를 그대로 주면 Pyodide 내부 TextDecoder가 거부한다
        // (shared buffer 불가) -> 워커 로컬 일반 버퍼로 1회 복사해 넘긴다.
        const shared = new Uint8Array(msg.snapshot);
        const copy = new Uint8Array(shared.byteLength);
        copy.set(shared);
        opts._loadSnapshot = copy;
      }
      // 리플레이 부팅: 같은 매니페스트의 워커들이 바이트 동일한 힙에 선다 = fork 가능한 풀.
      const replay = msg.replay || null;
      if (replay) opts.env = { PYTHONHASHSEED: "0", ...(replay.env || {}) };
      const restore = replay ? stubEntropy() : null;
      try {
        py = await mod.loadPyodide(opts);
        const packages = (replay && replay.packages) || msg.packages;
        if (packages && packages.length) await py.loadPackage(packages); // 프로세스별 패키지
        const setup = (replay && replay.setup) || msg.setup;
        if (setup) py.runPython(setup); // 부팅 시 예열(임포트 초기화를 태스크 밖으로)
      } finally { if (restore) restore(); }
      if (replay) { const h = heap(); cp0 = h.slice(0, h.length); } // 경계 사본 = 델타의 기준
      reseedRandom(); // cp0 확정 뒤에 실행: 경계 결정성은 지키고 프로세스는 갈라놓는다
      if (msg.interruptSab && py.setInterruptBuffer) {
        interruptView = new Uint8Array(msg.interruptSab); // 커널의 시그널 채널(SAB)
        py.setInterruptBuffer(interruptView);
      }
      postMessage({ type: "ready", id: msg.id, reqId: msg.reqId, bootMs: Math.round(performance.now() - t0), forked: !!msg.snapshot, replayed: !!replay, interrupts: !!interruptView });
    } else if (msg.type === "task") {
      // fnSrc = 파이썬 함수 정의 소스(def _fn(arg): ...), arg = 인자(JSON 직렬화 가능)
      py.globals.set("_arg", msg.arg);
      let r;
      try {
        r = py.runPython(msg.fnSrc + "\n_result = _fn(_arg)\n_result");
        // create_pyproxies:false = 결과는 직렬화 가능해야 한다는 계약을 기계로 강제한다
        // (숨은 PyProxy가 새지 않게). 변환 불가면 여기서 명시적 예외.
        const result = r === undefined ? null : (typeof r === "object" && r && r.toJs ? r.toJs({ create_pyproxies: false }) : r);
        postMessage({ type: "result", id: msg.id, reqId: msg.reqId, result });
      } finally {
        if (r && typeof r === "object" && r.destroy) r.destroy(); // WASM측 참조 해제(누적 방지)
      }
    } else if (msg.type === "repl") {
      // 자유 문장 실행 + stdout 캡처 + 마지막 식 값(REPL/잡 컨트롤 본체). 전역 상태는 누적된다
      // (대화형 레인). 식이면 값을 repr로, 문장이면 실행만. 잡은 이 위에서 fork된 레인에서 돈다.
      py.globals.set("_pyprocReplSrc", msg.code);
      const r = py.runPython(
        "import io as _pyprocIo, contextlib as _pyprocCtx\n" +
        "_pyprocBuf = _pyprocIo.StringIO()\n" +
        "_pyprocVal = None\n" +
        "with _pyprocCtx.redirect_stdout(_pyprocBuf), _pyprocCtx.redirect_stderr(_pyprocBuf):\n" +
        "    try:\n" +
        "        _pyprocVal = eval(compile(_pyprocReplSrc, '<repl>', 'eval'), globals())\n" +
        "    except SyntaxError:\n" +
        "        exec(_pyprocReplSrc, globals())\n" +
        "[_pyprocBuf.getvalue(), None if _pyprocVal is None else repr(_pyprocVal)]",
      );
      const [out, value] = r.toJs ? r.toJs() : r;
      if (r && r.destroy) r.destroy();
      postMessage({ type: "replResult", id: msg.id, reqId: msg.reqId, out, value });
    } else if (msg.type === "bindIpc") {
      // IPC 배선: SAB 항목들을 이 프로세스의 레지스트리에 등록하고(참조 공유), 파이썬
      // pyprocIpc 모듈을 세운다(1회). 이후 파이썬이 파이프/락/공유메모리를 파일처럼 만진다.
      installIpc(py, msg.items);
      postMessage({ type: "bound", id: msg.id, reqId: msg.reqId });
    } else if (msg.type === "harvest") {
      // fork의 부모측: cp0(리플레이 경계) 대비 바뀐 페이지 = 지금 이 커널의 사용자 상태.
      if (!cp0) throw new Error("harvest: 리플레이 부팅한 프로세스에서만 가능하다");
      const t0 = performance.now();
      const h = heap();
      const pages = [];
      const nCommon = Math.min(h.length, cp0.length) / PAGE;
      for (let p = 0; p < nCommon; p++) {
        const a = h.subarray(p * PAGE, (p + 1) * PAGE), b = cp0.subarray(p * PAGE, (p + 1) * PAGE);
        let same = true;
        for (let i = 0; i < PAGE; i += 8) { if (a[i] !== b[i]) { same = false; break; } } // 성긴 비교(빠른 기각)
        if (same) { for (let i = 0; i < PAGE; i++) { if (a[i] !== b[i]) { same = false; break; } } } // 확정 비교
        if (!same) pages.push(p);
      }
      for (let p = cp0.length / PAGE; p < h.length / PAGE; p++) pages.push(p); // 성장분 전량
      const bin = new Uint8Array(pages.length * PAGE);
      pages.forEach((p, i) => bin.set(h.subarray(p * PAGE, (p + 1) * PAGE), i * PAGE));
      const sp = py._module._emscripten_stack_get_current ? py._module._emscripten_stack_get_current() : null;
      postMessage({ type: "harvested", id: msg.id, reqId: msg.reqId, pages, bin: bin.buffer, sp, heapLen: h.length, ms: Math.round((performance.now() - t0) * 10) / 10 }, [bin.buffer]);
    } else if (msg.type === "applyDelta") {
      // fork의 자식측: 이 워커를 정확히 "cp0 + 부모 델타" 상태로 만든다(주소공간은 독립).
      // 델타만 덮으면 안 된다: dst가 경계 이후 실행으로 더럽힌 페이지 중 델타 밖의 것이 남아
      // 부모+자식 혼합 상태가 조용히 생긴다(2026-07-12 심판 발견). 그래서 먼저 델타 밖의
      // 드리프트를 cp0으로 되돌리고 그 위에 델타를 덮는다. 비용 = 힙 1회 스캔(수확과 동급).
      if (!cp0) throw new Error("applyDelta: 리플레이 부팅한 프로세스에서만 가능하다");
      const t0 = performance.now();
      const bin = new Uint8Array(msg.bin);
      // 부모 힙이 더 크면(성장 세션) 자식도 같은 길이까지 성장시킨다. JS에서 Memory.grow를
      // 직접 하면 Emscripten 글루가 깨지므로(session.js 실측) 파이썬 할당으로 정상 경로를 탄다.
      // 성장 루프의 흔적은 아래 드리프트 복원(cp0 범위)과 델타(성장 범위 전량 포함)가 지운다.
      if (msg.heapLen && msg.heapLen > heap().length) {
        py.runPython("_pyprocHold = []");
        while (heap().length < msg.heapLen) py.runPython("_pyprocHold.append(bytearray(8 * 1024 * 1024))");
        py.runPython("del _pyprocHold");
        if (heap().length < msg.heapLen) throw new Error(`applyDelta: 힙 성장 실패(목표 ${msg.heapLen}, 현재 ${heap().length})`);
      }
      const h = heap();
      let maxEnd = 0;
      for (const p of msg.pages) if ((p + 1) * PAGE > maxEnd) maxEnd = (p + 1) * PAGE;
      if (maxEnd > h.length) throw new Error(`applyDelta: 델타가 힙 밖(${maxEnd} > ${h.length})`);
      const incoming = new Set(msg.pages);
      let reverted = 0;
      const nCommon = Math.min(h.length, cp0.length) / PAGE;
      for (let p = 0; p < nCommon; p++) {
        if (incoming.has(p)) continue;
        const a = h.subarray(p * PAGE, (p + 1) * PAGE), b = cp0.subarray(p * PAGE, (p + 1) * PAGE);
        let same = true;
        for (let i = 0; i < PAGE; i += 8) { if (a[i] !== b[i]) { same = false; break; } } // 성긴 비교(빠른 기각)
        if (same) { for (let i = 0; i < PAGE; i++) { if (a[i] !== b[i]) { same = false; break; } } } // 확정 비교
        if (!same) { a.set(b); reverted++; }
      }
      // cp0 길이 밖(성장분)의 dst 잔재는 델타가 성장 범위를 전량 포함하므로 부모 길이까지
      // 전부 덮이고, 그 너머는 복원된 상태가 참조하지 않는다.
      msg.pages.forEach((p, i) => h.set(bin.subarray(i * PAGE, (i + 1) * PAGE), p * PAGE));
      if (msg.sp !== null && py._module._emscripten_stack_restore) py._module._emscripten_stack_restore(msg.sp);
      postMessage({ type: "applied", id: msg.id, reqId: msg.reqId, pages: msg.pages.length, reverted, ms: Math.round((performance.now() - t0) * 10) / 10 });
    }
  } catch (err) {
    if (interruptView) interruptView[0] = 0; // 시그널 소진 후 채널 리셋(다음 태스크 오염 방지)
    // traceback은 예외 타입이 끝에 온다. 자를 거면 꼬리를 남겨야 원인이 살아남는다.
    postMessage({ type: "error", id: msg.id, reqId: msg.reqId, error: String(err).slice(-300) });
  }
};
