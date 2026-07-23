// wheelCache.js - Layer 1 능력: wheel OPFS 캐시 ("웹의 uv" 3층 중 저장층).
// micropip/loadPackage가 받는 .whl 바이트를 OPFS에 저장하고, 다음부터는 네트워크 대신
// 캐시에서 서빙한다(재다운로드 0, 오프라인 재설치). 전역 fetch를 상시 오염시키지 않고
// install/loadPackages 호출 구간에서만 감싼다(명시적 스코프). 디렉터리 핸들은 소비자 제공.
export class WheelCache {
  constructor(rt, cfg = {}) {
    this._rt = rt;
    this._dir = cfg.dir; // FileSystemDirectoryHandle (필수)
    this.hits = 0; this.misses = 0;
  }

  _key(url) {
    // wheel 파일명은 PEP 427로 유일(이름-버전-태그). 경로 구분자만 제거해 키로 쓴다.
    return decodeURIComponent(new URL(url, globalThis.location.href).pathname.split("/").pop());
  }

  async _withCache(fn) {
    if (!this._dir) throw new Error("wheelCache: cfg.dir(FileSystemDirectoryHandle)이 필요하다");
    const orig = globalThis.fetch;
    globalThis.fetch = async (input, init) => {
      // input은 string | URL | Request 셋 다 온다(micropip은 URL 객체를 준다).
      const url = typeof input === "string" ? input : (input && input.url) || String(input);
      let isWheel = false;
      try { isWheel = new URL(url, globalThis.location.href).pathname.endsWith(".whl"); } catch (e) {}
      if (!isWheel) return orig(input, init);
      const key = this._key(url);
      try {
        const file = await (await this._dir.getFileHandle(key)).getFile();
        this.hits++;
        return new Response(file, { status: 200, headers: { "Content-Type": "application/zip" } });
      } catch (e) { /* 캐시 미스 -> 네트워크 */ }
      const resp = await orig(input, init);
      if (!resp.ok) return resp;
      const data = await resp.arrayBuffer();
      const fh = await this._dir.getFileHandle(key, { create: true });
      const w = await fh.createWritable();
      await w.write(data); await w.close();
      this.misses++;
      return new Response(data, { status: 200, headers: { "Content-Type": "application/zip" } });
    };
    try { return await fn(); } finally { globalThis.fetch = orig; }
  }

  // micropip 설치를 캐시 경유로. 캐시에 있으면 네트워크 0.
  install(pkg) { return this._withCache(() => this._rt.install(pkg)); }
  // pyodide 배포판 패키지 로드도 같은 캐시를 쓴다(.whl 동일).
  loadPackages(pkgs) { return this._withCache(() => this._rt.loadPackages(pkgs)); }
}
