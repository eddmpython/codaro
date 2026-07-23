import { getBrowserPythonRuntimeInfo } from "@/lib/browserPythonRuntime";
import {
  normalizeLearningOutput,
  type StrongLearningCheckSpecV1,
  verifyLearningFixtureHash,
} from "@/lib/learningCheckSpec";
import type { LearningEvidenceArtifact } from "@/lib/webLearningEvidence";

type PyProcManifestFile = {
  integrity: string;
  roles?: string[];
  url: string;
};

type PyProcManifest = {
  entrypoints?: Array<{ role?: string; url?: string }>;
  files?: PyProcManifestFile[];
};

export type BrowserStrongOutputCheckResult = {
  actual: string;
  artifacts?: LearningEvidenceArtifact[];
  detail: string;
  executor: "browser-worker";
  expected: string;
  passed: boolean;
  state: "error" | "mismatch" | "unsupported" | "verified";
};

type WorkerPayload = {
  artifacts?: unknown;
  exception: string;
  observed: unknown;
  stderr: string;
  stdout: string;
};

const BOOT_TIMEOUT_MS = 45_000;
let verifiedWorkerUrlPromise: Promise<string> | null = null;

const CHECK_TASK = String.raw`
def _fn(raw):
    import ast
    import asyncio
    import base64
    import contextlib
    import csv
    import hashlib
    import io
    import inspect
    import json
    import os
    import pathlib
    import random
    import tempfile
    import traceback

    request = json.loads(raw)
    source = request["source"]
    fixture = request["fixture"]

    def stable_json(value):
        if isinstance(value, list):
            return "[" + ",".join(stable_json(item) for item in value) + "]"
        if isinstance(value, dict):
            return "{" + ",".join(
                json.dumps(key, ensure_ascii=False) + ":" + stable_json(value[key])
                for key in sorted(value)
            ) + "}"
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)

    def digest_bytes(value):
        encoded = base64.urlsafe_b64encode(hashlib.sha256(value).digest()).decode("ascii").rstrip("=")
        return "sha256-" + encoded

    def digest_file(path):
        digest = hashlib.sha256()
        with path.open("rb") as stream:
            while True:
                chunk = stream.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)
        return "sha256-" + base64.urlsafe_b64encode(digest.digest()).decode("ascii").rstrip("=")

    def table_shape(path, format_name):
        try:
            if format_name == "csv":
                with path.open("r", encoding="utf-8-sig", newline="") as stream:
                    rows = csv.reader(stream)
                    columns = next(rows)
                    if not columns or any(not column for column in columns) or len(columns) != len(set(columns)):
                        return None
                    row_count = 0
                    for row in rows:
                        if len(row) != len(columns):
                            return None
                        row_count += 1
                    return columns, row_count
            if format_name == "json":
                records = json.loads(path.read_text(encoding="utf-8"))
                if not isinstance(records, list) or not records or not all(isinstance(record, dict) for record in records):
                    return None
                columns = sorted({key for record in records for key in record if isinstance(key, str) and key})
                if not columns or any(len(record) != len([key for key in record if isinstance(key, str) and key]) for record in records):
                    return None
                return columns, len(records)
        except (csv.Error, OSError, UnicodeError, ValueError, TypeError):
            return None
        return None

    def image_shape(path):
        try:
            data = path.read_bytes()
        except OSError:
            return None
        if len(data) >= 24 and data.startswith(b"\x89PNG\r\n\x1a\n"):
            width = int.from_bytes(data[16:20], "big")
            height = int.from_bytes(data[20:24], "big")
            return ("image/png", width, height) if width > 0 and height > 0 else None
        if len(data) >= 10 and data[:6] in {b"GIF87a", b"GIF89a"}:
            width = int.from_bytes(data[6:8], "little")
            height = int.from_bytes(data[8:10], "little")
            return ("image/gif", width, height) if width > 0 and height > 0 else None
        if len(data) < 4 or not data.startswith(b"\xff\xd8"):
            return None
        index = 2
        frame_markers = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
        while index < len(data):
            while index < len(data) and data[index] != 0xFF:
                index += 1
            while index < len(data) and data[index] == 0xFF:
                index += 1
            if index >= len(data):
                return None
            marker = data[index]
            index += 1
            if marker == 0xD9:
                return None
            if marker == 0x01 or 0xD0 <= marker <= 0xD8:
                continue
            if index + 2 > len(data):
                return None
            segment_length = int.from_bytes(data[index:index + 2], "big")
            if segment_length < 2 or index + segment_length > len(data):
                return None
            if marker in frame_markers and segment_length >= 7:
                height = int.from_bytes(data[index + 3:index + 5], "big")
                width = int.from_bytes(data[index + 5:index + 7], "big")
                return ("image/jpeg", width, height) if width > 0 and height > 0 else None
            index += segment_length
        return None

    def artifact_descriptor(root_path, item):
        path = str(item.get("path") or "")
        target = root_path / path
        origin = "fixture" if item.get("origin") == "fixture" else "created"
        if item.get("kind") == "file" and target.is_file():
            return {
                "byteLength": target.stat().st_size,
                "contentHash": digest_file(target),
                "fileCount": 1,
                "kind": "file",
                "origin": origin,
                "path": path,
                "schemaVersion": 1,
            }
        if item.get("kind") == "directory" and target.is_dir():
            entries = []
            total_bytes = 0
            for child in sorted(target.rglob("*")):
                if not child.is_file():
                    continue
                byte_length = child.stat().st_size
                total_bytes += byte_length
                entries.append({
                    "byteLength": byte_length,
                    "contentHash": digest_file(child),
                    "path": child.relative_to(target).as_posix(),
                })
            return {
                "byteLength": total_bytes,
                "contentHash": digest_bytes(stable_json(entries).encode("utf-8")),
                "fileCount": len(entries),
                "kind": "directory",
                "origin": origin,
                "path": path,
                "schemaVersion": 1,
            }
        if item.get("kind") == "table" and target.is_file():
            format_name = item.get("format")
            shape = table_shape(target, format_name)
            if shape is None or shape[0] != item.get("columns"):
                return None
            columns, row_count = shape
            return {
                "byteLength": target.stat().st_size,
                "columnCount": len(columns),
                "columns": columns,
                "contentHash": digest_file(target),
                "format": format_name,
                "kind": "table",
                "origin": origin,
                "path": path,
                "rowCount": row_count,
                "schemaVersion": 1,
            }
        if item.get("kind") == "image" and target.is_file():
            shape = image_shape(target)
            if shape is None or shape[0] != item.get("mediaType") or shape[1] != item.get("width") or shape[2] != item.get("height"):
                return None
            media_type, width, height = shape
            return {
                "byteLength": target.stat().st_size,
                "contentHash": digest_file(target),
                "height": height,
                "kind": "image",
                "mediaType": media_type,
                "origin": origin,
                "path": path,
                "schemaVersion": 1,
                "width": width,
            }
        return None
    forbidden_imports = {"js", "pyodide", "micropip", "socket", "requests", "http", "ftplib"}
    allowed_urllib_imports = {"urllib.error", "urllib.parse"}
    forbidden_calls = {"eval", "exec", "compile", "__import__"}
    tree = ast.parse(source, filename="<learning-check>", mode="exec")
    def import_names(node):
        if isinstance(node, ast.Import):
            return [alias.name for alias in node.names]
        if isinstance(node, ast.ImportFrom):
            module = node.module or ""
            if not module:
                return []
            if module == "urllib":
                return [module if alias.name == "*" else f"{module}.{alias.name}" for alias in node.names]
            return [module]
        return []

    def blocked_import_names(names):
        blocked = []
        for name in names:
            root = name.split(".", 1)[0]
            if root in forbidden_imports:
                blocked.append(name)
                continue
            if name == "urllib" or name.startswith("urllib."):
                if any(name == allowed or name.startswith(allowed + ".") for allowed in allowed_urllib_imports):
                    continue
                blocked.append(name)
        return sorted(set(blocked))

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            blocked = blocked_import_names(import_names(node))
            if blocked:
                raise PermissionError("browser strong check에서 허용하지 않는 import: " + ", ".join(blocked))
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in forbidden_calls:
            raise PermissionError("browser strong check에서 허용하지 않는 호출: " + node.func.id)

    stdout = io.StringIO()
    stderr = io.StringIO()
    exception = ""
    observed = None
    artifacts = []
    with tempfile.TemporaryDirectory(prefix="codaro-check-") as root:
        root_path = pathlib.Path(root)
        for item in fixture.get("directories", []):
            (root_path / item).mkdir(parents=True, exist_ok=True)
        for item in fixture.get("files", []):
            target = root_path / item["path"]
            target.parent.mkdir(parents=True, exist_ok=True)
            if item.get("contentBase64"):
                target.write_bytes(base64.b64decode(item["contentBase64"]))
            else:
                target.write_text(item.get("content", ""), encoding="utf-8")
        previous_cwd = pathlib.Path.cwd()
        previous_env = dict(os.environ)
        try:
            os.chdir(root_path)
            os.environ.clear()
            os.environ.update({"HOME": str(root_path), "LANG": "C.UTF-8", "TZ": "UTC"})
            os.environ.update(fixture.get("env", {}))
            random.seed(0)
            namespace = {"__name__": "__main__", "__builtins__": __builtins__}
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                exec(compile(tree, "<learning-check>", "exec"), namespace, namespace)
                if request["kind"] == "variable":
                    name = request["variableName"]
                    observed = {"exists": name in namespace, "value": namespace.get(name)}
                elif request["kind"] == "behavior":
                    behavior = request["behavior"]
                    entry = namespace.get(behavior["entry"])
                    if not callable(entry):
                        raise AssertionError("호출 가능한 함수가 없습니다: " + behavior["entry"])
                    preexisting = [item["path"] for item in behavior["expectedPaths"] if item.get("origin") == "created" and (root_path / item["path"]).exists()]
                    if preexisting:
                        raise AssertionError("함수 호출 전에 fixture를 변경했습니다: " + ", ".join(preexisting))
                    case_results = []
                    for case in behavior["cases"]:
                        args = [root_path / item["fixturePath"] if "fixturePath" in item else item.get("value") for item in case["arguments"]]
                        try:
                            returned = entry(*args)
                            if inspect.isawaitable(returned):
                                returned = asyncio.run(returned)
                            if behavior.get("normalizeReturnPaths") and isinstance(returned, dict):
                                returned = dict(returned)
                                for key in behavior["normalizeReturnPaths"]:
                                    if key not in returned:
                                        raise AssertionError("정규화할 반환 경로 key가 없습니다: " + key)
                                    try:
                                        returned[key] = pathlib.Path(returned[key]).resolve().relative_to(root_path.resolve()).as_posix()
                                    except ValueError:
                                        returned[key] = "outside-fixture"
                            case_results.append({"id": case["id"], "return": returned})
                        except BaseException as case_error:
                            case_results.append({"id": case["id"], "exception": type(case_error).__name__})
                    paths = []
                    for item in behavior["expectedPaths"]:
                        target = root_path / item["path"]
                        descriptor = artifact_descriptor(root_path, item)
                        if descriptor is not None:
                            artifacts.append(descriptor)
                        actual_kind = descriptor["kind"] if descriptor is not None else "directory" if target.is_dir() else "file" if target.is_file() else "missing"
                        paths.append({"path": item["path"], "kind": actual_kind})
                    observed = {"cases": case_results, "paths": paths}
                    artifacts.sort(key=lambda item: (item["origin"], item["path"], item["kind"]))
        except BaseException:
            exception = traceback.format_exc(limit=4)
        finally:
            os.chdir(previous_cwd)
            os.environ.clear()
            os.environ.update(previous_env)
    return json.dumps({"artifacts": artifacts, "stdout": stdout.getvalue(), "stderr": stderr.getvalue(), "exception": exception, "observed": observed}, ensure_ascii=False)
`;

export async function executeBrowserStrongCheck(
  spec: StrongLearningCheckSpecV1,
  source: string,
): Promise<BrowserStrongOutputCheckResult> {
  const expected = expectedDisplay(spec);
  if (!(await verifyLearningFixtureHash(spec))) {
    return failed("error", expected, "", "검증 fixture hash가 일치하지 않아 결과를 기록하지 않았습니다.");
  }

  let worker: Worker | null = null;
  try {
    const [{ indexURL }, workerUrl, packageUrls] = await Promise.all([
      getBrowserPythonRuntimeInfo(),
      verifiedProcessWorkerUrl(),
      verifiedLearningPackageUrls(spec.packageAssets),
    ]);
    worker = new Worker(workerUrl, { type: "module", name: `codaro-check-${spec.id}` });
    const bootReqId = `boot-${crypto.randomUUID()}`;
    const boot = waitForWorker(worker, bootReqId, BOOT_TIMEOUT_MS);
    worker.postMessage({
      type: "boot",
      id: 1,
      reqId: bootReqId,
      indexURL,
      packages: packageUrls,
      snapshot: null,
    });
    await boot;

    const taskReqId = `task-${crypto.randomUUID()}`;
    const task = waitForWorker(worker, taskReqId, spec.timeoutMs);
    worker.postMessage({
      type: "task",
      id: 1,
      reqId: taskReqId,
      taskId: 1,
      fnSrc: CHECK_TASK,
      arg: JSON.stringify({
        behavior: spec.kind === "behavior" ? runtimeBehaviorPayload(spec.payload) : null,
        fixture: spec.fixture,
        kind: spec.kind,
        source,
        variableName: spec.kind === "variable" ? spec.payload.name : null,
      }),
    });
    const response = await task;
    const payload = JSON.parse(String(response.result ?? "{}")) as Partial<WorkerPayload>;
    const actual = spec.kind === "output"
      ? normalizeLearningOutput(payload.stdout ?? "")
      : stableJson(payload.observed ?? null);
    if (payload.exception) {
      return failed("error", expected, actual, concisePythonError(payload.exception));
    }
    if (actual !== expected) {
      return failed("mismatch", expected, actual, `기대 출력은 ${displayOutput(expected)}이고, 현재 출력은 ${displayOutput(actual)}입니다.`);
    }
    return {
      actual,
      ...(spec.kind === "behavior" ? { artifacts: normalizeWorkerArtifacts(payload.artifacts) } : {}),
      detail: spec.kind === "output"
        ? "새 브라우저 Python Worker에서 fixture와 함께 다시 실행해 정확한 출력을 확인했습니다."
        : spec.kind === "variable"
          ? "새 브라우저 Python Worker에서 학생 namespace의 변수 값을 격리해 확인했습니다."
          : "새 브라우저 Python Worker의 fixture에서 함수 반환값과 생성된 경로를 함께 확인했습니다.",
      executor: "browser-worker",
      expected,
      passed: true,
      state: "verified",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const unsupported = /manifest|asset|fetch|crypto|Worker/i.test(message);
    return failed(
      unsupported ? "unsupported" : "error",
      expected,
      "",
      unsupported
        ? "이 브라우저에서는 격리 검증기를 준비하지 못해 학습 증거를 기록하지 않았습니다."
        : `격리 검증을 마치지 못했습니다: ${message}`,
    );
  } finally {
    worker?.terminate();
  }
}

function normalizeWorkerArtifacts(value: unknown): LearningEvidenceArtifact[] {
  if (!Array.isArray(value) || value.length > 64) return [];
  const artifacts: LearningEvidenceArtifact[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const descriptor = item as Record<string, unknown>;
    const byteLength = Number(descriptor.byteLength);
    const kind = descriptor.kind;
    const origin = descriptor.origin;
    const path = String(descriptor.path ?? "");
    const contentHash = String(descriptor.contentHash ?? "");
    if (
      descriptor.schemaVersion !== 1
      || !new Set(["directory", "file", "table", "image"]).has(String(kind))
      || !new Set(["created", "fixture"]).has(String(origin))
      || !path
      || unsafeArtifactPath(path)
      || !/^sha256-[A-Za-z0-9_-]{43}$/.test(contentHash)
      || !Number.isSafeInteger(byteLength)
      || byteLength < 0
    ) return [];
    const base = {
      byteLength,
      contentHash,
      origin: origin as "created" | "fixture",
      path,
      schemaVersion: 1 as const,
    };
    if (kind === "directory" || kind === "file") {
      const fileCount = Number(descriptor.fileCount);
      if (!Number.isSafeInteger(fileCount) || fileCount < 0) return [];
      artifacts.push({ ...base, fileCount, kind });
      continue;
    }
    if (kind === "table") {
      const rowCount = Number(descriptor.rowCount);
      const columnCount = Number(descriptor.columnCount);
      const rawColumns = descriptor.columns;
      const format = descriptor.format;
      if (
        (format !== "csv" && format !== "json")
        || !Number.isSafeInteger(rowCount)
        || rowCount < 0
        || !Number.isSafeInteger(columnCount)
        || columnCount < 1
        || !Array.isArray(rawColumns)
        || !rawColumns.every((column) => typeof column === "string" && Boolean(column))
        || new Set(rawColumns).size !== rawColumns.length
        || rawColumns.length !== columnCount
      ) return [];
      artifacts.push({
        ...base,
        columnCount,
        columns: rawColumns as string[],
        format,
        kind,
        rowCount,
      });
      continue;
    }
    const width = Number(descriptor.width);
    const height = Number(descriptor.height);
    const mediaType = descriptor.mediaType;
    if (
      !new Set(["image/png", "image/jpeg", "image/gif"]).has(String(mediaType))
      || !Number.isSafeInteger(width)
      || width < 1
      || !Number.isSafeInteger(height)
      || height < 1
    ) return [];
    artifacts.push({
      ...base,
      height,
      kind: "image",
      mediaType: mediaType as "image/gif" | "image/jpeg" | "image/png",
      width,
    });
  }
  return artifacts.sort((left, right) => (
    `${left.origin}:${left.path}:${left.kind}`.localeCompare(`${right.origin}:${right.path}:${right.kind}`)
  ));
}

function unsafeArtifactPath(value: string): boolean {
  const normalized = value.replace(/\\/g, "/");
  return normalized.startsWith("/") || normalized.includes(":") || normalized.split("/").includes("..");
}

function runtimeBehaviorPayload(payload: Extract<StrongLearningCheckSpecV1, { kind: "behavior" }>["payload"]) {
  return {
    cases: payload.cases.map(({ arguments: caseArguments, id }) => ({
      arguments: caseArguments,
      id,
    })),
    entry: payload.entry,
    expectedPaths: payload.expectedPaths.map((item) => ({ ...item })),
    normalizeReturnPaths: payload.normalizeReturnPaths,
  };
}

async function verifiedProcessWorkerUrl(): Promise<string> {
  if (!verifiedWorkerUrlPromise) {
    verifiedWorkerUrlPromise = loadAndVerifyProcessWorker().catch((error: unknown) => {
      verifiedWorkerUrlPromise = null;
      throw error;
    });
  }
  return verifiedWorkerUrlPromise;
}

async function loadAndVerifyProcessWorker(): Promise<string> {
  const appBase = import.meta.env.BASE_URL || "/";
  const baseHref = new URL(appBase, window.location.origin).href;
  const manifestUrl = new URL("pyproc-assets.json", baseHref);
  const response = await fetch(manifestUrl, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(`pyproc asset manifest fetch failed: ${response.status}`);
  const manifest = await response.json() as PyProcManifest;
  const files = (manifest.files ?? []).filter((file) => file.roles?.includes("processWorker"));
  const entry = (manifest.entrypoints ?? []).find((item) => item.role === "processWorker");
  if (!entry?.url || !files.length) throw new Error("pyproc processWorker asset graph missing");
  for (const file of files) await verifyAsset(file);
  return new URL(entry.url, window.location.origin).href;
}

async function verifyAsset(file: PyProcManifestFile): Promise<void> {
  const url = new URL(file.url, window.location.origin);
  if (url.origin !== window.location.origin) throw new Error(`cross-origin check asset rejected: ${url.href}`);
  const response = await fetch(url, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(`check asset fetch failed: ${response.status}`);
  const digest = await crypto.subtle.digest("SHA-256", await response.arrayBuffer());
  const actual = `sha256-${bytesToBase64(new Uint8Array(digest))}`;
  if (actual !== file.integrity) throw new Error(`check asset integrity mismatch: ${url.pathname}`);
}

async function verifiedLearningPackageUrls(
  assets: StrongLearningCheckSpecV1["packageAssets"],
): Promise<string[]> {
  const appBase = import.meta.env.BASE_URL || "/";
  const baseHref = new URL(appBase, window.location.origin);
  const urls: string[] = [];
  for (const asset of assets) {
    const url = new URL(asset.url, baseHref);
    if (url.origin !== window.location.origin) {
      throw new Error(`cross-origin learning package rejected: ${asset.name}`);
    }
    const response = await fetch(url, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error(`learning package fetch failed: ${asset.name} ${response.status}`);
    const digest = await crypto.subtle.digest("SHA-256", await response.arrayBuffer());
    const actual = `sha256-${bytesToBase64(new Uint8Array(digest))}`;
    if (actual !== asset.integrity) throw new Error(`learning package integrity mismatch: ${asset.name}`);
    urls.push(url.href);
  }
  return urls;
}

function waitForWorker(worker: Worker, reqId: string, timeoutMs: number): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error(`learning check timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    const onMessage = (event: MessageEvent<Record<string, unknown>>) => {
      if (event.data.reqId !== reqId) return;
      cleanup();
      if (event.data.type === "error") reject(new Error(String(event.data.error ?? "worker error")));
      else resolve(event.data);
    };
    const onError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || "learning check worker crashed"));
    };
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
  });
}

function failed(
  state: "error" | "mismatch" | "unsupported",
  expected: string,
  actual: string,
  detail: string,
): BrowserStrongOutputCheckResult {
  return { actual, detail, executor: "browser-worker", expected, passed: false, state };
}

function concisePythonError(value: string): string {
  const lines = value.trim().split(/\r?\n/).filter(Boolean);
  return lines.slice(-2).join(" ") || "Python 실행 오류가 발생했습니다.";
}

function displayOutput(value: string): string {
  return value ? `“${value.replace(/\n/g, " ↵ ")}”` : "빈 출력";
}

function expectedDisplay(spec: StrongLearningCheckSpecV1): string {
  if (spec.kind === "output") return normalizeLearningOutput(spec.payload.expected);
  if (spec.kind === "variable") return stableJson({ exists: true, value: spec.payload.expected });
  return stableJson({
    cases: spec.payload.cases.map((item) => (
      item.expectedException
        ? { exception: item.expectedException, id: item.id }
        : { id: item.id, return: item.expectedReturn }
    )),
    paths: spec.payload.expectedPaths.map(({ kind, path }) => ({ kind, path })),
  });
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
