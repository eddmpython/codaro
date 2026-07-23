// pyodideEngine.js - Layer 0: EngineContract의 Pyodide 구현(어댑터).
// 엔진 접점(코드 실행, 값 다리, 선형 메모리, 스택, 인터럽트, 패키지, 스냅샷)을 이 계약 하나
// 뒤로 격리한다. 상위(Runtime/MemoryCapability/능력)는 계약만 보고 `_module.HEAPU8`,
// `globals`, `_emscripten_stack_*` 같은 엔진 내부를 직접 만지지 않는다.
// 승격 근거: tests/attempts/engineContract/contractProbe 8/8 - reactive 시간여행이 이 계약
// 표면만으로 성립(엔진 내부 직접 접근 0). 정본: mainPlan/_done/engine-independence(P1 seam).
//
// 엔진 독립 설계: 각 메서드에 "다른 엔진(WASI CPython)이 어떻게 구현하나"를 명시해 계약이
// Pyodide 어휘로 굳지 않게 한다. FFI(프록시)에 기대는 값 다리는 계약상 "직렬화 가능 값"이
// 기본이고, 프록시는 Pyodide 어댑터의 편의다. 매핑 표: engineContract/README.md.

export class PyodideEngine {
  constructor(py) { this._py = py; this._micropip = null; this._fs = null; }

  // --- 실행 --- (WASI: stdin 프레임 드라이버로 exec 후 stdout 프로토콜 회수)
  runSync(code) { return this._py.runPython(code); }
  runAsync(code) { return this._py.runPythonAsync(code); }

  // --- 값 다리 --- (Pyodide: FFI 프록시. WASI: JSON 직렬화 = 값 프로토콜, FFI 없음)
  setGlobal(name, value) { this._py.globals.set(name, value); }
  getGlobal(name) { return this._py.globals.get(name); }

  // --- 선형 메모리 --- (체크포인트/델타/fork의 전제. exports.memory는 wasm ABI가 강제)
  heapU8() { return this._py._module.HEAPU8; }
  // 스택 포인터: Pyodide는 emscripten_stack_*. WASI 프리빌트는 미노출 -> null 계약
  // (복원은 페이지 델타로 성립, sp는 정합성 강화 옵션). 자가빌드는 export로 노출 가능.
  stackSave() { const M = this._py._module; return M._emscripten_stack_get_current ? M._emscripten_stack_get_current() : null; }
  stackRestore(sp) { const M = this._py._module; if (sp != null && M._emscripten_stack_restore) { try { M._emscripten_stack_restore(sp); } catch (e) {} } }

  // --- 인터럽트 --- (선택: 미지원이면 false. WASI 프리빌트는 시그널 없음 = false)
  setInterruptBuffer(sab) {
    if (!this._py.setInterruptBuffer) return false;
    this._py.setInterruptBuffer(new Uint8Array(sab));
    return true;
  }

  // --- 패키지 --- (선택)
  async loadPackages(pkgs) { return this._py.loadPackage(pkgs); }
  // 셀 코드의 import 문을 스캔해 필요한 C확장 휠을 자동 로드(선택). WASI: 정적 스캔 불가 = no-op.
  async loadPackagesFromImports(code) { return this._py.loadPackagesFromImports(code); }
  async install(pkg) {
    if (!this._micropip) { await this._py.loadPackage("micropip"); this._micropip = this._py.pyimport("micropip"); }
    return this._micropip.install(pkg);
  }
  async freeze() {
    if (!this._micropip) { await this._py.loadPackage("micropip"); this._micropip = this._py.pyimport("micropip"); }
    return this._micropip.freeze();
  }

  // --- 실행 출력 --- (Pyodide: setStdout({batched}). WASI: stdout 프로토콜 회수)
  // handler는 문자열 청크 수신(batched = 개행 경계 flush). null 전달 = 기본 복원. 셀별 라이브 스트리밍 = 가변 싱크.
  setStdout(handler) { if (handler == null) this._py.setStdout(); else this._py.setStdout({ batched: handler }); }
  setStderr(handler) { if (handler == null) this._py.setStderr(); else this._py.setStderr({ batched: handler }); }

  // --- FS/영속 --- (선택. 장치 세계(P7)는 아직 엔진 특유라 raw 탈출구로도 접근한다)
  async mountDir(path, handle) { const fs = await this._py.mountNativeFS(path, handle); return { path, sync: () => fs.syncfs() }; }

  // 파일 IO 중립 파사드(1회 빌드 후 캐시). Pyodide는 _py.FS, WASI는 자체 FS를 여기 매핑한다.
  // 파일-op만 담는다(장치 등록 registerDevice 등은 파일 IO가 아니라 별개 seam = raw). 소비자는
  // FileSystem 능력(Runtime.fs)이 이 파사드에 위임한 것만 본다. 계약이 Pyodide FS 모양으로 안 굳게 중립 어휘.
  get fs() {
    if (this._fs) return this._fs;
    const FS = this._py.FS;
    this._fs = {
      // data가 문자열이면 utf8, Uint8Array면 binary(opts.encoding으로 명시 가능).
      writeFile(path, data, opts = {}) {
        const encoding = opts.encoding || (typeof data === "string" ? "utf8" : "binary");
        FS.writeFile(path, data, { encoding });
      },
      // 기본 binary(Uint8Array). { encoding: "utf8" }면 문자열.
      readFile(path, opts = {}) { return FS.readFile(path, { encoding: opts.encoding || "binary" }); },
      mkdir(path) { FS.mkdir(path); },
      mkdirTree(path) { FS.mkdirTree(path); },
      readdir(path) { return FS.readdir(path).filter((n) => n !== "." && n !== ".."); },
      stat(path) {
        const s = FS.stat(path);
        const mtimeMs = s.mtime && typeof s.mtime.getTime === "function" ? s.mtime.getTime() : null;
        return { size: s.size, isDir: FS.isDir(s.mode), isFile: FS.isFile(s.mode), mtimeMs };
      },
      exists(path) { return FS.analyzePath(path).exists; },
      unlink(path) { FS.unlink(path); },
      rmdir(path) { FS.rmdir(path); },
    };
    return this._fs;
  }

  // --- 스냅샷 --- (선택: bare fork. WASI는 memory.buffer 전체 복사로 대응 전망)
  makeSnapshot() { return this._py.makeMemorySnapshot(); }

  // --- 탈출구 --- (미이관 접점용. 권장 안 함)
  raw() { return this._py; }
}
