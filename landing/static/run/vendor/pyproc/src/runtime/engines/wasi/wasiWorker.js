// wasiWorker.js - WASI "프로세스": non-Pyodide CPython(WASI)을 vendored shim으로 워커에서
// 부팅하고, pyproc이 소유한 드라이버(wasiReplDriver)를 세워 코드 조각을 반복 실행한다.
// wasiSession.js가 이 파일을 new URL 상대경로로 spawn한다(위치 = 번들러 워커 emit 계약).
// 값 채널 무상태화(완전 시간여행): 코드는 preopen 파일 /cmd(힙 밖), stdin은 신호 1바이트.
// 실행 경계(fd_read = 파이썬이 다음 신호 대기)에서 힙 체크포인트/복원 메타를 처리하므로
// 복원이 파이썬 I/O 상태를 어긋내지 않는다(reactive 완전 시간여행이 exports.memory 위에서 성립).
import { WASI, File, OpenFile, ConsoleStdout, PreopenDirectory, Directory, wasi } from "./browserWasiShim.js";
import { DRIVER_SOURCE } from "./wasiReplDriver.js";
import { SIGNAL_META, EOT, CMD_PATH, DRIVER_PATH, SITE_PATH, FILETYPE_CHARACTER_DEVICE } from "./wasiProtocol.js";

// 결정적 부팅: WASI는 엔트로피/시간이 import 2개로 수렴한다(Pyodide 3소스 스텁보다 깨끗).
function makeDeterministic(wasiInst, getInst) {
  wasiInst.wasiImport.random_get = (buf, len) => { new Uint8Array(getInst().exports.memory.buffer, buf, len).fill(7); return 0; };
  wasiInst.wasiImport.clock_time_get = (id, prec, out) => { new DataView(getInst().exports.memory.buffer).setBigUint64(out, 1750000000000000000n, true); return 0; };
}

// 시간여행 파티션 경계: wasm global[0](관례상 __stack_pointer)의 init = 스택 top = 정적 데이터 시작
// (CPython WASI는 --stack-first 링크). 복원 시 [0, stackTop)=shadow stack(라이브 실행)은 보존하고
// [stackTop, end)=정적데이터+힙은 되돌린다. export 심볼이 없어도(memory/_start만) 파싱으로 얻는다.
function parseStackTop(bytes) {
  const u = new Uint8Array(bytes); let p = 8; // magic(4)+version(4)
  const uLEB = () => { let r = 0, s = 0, b; do { b = u[p++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80); return r >>> 0; };
  const sLEB = () => { let r = 0, s = 0, b; do { b = u[p++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80); if (s < 32 && (b & 0x40)) r |= (-1 << s); return r; };
  while (p < u.length) {
    const id = u[p++]; const size = uLEB(); const end = p + size;
    if (id === 6) { const count = uLEB(); if (count > 0) { p++; p++; if (u[p++] === 0x41) return sLEB() >>> 0; } return 0; }
    p = end;
  }
  return 0;
}

// 평평한 [상대경로, 바이트]를 shim File/Directory 트리로. 외부 stdlib(python.wasm + 별도 lib)
// 빌드를 마운트할 때 쓴다. self-contained 빌드(WLR = stdlib baked-in)는 이게 필요 없다.
function buildTree(files) {
  const root = new Map();
  for (const [rel, bytes] of files) {
    const parts = rel.split("/").filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) { if (!node.has(parts[i])) node.set(parts[i], new Map()); node = node.get(parts[i]); }
    node.set(parts[parts.length - 1], bytes);
  }
  const mat = (node) => { const e = []; for (const [n, v] of node) e.push([n, v instanceof Map ? mat(v) : new File(v)]); return new Directory(e); };
  return mat(root);
}

// SAB 블로킹 신호 stdin. stdin은 "실행 신호 1바이트"만 나르고, 코드는 /cmd 파일(힙 밖)로 나른다.
// 그래서 fd_read는 항상 1바이트만 반환하고, 그 1바이트가 유일한 입력 상태라 힙 복원이 스트림을
// 어긋낼 여지가 없다. OpenFile 상속: 파이썬 stdin 초기화가 fdstat/seek를 조회하는데 Fd(부분
// 구현)면 깨진다(File은 되고 부분 Fd는 memory access out of bounds).
class SabStdin extends OpenFile {
  constructor(ctlSab, dataSab, cmdFile) {
    super(new File([]));
    this.ctl = new Int32Array(ctlSab);
    this.data = new Uint8Array(dataSab);
    this.cmdFile = cmdFile;  // /cmd preopen File: 실행할 코드를 여기에 싣는다(힙 밖 채널)
    this.inst = null;        // exports.memory 접근용(체크포인트/복원)
    this.snapshots = [];     // 시간여행: 경계에서 찍은 힙 스냅샷
    this.stackTop = 0;       // 파티션 복원 경계(parseStackTop, 0이면 전체 복원 폴백)
  }
  setInst(inst) { this.inst = inst; }
  _heapU8() { return new Uint8Array(this.inst.exports.memory.buffer); }
  fd_fdstat_get() { return { ret: 0, fdstat: new wasi.Fdstat(FILETYPE_CHARACTER_DEVICE, 0) }; }
  fd_read() {
    // 실행 경계(파이썬이 신호 1바이트 대기 = 스택 항상 같은 깊이, 입력 상태 = 없음).
    // checkpoint/restore를 여기서 처리하면 복원이 파이썬 I/O 상태를 어긋내지 않는다.
    for (;;) {
      postMessage({ type: "idle" });
      Atomics.wait(this.ctl, 0, 0);
      const n = Atomics.load(this.ctl, 1);
      const raw = this.data.slice(0, n);
      Atomics.store(this.ctl, 0, 0);
      Atomics.notify(this.ctl, 0);
      if (raw.length > 0 && raw[0] === SIGNAL_META) {
        const cmd = new TextDecoder().decode(raw.subarray(1));
        if (cmd === "checkpoint") {
          this.snapshots.push(this._heapU8().slice());
          postMessage({ type: "meta", kind: "checkpoint", idx: this.snapshots.length - 1, mb: +(this._heapU8().length / 1048576).toFixed(1) });
        } else if (cmd.startsWith("restore ")) {
          const i = +cmd.slice(8);
          // 파티션 복원: [0, stackTop)=shadow stack(라이브 fd_read 호출 체인)은 보존, [stackTop, end)=
          // 정적데이터(_PyRuntime/allocator 상태)+힙은 되돌린다(둘이 lockstep이라야 allocator 정합).
          // 할당 불변 드라이버(readinto)와 짝: 경계-넘는 힙 포인터가 안정이라 복원이 무해하다.
          const snap = this.snapshots[i]; const cur = this._heapU8(); const part = this.stackTop || 0;
          cur.set(snap.subarray(part), part);
          postMessage({ type: "meta", kind: "restore", idx: i });
        }
        continue; // 메타는 파이썬 왕복 아님(다음 신호 계속 대기)
      }
      // exec 신호: raw = [SIGNAL_EXEC, ...코드]. 코드를 /cmd에 싣고 신호 1바이트만 반환한다.
      this.cmdFile.data = raw.subarray(1).slice();
      return { ret: 0, data: new Uint8Array([1]) }; // 파이썬 os.read(0,1)이 받는 무상태 신호
    }
  }
}

onmessage = async (e) => {
  const msg = e.data;
  if (msg.type !== "boot") return;
  try {
    const { deterministic, wasmBytes, stdlibFiles, stdlibDir, ctlSab, dataSab } = msg;
    const emit = (stream) => (line) => postMessage({ type: "out", stream, line });
    // 드라이버/코드는 preopen 파일로 실행한다(argv에 UTF-8을 실으면 args 처리가 크래시).
    const cmdFile = new File([]);
    // /site = 쓰기 가능한 빈 preopen 디렉터리(브라우저판 site-packages). installWheel이 파이썬을
    // 통해 여기에 순수 파이썬 wheel 파일을 쓰고, 드라이버가 /site를 sys.path에 끼워 import한다.
    // 파일은 shim(JS) 쪽에 산다 = wasm 힙 밖 = 시간여행 스냅샷과 무관(패키지는 안정 상태).
    const entries = [
      [DRIVER_PATH.slice(1), new File(new TextEncoder().encode(DRIVER_SOURCE))],
      [CMD_PATH.slice(1), cmdFile],
      [SITE_PATH.slice(1), new Directory([])],
    ];
    const env = ["PYTHONHASHSEED=0", "PYTHONDONTWRITEBYTECODE=1"];
    // 외부 stdlib 빌드(brettcannon = python.wasm + 별도 lib): stdlibFiles를 /lib/<dir>로 마운트하고
    // PYTHONHOME을 줘 getpath가 찾게 한다. self-contained 빌드(WLR)는 stdlibFiles 없이 그대로.
    if (stdlibFiles && stdlibFiles.length && stdlibDir) {
      entries.push(["lib", new Directory([[stdlibDir, buildTree(stdlibFiles)]])]);
      env.push("PYTHONHOME=/", "PYTHONPATH=/lib/" + stdlibDir);
    }
    const preopen = new PreopenDirectory("/", entries);
    const stdin = new SabStdin(ctlSab, dataSab, cmdFile);
    const fds = [stdin, ConsoleStdout.lineBuffered(emit("stdout")), ConsoleStdout.lineBuffered(emit("stderr")), preopen];
    const wasiInst = new WASI(["python", "-B", DRIVER_PATH], env, fds);
    let inst = null;
    if (deterministic) makeDeterministic(wasiInst, () => inst);
    ({ instance: inst } = await WebAssembly.instantiate(wasmBytes, { wasi_snapshot_preview1: wasiInst.wasiImport }));
    stdin.setInst(inst);
    stdin.stackTop = parseStackTop(wasmBytes); // 시간여행 파티션 경계(global[0] init = stack top)
    postMessage({ type: "ready", heapLen: inst.exports.memory.buffer.byteLength, eot: EOT });
    try { wasiInst.start(inst); } catch (err) { postMessage({ type: "out", stream: "stderr", line: String(err) }); }
    postMessage({ type: "exited" });
  } catch (err) {
    postMessage({ type: "bootError", error: String(err).slice(-300) });
  }
};
