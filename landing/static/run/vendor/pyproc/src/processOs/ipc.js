// ipc.js - Layer 2: 프로세스 간 IPC 프리미티브(파이프/공유메모리/락/세마포어).
// map은 배치고 파이프는 흐름이다: SAB 링버퍼 + Atomics로 진짜 블로킹 read와 backpressure를
// 만든다. 워커(프로세스)는 Atomics.wait로 블로킹하되 **유한 슬라이스**(WAIT_SLICE_MS)로 끊어
// 파이썬 eval 루프에 주기적으로 복귀시킨다: 블로킹 read 중에도 시그널(SIGTERM 등)이
// interrupt SAB를 타고 파이썬 핸들러에 닿는 조건이다(무한 wait면 시그널이 영원히 못 낀다).
// 메인 스레드(커널)는 Atomics.wait 불가라 waitAsync 엔드포인트(readAsync/writeAsync)를 쓴다.
// 공유메모리는 "memcpy 1회" 계약이다: WASM 단일 선형 메모리 벽 때문에 SAB를 파이썬 힙에
// 제로카피로 비출 수 없다(browser-os 안티 추천 4). read/write(offset, len)가 정직한 표면이다.
// 실측: tests/attempts/pythonMachine/pipeShmProbe.html.
const HEADER_BYTES = 64; // Int32 16개(캐시라인 여유). [0]=head [1]=tail [2]=closed
const HEAD = 0, TAIL = 1, CLOSED = 2;
const WAIT_SLICE_MS = 50;

// head/tail은 int32로 단조 증가(랩어라운드 허용): 미소비량 = (tail - head) | 0.
// cap이 2^31보다 한참 작으므로 두 값의 차는 항상 정확하다.
const wrap = (v, cap) => (((v % cap) + cap) % cap);

export function createPipe(capacity = 1 << 20) {
  const sab = new SharedArrayBuffer(HEADER_BYTES + capacity);
  return { kind: "pipe", sab, cap: capacity };
}
export function createLock() {
  const sab = new SharedArrayBuffer(4);
  new Int32Array(sab)[0] = 1; // 락 = 세마포어(1): [0]=잔여 획득 가능 수(1 = 사용 가능)
  return { kind: "lock", sab };
}
export function createSemaphore(count = 1) {
  const sab = new SharedArrayBuffer(4);
  new Int32Array(sab)[0] = count;
  return { kind: "semaphore", sab };
}
export function createShm(byteLength) {
  return { kind: "shm", sab: new SharedArrayBuffer(byteLength) };
}

const views = (item) => ({
  i32: new Int32Array(item.sab, 0, HEADER_BYTES / 4),
  u8: new Uint8Array(item.sab, HEADER_BYTES),
});

// 한 번의 시도로 링에서 최대 max 바이트를 꺼낸다. 비어 있으면 유한 슬라이스 대기 후 재시도 1회.
// 반환: Uint8Array(0..n) / null = EOF(닫힘 + 소진). 호출측(파이썬 루프)이 0바이트면 재호출한다.
function ringReadOnce(item, max, wait) {
  const { i32, u8 } = views(item);
  const head = Atomics.load(i32, HEAD);
  let tail = Atomics.load(i32, TAIL);
  let avail = (tail - head) | 0;
  if (avail === 0) {
    if (Atomics.load(i32, CLOSED)) return null;
    if (wait) Atomics.wait(i32, TAIL, tail, WAIT_SLICE_MS);
    tail = Atomics.load(i32, TAIL);
    avail = (tail - head) | 0;
    if (avail === 0) return Atomics.load(i32, CLOSED) ? null : new Uint8Array(0);
  }
  const n = Math.min(avail, max);
  const start = wrap(head, item.cap);
  const first = Math.min(n, item.cap - start);
  const out = new Uint8Array(n);
  out.set(u8.subarray(start, start + first));
  if (n > first) out.set(u8.subarray(0, n - first), first);
  Atomics.store(i32, HEAD, (head + n) | 0);
  Atomics.notify(i32, HEAD);
  return out;
}

// 한 번의 시도로 링에 들어가는 만큼 쓴다. 가득이면 유한 슬라이스 대기 후 재시도 1회.
// 반환: 쓴 바이트 수(0 = 여전히 가득, 호출측이 재호출) / -1 = 닫힌 파이프(BrokenPipe).
function ringWriteOnce(item, data, wait) {
  const { i32, u8 } = views(item);
  if (Atomics.load(i32, CLOSED)) return -1;
  const tail = Atomics.load(i32, TAIL);
  let head = Atomics.load(i32, HEAD);
  let free = item.cap - ((tail - head) | 0);
  if (free === 0) {
    if (wait) Atomics.wait(i32, HEAD, head, WAIT_SLICE_MS); // backpressure: 소비를 기다린다
    if (Atomics.load(i32, CLOSED)) return -1;
    head = Atomics.load(i32, HEAD);
    free = item.cap - ((tail - head) | 0);
    if (free === 0) return 0;
  }
  const n = Math.min(free, data.byteLength);
  const start = wrap(tail, item.cap);
  const first = Math.min(n, item.cap - start);
  u8.set(data.subarray(0, first), start);
  if (n > first) u8.set(data.subarray(first, n), 0);
  Atomics.store(i32, TAIL, (tail + n) | 0);
  Atomics.notify(i32, TAIL);
  return n;
}

function pipeClose(item) {
  const { i32 } = views(item);
  Atomics.store(i32, CLOSED, 1);
  Atomics.notify(i32, TAIL); // 대기 중인 양쪽을 전부 깨운다
  Atomics.notify(i32, HEAD);
}

// 메인 스레드(커널) 엔드포인트: Atomics.wait 불가 -> waitAsync(Chromium 지원)로 같은 의미.
export async function pipeWriteAsync(item, bytes) {
  const { i32 } = views(item);
  let off = 0;
  while (off < bytes.byteLength) {
    const sent = ringWriteOnce(item, bytes.subarray(off), false);
    if (sent < 0) throw new Error("pipe: 닫힌 파이프에 쓰기");
    off += sent;
    if (sent === 0) {
      const head = Atomics.load(i32, HEAD);
      if (((Atomics.load(i32, TAIL) - head) | 0) === item.cap) {
        const w = Atomics.waitAsync(i32, HEAD, head, WAIT_SLICE_MS);
        if (w.async) await w.value;
      }
    }
  }
  return off;
}
export async function pipeReadAsync(item, max = 65536) {
  const { i32 } = views(item);
  for (;;) {
    const got = ringReadOnce(item, max, false);
    if (got === null) return null; // EOF
    if (got.byteLength) return got;
    const tail = Atomics.load(i32, TAIL);
    if (((tail - Atomics.load(i32, HEAD)) | 0) === 0 && !Atomics.load(i32, CLOSED)) {
      const w = Atomics.waitAsync(i32, TAIL, tail, WAIT_SLICE_MS);
      if (w.async) await w.value;
    }
  }
}
export { pipeClose };

// ---- 워커(프로세스) 측: js 전역 브리지 + 파이썬 pyprocIpc 모듈 ----

// 파이썬 표면(전부 표준 관례 이름은 원어, 우리 식별자는 camelCase).
// pyprocIpc.open(name, mode) -> 파이프 끝(read/write/close, with 지원)
// pyprocIpc.lock(name) / semaphore(name) -> acquire/release, with 지원
// pyprocIpc.shm(name) -> read(off, n)/write(off, data)/size (memcpy 1회 계약)
const PY_BOOTSTRAP = `
import sys as _pyprocSys, types as _pyprocTypes
import js as _pyprocJs
from pyodide.ffi import to_js as _pyprocToJs

_pyprocIpcMod = _pyprocTypes.ModuleType('pyprocIpc')

class _PyprocPipeEnd:
    def __init__(self, name, mode):
        self.name = name
        self.mode = mode
    def read(self, n=65536):
        while True:
            got = _pyprocJs._pyprocIpcRead(self.name, n)
            if got is None:
                return b''
            data = got.to_py()
            if data:
                return bytes(data)
    def write(self, data):
        raw = bytes(data)
        total = 0
        while total < len(raw):
            sent = _pyprocJs._pyprocIpcWrite(self.name, _pyprocToJs(raw[total:]))
            if sent < 0:
                raise BrokenPipeError(self.name)
            total += sent
        return total
    def close(self):
        _pyprocJs._pyprocIpcClose(self.name)
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.close()

class _PyprocLock:
    def __init__(self, name):
        self.name = name
    def acquire(self):
        while not _pyprocJs._pyprocIpcAcquire(self.name):
            pass
        return True
    def release(self):
        _pyprocJs._pyprocIpcRelease(self.name)
    def __enter__(self):
        self.acquire()
        return self
    def __exit__(self, *args):
        self.release()

class _PyprocShm:
    def __init__(self, name):
        self.name = name
        self.size = _pyprocJs._pyprocIpcShmSize(name)
    def read(self, off=0, n=None):
        if n is None:
            n = self.size - off
        return bytes(_pyprocJs._pyprocIpcShmRead(self.name, off, n).to_py())
    def write(self, off, data):
        _pyprocJs._pyprocIpcShmWrite(self.name, off, _pyprocToJs(bytes(data)))
        return len(bytes(data))

def _pyprocOpen(name, mode='r'):
    return _PyprocPipeEnd(name, mode)

_pyprocIpcMod.open = _pyprocOpen
_pyprocIpcMod.lock = _PyprocLock
_pyprocIpcMod.semaphore = _PyprocLock
_pyprocIpcMod.shm = _PyprocShm
_pyprocSys.modules['pyprocIpc'] = _pyprocIpcMod
`;

// 워커 전역에 IPC 레지스트리 + 브리지 함수를 세우고(1회), 항목들을 등록한다.
// 락과 세마포어는 같은 브리지를 쓴다: 락 = 초기값 1(비트), 세마포어 = 초기값 N(카운트).
export function installIpc(py, items) {
  const g = globalThis;
  if (!g._pyprocIpcRegistry) {
    const reg = (g._pyprocIpcRegistry = new Map());
    // EOF는 undefined로 준다: Pyodide에서 null은 None이 아니라 JsNull 프록시가 된다(실측).
    g._pyprocIpcRead = (name, max) => { const r = ringReadOnce(reg.get(name), max, true); return r === null ? undefined : r; };
    g._pyprocIpcWrite = (name, chunk) => ringWriteOnce(reg.get(name), chunk, true);
    g._pyprocIpcClose = (name) => pipeClose(reg.get(name));
    g._pyprocIpcAcquire = (name) => {
      const i32 = new Int32Array(reg.get(name).sab);
      const cur = Atomics.load(i32, 0);
      if (cur > 0 && Atomics.compareExchange(i32, 0, cur, cur - 1) === cur) return true;
      Atomics.wait(i32, 0, 0, WAIT_SLICE_MS); // 유한 슬라이스: 시그널이 낄 자리
      return false;
    };
    g._pyprocIpcRelease = (name) => {
      const i32 = new Int32Array(reg.get(name).sab);
      Atomics.add(i32, 0, 1);
      Atomics.notify(i32, 0);
    };
    g._pyprocIpcShmSize = (name) => reg.get(name).sab.byteLength;
    g._pyprocIpcShmRead = (name, off, n) => {
      const out = new Uint8Array(n);
      out.set(new Uint8Array(reg.get(name).sab, off, n));
      return out;
    };
    g._pyprocIpcShmWrite = (name, off, chunk) => {
      new Uint8Array(reg.get(name).sab, off, chunk.byteLength).set(chunk);
    };
    py.runPython(PY_BOOTSTRAP);
  }
  for (const it of items) g._pyprocIpcRegistry.set(it.name, it);
}
