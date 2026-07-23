// deviceFs.js - Layer 1 능력: 모든 것은 파일(Plan 9). 브라우저 능력이 파이썬 파일이 된다.
// 실측(pythonMachine/deviceFsProbe 8/8 + fsWorldProbe): open() 쌍방 브리지, 열 때마다 신선한
// 동적 읽기, /proc 커널 상태, 부분 읽기/with문/os.path.exists, 그리고 fsWorld v2(장치 성장 +
// /proc/<pid>/ctl 쓰기=시그널 + /dev/fb0 프레임버퍼).
// 계약: 장치 read 콜백은 동기이고 open 시점에 내용이 확정된다. 비동기 소스(클립보드 등)는
// "캐시 + refresh(비동기)"가 정직한 계약이다: open()은 마지막으로 알려진 값을 준다.
// write 장치는 close 시 flush 훅을 받는다(fb0가 축적된 프레임을 화면에 blit하는 자리).
// 엔진 FS 접근은 이 능력 뒤에 격리한다(소비자는 파이썬 open()만 쓴다).
export class DeviceFs {
  constructor(rt, cfg = {}) {
    this._rt = rt;
    this._cfg = cfg;
    this._clip = ""; // /dev/clipboard 읽기 캐시(refreshClipboard가 채운다)
    this._minor = 0;
    this._installed = [];
  }

  // 장치 하나를 등록한다. provider: { read?()->string, write?(bytes), flush?() }.
  // write 장치는 축적 버퍼(pyprocWrite)를 쌓고 close에서 flush를 부른다(fb0 프레임 blit 등).
  _mk(path, provider) {
    const FS = this._rt.raw.FS;
    const enc = new TextEncoder();
    const dev = FS.makedev(64, ++this._minor);
    FS.registerDevice(dev, {
      open(stream) {
        stream.pyprocData = enc.encode(String((provider.read && provider.read()) ?? ""));
        if (provider.write || provider.flush) stream.pyprocWrite = [];
      },
      close(stream) {
        if (provider.flush && stream.pyprocWrite) {
          const total = stream.pyprocWrite.reduce((n, c) => n + c.length, 0);
          const all = new Uint8Array(total);
          let o = 0; for (const c of stream.pyprocWrite) { all.set(c, o); o += c.length; }
          provider.flush(all);
        }
      },
      read(stream, buffer, offset, length, position) {
        const data = stream.pyprocData;
        let i = 0;
        while (i < length && position + i < data.length) { buffer[offset + i] = data[position + i]; i++; }
        return i;
      },
      write(stream, buffer, offset, length) {
        if (provider.write) provider.write(buffer.subarray(offset, offset + length));
        if (stream.pyprocWrite) stream.pyprocWrite.push(buffer.slice(offset, offset + length));
        return length;
      },
    });
    // 부모 디렉터리 보장(/proc/<pid>/ 같은 중첩 경로).
    const dir = path.slice(0, path.lastIndexOf("/"));
    if (dir) { try { FS.mkdirTree ? FS.mkdirTree(dir) : FS.mkdir(dir); } catch (e) { /* 존재하면 그대로 */ } }
    try { FS.unlink(path); } catch (e) { /* 없으면 그대로(재등록 대비) */ }
    FS.mkdev(path, dev);
    if (!this._installed.includes(path)) this._installed.push(path);
    return path;
  }

  install() {
    const rt = this._rt;
    const FS = rt.raw.FS;
    rt.execSeq++; // FS 변이 = 실행 경계(리액티브 가드 근거)
    const dec = new TextDecoder();

    try { FS.mkdir("/proc"); } catch (e) { /* 이미 존재하면 그대로 쓴다 */ }
    // 내장 /proc: 커널 상태 파일
    this._mk("/proc/meminfo", { read: () => JSON.stringify({ heapBytes: rt.memory.byteLength(), execSeq: rt.execSeq }) });
    if (this._cfg.ps) this._mk("/proc/ps", { read: () => JSON.stringify(this._cfg.ps()) });
    // 내장 /dev/clipboard: 쓰기 = 시스템 클립보드 반영 시도(권한 없으면 캐시만),
    // 읽기 = 캐시(비동기 클립보드 읽기는 refreshClipboard()로 끌어온다).
    this._mk("/dev/clipboard", {
      read: () => this._clip,
      write: (bytes) => {
        const text = dec.decode(bytes);
        this._clip = text;
        if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); // 권한 없음 = 캐시만 (best-effort)
      },
    });
    // fsWorld v2: 장치 성장. /dev/random = 열 때마다 신선한 암호학적 난수(요청 크기는 open의
    // 관례상 넉넉히 채운다: read(n)이 그 앞부분을 가져간다). raw RGBA를 화면에 쓰는 /dev/fb0.
    this._mk("/dev/random", { read: () => {
      const buf = new Uint8Array(4096);
      crypto.getRandomValues(buf);
      return String.fromCharCode(...buf); // latin-1 경계로 파이썬이 .encode('latin-1')로 되받는다
    } });
    // /dev/fb0: 파이썬이 raw RGBA 바이트를 쓰면 close 시 프레임이 소비자 콜백으로 간다
    // (canvas putImageData = 화면). cfg.framebuffer = { width, height, onFrame(rgba, w, h) }.
    const fb = this._cfg.framebuffer;
    if (fb && fb.onFrame) {
      this._mk("/dev/fb0", { flush: (rgba) => fb.onFrame(rgba, fb.width, fb.height) });
    }
    // 소비자 정의 장치: { "/dev/이름": { read?, write?, flush? } }
    for (const [path, provider] of Object.entries(this._cfg.devices || {})) this._mk(path, provider);
    return { installed: this._installed.slice() };
  }

  // fsWorld v2: /proc/<pid>/ctl 등록(Plan 9). 파이썬이 여기에 시그널명을 쓰면 시그널이 발화한다.
  // cfg.signal(pid, signum)이 있어야 한다(보통 PyProc.signal 배선). 반환: 등록된 ctl 경로.
  // ctl 어휘: "kill"/"term"->SIGTERM, "int"->SIGINT, "usr1"/"usr2", 또는 숫자.
  track(pid) {
    if (!this._cfg.signal) throw new Error("track: cfg.signal(pid, signum) 필요");
    const dec = new TextDecoder();
    const map = { int: 2, usr1: 10, usr2: 12, term: 15, kill: 15 };
    this._mk(`/proc/${pid}/status`, { read: () => JSON.stringify({ pid, ts: this._cfg.ps ? this._cfg.ps() : null }) });
    return this._mk(`/proc/${pid}/ctl`, {
      write: (bytes) => {
        const word = dec.decode(bytes).trim().toLowerCase();
        const signum = map[word] ?? parseInt(word, 10);
        if (!Number.isNaN(signum)) this._cfg.signal(pid, signum);
      },
    });
  }

  // 시스템 클립보드를 캐시로 끌어온다(사용자 제스처/권한 필요할 수 있음).
  // 이후 파이썬 open('/dev/clipboard').read()가 이 값을 읽는다.
  async refreshClipboard() {
    this._clip = await navigator.clipboard.readText();
    return this._clip;
  }
}
