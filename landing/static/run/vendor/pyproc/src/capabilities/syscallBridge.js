// syscallBridge.js - Layer 1 능력: 빌린 시스템콜 브리지 (v1 실배선).
// 브라우저에는 blocking input / socket / subprocess가 없다. 이 능력이 그 부재를 빌려온다:
//   input()      -> JS 핸들러(동기) 또는 JSPI callSyncifying(비동기 핸들러, runAsync 경로)
//   urllib(HTTP) -> 동기 XHR(fetch의 동기 형태). proxyUrl을 주면 소비 제품의 프록시 경유
//   subprocess   -> 자식 워커의 독립 인터프리터(콜드 부팅). JSPI 필요, ["python","-c",code]만 (v1)
// 실측 근거: tests/attempts/syscallBridge. 저수준 socket 자체의 배선은 프론티어(로드맵) 몫이다.
import { verifyPyProcAssetIntegrity } from "../runtime/assets.js";

const BOOTSTRAP = `
import builtins, sys, io, subprocess, urllib.request
from pyodide.ffi import can_run_sync, run_sync

def _pyprocDecodeUserDefined(text):
    # x-user-defined 응답 텍스트 -> 원본 바이트. 그 charset 은 0x00~0xFF 를 U+0000~U+00FF /
    # U+F780~U+F7FF 로 1:1 사상하므로 하위 8비트가 원본이다. 문자 루프(bytes(ord(c)&0xFF ...))는
    # MB 응답에서 문자당 파이썬을 돌아 수 초를 먹는다(실측: 12.8MB 1.85s). UTF-16LE 로 C 레벨 1회
    # 인코딩하면 문자당 2바이트가 되고, numpy 로 하위 바이트만 벡터 추출한다(실측 0.38s, byte-identical).
    # numpy 부재/예외 시 옛 루프로 폴백(정확성 우선).
    try:
        import numpy as _np
        codes = _np.frombuffer(text.encode("utf-16-le"), dtype="<u2")
        return (codes & 0xFF).astype(_np.uint8).tobytes()
    except Exception:
        return bytes(ord(c) & 0xFF for c in text)

def _pyprocInput(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt)); sys.stdout.flush()
    # 호출 시점 판정: runAsync(JSPI 서스펜더) 안이면 비동기 핸들러를 블로킹으로 빌린다.
    if _pyprocSyscall.hasAsyncInput and can_run_sync():
        r = run_sync(_pyprocSyscall.inputAsync(str(prompt)))
    else:
        r = _pyprocSyscall.inputSync(str(prompt))
    if r is None:
        raise EOFError("pyproc input: 입력 소스가 없다 (install({ input }) 또는 prompt 가능 환경 필요)")
    return str(r)
builtins.input = _pyprocInput

class _PyprocResponse(io.BytesIO):
    def __init__(self, url, status, body):
        super().__init__(body)
        self.url = url; self.status = status; self.headers = {}
    def getcode(self): return self.status
    def geturl(self): return self.url

def _pyprocUrlopen(url, data=None, timeout=None, *a, **k):
    if hasattr(url, "full_url"):
        req = url; urlStr = req.full_url
        if data is None: data = req.data
    else:
        urlStr = str(url)
    body = None if data is None else bytes(data).decode("latin1")
    r = _pyprocSyscall.httpSync(urlStr, "GET" if data is None else "POST", body)
    if r.status == 0:
        raise OSError(f"pyproc http: 요청 실패 (CORS/네트워크): {urlStr}")
    raw = _pyprocDecodeUserDefined(r.body)
    return _PyprocResponse(urlStr, r.status, raw)
urllib.request.urlopen = _pyprocUrlopen

def _pyprocSubprocessRun(args, capture_output=False, text=None, **k):
    if not (isinstance(args, (list, tuple)) and len(args) >= 3 and str(args[1]) == "-c"):
        raise NotImplementedError("pyproc subprocess(v1): ['python', '-c', code] 형태만 지원")
    if not can_run_sync():
        raise NotImplementedError("pyproc subprocess: runAsync(JSPI) 경로에서만 가능")
    out = run_sync(_pyprocSyscall.subprocessRun(str(args[2])))
    return subprocess.CompletedProcess(list(args), 0, stdout=str(out), stderr="")
subprocess.run = _pyprocSubprocessRun
`;

// 자식 워커에서 code를 실행하고 stdout을 캡처해 돌려주는 래퍼(worker task 프로토콜 재사용).
const SUBPROC_FN = "def _fn(code):\n"
  + "    import io, contextlib\n"
  + "    buf = io.StringIO()\n"
  + "    with contextlib.redirect_stdout(buf):\n"
  + "        exec(code, {'__name__': '__main__'})\n"
  + "    return buf.getvalue()";

export class SyscallBridge {
  constructor(rt, cfg) { this._rt = rt; this._cfg = cfg; this._assetIntegrityCheck = null; }

  _httpSync(url, method, body) {
    const target = this._cfg.proxyUrl ? this._cfg.proxyUrl + "?url=" + encodeURIComponent(url) : url;
    const xhr = new XMLHttpRequest();
    try {
      xhr.open(method, target, false); // 동기 XHR = 파이썬 동기 시맨틱과 일치
      xhr.overrideMimeType("text/plain; charset=x-user-defined"); // 바이너리 보존(byte -> charCode)
      xhr.send(body ?? null);
      return { status: xhr.status, body: xhr.responseText || "" };
    } catch (e) {
      return { status: 0, body: String(e) };
    }
  }

  async _subprocessRun(code) {
    if (this._cfg.assetIntegrity) {
      this._assetIntegrityCheck ||= verifyPyProcAssetIntegrity(this._cfg.assetIntegrity, { roles: ["processWorker"] });
      await this._assetIntegrityCheck;
    }
    const w = new Worker(new URL("../processOs/worker.js", import.meta.url), { type: "module" });
    try {
      await new Promise((resolve, reject) => {
        w.addEventListener("message", function onMsg(e) {
          if (e.data.type === "ready") { w.removeEventListener("message", onMsg); resolve(); }
          else if (e.data.type === "error") { w.removeEventListener("message", onMsg); reject(new Error(e.data.error)); }
        });
        // 부모 커널과 같은 배포 지점으로 부팅한다(자가호스팅/오프라인에서 자식만 CDN으로 새지 않게).
        w.postMessage({ type: "boot", id: 1, snapshot: null, indexURL: this._rt.indexURL });
      });
      return await new Promise((resolve, reject) => {
        w.addEventListener("message", (e) => {
          if (e.data.type === "result") resolve(e.data.result);
          else if (e.data.type === "error") reject(new Error(e.data.error));
        });
        w.postMessage({ type: "task", taskId: 0, fnSrc: SUBPROC_FN, arg: code });
      });
    } finally {
      w.terminate();
    }
  }

  // 실제 배선을 수행한다.
  // cfg.input: (prompt) => string        동기 핸들러. run()/runAsync() 어디서나 동작.
  // cfg.inputAsync: (prompt) => Promise  비동기 핸들러. JSPI + runAsync() 경로에서만(터미널용).
  // cfg.requests: true                   requests 계열 배선(pyodide-http의 patch_all 흡수).
  async install() {
    const cfg = this._cfg, rt = this._rt;
    const jspi = typeof WebAssembly !== "undefined" && "Suspending" in WebAssembly;
    if (cfg.requests) {
      // 파이썬 생태계 표준 HTTP. 실측: runtimeParity/requestsProbe. 절대 URL만 받는다.
      await rt.loadPackages(["requests", "pyodide-http"]);
      rt.run("import pyodide_http\npyodide_http.patch_all()");
    }
    const bridge = {
      hasAsyncInput: !!cfg.inputAsync,
      // 동기 경로: 동기 핸들러 또는 마지막 수단으로 브라우저 prompt().
      inputSync: (prompt) => {
        if (cfg.input) return cfg.input(prompt);
        return typeof globalThis.prompt === "function" ? globalThis.prompt(prompt) : null;
      },
      inputAsync: async (prompt) => (cfg.inputAsync ? await cfg.inputAsync(prompt) : null),
      httpSync: (url, method, body) => this._httpSync(url, method, body),
      subprocessRun: (code) => this._subprocessRun(code),
    };
    rt.setGlobal("_pyprocSyscall", bridge);
    rt.run(BOOTSTRAP);
    const installed = ["input->js" + (jspi ? "+JSPI" : "(sync)"), "urllib->syncXHR" + (cfg.proxyUrl ? "(proxy)" : "(direct)"), "subprocess->childWorker" + (jspi ? "" : "(JSPI 필요, 미가용)")];
    if (cfg.requests) installed.push("requests->pyodide-http(patch_all)");
    return { installed, jspi, proxyUrl: cfg.proxyUrl || null };
  }
}
