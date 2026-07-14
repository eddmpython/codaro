// browserPythonRuntime.ts - pyproc(브라우저 파이썬 런타임) 소비 세임 = 브라우저 커널.
// 같은 노트북이 로컬 백엔드(apiOnline)와 브라우저(WASM CPython)를 모두 쓴다. 백엔드가 없으면
// notebookRuntime이 이 커널로 셀을 진짜 실행한다(과거 print 정규식 시뮬레이션 대체).
// 실행 SSOT는 로컬 Python 불변이고 이 티어는 보조다. 설계 근거: mainPlan/codaro-anywhere/14, 19.
// pyproc은 첫 실행에서 lazy import(런타임 다운로드 지연 + 코드 스플릿). 단일 boot 경로는
// SharedArrayBuffer/COOP-COEP가 필요 없어 정적 호스팅에서도 돈다.
import type { ExecutionResult, VariableInfo } from "@/types";

type PyRuntime = {
  fs: PyRuntimeFileSystem;
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

type PyProcAssetIntegrity = {
  files?: { path: string; url: string; integrity: string; roles?: string[] }[];
};

type PyProcModule = {
  boot(opts: {
    stdout?: (line: string) => void;
    stderr?: (line: string) => void;
    assetIntegrity?: PyProcAssetIntegrity;
  }): Promise<PyRuntime>;
};

let runtimePromise: Promise<PyRuntime> | null = null;
let assetIntegrityPromise: Promise<PyProcAssetIntegrity | null> | null = null;
const stdoutLines: string[] = [];
const stderrLines: string[] = [];
let previousVariables = new Map<string, VariableInfo>();
const attemptedPackages = new Set<string>();
const browserFsRoot = "/home/web/codaro";
const browserFsCellsDir = `${browserFsRoot}/cells`;
const browserFsRunsDir = `${browserFsRoot}/runs`;

function assetIntegrityUrl(): string {
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
      .then((response) => (response.ok ? response.json() as Promise<PyProcAssetIntegrity> : null))
      .catch((error: unknown) => {
        console.warn("pyproc asset manifest unavailable", error);
        return null;
      });
  }
  return assetIntegrityPromise;
}

async function ensureRuntime(): Promise<PyRuntime> {
  if (!runtimePromise) {
    runtimePromise = import("pyproc")
      .then(async (module) => {
        const { boot } = module as unknown as PyProcModule;
        const assetIntegrity = await loadAssetIntegrity();
        return boot({
          stdout: (line: string) => stdoutLines.push(line),
          stderr: (line: string) => stderrLines.push(line),
          ...(assetIntegrity ? { assetIntegrity } : {}),
        });
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
    const key = name.trim().toLowerCase();
    if (!key || attemptedPackages.has(key)) continue;
    attemptedPackages.add(key);
    try {
      await runtime.loadPackages([key]);
    } catch {
      try {
        await runtime.install(key);
      } catch (error) {
        console.warn(`browser kernel package unavailable: ${key}`, error);
      }
    }
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

/** 셀 하나를 브라우저 WASM CPython에서 진짜 실행한다. */
export async function executeBrowserBlock(
  blockId: string,
  code: string,
  executionCount: number,
  packages: string[] = [],
): Promise<ExecutionResult> {
  const runtime = await ensureRuntime();
  await ensurePackages(runtime, packages);
  drainBuffers();

  let resultRepr = "";
  let errorText = "";
  let sourcePath = "";
  let artifacts: ReturnType<typeof browserFileArtifacts> = [];
  try {
    const sourceEvidence = writeBrowserCellSource(runtime, blockId, code);
    sourcePath = sourceEvidence.sourcePath;
    const value = await runtime.runAsync(code);
    if (value !== undefined && value !== null) {
      resultRepr = String(value);
      const proxy = value as { destroy?: () => void };
      if (typeof proxy.destroy === "function") proxy.destroy();
    }
  } catch (error) {
    errorText = error instanceof Error ? error.message : String(error);
  }

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

  return {
    type: "text",
    blockId,
    data: null,
    stdout: combinedStdout,
    stderr: errorText ? (stderr ? `${stderr}\n${errorText}` : errorText) : stderr,
    variables,
    stateDelta,
    executionCount,
    status: errorText ? "error" : "success",
    artifacts,
  };
}

/** 노트북 전체를 순차 실행한다(브라우저 티어는 리액티브 그래프 대신 문서 순서). */
export async function runBrowserNotebook(
  blocks: { id: string; code: string }[],
  packages: string[] = [],
): Promise<{ results: Record<string, ExecutionResult>; variables: VariableInfo[] }> {
  const results: Record<string, ExecutionResult> = {};
  let lastVariables: VariableInfo[] = [];
  let executionCount = 0;
  for (const block of blocks) {
    executionCount += 1;
    const result = await executeBrowserBlock(block.id, block.code, executionCount, packages);
    results[block.id] = result;
    if (result.status !== "error") lastVariables = result.variables;
  }
  return { results, variables: lastVariables };
}

type BrowserPythonRuntimeDiagnostics = {
  executeBlock: typeof executeBrowserBlock;
  isBooted: typeof isBrowserKernelBooted;
  readTextFile: (path: string) => Promise<string>;
  runNotebook: typeof runBrowserNotebook;
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
  };
  return () => {
    if (previous) {
      window.__codaroBrowserPythonDiagnostics = previous;
    } else {
      delete window.__codaroBrowserPythonDiagnostics;
    }
  };
}
