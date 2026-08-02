// runtime.js - Layer 0: Pyodide 엔진 래퍼(boot/Runtime core).
// 설계 원칙: 엔진 내부 접근은 memoryCapability.js 계약 뒤에 격리하고, 선택 능력 등록은
// runtimeApi.js의 public binding이 주입한다. 빌드 단계 없음(네이티브 ESM).
// 지원: Chromium/Edge (JSPI + SharedArrayBuffer + crossOriginIsolated).
import { MemoryCapability } from "./memoryCapability.js";
import { PyodideEngine } from "./engines/pyodideEngine.js";
import { FileSystem } from "./fileSystem.js";
import { PyProcError } from "./errors.js";
import { runWithGlobalPatch } from "./globalPatch.js";
import { verifySri } from "./contentDigest.js";
import {
  ENGINE_CAPABILITIES,
  assertEngineContract,
  requireEngineCapability,
} from "./engineContract.js";
import { RUNTIME_CAPABILITIES, RUNTIME_CONTRACT_VERSION } from "./runtimeContract.js";

export { MemoryCapability, PAGE_SIZE } from "./memoryCapability.js";
export { checkEnvironment } from "./preflight.js";

// 기본 엔진 배포 지점(출처: docs/consuming/contract.md의 Pyodide 버전 계약). 이 상수의
// 유일한 정의처다: boot/bootEnv/PyProc이 여기서 가져간다. 버전 변경 = 릴리즈 사유.
export const DEFAULT_INDEX = "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/";

function normalizeCoreIntegrity(policy) {
  if (!policy) return null;
  const files = policy.files || policy;
  return { files, required: policy.required !== false };
}

function expectedCoreIntegrity(policy, url, name) {
  if (!policy) return null;
  const href = new URL(url, location.href).href;
  const pathname = new URL(href).pathname;
  let relative = null;
  const indexRoot = policy.indexURL ? new URL(policy.indexURL, location.href).href : "";
  if (indexRoot && href.startsWith(indexRoot)) relative = href.slice(indexRoot.length);
  return policy.files[href]
    || policy.files[url]
    || policy.files[pathname]
    || policy.files[pathname.replace(/^\/+/, "")]
    || (relative ? policy.files[relative] : null)
    || policy.files[name]
    || null;
}

function failIntegrity(cache, err) {
  const e = err instanceof Error ? err : new PyProcError("PYPROC_ASSET_INTEGRITY", String(err));
  if (cache.rejectIntegrity) cache.rejectIntegrity(e);
  throw e;
}

// 엔진 스크립트 1회 로드(전역 loadPyodide 확보). boot/bootEnv/PyProc 공용.
// 진행 중 로드는 공유한다: 동시 첫 호출이 script 태그를 중복 삽입하지 않게(부팅 동시성 수리).
// 전역 loadPyodide는 오리진당 하나이므로 스크립트 출처와 SRI는 첫 호출의 indexURL/integrity가 이긴다.
let engineScriptLoad = null;
let engineScriptPending = null;
let engineScriptState = null;
export function ensureEngineScript(indexURL, opts = {}) {
  const integrity = opts.integrity || null;
  if (globalThis.loadPyodide) {
    if (integrity && engineScriptState?.integrity !== integrity) {
      return Promise.reject(new PyProcError("PYPROC_ASSET_INTEGRITY", "pyodide.js is already loaded with a different integrity value. engineScriptIntegrity can only be enforced before the first boot."));
    }
    return Promise.resolve();
  }
  if (!engineScriptLoad) {
    engineScriptPending = { indexURL, integrity };
    engineScriptLoad = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = indexURL + "pyodide.js";
      if (integrity) {
        s.integrity = integrity;
        s.crossOrigin = opts.crossOrigin || "anonymous";
      }
      s.onload = () => { engineScriptState = engineScriptPending; engineScriptPending = null; res(); };
      s.onerror = () => { engineScriptLoad = null; engineScriptPending = null; rej(new PyProcError("PYPROC_BOOT_FAILED", "failed to load pyodide.js from " + indexURL, { retryable: true })); };
      document.head.appendChild(s);
    });
  } else if (integrity && engineScriptPending?.integrity !== integrity) {
    return Promise.reject(new PyProcError("PYPROC_ASSET_INTEGRITY", "a pyodide.js load with a different integrity value is already in flight."));
  }
  return engineScriptLoad;
}

// 코어 자산 MIME(캐시 서빙용). instantiateStreaming이 wasm 타입을 요구한다.
const CORE_MIME = { ".wasm": "application/wasm", ".zip": "application/zip", ".json": "application/json", ".js": "text/javascript", ".mjs": "text/javascript" };

export async function boot(opts = {}) {
  const indexURL = opts.indexURL || DEFAULT_INDEX;
  // 오프라인 부팅(기둥5): coreCacheDir을 주면 indexURL 자산을 OPFS에 저장/서빙한다.
  // fetch를 타는 자산(wasm/stdlib/lock 등 대용량)이 대상이고, 부팅 구간에만 fetch를 감싼다.
  // coreIntegrity를 주면 캐시 hit와 네트워크 miss 모두 SRI(sha256-...)로 검증한다.
  // manifest가 strict(required 기본 true)일 때 누락된 자산은 실패한다. 변조 캐시는 네트워크로
  // 조용히 우회하지 않는다: 로컬 캐시도 실행 바이트이므로 파손이면 부팅을 멈춘다.
  const coreIntegrity = normalizeCoreIntegrity(opts.coreIntegrity);
  if (coreIntegrity) coreIntegrity.indexURL = indexURL;
  const cache = opts.coreCacheDir || coreIntegrity
    ? { dir: opts.coreCacheDir || null, hits: 0, misses: 0, verified: 0, integrityMissing: 0, integrity: coreIntegrity }
    : null;
  const cachedFetch = cache ? async (url) => {
    const name = new URL(url).pathname.split("/").pop();
    const ext = name.slice(name.lastIndexOf("."));
    const type = CORE_MIME[ext] || "application/octet-stream";
    const expected = expectedCoreIntegrity(cache.integrity, url, name);
    if (cache.integrity?.required && !expected) {
      cache.integrityMissing++;
      failIntegrity(cache, new PyProcError("PYPROC_ASSET_INTEGRITY", `integrity: ${name} is not listed in coreIntegrity`));
    }
    if (cache.dir) {
      try {
        const f = await (await cache.dir.getFileHandle(name)).getFile();
        const data = await f.arrayBuffer();
        if (expected) {
          try { await verifySri(data, expected, name); cache.verified++; }
          catch (e) { failIntegrity(cache, e); }
        }
        cache.hits++;
        return new Response(data, { headers: { "Content-Type": type } });
      } catch (e) {
        if (String(e).includes("integrity:")) throw e;
        // 미스 -> 네트워크
      }
    }
    const resp = await (cache.orig || fetch)(url); // 감싼 fetch 재진입(무한 재귀) 방지
    if (!resp.ok) return resp;
    const data = await resp.arrayBuffer();
    if (expected) {
      try { await verifySri(data, expected, name); cache.verified++; }
      catch (e) { failIntegrity(cache, e); }
    }
    if (cache.dir) {
      const fh = await cache.dir.getFileHandle(name, { create: true });
      const w = await fh.createWritable(); await w.write(data); await w.close();
    }
    cache.misses++;
    return new Response(data, { headers: { "Content-Type": type } });
  } : null;
  // env: 초기화 전에 CPython 환경변수로 반영된다(예: PYTHONHASHSEED=0 -> 결정적 부팅).
  // undefined로 명시 전달하면 pyodide가 env.HOME 접근에서 죽으므로 있을 때만 싣는다.
  const cfg = { indexURL, stdout: opts.stdout, stderr: opts.stderr };
  if (opts.env) cfg.env = opts.env;
  // 락 파일 교체(freeze 산출물 등): 환경 재현의 축. 실측: envManager/freezeLockProbe.
  if (opts.lockFileURL) cfg.lockFileURL = opts.lockFileURL;
  // opts.loadPyodide: 워커 소비자(document 없음)가 자체 import한 loadPyodide를 준다. 그러면
  // document 기반 script 로드(ensureEngineScript)를 건너뛰고 globalThis를 오염시키지 않는다.
  // dartlab/xlpod처럼 워커에서 boot의 캐시/env/packages 로직을 쓰려는 소비자의 경로.
  const doLoad = opts.loadPyodide
    ? () => opts.loadPyodide(cfg)
    : async () => { await ensureEngineScript(indexURL, { integrity: opts.engineScriptIntegrity }); return loadPyodide(cfg); };
  if (opts.loadPyodide && opts.engineScriptIntegrity) throw new PyProcError("PYPROC_INPUT_INVALID", "engineScriptIntegrity applies only when pyproc loads pyodide.js itself.");
  let py;
  if (cache) {
    // 코어 캐시의 fetch 랩은 전역 패치 창이다: 단독 boot는 공용 체인으로 직렬화하고,
    // 이미 열린 창(bootSession의 엔트로피 스텁) 안에서는 그 창이 넘겨준 patchScope로 중첩한다.
    const patchScope = opts.patchScope || runWithGlobalPatch;
    py = await patchScope(async () => {
    const fetchOrig = globalThis.fetch;
    cache.orig = fetchOrig;
    const integrityFailure = new Promise((_, reject) => { cache.rejectIntegrity = reject; });
    const loadAll = async () => {
      const loaded = await doLoad();
      if (opts.packages && opts.packages.length) await loaded.loadPackage(opts.packages);
      return loaded;
    };
    globalThis.fetch = (input, init) => {
      const u = typeof input === "string" ? input : (input && input.url) || String(input);
      return u.startsWith(indexURL) ? cachedFetch(u) : fetchOrig(input, init);
    };
    try {
      return await Promise.race([loadAll(), integrityFailure]);
    } finally { globalThis.fetch = fetchOrig; }
    });
  } else {
    py = await doLoad();
    if (opts.packages && opts.packages.length) await py.loadPackage(opts.packages);
  }
  const rt = new Runtime(new PyodideEngine(py), indexURL, { assetIntegrity: opts.assetIntegrity || null });
  if (cache) rt.coreCache = { hits: cache.hits, misses: cache.misses, verified: cache.verified, integrityMissing: cache.integrityMissing }; // 부팅 자산 캐시/검증 통계
  return rt;
}

export class Runtime {
  // engineOrPy: EngineContract(기본 PyodideEngine) 또는 **로드된 Pyodide 인스턴스**.
  // 후자면 PyodideEngine으로 감싼다(하위 호환 + 채택 경로): dartlab처럼 워커에서 자체 부팅한
  // Pyodide를 `new Runtime(py)`로 채택하는 라이브 소비자를 지원한다. EngineContract seam(계약
  // 격리) 도입 시 `Runtime(py)` 채택 경로가 깨질 뻔한 회귀를 이 판별로 복원한다(runSync 유무로 구분).
  constructor(engineOrPy, indexURL, opts = {}) {
    const engine = engineOrPy?.engineContractVersion === 1 ? engineOrPy : new PyodideEngine(engineOrPy);
    this._engine = assertEngineContract(engine);
    this.runtimeContractVersion = RUNTIME_CONTRACT_VERSION;
    this.runtimeKind = this._engine.engineKind;
    // 이 커널이 어느 배포 지점에서 부팅됐는지. 자식 워커(subprocess 등)가 같은 지점을
    // 쓰게 하는 근거다(자가호스팅/오프라인 배포에서 자식만 CDN으로 새는 결함 방지).
    this.indexURL = indexURL || DEFAULT_INDEX;
    this.assetIntegrity = opts.assetIntegrity || null;
    this.memory = new MemoryCapability(this._engine);
    this.fs = new FileSystem(this); // 엔진-무관 일반 파일 IO(상시 능력, memory와 동급). 미지원 엔진이면 호출 시 에러.
    this.execSeq = 0; // 상태 변이 카운터. 리액티브가 실행 경계 위반을 O(1)로 감지하는 근거.
  }
  // 실행 API 밖의 상태 변이를 경계 카운터에 기록한다. 소비자: 리액티브의 복원(restore도
  // 힙 변이다 = 저널 유휴 감시 같은 외부 관찰자에게 보여야 한다)과 markDirty(라이브 PyProxy
  // 호출처럼 계측 불가능한 변이의 신고 채널).
  noteStateMutation() { this.execSeq++; }
  capabilities() {
    const engine = new Set(this._engine.capabilities());
    const runtime = [
      RUNTIME_CAPABILITIES.asyncExecution,
      RUNTIME_CAPABILITIES.syncExecution,
      RUNTIME_CAPABILITIES.globals,
      RUNTIME_CAPABILITIES.hostValues,
      RUNTIME_CAPABILITIES.memory,
    ];
    if (engine.has(ENGINE_CAPABILITIES.fileSystem)) runtime.push(RUNTIME_CAPABILITIES.fileSystem);
    if (engine.has(ENGINE_CAPABILITIES.packages)) runtime.push(RUNTIME_CAPABILITIES.packages);
    return Object.freeze(runtime);
  }
  // 이 런타임의 힙에 JS 핸들이 심겼는가. 이미지 이식성의 전제라 세션이 이것을 보고 판정한다
  // (엔진마다 값 다리가 다르므로 미지원 엔진은 0 = 핸들 없음이 참이다: WASI는 JSON 값 프로토콜).
  hostProxySurfaces() { return [...(this._engine.hostProxyNames || [])]; }

  run(code) { this.execSeq++; return this._engine.runSync(code); }
  runAsync(code) { this.execSeq++; return this._engine.runAsync(code); }
  setGlobal(name, value) { this.execSeq++; this._engine.setGlobal(name, value); }
  // getGlobal은 엔진 프록시(Pyodide면 PyProxy)를 그대로 반환한다. 소비자는 `toHostValue`로
  // host 값으로 정규화하고 `destroyHostValue`로 파기한다(재사용 프록시 캐시 패턴).
  getGlobal(name) { return this._engine.getGlobal(name); }
  // 엔진별 값 브리지를 계약 메서드로 통일: Pyodide 값을 host 타입으로 정규화하고, 필요 시
  // pyodide 해제 경로를 한 곳에 모은다. (WASI는 pass-through + no-op destroy).
  toHostValue(value, options = {}) { return this._engine.toHostValue(value, options); }
  destroyHostValue(value) { if (this._engine.destroyHostValue) this._engine.destroyHostValue(value); }
  // 인터럽트 SAB 배선: 이 버퍼의 [0]에 시그널 번호를 쓰면 실행 중 파이썬이 반응한다
  // (2=SIGINT=KeyboardInterrupt). 워커에서 파이썬을 돌리는 소비자(예: 동기 UDF의 무한 실행
  // 취소)의 계약. 미지원 엔진이면 false. 엔진 내부(setInterruptBuffer)를 raw로 만지지 않게 한다.
  setInterruptBuffer(sab) {
    if (!new Set(this._engine.capabilities()).has(ENGINE_CAPABILITIES.interrupts)) return false;
    return this._engine.setInterruptBuffer(sab);
  }
  async install(pkg) {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.install, "Runtime.install");
    this.execSeq++; return this._engine.install(pkg);
  }
  async loadPackages(pkgs) {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.packages, "Runtime.loadPackages");
    this.execSeq++; return this._engine.loadPackages(pkgs);
  }
  // 셀 코드의 import 문을 스캔해 필요한 패키지를 자동 로드. 미지원 엔진(WASI)은 no-op(명시 loadPackages 폴백).
  async loadPackagesFromImports(code) {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.importDiscovery, "Runtime.loadPackagesFromImports");
    this.execSeq++; return this._engine.loadPackagesFromImports(code);
  }
  // 실행 출력 캡처(셀별 가변 싱크). handler는 문자열 청크 수신, null = 기본 복원. 엔진 setStdout를 raw로 안 만지게.
  setStdout(handler) {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.output, "Runtime.setStdout");
    return this._engine.setStdout(handler);
  }
  setStderr(handler) {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.output, "Runtime.setStderr");
    return this._engine.setStderr(handler);
  }

  // 현재 환경을 pyodide-lock 형식 락(JSON 문자열)으로 고정한다(uv lock 등가).
  // boot({ lockFileURL })에 되먹이면 같은 버전이 해석 0으로 재현된다. 실측: freezeLockProbe.
  async freeze() {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.freeze, "Runtime.freeze");
    this.execSeq++; return this._engine.freeze();
  }

  // 영속 디스크: OPFS 등 디렉터리 핸들을 파이썬 파일시스템 경로로 마운트한다.
  // 파이썬 open()이 진짜 지속 파일을 읽고 쓴다. 변경 반영은 반환된 sync() 호출(핸들은 소비자 제공).
  async mountHome(dirHandle, path = "/home/web") {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.mount, "Runtime.mountHome");
    this.execSeq++;
    return this._engine.mountDir(path, dirHandle);
  }

  get raw() {
    requireEngineCapability(this._engine, ENGINE_CAPABILITIES.raw, "Runtime.raw");
    return this._engine.raw();
  }
}
