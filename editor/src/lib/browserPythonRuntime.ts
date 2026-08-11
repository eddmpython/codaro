// browserPythonRuntime.ts - pyproc(브라우저 파이썬 런타임) 소비 세임 = 브라우저 커널.
// 같은 노트북이 로컬 백엔드(apiOnline)와 브라우저(WASM CPython)를 모두 쓴다. 백엔드가 없으면
// notebookRuntime이 이 커널로 셀을 진짜 실행한다(과거 print 정규식 시뮬레이션 대체).
// Web Run과 Local은 같은 학습 문서와 evidence 계약을 쓴다. 설계 근거:
// docs/skills/architecture/learning-experience.md와 contracts/learningEvent.schema.json.
// pyproc은 코드 스플릿으로 lazy import한다. Web Run에서는 App이 idle에
// scheduleBrowserPythonRuntimeWarm()으로 같은 싱글턴을 미리 올려 첫 셀 실행 지연을 줄인다.
// 단일 boot 경로는 SharedArrayBuffer/COOP-COEP가 필요 없어 정적 호스팅에서도 돈다.
import analysisSource from "../../../src/codaro/document/analysis.py?raw";
import appRuntimeSource from "../../../src/codaro/appRuntime.py?raw";
import figureCaptureSource from "../../../src/codaro/runtime/figureCapture.py?raw";
import reactivePlanSource from "../../../src/codaro/kernel/reactivePlan.py?raw";
import outputDescriptorSource from "../../../src/codaro/outputDescriptor.py?raw";
import uiCallbacksSource from "../../../src/codaro/uiCallbacks.py?raw";
import uiValueSource from "../../../src/codaro/uiValue.py?raw";
import { shouldUseApi } from "@/lib/api";
import {
  fetchVerifiedPublicationFile,
  loadStaticPublication,
  publicationAssetUrl,
  staticPublicationManifestUrl,
} from "@/lib/staticPublication";
import type { ExecutionResult, ReactiveDiagnostics, VariableInfo } from "@/types";

type PyRuntime = {
  readonly indexURL: string;
  fs: PyRuntimeFileSystem;
  enableAsgiServer(cfg?: { app?: string }): PyRuntimeAsgiServer;
  run(code: string): unknown;
  runAsync(code: string): Promise<unknown>;
  install(pkg: string): Promise<void>;
  loadPackages(pkgs: string | string[]): Promise<void>;
};

type PyRuntimeFileSystem = {
  writeFile(path: string, data: string | Uint8Array, opts?: { encoding?: "utf8" | "binary" }): void;
  readFile(path: string, opts?: { encoding?: "utf8" | "binary" }): Uint8Array | string;
  mkdirTree(path: string): void;
  exists(path: string): boolean;
};

type PyRuntimeAsgiResponse = {
  status: number;
  headers: [string, string][];
  body: string;
  bodyBytes: Uint8Array;
};

type PyRuntimeAsgiServer = {
  install(): Promise<{ app?: string; transport?: string }>;
  serve(
    method: string,
    path: string,
    body?: string | Uint8Array | null,
    query?: string,
    headers?: [string, string][] | null,
  ): Promise<PyRuntimeAsgiResponse>;
};

type PyProcAssetIntegrity = {
  files?: { path: string; url: string; integrity: string; roles?: string[] }[];
};

type PyodideAssetIntegrity = {
  packageRoot?: string;
  files?: { path: string; url: string; integrity: string; roles?: string[] }[];
};

type PyProcModule = {
  bootRuntime(opts: {
    stdout?: (line: string) => void;
    stderr?: (line: string) => void;
    assetIntegrity?: PyProcAssetIntegrity;
    coreIntegrity?: { files: Record<string, string>; required: boolean };
    engineScriptIntegrity?: string;
    indexURL?: string;
  }): Promise<PyRuntime>;
};

let runtimePromise: Promise<PyRuntime> | null = null;
let assetIntegrityPromise: Promise<PyProcAssetIntegrity | null> | null = null;
let pyodideIntegrityPromise: Promise<PyodideAssetIntegrity> | null = null;
let browserExecutionQueue: Promise<void> = Promise.resolve();
const stdoutLines: string[] = [];
const stderrLines: string[] = [];
let previousVariables = new Map<string, VariableInfo>();
const loadedPackages = new Set<string>();
const browserFsRoot = "/home/web/codaro";
const browserFsCellsDir = `${browserFsRoot}/cells`;
const browserFsRunsDir = `${browserFsRoot}/runs`;

export type BrowserReactivePlan = ReactiveDiagnostics & {
  executionOrder: string[];
};

function assetIntegrityUrl(): string {
  if (staticPublicationManifestUrl()) return publicationAssetUrl("pyproc-assets.json").href;
  const envUrl = import.meta.env.VITE_PYPROC_ASSET_INTEGRITY_URL;
  if (typeof envUrl === "string" && envUrl.trim()) return envUrl;
  const appBase = import.meta.env.BASE_URL || "/";
  const baseHref = new URL(appBase, window.location.origin).href;
  const manifestUrl = new URL("pyproc-assets.json", baseHref);
  return `${manifestUrl.pathname}${manifestUrl.search}${manifestUrl.hash}`;
}

async function loadAssetIntegrity(): Promise<PyProcAssetIntegrity | null> {
  if (!assetIntegrityPromise) {
    assetIntegrityPromise = fetch(assetIntegrityUrl(), { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) return null;
        const manifest = await response.json() as PyProcAssetIntegrity;
        return {
          ...manifest,
          files: manifest.files?.map((file) => ({ ...file, url: resolvedAssetUrl(file.url) })),
        };
      })
      .catch((error: unknown) => {
        console.warn("pyproc asset manifest unavailable", error);
        return null;
      });
  }
  return assetIntegrityPromise;
}

async function loadPyodideIntegrity(): Promise<PyodideAssetIntegrity> {
  if (!pyodideIntegrityPromise) {
    const url = staticPublicationManifestUrl()
      ? publicationAssetUrl("pyodide-assets.json").href
      : new URL("pyodide-assets.json", new URL(import.meta.env.BASE_URL || "/", window.location.origin)).href;
    pyodideIntegrityPromise = fetch(url, { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`pyodide asset manifest unavailable: ${response.status}`);
        return response.json() as Promise<PyodideAssetIntegrity>;
      });
  }
  return pyodideIntegrityPromise;
}

function resolvedAssetUrl(value: string): string {
  if (staticPublicationManifestUrl()) return publicationAssetUrl(value.replace(/^\/+/, "")).href;
  return new URL(value, window.location.href).href;
}

async function ensureRuntime(): Promise<PyRuntime> {
  if (!runtimePromise) {
    runtimePromise = import("pyproc/runtime")
      .then(async (module) => {
        const { bootRuntime } = module as unknown as PyProcModule;
        const [assetIntegrity, pyodideIntegrity] = await Promise.all([
          loadAssetIntegrity(),
          loadPyodideIntegrity(),
        ]);
        const pyodideFiles = pyodideIntegrity.files ?? [];
        const pythonIndexUrl = resolvedAssetUrl(pyodideIntegrity.packageRoot ?? "vendor/pyodide/");
        const engineScript = pyodideFiles.find((file) => file.roles?.includes("engineScript"));
        const coreFiles: Record<string, string> = {};
        for (const file of pyodideFiles) {
          const url = resolvedAssetUrl(file.url);
          coreFiles[file.path] = file.integrity;
          coreFiles[url] = file.integrity;
          coreFiles[new URL(url).pathname] = file.integrity;
        }
        const runtime = await bootRuntime({
          stdout: (line: string) => stdoutLines.push(line),
          stderr: (line: string) => stderrLines.push(line),
          ...(assetIntegrity ? { assetIntegrity } : {}),
          coreIntegrity: { files: coreFiles, required: true },
          ...(engineScript ? { engineScriptIntegrity: engineScript.integrity } : {}),
          indexURL: pythonIndexUrl.endsWith("/") ? pythonIndexUrl : `${pythonIndexUrl}/`,
        });
        // matplotlib을 headless로 고정한다. import보다 먼저 정해져야 하므로 부팅 직후에 둔다.
        // 로컬 워커도 같은 값을 쓴다(localWorker.py 상단).
        runtime.run("import os as _codaroOs\n_codaroOs.environ.setdefault('MPLBACKEND', 'Agg')");
        installBrowserCodaroModules(runtime);
        ensureBrowserFileWorld(runtime);
        runtime.run(`import os as _codaroOs\n_codaroOs.chdir(${JSON.stringify(browserFsRoot)})`);
        await mountStaticPublicationAssets(runtime);
        return runtime;
      })
      .catch((error: unknown) => {
        runtimePromise = null;
        throw error;
      }) as Promise<PyRuntime>;
  }
  return runtimePromise;
}

/** 브라우저 커널이 이미 부팅됐는지(부팅 대기 없이 상태 표시용). */
export function isBrowserKernelBooted(): boolean {
  return runtimePromise !== null;
}

/** Web Run에서 idle 예열. 실패는 다음 실행 경로가 다시 시도한다. */
export function warmBrowserPythonRuntime(): void {
  void ensureRuntime().catch((error: unknown) => {
    console.warn("browser python runtime warm failed", error);
  });
}

/**
 * idle(+timeout)에 pyproc 부팅을 예약하고, 취소 함수를 돌려준다.
 * 예열 대상 판정도 여기서 한다. Local Studio는 네이티브 커널을 쓰므로 브라우저
 * 런타임을 내려받지 않는다. 판정에 연결 상태(apiOnline)를 쓰면 첫 health probe
 * 전까지 false라서 Local 부팅 중 잠깐 Web Run으로 오인해 CDN 요청을 시작했다가
 * 취소해버린다. shouldUseApi()는 runtime-tier meta로 결정되는 동기 값이라 경합이 없다.
 */
export function scheduleBrowserPythonRuntimeWarm(): () => void {
  if (typeof window === "undefined" || shouldUseApi()) return () => {};
  let cancelled = false;
  const start = () => {
    if (cancelled) return;
    warmBrowserPythonRuntime();
  };
  let idleId: number | undefined;
  let timeoutId: number | undefined;
  if (typeof window.requestIdleCallback === "function") {
    idleId = window.requestIdleCallback(start, { timeout: 1500 });
  } else {
    timeoutId = window.setTimeout(start, 0);
  }
  return () => {
    cancelled = true;
    if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleId);
    }
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  };
}

export async function getBrowserPythonRuntimeInfo(): Promise<{ indexURL: string }> {
  const runtime = await ensureRuntime();
  return { indexURL: runtime.indexURL };
}

export async function planBrowserReactiveNotebook(
  blocks: Array<{ id: string; type: "code" | "markdown"; content: string }>,
  changedBlockId: string | null,
  notebookName?: string | null,
): Promise<BrowserReactivePlan> {
  const runtime = await ensureRuntime();
  const code = [
    "import json as _codaroJson",
    "import sys as _codaroSys",
    "import types as _codaroTypes",
    "_codaroAnalysis = _codaroSys.modules.get('_codaro_analysis_ssot')",
    "if _codaroAnalysis is None:",
    "    _codaroAnalysis = _codaroTypes.ModuleType('_codaro_analysis_ssot')",
    "    _codaroSys.modules[_codaroAnalysis.__name__] = _codaroAnalysis",
    `    exec(${JSON.stringify(analysisSource)}, _codaroAnalysis.__dict__)`,
    "_codaroPlan = _codaroSys.modules.get('_codaro_reactive_plan_ssot')",
    "if _codaroPlan is None:",
    "    _codaroPlan = _codaroTypes.ModuleType('_codaro_reactive_plan_ssot')",
    "    _codaroSys.modules[_codaroPlan.__name__] = _codaroPlan",
    `    exec(${JSON.stringify(reactivePlanSource)}, _codaroPlan.__dict__)`,
    `_codaroBlocks = _codaroJson.loads(${JSON.stringify(JSON.stringify(blocks))})`,
    "_codaroPayload = _codaroPlan.reactivePlanPayload(",
    "    _codaroBlocks,",
    `    ${changedBlockId === null ? "None" : JSON.stringify(changedBlockId)},`,
    "    _codaroAnalysis.analyzeCellBindings,",
    "    _codaroAnalysis.analyzeMarkdownRefs,",
    `    notebookName=${notebookName ? JSON.stringify(notebookName) : "None"},`,
    ")",
    "_codaroJson.dumps(_codaroPayload)",
  ].join("\n");
  return JSON.parse(String(runtime.run(code))) as BrowserReactivePlan;
}

// 셀이 남긴 matplotlib figure를 거둔다. 규칙은 로컬 워커와 같은 파일(figureCapture.py)이 소유해
// Web Run과 Local이 "어느 쪽에서는 그림이 나오고 어느 쪽에서는 안 나오는" 갈라짐을 만들지 않는다.
const FIGURE_CAPTURE_SNIPPET = [
  "import json as _codaroJson",
  "import sys as _codaroSys",
  "import types as _codaroTypes",
  "_codaroFigureCapture = _codaroSys.modules.get('_codaro_figure_capture_ssot')",
  "if _codaroFigureCapture is None:",
  "    _codaroFigureCapture = _codaroTypes.ModuleType('_codaro_figure_capture_ssot')",
  "    _codaroSys.modules[_codaroFigureCapture.__name__] = _codaroFigureCapture",
  `    exec(${JSON.stringify(figureCaptureSource)}, _codaroFigureCapture.__dict__)`,
  "_codaroJson.dumps(_codaroFigureCapture.captureMatplotlibFigures())",
].join("\n");

function captureFigures(runtime: PyRuntime): string[] {
  try {
    const parsed = JSON.parse(String(runtime.run(FIGURE_CAPTURE_SNIPPET)));
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    // 그림 수집 실패가 셀 실행 결과를 덮어써서는 안 된다. 코드는 이미 돌았다.
    return [];
  }
}

// 사용자 전역을 VariableInfo 목록(JSON)으로 뽑는다. 밑줄 프리픽스는 내부용이라 제외.
const VARIABLES_SNIPPET = `
def _codaro_variables():
    import json as _json
    entries = []
    for _name, _value in list(globals().items()):
        if _name.startswith("_"):
            continue
        _type = type(_value).__name__
        if _type in ("module", "function", "builtin_function_or_method", "type"):
            continue
        try:
            _repr = repr(_value)
        except Exception as _exc:
            _repr = f"<repr 실패: {_exc}>"
        if len(_repr) > 120:
            _repr = _repr[:117] + "..."
        _entry = {"name": _name, "typeName": _type, "repr": _repr}
        try:
            _entry["size"] = len(_value)
        except Exception:
            pass
        _shape = getattr(_value, "shape", None)
        if _shape is not None:
            _entry["shape"] = str(_shape)
        _dtype = getattr(_value, "dtype", None)
        if _dtype is not None:
            _entry["dtype"] = str(_dtype)
        entries.append(_entry)
    return _json.dumps(entries)
_codaro_variables()
`;

function collectVariables(runtime: PyRuntime): VariableInfo[] {
  try {
    const raw = runtime.run(VARIABLES_SNIPPET);
    return JSON.parse(String(raw)) as VariableInfo[];
  } catch (error) {
    console.warn("browser kernel variable collection failed", error);
    return [];
  }
}

function computeDelta(current: VariableInfo[]) {
  const currentByName = new Map(current.map((item) => [item.name, item]));
  const added: VariableInfo[] = [];
  const updated: VariableInfo[] = [];
  const removed: string[] = [];
  for (const item of current) {
    const before = previousVariables.get(item.name);
    if (!before) added.push(item);
    else if (before.repr !== item.repr || before.typeName !== item.typeName) updated.push(item);
  }
  for (const name of previousVariables.keys()) {
    if (!currentByName.has(name)) removed.push(name);
  }
  previousVariables = currentByName;
  return { added, updated, removed };
}

// 패키지 보장: pyodide 배포판(loadPackages) 우선, 실패 시 micropip(install). 실패는 비치명 -
// 진짜 import 오류가 셀 stderr로 정직하게 드러난다.
async function ensurePackages(runtime: PyRuntime, packages: string[]): Promise<void> {
  for (const name of packages) {
    const requested = name.trim();
    const key = requested.toLowerCase();
    if (!key || loadedPackages.has(key)) continue;
    try {
      await runtime.loadPackages([requested]);
      loadedPackages.add(key);
    } catch {
      try {
        await runtime.install(requested);
        loadedPackages.add(key);
      } catch (error) {
        console.warn(`browser kernel package unavailable: ${key}`, error);
      }
    }
  }
}

async function mountStaticPublicationAssets(runtime: PyRuntime): Promise<void> {
  const publication = await loadStaticPublication();
  if (!publication) return;
  for (const asset of publication.manifest.dataAssets) {
    const bytes = await fetchVerifiedPublicationFile(publication, asset.bundlePath);
    const relativeParts = asset.sourcePath.split("/").filter(Boolean);
    const fileName = relativeParts.pop();
    if (!fileName) throw new Error(`publication asset path is invalid: ${asset.sourcePath}`);
    const directory = [browserFsRoot, ...relativeParts].join("/");
    runtime.fs.mkdirTree(directory);
    runtime.fs.writeFile(`${directory}/${fileName}`, bytes, { encoding: "binary" });
  }
}

function drainBuffers() {
  const stdout = stdoutLines.join("\n");
  const stderr = stderrLines.join("\n");
  stdoutLines.length = 0;
  stderrLines.length = 0;
  return { stdout, stderr };
}

function browserSafeBlockName(blockId: string): string {
  const safe = blockId.replace(/[^A-Za-z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "");
  return safe || "cell";
}

function ensureBrowserFileWorld(runtime: PyRuntime): void {
  runtime.fs.mkdirTree(browserFsCellsDir);
  runtime.fs.mkdirTree(browserFsRunsDir);
}

function installBrowserCodaroModules(runtime: PyRuntime): void {
  const modules = [
    ["codaro.uiCallbacks", uiCallbacksSource],
    ["codaro.uiValue", uiValueSource],
    ["codaro.outputDescriptor", outputDescriptorSource],
    ["codaro.appRuntime", appRuntimeSource],
  ];
  const code = [
    "import sys as _codaroSys",
    "import types as _codaroTypes",
    "_codaroPackage = _codaroSys.modules.get('codaro')",
    "if _codaroPackage is None:",
    "    _codaroPackage = _codaroTypes.ModuleType('codaro')",
    "    _codaroPackage.__path__ = []",
    "    _codaroSys.modules['codaro'] = _codaroPackage",
    `_codaroModuleSources = ${JSON.stringify(modules)}`,
    "for _codaroModuleName, _codaroModuleSource in _codaroModuleSources:",
    "    _codaroModule = _codaroTypes.ModuleType(_codaroModuleName)",
    "    _codaroModule.__package__ = 'codaro'",
    "    _codaroSys.modules[_codaroModuleName] = _codaroModule",
    "    exec(_codaroModuleSource, _codaroModule.__dict__)",
    "    setattr(_codaroPackage, _codaroModuleName.rsplit('.', 1)[-1], _codaroModule)",
    "_codaroBrowserApi = _codaroSys.modules['codaro.appRuntime']",
    "_codaroBrowserNames = ('App', 'accordion', 'callout', 'hstack', 'html', 'md', 'markdown', 'plain', 'sidebar', 'stat', 'state', 'stop', 'tabs', 'text', 'ui', 'vstack')",
    "for _codaroBrowserName in _codaroBrowserNames:",
    "    setattr(_codaroPackage, _codaroBrowserName, getattr(_codaroBrowserApi, _codaroBrowserName))",
    "_codaroPackage.__all__ = list(_codaroBrowserNames)",
    "_codaroPackage.__version__ = '0.0.0+browser'",
  ].join("\n");
  runtime.run(code);
}

function pythonBool(value: unknown): boolean {
  return value === true || String(value).toLowerCase() === "true";
}

function pythonFileEquals(runtime: PyRuntime, path: string, expected: string): boolean {
  const code = [
    "import pathlib as _codaroPathlib",
    `_codaroPathlib.Path(${JSON.stringify(path)}).read_text(encoding="utf-8") == ${JSON.stringify(expected)}`,
  ].join("\n");
  return pythonBool(runtime.run(code));
}

function pythonRunRecordMatches(runtime: PyRuntime, path: string, blockId: string, status: string): boolean {
  const code = [
    "import json as _codaroJson",
    `_codaroRecord = _codaroJson.load(open(${JSON.stringify(path)}, encoding="utf-8"))`,
    `_codaroRecord.get("blockId") == ${JSON.stringify(blockId)} and _codaroRecord.get("status") == ${JSON.stringify(status)}`,
  ].join("\n");
  return pythonBool(runtime.run(code));
}

function writeBrowserCellSource(runtime: PyRuntime, blockId: string, code: string) {
  ensureBrowserFileWorld(runtime);
  const sourcePath = `${browserFsCellsDir}/${browserSafeBlockName(blockId)}.py`;
  runtime.fs.writeFile(sourcePath, code, { encoding: "utf8" });
  const pythonOpenVerified = pythonFileEquals(runtime, sourcePath, code);
  if (!pythonOpenVerified) {
    throw new Error(`browser Runtime.fs source mirror was not visible to Python open(): ${sourcePath}`);
  }
  return { sourcePath, pythonOpenVerified };
}

function writeBrowserRunRecord(
  runtime: PyRuntime,
  record: {
    blockId: string;
    executionCount: number;
    status: string;
    stdout: string;
    stderr: string;
    resultRepr: string;
    sourcePath: string;
  },
) {
  ensureBrowserFileWorld(runtime);
  const resultPath = `${browserFsRunsDir}/${browserSafeBlockName(record.blockId)}.json`;
  const payload = {
    ...record,
    resultPath,
    completedAt: new Date().toISOString(),
    runtime: {
      tier: "browser",
      engine: "pyproc",
      fileSystem: "Runtime.fs",
      pythonOpenShared: true,
    },
  };
  const text = `${JSON.stringify(payload, null, 2)}\n`;
  runtime.fs.writeFile(resultPath, text, { encoding: "utf8" });
  runtime.fs.writeFile(`${browserFsRunsDir}/latest.json`, text, { encoding: "utf8" });
  const readBack = JSON.parse(String(runtime.fs.readFile(resultPath, { encoding: "utf8" }))) as { blockId?: string; status?: string };
  if (readBack.blockId !== record.blockId || readBack.status !== record.status) {
    throw new Error(`browser Runtime.fs run record readback mismatch: ${resultPath}`);
  }
  const pythonOpenVerified = pythonRunRecordMatches(runtime, resultPath, record.blockId, record.status);
  if (!pythonOpenVerified) {
    throw new Error(`browser Runtime.fs run record was not visible to Python open(): ${resultPath}`);
  }
  return { resultPath, latestPath: `${browserFsRunsDir}/latest.json`, pythonOpenVerified };
}

function browserFileArtifacts(evidence: {
  sourcePath: string;
  resultPath: string;
  latestPath: string;
  pythonOpenVerified: boolean;
}) {
  return [
    {
      kind: "browser-runtime-source-file",
      label: "브라우저 FS 셀 소스",
      path: evidence.sourcePath,
      detail: "pyproc Runtime.fs writeFile, Python open() 공유 확인",
    },
    {
      kind: "browser-runtime-run-record",
      label: "브라우저 FS 실행 기록",
      path: evidence.resultPath,
      detail: evidence.pythonOpenVerified
        ? `latest: ${evidence.latestPath}, Python open() 확인`
        : `latest: ${evidence.latestPath}`,
    },
  ];
}

function responseHeadersToRecord(headers: [string, string][]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [name, value] of headers) {
    record[name.toLowerCase()] = value;
  }
  return record;
}

function asgiBodyText(response: PyRuntimeAsgiResponse): string {
  if (response.body) return response.body;
  return new TextDecoder().decode(response.bodyBytes);
}

/** 브라우저 커널 안 Python ASGI 앱을 소켓 없이 요청/응답 왕복으로 검증한다. */
export async function verifyBrowserAsgiServer() {
  const runtime = await ensureRuntime();
  const appName = "_codaroAsgiApp";
  runtime.run([
    "import json as _codaroJson",
    `async def ${appName}(scope, receive, send):`,
    "    _event = await receive()",
    "    _headers = {k.decode(): v.decode() for k, v in scope.get('headers', [])}",
    "    _payload = {",
    "        'runtime': 'pyproc-asgi',",
    "        'method': scope.get('method'),",
    "        'path': scope.get('path'),",
    "        'query': scope.get('query_string', b'').decode(),",
    "        'requestBody': _event.get('body', b'').decode(),",
    "        'header': _headers.get('x-codaro-gate'),",
    "    }",
    "    _body = _codaroJson.dumps(_payload, sort_keys=True).encode()",
    "    await send({",
    "        'type': 'http.response.start',",
    "        'status': 207,",
    "        'headers': [(b'content-type', b'application/json'), (b'x-codaro-runtime', b'pyproc-asgi')],",
    "    })",
    "    await send({'type': 'http.response.body', 'body': _body})",
  ].join("\n"));
  const asgi = runtime.enableAsgiServer({ app: appName });
  const installed = await asgi.install();
  const request = {
    method: "POST",
    path: "/codaro/pyproc-asgi",
    query: "value=41",
    body: JSON.stringify({ source: "codaro-product-gate", value: 41 }),
    header: "browser-os-server",
  };
  const response = await asgi.serve(
    request.method,
    request.path,
    request.body,
    request.query,
    [["x-codaro-gate", request.header]],
  );
  const bodyText = asgiBodyText(response);
  const body = JSON.parse(bodyText) as Record<string, unknown>;
  return {
    appName,
    installed,
    request,
    status: response.status,
    headers: responseHeadersToRecord(response.headers),
    body,
    bodyText,
    bodyByteLength: response.bodyBytes.byteLength,
  };
}

/** 셀 하나를 브라우저 WASM CPython에서 진짜 실행한다. */
export function executeBrowserBlock(
  blockId: string,
  code: string,
  executionCount: number,
  packages: string[] = [],
): Promise<ExecutionResult> {
  // 브라우저 커널과 출력 버퍼, 변수 스냅샷은 한 세트의 공유 상태다. 호출자가 각자
  // 직렬화하더라도 자동 예제와 학습자 실행처럼 서로 다른 흐름이 겹칠 수 있으므로,
  // 커널 소유자가 코드 실행부터 결과 수집까지 하나의 트랜잭션으로 보장한다.
  const scheduled = browserExecutionQueue.then(
    () => executeBrowserBlockTransaction(blockId, code, executionCount, packages),
    () => executeBrowserBlockTransaction(blockId, code, executionCount, packages),
  );
  browserExecutionQueue = scheduled.then(
    () => undefined,
    () => undefined,
  );
  return scheduled;
}

async function executeBrowserBlockTransaction(
  blockId: string,
  code: string,
  executionCount: number,
  packages: string[],
): Promise<ExecutionResult> {
  const runtime = await ensureRuntime();
  await ensurePackages(runtime, packages);
  drainBuffers();

  let resultRepr = "";
  let resultData: unknown = null;
  let resultType: ExecutionResult["type"] = "text";
  let errorText = "";
  let sourcePath = "";
  let artifacts: ReturnType<typeof browserFileArtifacts> = [];
  try {
    const sourceEvidence = writeBrowserCellSource(runtime, blockId, code);
    sourcePath = sourceEvidence.sourcePath;
    runtime.run(
      `from codaro.uiValue import beginBlock as _codaroBeginBlock\n_codaroBeginBlock(${JSON.stringify(blockId)})`,
    );
    const value = await runtime.runAsync(code);
    if (value !== undefined && value !== null) {
      const normalized = normalizeBrowserPythonResult(value);
      resultData = normalized.data;
      resultRepr = normalized.repr;
      resultType = normalized.type;
      const proxy = value as { destroy?: () => void };
      if (typeof proxy.destroy === "function") proxy.destroy();
    }
  } catch (error) {
    errorText = error instanceof Error ? error.message : String(error);
  }

  // 에러로 끝난 셀에서도 거둔다. 남겨 두면 다음 셀이 같은 그림을 다시 낸다.
  const figures = captureFigures(runtime);
  const { stdout, stderr } = drainBuffers();
  const status = errorText ? "error" : "success";
  try {
    if (sourcePath) {
      const runEvidence = writeBrowserRunRecord(runtime, {
        blockId,
        executionCount,
        status,
        stdout,
        stderr: errorText ? (stderr ? `${stderr}\n${errorText}` : errorText) : stderr,
        resultRepr,
        sourcePath,
      });
      artifacts = browserFileArtifacts({ sourcePath, ...runEvidence });
    }
  } catch (error) {
    const fileError = error instanceof Error ? error.message : String(error);
    errorText = errorText ? `${errorText}\n${fileError}` : fileError;
  }
  const variables = errorText ? [] : collectVariables(runtime);
  const stateDelta = errorText ? { added: [], updated: [], removed: [] } : computeDelta(variables);
  const combinedStdout = resultRepr ? (stdout ? `${stdout}\n${resultRepr}` : resultRepr) : stdout;

  const showFigures = !errorText && figures.length > 0;
  return {
    type: showFigures ? "image" : resultType,
    blockId,
    data: showFigures ? (figures.length > 1 ? figures : figures[0]) : resultData,
    stdout: resultType === "layout" ? stdout : combinedStdout,
    stderr: errorText ? (stderr ? `${stderr}\n${errorText}` : errorText) : stderr,
    variables,
    stateDelta,
    executionCount,
    status: errorText ? "error" : "success",
    artifacts,
  };
}

function normalizeBrowserPythonResult(value: unknown): {
  data: unknown;
  repr: string;
  type: ExecutionResult["type"];
} {
  const proxy = value as {
    codaroDescriptor?: () => unknown;
    destroy?: () => void;
    toJs?: (options?: Record<string, unknown>) => unknown;
  };
  let candidate: unknown = value;
  let descriptorProxy: unknown = null;
  if (typeof proxy.codaroDescriptor === "function") {
    descriptorProxy = proxy.codaroDescriptor();
    candidate = descriptorProxy;
  }
  const converted = pythonProxyToJs(candidate);
  const descriptor = isBrowserWidgetDescriptor(converted) ? converted : null;
  const disposable = descriptorProxy as { destroy?: () => void } | null;
  disposable?.destroy?.();
  if (descriptor) return { data: descriptor, repr: "", type: "layout" };
  return { data: null, repr: String(value), type: "text" };
}

function pythonProxyToJs(value: unknown): unknown {
  const proxy = value as { toJs?: (options?: Record<string, unknown>) => unknown };
  if (typeof proxy?.toJs !== "function") return value;
  try {
    return proxy.toJs({
      create_pyproxies: false,
      dict_converter: (entries: Iterable<readonly [PropertyKey, unknown]>) => Object.fromEntries(entries),
    });
  } catch {
    return null;
  }
}

function isBrowserWidgetDescriptor(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const type = (value as Record<string, unknown>).type;
  return typeof type === "string" && [
    "accordion", "callout", "custom", "hstack", "html", "markdown", "plain",
    "sidebar", "stat", "tabs", "text", "ui", "vstack",
  ].includes(type);
}

/** 노트북 전체를 공용 AST 그래프의 문서 순서로 실행한다. */
export async function runBrowserNotebook(
  blocks: Array<{ id: string; type?: "code" | "markdown"; code: string }>,
  packages: string[] = [],
  notebookName?: string | null,
): Promise<{
  results: Record<string, ExecutionResult>;
  variables: VariableInfo[];
  diagnostics: BrowserReactivePlan;
}> {
  const planBlocks = blocks.map((block) => ({
    id: block.id,
    type: block.type ?? "code",
    content: block.code,
  }));
  const diagnostics = await planBrowserReactiveNotebook(planBlocks, null, notebookName);
  const outcome = await runBrowserExecutionPlan(blocks, diagnostics, packages);
  return { ...outcome, diagnostics };
}

/** 선택 셀과 그 셀에 의존하는 하위 셀만 공용 AST 계획에 따라 실행한다. */
export async function runBrowserReactiveNotebook(
  blocks: Array<{ id: string; type?: "code" | "markdown"; code: string }>,
  changedBlockId: string,
  packages: string[] = [],
  notebookName?: string | null,
): Promise<{
  results: Record<string, ExecutionResult>;
  variables: VariableInfo[];
  diagnostics: BrowserReactivePlan;
}> {
  const planBlocks = blocks.map((block) => ({
    id: block.id,
    type: block.type ?? "code",
    content: block.code,
  }));
  const diagnostics = await planBrowserReactiveNotebook(planBlocks, changedBlockId, notebookName);
  const outcome = await runBrowserExecutionPlan(blocks, diagnostics, packages);
  return { ...outcome, diagnostics };
}

export async function setBrowserNotebookUiValue(
  blocks: Array<{ id: string; type?: "code" | "markdown"; code: string }>,
  changedBlockId: string,
  elementId: string,
  value: unknown,
  packages: string[] = [],
  notebookName?: string | null,
): Promise<{
  results: Record<string, ExecutionResult>;
  variables: VariableInfo[];
  diagnostics: BrowserReactivePlan;
}> {
  const runtime = await ensureRuntime();
  const encoded = JSON.stringify(value);
  runtime.run([
    "import json as _codaroJson",
    "from codaro.uiValue import setStoredValue as _codaroSetStoredValue",
    `_codaroSetStoredValue(${JSON.stringify(elementId)}, _codaroJson.loads(${JSON.stringify(encoded)}))`,
  ].join("\n"));
  const planBlocks = blocks.map((block) => ({
    id: block.id,
    type: block.type ?? "code",
    content: block.code,
  }));
  const diagnostics = await planBrowserReactiveNotebook(planBlocks, changedBlockId, notebookName);
  diagnostics.executionOrder = diagnostics.executionOrder.filter((blockId) => blockId !== changedBlockId);
  const outcome = await runBrowserExecutionPlan(blocks, diagnostics, packages);
  return { ...outcome, diagnostics };
}

async function runBrowserExecutionPlan(
  blocks: Array<{ id: string; type?: "code" | "markdown"; code: string }>,
  plan: BrowserReactivePlan,
  packages: string[],
): Promise<{ results: Record<string, ExecutionResult>; variables: VariableInfo[] }> {
  const results: Record<string, ExecutionResult> = {};
  const blockById = new Map(blocks.map((block) => [block.id, block]));
  const skipped = new Set<string>();
  let lastVariables: VariableInfo[] = [];
  let executionCount = 0;
  for (const blockId of plan.executionOrder) {
    if (skipped.has(blockId)) continue;
    const block = blockById.get(blockId);
    if (!block || block.type === "markdown") continue;
    executionCount += 1;
    const result = await executeBrowserBlock(block.id, block.code, executionCount, packages);
    results[block.id] = result;
    if (result.status === "error") {
      for (const dependent of transitiveDependents(plan.dependents, block.id)) skipped.add(dependent);
    } else {
      lastVariables = result.variables;
    }
  }
  plan.staleBlockIds = plan.executionOrder.filter((blockId) => skipped.has(blockId));
  return { results, variables: lastVariables };
}

function transitiveDependents(dependents: Record<string, string[]>, sourceBlockId: string): Set<string> {
  const affected = new Set<string>();
  const queue = [sourceBlockId];
  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;
    for (const dependent of dependents[current] ?? []) {
      if (affected.has(dependent)) continue;
      affected.add(dependent);
      queue.push(dependent);
    }
  }
  return affected;
}

type BrowserPythonRuntimeDiagnostics = {
  executeBlock: typeof executeBrowserBlock;
  isBooted: typeof isBrowserKernelBooted;
  readTextFile: (path: string) => Promise<string>;
  runNotebook: typeof runBrowserNotebook;
  runReactiveNotebook: typeof runBrowserReactiveNotebook;
  planReactiveNotebook: typeof planBrowserReactiveNotebook;
  verifyAsgiServer: typeof verifyBrowserAsgiServer;
};

declare global {
  interface Window {
    __codaroBrowserPythonDiagnostics?: BrowserPythonRuntimeDiagnostics;
  }
}

export function installBrowserPythonRuntimeDiagnostics(): () => void {
  const previous = window.__codaroBrowserPythonDiagnostics;
  window.__codaroBrowserPythonDiagnostics = {
    executeBlock: executeBrowserBlock,
    isBooted: isBrowserKernelBooted,
    readTextFile: async (path: string) => {
      const runtime = await ensureRuntime();
      return String(runtime.fs.readFile(path, { encoding: "utf8" }));
    },
    runNotebook: runBrowserNotebook,
    runReactiveNotebook: runBrowserReactiveNotebook,
    planReactiveNotebook: planBrowserReactiveNotebook,
    verifyAsgiServer: verifyBrowserAsgiServer,
  };
  return () => {
    if (previous) {
      window.__codaroBrowserPythonDiagnostics = previous;
    } else {
      delete window.__codaroBrowserPythonDiagnostics;
    }
  };
}
