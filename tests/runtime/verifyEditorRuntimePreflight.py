from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EDITOR_DIR = ROOT / "editor"
EDITOR_PACKAGE = EDITOR_DIR / "package.json"
PYPROC_ASSET_SCRIPT = EDITOR_DIR / "scripts" / "generatePyprocAssets.mjs"
NOTEBOOK_RUNTIME = EDITOR_DIR / "src" / "lib" / "notebookRuntime.ts"
BROWSER_RUNTIME = EDITOR_DIR / "src" / "lib" / "browserPythonRuntime.ts"
AUTOMATION_CELL_RUNTIME = EDITOR_DIR / "src" / "lib" / "automationCellRuntime.ts"
AUTOMATION_PRESENTATION = EDITOR_DIR / "src" / "lib" / "automationPresentation.ts"
LEARNING_ATTEMPT_CHECK = EDITOR_DIR / "src" / "lib" / "learningAttemptCheck.ts"
DISPLAY_FORMAT = EDITOR_DIR / "src" / "lib" / "displayFormat.ts"
TRACEBACK_PARSER = EDITOR_DIR / "src" / "lib" / "tracebackParser.ts"
LOCAL_RUNTIME = EDITOR_DIR / "src" / "lib" / "localRuntime.ts"
PACKAGE_INFERENCE = EDITOR_DIR / "src" / "lib" / "packageInference.ts"
PYTHON_STDLIB = EDITOR_DIR / "src" / "lib" / "pythonStdlib.ts"
LOCALE_COPY = EDITOR_DIR / "src" / "lib" / "localeCopy.ts"
DEP_GRAPH_LAYOUT = EDITOR_DIR / "src" / "lib" / "dependencyGraphLayout.ts"
APP_PRIMITIVES = EDITOR_DIR / "src" / "components" / "app" / "appPrimitives.tsx"
APP_ENTRY = EDITOR_DIR / "src" / "App.tsx"
DAY01_CURRICULUM = ROOT / "curricula" / "python" / "basics" / "30days" / "day01_헬로월드.yaml"


def main() -> int:
    failures = sourceContractFailures()
    nodeFailure, nodeOutput = runRuntimeProbe()
    if nodeFailure:
        failures.append(nodeFailure)
    assetFailure, assetOutput = runPyprocAssetScriptProbe()
    if assetFailure:
        failures.append(assetFailure)
    installedAssetFailure, installedAssetOutput = runInstalledPyprocAssetProbe()
    if installedAssetFailure:
        failures.append(installedAssetFailure)

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        if nodeOutput:
            print(nodeOutput, file=sys.stderr)
        if assetOutput:
            print(assetOutput, file=sys.stderr)
        if installedAssetOutput:
            print(installedAssetOutput, file=sys.stderr)
        return 1

    print(f"ok: editor runtime package preflight verified {nodeOutput} {assetOutput} {installedAssetOutput}")
    return 0


def sourceContractFailures() -> list[str]:
    failures: list[str] = []
    for path in (
        EDITOR_PACKAGE,
        PYPROC_ASSET_SCRIPT,
        NOTEBOOK_RUNTIME,
        BROWSER_RUNTIME,
        AUTOMATION_CELL_RUNTIME,
        AUTOMATION_PRESENTATION,
        LEARNING_ATTEMPT_CHECK,
        DISPLAY_FORMAT,
        TRACEBACK_PARSER,
        LOCAL_RUNTIME,
        PACKAGE_INFERENCE,
        PYTHON_STDLIB,
        LOCALE_COPY,
        APP_PRIMITIVES,
        APP_ENTRY,
        DAY01_CURRICULUM,
    ):
        if not path.is_file():
            failures.append(f"missing {path.relative_to(ROOT)}")

    if failures:
        return failures

    packageText = EDITOR_PACKAGE.read_text(encoding="utf-8")
    assetScriptText = PYPROC_ASSET_SCRIPT.read_text(encoding="utf-8")
    runtimeText = NOTEBOOK_RUNTIME.read_text(encoding="utf-8")
    browserRuntimeText = BROWSER_RUNTIME.read_text(encoding="utf-8")
    automationCellText = AUTOMATION_CELL_RUNTIME.read_text(encoding="utf-8")
    automationPresentationText = AUTOMATION_PRESENTATION.read_text(encoding="utf-8")
    learningAttemptText = LEARNING_ATTEMPT_CHECK.read_text(encoding="utf-8")
    displayFormatText = DISPLAY_FORMAT.read_text(encoding="utf-8")
    tracebackParserText = TRACEBACK_PARSER.read_text(encoding="utf-8")
    localRuntimeText = LOCAL_RUNTIME.read_text(encoding="utf-8")
    inferenceText = PACKAGE_INFERENCE.read_text(encoding="utf-8")
    stdlibText = PYTHON_STDLIB.read_text(encoding="utf-8")
    localeText = LOCALE_COPY.read_text(encoding="utf-8")
    appPrimitivesText = APP_PRIMITIVES.read_text(encoding="utf-8")
    appEntryText = APP_ENTRY.read_text(encoding="utf-8")
    required = {
        EDITOR_PACKAGE: (
            "\"pyproc:assets\"",
            "vite build && npm run pyproc:assets",
        ),
        PYPROC_ASSET_SCRIPT: (
            "CODARO_PYPROC_PACKAGE_ROOT",
            "CODARO_WEB_OUT",
            "pyproc-assets.json",
            "vendor/pyproc",
            "getPyProcAssetManifest",
            "sha256-",
            "collectGraph",
        ),
        NOTEBOOK_RUNTIME: (
            "runAutomationSessionCell",
            "isKernelExecutableBlock",
            "isPersistentAutomationBlock",
            "preflightRuntimePackages",
            "sessionPackagesList",
            "sessionPackageInstall",
            "executeCode",
            "executeReactive",
            "runtime.libraryFailed",
            "runtime.uvPrepared",
        ),
        BROWSER_RUNTIME: (
            "VITE_PYPROC_ASSET_INTEGRITY_URL",
            "new URL(\"pyproc-assets.json\"",
            "import.meta.env.BASE_URL",
            "assetIntegrity",
            "loadAssetIntegrity",
            "fetch(assetIntegrityUrl()",
            "fs: PyRuntimeFileSystem",
            "Runtime.fs",
            "/home/web/codaro",
            "writeBrowserRunRecord",
            "enableAsgiServer",
            "verifyBrowserAsgiServer",
            "verifyAsgiServer",
            "installBrowserPythonRuntimeDiagnostics",
        ),
        AUTOMATION_CELL_RUNTIME: (
            "runAutomationCell",
            "automationPresentationCopy",
            "AutomationSessionCellPayload",
        ),
        AUTOMATION_PRESENTATION: (
            "automationExecutionPresentation",
            "automationPresentationCopy",
            "automationSessionPresentation",
            "runtime.automationStarted",
            "runtime.automationCompleted",
            "runtime.automationCancelled",
            "runtime.automationTimedOut",
            "runtime.automationFailed",
            "sanitizeAutomationDetail",
            "cancelledStatuses",
            "timeoutStatuses",
            "failedStatuses",
            "readableFields",
        ),
        LEARNING_ATTEMPT_CHECK: (
            "evaluateLearningAttempt",
            "practiceActualOutput",
            "stringifyData",
            "decodePythonStringRepr",
        ),
        TRACEBACK_PARSER: (
            "learnerFacingErrorText",
            "pythonErrorSummary",
            "sanitizeLearnerErrorDetail",
            "CELL_FILE_HINTS",
        ),
        LOCAL_RUNTIME: (
            "buildLocalExecutionResult",
            "firstOutputLine",
            "extractStdout",
        ),
        PACKAGE_INFERENCE: (
            "inferCodePackages",
            "inferDocumentPackages",
            "inferAssistantPackages",
            "normalizePackageName",
            "isPythonStdlibModule",
            "PACKAGE_ALIASES",
            "PACKAGE_PROVIDER_EQUIVALENTS",
        ),
        PYTHON_STDLIB: (
            "PYTHON_STDLIB_MODULES",
            "isPythonStdlibModule",
            "isPythonStdlibPackageName",
        ),
        LOCALE_COPY: (
            "라이브러리 준비 실패",
            "uv로 준비한 뒤 실행했습니다",
        ),
        APP_PRIMITIVES: (
            "automationExecutionPresentation",
            "learnerFacingErrorText",
        ),
        APP_ENTRY: (
            "codaroBrowserRuntimeDiagnostics",
            "installBrowserPythonRuntimeDiagnostics",
        ),
    }
    sourceByPath = {
        EDITOR_PACKAGE: packageText,
        PYPROC_ASSET_SCRIPT: assetScriptText,
        NOTEBOOK_RUNTIME: runtimeText,
        BROWSER_RUNTIME: browserRuntimeText,
        AUTOMATION_CELL_RUNTIME: automationCellText,
        AUTOMATION_PRESENTATION: automationPresentationText,
        LEARNING_ATTEMPT_CHECK: learningAttemptText,
        DISPLAY_FORMAT: displayFormatText,
        TRACEBACK_PARSER: tracebackParserText,
        LOCAL_RUNTIME: localRuntimeText,
        PACKAGE_INFERENCE: inferenceText,
        PYTHON_STDLIB: stdlibText,
        LOCALE_COPY: localeText,
        APP_PRIMITIVES: appPrimitivesText,
        APP_ENTRY: appEntryText,
    }
    for path, tokens in required.items():
        text = sourceByPath[path]
        for token in tokens:
            if token not in text:
                failures.append(f"{path.relative_to(ROOT)} missing {token}")
    return failures


def runPyprocAssetScriptProbe() -> tuple[str | None, str]:
    node = shutil.which("node")
    if not node:
        return "node is required for pyproc asset script verification", ""

    with tempfile.TemporaryDirectory(prefix="codaro-pyproc-assets-") as tempDir:
        tempRoot = Path(tempDir)
        packageRoot = tempRoot / "pkg"
        outDir = tempRoot / "out"
        (packageRoot / "src" / "runtime").mkdir(parents=True)
        (packageRoot / "src" / "processOs").mkdir(parents=True)
        (packageRoot / "src" / "runtime" / "assets.js").write_text(
            """
export function getPyProcAssetManifest(opts = {}) {
  const root = String(opts.baseURL || "/vendor/pyproc/").replace(/\\/?$/, "/");
  return {
    version: 1,
    packageRoot: root,
    policy: {
      sameOriginRequired: true,
      preserveRelativeImports: true,
      runtimePreflight: true,
      note: "probe",
    },
    assets: [{
      role: "processWorker",
      path: "src/processOs/worker.js",
      kind: "module-worker",
      sameOrigin: true,
      usedBy: ["probe"],
      reason: "probe",
      url: root + "src/processOs/worker.js",
    }],
  };
}
""".strip()
            + "\n",
            encoding="utf-8",
        )
        (packageRoot / "src" / "processOs" / "worker.js").write_text(
            'import "./helper.js";\nexport const workerReady = true;\n',
            encoding="utf-8",
        )
        (packageRoot / "src" / "processOs" / "helper.js").write_text(
            "export const helperReady = true;\n",
            encoding="utf-8",
        )
        result = subprocess.run(
            [
                node,
                str(PYPROC_ASSET_SCRIPT),
                "--package-root",
                str(packageRoot),
                "--out-dir",
                str(outDir),
                "--baseURL",
                "/vendor/pyproc/",
            ],
            cwd=EDITOR_DIR,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        output = result.stdout.strip()
        if result.returncode != 0:
            return "pyproc asset script probe failed", output

        manifestPath = outDir / "pyproc-assets.json"
        workerPath = outDir / "vendor" / "pyproc" / "src" / "processOs" / "worker.js"
        helperPath = outDir / "vendor" / "pyproc" / "src" / "processOs" / "helper.js"
        if not manifestPath.is_file():
            return "pyproc asset script did not write pyproc-assets.json", output
        if not workerPath.is_file() or not helperPath.is_file():
            return "pyproc asset script did not copy the import graph", output
        manifest = json.loads(manifestPath.read_text(encoding="utf-8"))
        graph = manifest["entrypoints"][0]["graph"]
        files = manifest["files"]
        if graph != ["src/processOs/helper.js", "src/processOs/worker.js"]:
            return f"pyproc asset script graph mismatch: {graph}", output
        if sorted(file["path"] for file in files) != graph:
            return "pyproc asset script files mismatch", output
        if not all(file["url"].startswith("/vendor/pyproc/") for file in files):
            return "pyproc asset script URL base mismatch", output
        if not all(file["integrity"].startswith("sha256-") for file in files):
            return "pyproc asset script did not write sha256 SRI", output
        return None, json.dumps({"pyprocAssetFiles": len(files), "pyprocAssetGraph": graph}, ensure_ascii=False)


def runInstalledPyprocAssetProbe() -> tuple[str | None, str]:
    node = shutil.which("node")
    if not node:
        return "node is required for installed pyproc asset verification", ""

    with tempfile.TemporaryDirectory(prefix="codaro-installed-pyproc-assets-") as tempDir:
        outDir = Path(tempDir) / "out"
        result = subprocess.run(
            [
                node,
                str(PYPROC_ASSET_SCRIPT),
                "--out-dir",
                str(outDir),
                "--baseURL",
                "/vendor/pyproc/",
            ],
            cwd=EDITOR_DIR,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        output = result.stdout.strip()
        if result.returncode != 0:
            return "installed pyproc asset script probe failed", output
        manifestPath = outDir / "pyproc-assets.json"
        if not manifestPath.is_file():
            return "installed pyproc package did not produce pyproc-assets.json", output
        manifest = json.loads(manifestPath.read_text(encoding="utf-8"))
        roles = sorted(entrypoint["role"] for entrypoint in manifest["entrypoints"])
        expectedRoles = [
            "machineWorker",
            "processWorker",
            "pyprocServiceWorker",
            "sharedKernelHost",
            "wasiWorker",
        ]
        if roles != expectedRoles:
            return f"installed pyproc asset roles mismatch: {roles}", output
        files = manifest["files"]
        if len(files) < len(expectedRoles):
            return "installed pyproc asset graph is too small", output
        missingCopies = [
            file["path"]
            for file in files
            if not (outDir / "vendor" / "pyproc" / Path(file["path"])).is_file()
        ]
        if missingCopies:
            return f"installed pyproc copied graph missing files: {missingCopies[:3]}", output
        if not all(file["integrity"].startswith("sha256-") for file in files):
            return "installed pyproc asset graph has non-SRI entries", output
        return None, json.dumps({"installedPyprocAssetFiles": len(files), "installedPyprocRoles": roles}, ensure_ascii=False)


def runRuntimeProbe() -> tuple[str | None, str]:
    node = shutil.which("node")
    if not node:
        return "node is required for editor runtime preflight verification", ""

    result = subprocess.run(
        [node, "-e", nodeProbeScript()],
        cwd=EDITOR_DIR,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    output = result.stdout.strip()
    if result.returncode != 0:
        return "editor runtime preflight probe failed", output
    return None, output


def nodeProbeScript() -> str:
    runtimePath = json.dumps(str(NOTEBOOK_RUNTIME), ensure_ascii=False)
    automationRuntimePath = json.dumps(str(AUTOMATION_CELL_RUNTIME), ensure_ascii=False)
    automationPresentationPath = json.dumps(str(AUTOMATION_PRESENTATION), ensure_ascii=False)
    learningAttemptPath = json.dumps(str(LEARNING_ATTEMPT_CHECK), ensure_ascii=False)
    displayFormatPath = json.dumps(str(DISPLAY_FORMAT), ensure_ascii=False)
    tracebackParserPath = json.dumps(str(TRACEBACK_PARSER), ensure_ascii=False)
    day01CurriculumPath = json.dumps(str(DAY01_CURRICULUM), ensure_ascii=False)
    inferencePath = json.dumps(str(PACKAGE_INFERENCE), ensure_ascii=False)
    stdlibPath = json.dumps(str(PYTHON_STDLIB), ensure_ascii=False)
    layoutPath = json.dumps(str(DEP_GRAPH_LAYOUT), ensure_ascii=False)
    editorDir = json.dumps(str(EDITOR_DIR), ensure_ascii=False)
    return f"""
(async () => {{
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require(require.resolve("esbuild", {{ paths: [{editorDir}] }}));

function loadModule(filePath, customRequire) {{
  const source = fs.readFileSync(filePath, "utf8");
  const transformed = esbuild.transformSync(source, {{
    loader: "ts",
    format: "cjs",
    platform: "node",
    target: "es2022",
  }});
  const moduleObject = {{ exports: {{}} }};
  new Function("exports", "require", "module", "__filename", "__dirname", transformed.code)(
    moduleObject.exports,
    customRequire,
    moduleObject,
    filePath,
    path.dirname(filePath),
  );
  return moduleObject.exports;
}}

const calls = [];
let installFails = false;
let automationFixture = "success";
const fakeResult = {{
  type: "execute_result",
  blockId: "cell-1",
  data: "done",
  stdout: "done\\n",
  stderr: "",
  variables: [],
  stateDelta: {{ added: [], updated: [], removed: [] }},
  executionCount: 1,
  status: "ok",
}};
const cancelledBackendPayload = {{
  sessionKey: "browser:orders",
  sessionId: "session-private-cancelled",
  kind: "browser",
  op: "step",
  action: "navigate",
  status: "cancelled",
  result: {{}},
  step: {{
    id: "step-private-cancelled",
    sessionId: "session-private-cancelled",
    action: "navigate",
    status: "cancelled",
    startedAt: "2026-07-23T00:00:00+00:00",
    finishedAt: "2026-07-23T00:00:01+00:00",
    durationMs: 1000,
    error: "Emergency stop is active: 사용자 요청 session-private-cancelled browser:orders 123e4567-e89b-42d3-a456-426614174000",
    result: {{}},
  }},
  state: null,
  opened: false,
}};
const fakeApi = {{
  createSession: async () => {{
    calls.push(["createSession"]);
    return {{ sessionId: "session-1", status: "ready" }};
  }},
  sessionPackagesList: async (sessionId) => {{
    calls.push(["packages-check", sessionId]);
    return [{{ name: "numpy", version: "1.0.0" }}];
  }},
  sessionPackageInstall: async (sessionId, name) => {{
    calls.push(["packages-install", sessionId, name]);
    if (installFails) {{
      return {{
        package: name,
        success: false,
        message: "install failed",
        installer: "uv",
        environment: "project .venv",
        durationMs: 12,
        skipped: false,
      }};
    }}
    return {{
      package: name,
      success: true,
      message: "installed",
      installer: "uv",
      environment: "project .venv",
      durationMs: 42,
      skipped: false,
    }};
  }},
  executeCode: async (sessionId, code, blockId) => {{
    calls.push(["cell-call", sessionId, blockId, code]);
    return {{ ...fakeResult, blockId }};
  }},
  executeReactive: async (sessionId, blockId, blocks) => {{
    calls.push(["cell-call-reactive", sessionId, blockId, blocks.map((block) => block.id)]);
    return {{ results: [{{ ...fakeResult, blockId }}], executionOrder: [blockId] }};
  }},
  runAutomationCell: async (payload) => {{
    calls.push(["automation-cell", payload.blockId, payload.executionKind, payload.sessionId]);
    if (automationFixture === "cancelled") return cancelledBackendPayload;
    return {{
      sessionKey: "browser:orders",
      sessionId: "auto-session-1",
      kind: "browser",
      op: "open",
      action: "open",
      status: "success",
      opened: true,
      closed: false,
      state: {{ url: "about:blank", title: "stub" }},
      result: {{ status: "live" }},
    }};
  }},
}};
const stdlib = loadModule({stdlibPath}, (specifier) => {{
  if (specifier === "@/types") return {{}};
  return require(specifier);
}});
const inference = loadModule({inferencePath}, (specifier) => {{
  if (specifier === "@/types") return {{}};
  if (specifier === "@/lib/pythonStdlib") return stdlib;
  return require(specifier);
}});
function translate(key, values) {{
  const messages = {{
    "runtime.cellRunDone": "셀 실행 완료",
    "runtime.automationStarted": "자동화 시작",
    "runtime.automationStartedDetail": "자동화가 준비되어 다음 동작을 이어갈 수 있습니다.",
    "runtime.automationCompleted": "자동화 완료",
    "runtime.automationCompletedDetail": "요청한 동작을 마쳤습니다.",
    "runtime.automationCancelled": "자동화 중단",
    "runtime.automationCancelledDetail": "비상 정지 또는 취소 요청으로 자동화를 중단했습니다.",
    "runtime.automationCancelledReason": "자동화를 중단했습니다. 사유: {{reason}}",
    "runtime.automationTimedOut": "자동화 시간 초과",
    "runtime.automationTimedOutDetail": "제한 시간 안에 동작을 마치지 못했습니다.",
    "runtime.automationTimedOutReason": "제한 시간 안에 동작을 마치지 못했습니다. 사유: {{reason}}",
    "runtime.automationFailed": "자동화 실패",
    "runtime.automationFailedDetail": "오류를 확인하고 자동화를 다시 실행해 주세요.",
    "runtime.automationOutputUnavailable": "자동화 결과를 안전하게 표시할 수 없습니다. 다시 실행해 주세요.",
    "runtime.executionFailed": "실행 실패",
    "runtime.evaluatedCells": "{{count}}개 셀을 평가했습니다.",
    "runtime.libraryFailed": "라이브러리 준비 실패",
    "runtime.noOutput": "출력 없음",
    "runtime.notebookRunDone": "노트북 실행 완료",
    "runtime.notebookRunFailed": "노트북 실행 실패",
    "runtime.outputReady": "출력 준비됨",
    "runtime.packageInstallFailed": "{{package}} 설치에 실패했습니다.",
    "runtime.unavailable": "런타임 사용 불가",
    "runtime.uvPrepared": "{{packages}}를 uv로 준비한 뒤 실행했습니다. · {{detail}}",
  }};
  const template = messages[key] || key;
  return template.replace(/\\{{(\\w+)\\}}/g, (_, name) => String((values || {{}})[name] ?? ""));
}}
const cellModel = {{
  isExecutableBlock: (block) => block.type === "code" || block.type === "automation",
  isPersistentAutomationBlock: (block) => block.type === "automation" && ["browser", "os", "mouse"].includes(block.executionKind),
  isKernelExecutableBlock: (block) => (block.type === "code" || block.type === "automation") && !(block.type === "automation" && ["browser", "os", "mouse"].includes(block.executionKind)),
}};
const automationPresentation = loadModule({automationPresentationPath}, (specifier) => {{
  if (specifier === "@/types") return {{}};
  return require(specifier);
}});
const displayFormat = loadModule({displayFormatPath}, (specifier) => require(specifier));
const tracebackParser = loadModule({tracebackParserPath}, (specifier) => require(specifier));
const learningAttempt = loadModule({learningAttemptPath}, (specifier) => {{
  if (specifier === "@/lib/browserLearningCheckExecutor") {{
    return {{ executeBrowserStrongCheck: async () => {{ throw new Error("unexpected strong check"); }} }};
  }}
  if (specifier === "@/lib/displayFormat") return displayFormat;
  if (specifier === "@/lib/learningCheckSpec") return {{ parseStrongLearningCheckSpec: () => null }};
  if (specifier === "@/lib/localLearningCheckExecutor") {{
    return {{ executeLocalStrongCheck: async () => {{ throw new Error("unexpected strong check"); }} }};
  }}
  if (specifier === "@/types" || specifier === "@/lib/webLearningEvidence") return {{}};
  return require(specifier);
}});
const yaml = require(require.resolve("yaml", {{ paths: [{editorDir}] }}));
const day01 = yaml.parse(fs.readFileSync({day01CurriculumPath}, "utf8"));
const notebookExpression = day01.sections.find((section) => section.id === "notebook_expression");
assert.ok(notebookExpression, "day01 notebook_expression lesson exists");
const notebookExpressionAttempt = await learningAttempt.evaluateLearningAttempt(
  notebookExpression.check,
  {{
    ...fakeResult,
    type: "text",
    data: "'Hello Notebook'",
    stdout: "",
    status: "done",
  }},
  notebookExpression.exercise.starterCode,
  "local",
);
assert.equal(notebookExpressionAttempt.actual, "Hello Notebook");
assert.equal(notebookExpressionAttempt.expected, "Hello Notebook");
assert.equal(notebookExpressionAttempt.passed, true);
assert.equal(notebookExpressionAttempt.state, "verified");
assert.equal(
  learningAttempt.practiceActualOutput({{
    ...fakeResult,
    type: "text",
    data: "'data must not replace stdout'",
    stdout: "stdout wins\\n",
    status: "done",
  }}),
  "stdout wins",
);
const pyodideSyntaxError = [
  "PythonError: Traceback (most recent call last):",
  '  File "/lib/python314.zip/_pyodide/_base.py", line 597, in eval_code_async',
  "    await CodeRunner(",
  '  File "/lib/python314.zip/_pyodide/_base.py", line 411, in run_async',
  '  File "<exec>", line 3',
  "    print(",
  "         ^",
  "SyntaxError: '(' was never closed",
  "session-private-syntax 123e4567-e89b-42d3-a456-426614174000",
].join("\\n");
assert.equal(
  tracebackParser.learnerFacingErrorText(pyodideSyntaxError),
  "SyntaxError: '(' was never closed\\nline 3",
);
const pyodideNameError = [
  "Traceback (most recent call last):",
  '  File "/lib/python314.zip/_pyodide/_base.py", line 411, in run_async',
  '  File "/home/web/codaro/cells/py-private.py", line 2, in <module>',
  "NameError: name 'total' is not defined",
].join("\\n");
assert.equal(
  tracebackParser.learnerFacingErrorText(pyodideNameError),
  "NameError: name 'total' is not defined\\nline 2",
);
const missingFileError = tracebackParser.learnerFacingErrorText(
  "FileNotFoundError: [Errno 2] No such file or directory: '/home/web/codaro/runs/private.json' "
  + "session-private-file 123e4567-e89b-42d3-a456-426614174000",
);
assert.equal(missingFileError, "FileNotFoundError: [Errno 2] No such file or directory");
assert.doesNotMatch(
  tracebackParser.learnerFacingErrorText(pyodideSyntaxError),
  /_pyodide|python314[.]zip|[/]lib[/]|session-private|123e4567/,
);
assert.equal(
  tracebackParser.learnerFacingErrorText("라이브러리 준비 실패\\ninstall failed"),
  "라이브러리 준비 실패\\ninstall failed",
);
assert.equal(
  automationPresentation.sanitizeAutomationDetail(
    "완료 123e4567-e89b-42d3-a456-426614174000 session-private-7 browser:orders",
  ),
  "완료",
);
assert.equal(
  automationPresentation.sanitizeAutomationDetail(
    '실패 {{"sessionId":"private-1","action":"click","status":"failed","opened":false}}',
  ),
  "실패",
);
assert.equal(
  automationPresentation.sanitizeAutomationDetail(
    "https://example.test/orders?view=student&sessionId=secret&sessionKey=browser%3Aorders#overview /home/web/codaro/cells/py-private.py",
  ),
  "https://example.test/orders?view=student#overview",
);
for (const [status, expectedKind] of [
  ["cancelled", "cancelled"],
  ["canceled", "cancelled"],
  ["timeout", "timeout"],
  ["timed-out", "timeout"],
]) {{
  const presentation = automationPresentation.automationSessionPresentation({{
    ...cancelledBackendPayload,
    status,
    step: {{
      ...cancelledBackendPayload.step,
      status,
      error: status === "timeout" || status === "timed-out"
        ? "step timeout after 30 seconds session-private-cancelled browser:orders"
        : "Emergency stop is active: 사용자 요청 session-private-cancelled browser:orders",
    }},
  }});
  assert.equal(presentation.state, "failed");
  assert.equal(presentation.failureKind, expectedKind);
}}
const emptyStderrCancellation = automationPresentation.automationExecutionPresentation(
  {{ data: cancelledBackendPayload, status: "error", stderr: "" }},
  translate,
);
assert.equal(emptyStderrCancellation.hasError, true);
assert.equal(emptyStderrCancellation.copy.title, "자동화 중단");
assert.equal(emptyStderrCancellation.copy.detail, "자동화를 중단했습니다. 사유: 사용자 요청");
assert.doesNotMatch(
  emptyStderrCancellation.copy.title + emptyStderrCancellation.copy.detail,
  /session-private-cancelled|browser:orders|123e4567-e89b-42d3-a456-426614174000|sessionId|action|status/,
);
const malformedOutput = automationPresentation.automationExecutionPresentation(
  {{
    data: {{
      sessionId: "session-version-skew-private",
      kind: "browser",
      action: "navigate",
      status: "success",
      state: {{ title: "VERSION_SKEW_INTERNAL_STATE" }},
    }},
    status: "error",
    stderr: "",
  }},
  translate,
);
assert.equal(malformedOutput.valid, false);
assert.equal(malformedOutput.hasError, true);
assert.equal(malformedOutput.copy.title, "자동화 실패");
assert.equal(malformedOutput.copy.detail, "자동화 결과를 안전하게 표시할 수 없습니다. 다시 실행해 주세요.");
assert.doesNotMatch(
  malformedOutput.copy.title + malformedOutput.copy.detail,
  /session-version-skew-private|VERSION_SKEW_INTERNAL_STATE|sessionId|action|status/,
);
const unopenedSessionOutput = automationPresentation.automationExecutionPresentation(
  {{
    data: null,
    status: "error",
    stderr: "자동화 실패\\nAutomation session is not open: browser:orders session-private-unopened",
  }},
  translate,
);
assert.equal(unopenedSessionOutput.valid, false);
assert.equal(unopenedSessionOutput.presentation.failureKind, "failed");
assert.equal(unopenedSessionOutput.copy.title, "자동화 실패");
assert.equal(unopenedSessionOutput.copy.detail, "Automation session is not open");
assert.doesNotMatch(
  unopenedSessionOutput.copy.detail,
  /browser:orders|session-private-unopened|sessionId|sessionKey/,
);
const networkFailureOutput = automationPresentation.automationExecutionPresentation(
  {{
    data: null,
    status: "error",
    stderr: "자동화 실패\\nNetwork request failed /home/web/codaro/runs/private-run.json session-private-network",
  }},
  translate,
);
assert.equal(networkFailureOutput.valid, false);
assert.equal(networkFailureOutput.presentation.failureKind, "failed");
assert.equal(networkFailureOutput.copy.title, "자동화 실패");
assert.equal(networkFailureOutput.copy.detail, "Network request failed");
assert.doesNotMatch(
  networkFailureOutput.copy.detail,
  /[/]home[/]web[/]codaro[/]runs|private-run|session-private-network/,
);
const interruptedOutput = automationPresentation.automationExecutionPresentation(
  {{
    data: null,
    status: "error",
    stderr: "자동화 실패\\nEmergency stop is active: 사용자 요청 browser:orders session-private-interrupted",
  }},
  translate,
);
assert.equal(interruptedOutput.valid, false);
assert.equal(interruptedOutput.presentation.failureKind, "cancelled");
assert.equal(interruptedOutput.copy.title, "자동화 중단");
assert.equal(interruptedOutput.copy.detail, "자동화를 중단했습니다. 사유: 사용자 요청");
assert.doesNotMatch(
  interruptedOutput.copy.detail,
  /Emergency stop|browser:orders|session-private-interrupted|sessionId|sessionKey/,
);
const automationCellRuntime = loadModule({automationRuntimePath}, (specifier) => {{
  if (specifier === "@/lib/api") return {{ codaroApi: fakeApi }};
  if (specifier === "@/lib/automationPresentation") return automationPresentation;
  if (specifier === "@/lib/localeCopy") return {{ translate }};
  if (specifier === "@/types") return {{}};
  return require(specifier);
}});
const runtime = loadModule({runtimePath}, (specifier) => {{
  if (specifier === "@/lib/api") return {{ codaroApi: fakeApi }};
  if (specifier === "@/lib/automationCellRuntime") return automationCellRuntime;
  if (specifier === "@/lib/browserPythonRuntime") return {{
    executeBrowserBlock: async (blockId, code, executionCount) => ({{
      ...fakeResult,
      blockId,
      data: code,
      executionCount,
    }}),
    runBrowserNotebook: async () => ({{ results: {{}}, variables: [] }}),
  }};
  if (specifier === "@/lib/cellModel") return cellModel;
  if (specifier === "@/lib/localeCopy") return {{ translate }};
  if (specifier === "@/lib/localRuntime") return {{
    buildLocalExecutionResult: () => fakeResult,
    firstOutputLine: (result) => result.stdout.trim(),
  }};
  if (specifier === "@/lib/packageInference") return inference;
  if (specifier === "@/lib/reactiveDiagnostics") return {{
    emptyReactiveDiagnostics: {{
      cycles: [], multipleDefinitions: [], crossCellMutations: [], staleBlockIds: [], dependents: {{}},
    }},
  }};
  if (specifier === "@/types") return {{}};
  return require(specifier);
}});

assert.deepEqual(inference.inferCodePackages("import os\\nfrom PIL import Image\\nimport yaml\\nfrom sklearn.model_selection import train_test_split"), [
  "pillow",
  "pyyaml",
  "scikit-learn",
]);
assert.deepEqual(inference.inferCodePackages("import cv2\\nfrom docx import Document\\nfrom bs4 import BeautifulSoup\\nimport pydantic_settings"), [
  "beautifulsoup4",
  "opencv-python",
  "pydantic-settings",
  "python-docx",
]);
assert.deepEqual(inference.inferDocumentPackages({{
  runtime: {{ packages: ["opencv-contrib-python", "docx"] }},
  blocks: [{{ id: "cell-a", type: "code", content: "import cv2\\nfrom docx import Document" }}],
}}), [
  "opencv-contrib-python",
  "python-docx",
]);
assert.deepEqual(inference.declaredDocumentPackages({{
  runtime: {{ packages: ["io", "docx", "pandas", "sklearn", "PIL", "cv2", "yaml", "zipfile"] }},
  blocks: [{{ id: "cell-a", type: "code", content: "from sklearn.model_selection import train_test_split" }}],
}}), [
  "opencv-python",
  "pandas",
  "pillow",
  "python-docx",
  "pyyaml",
  "scikit-learn",
]);
assert.equal(inference.normalizePackageName("Pandas>=2"), "pandas");

const block = {{ id: "cell-1", type: "code", content: "" }};
const outcome = await runtime.runNotebookBlock({{
  apiOnline: true,
  block,
  code: "import pandas as pd\\nimport os\\nfrom sklearn.model_selection import train_test_split\\nprint('done')",
  localExecutionCount: 1,
  runtimePackages: ["numpy"],
  sessionId: null,
}});
assert.equal(outcome.sessionId, "session-1");
assert.equal(outcome.result.status, "ok");
assert.match(outcome.notice.detail, /pandas, scikit-learn를 uv로 준비한 뒤 실행했습니다/);
assert.deepEqual(calls.map((call) => call[0]), [
  "createSession",
  "packages-check",
  "packages-install",
  "packages-install",
  "cell-call",
]);
assert.deepEqual(calls.slice(2, 4).map((call) => call[2]), ["pandas", "scikit-learn"]);

calls.length = 0;
const automationBlock = {{
  id: "auto-1",
  type: "automation",
  executionKind: "browser",
  content: "{{\\"op\\": \\"open\\", \\"session\\": \\"orders\\"}}",
}};
const automationOutcome = await runtime.runNotebookBlock({{
  apiOnline: true,
  block: automationBlock,
  code: automationBlock.content,
  localExecutionCount: 2,
  runtimePackages: ["numpy"],
  sessionId: "session-1",
  automationSessionId: null,
}});
assert.equal(automationOutcome.sessionId, "session-1");
assert.equal(automationOutcome.automationSessionId, "auto-session-1");
assert.equal(automationOutcome.result.status, "done");
assert.equal(automationOutcome.notice.title, "자동화 시작");
assert.equal(automationOutcome.notice.detail, "stub\\nabout:blank");
assert.equal(automationOutcome.result.stdout, "자동화 시작\\nstub\\nabout:blank");
assert.equal(automationOutcome.result.stderr, "");
assert.equal(automationOutcome.result.data.sessionId, "auto-session-1");
assert.doesNotMatch(
  automationOutcome.result.stdout + automationOutcome.notice.title + automationOutcome.notice.detail,
  /auto-session-1|browser:orders|sessionId|sessionKey|opened|closed|action/,
);
assert.deepEqual(calls.map((call) => call[0]), ["automation-cell"]);

calls.length = 0;
automationFixture = "cancelled";
const cancelledAutomation = await runtime.runNotebookBlock({{
  apiOnline: true,
  block: automationBlock,
  code: automationBlock.content,
  localExecutionCount: 3,
  runtimePackages: ["numpy"],
  sessionId: "session-1",
  automationSessionId: "auto-session-1",
}});
assert.equal(cancelledAutomation.result.status, "error");
assert.equal(cancelledAutomation.notice.title, "자동화 중단");
assert.equal(cancelledAutomation.notice.detail, "자동화를 중단했습니다. 사유: 사용자 요청");
assert.equal(
  cancelledAutomation.result.stderr,
  "자동화 중단\\n자동화를 중단했습니다. 사유: 사용자 요청",
);
assert.equal(cancelledAutomation.result.stdout, "");
assert.equal(cancelledAutomation.result.data.status, "cancelled");
assert.doesNotMatch(
  cancelledAutomation.result.stderr + cancelledAutomation.notice.title + cancelledAutomation.notice.detail,
  /session-private-cancelled|browser:orders|123e4567-e89b-42d3-a456-426614174000|sessionId|sessionKey|opened|closed|action|status/,
);
assert.deepEqual(calls.map((call) => call[0]), ["automation-cell"]);

calls.length = 0;
const offlineAutomation = await runtime.runNotebookBlock({{
  apiOnline: false,
  block: automationBlock,
  code: automationBlock.content,
  localExecutionCount: 3,
  runtimePackages: ["numpy"],
  sessionId: "session-1",
  automationSessionId: "auto-session-1",
}});
assert.equal(offlineAutomation.result.status, "error");
assert.deepEqual(calls, []);

calls.length = 0;
installFails = true;
const failed = await runtime.runNotebookBlock({{
  apiOnline: true,
  block,
  code: "import pandas as pd\\nprint('done')",
  localExecutionCount: 1,
  runtimePackages: [],
  sessionId: "session-1",
}});
assert.equal(failed.result.status, "package-error");
assert.equal(failed.result.blockId, "cell-1");
assert.match(failed.result.stderr, /라이브러리 준비 실패\\ninstall failed/);
assert.equal(failed.notice.title, "라이브러리 준비 실패");
assert.deepEqual(calls.map((call) => call[0]), ["packages-check", "packages-install"]);

calls.length = 0;
installFails = false;
await runtime.runReactiveNotebook({{
  apiOnline: true,
  codeBlocks: [block, automationBlock],
  document: {{
    id: "doc-1",
    title: "Doc",
    runtime: {{ defaultEngine: "local", reactiveMode: "hybrid", packages: ["pandas"] }},
    blocks: [
      {{ ...block, content: "import pandas as pd\\nprint('done')" }},
      {{ ...automationBlock, content: "{{\\"op\\": \\"step\\", \\"session\\": \\"orders\\", \\"action\\": \\"click\\"}}" }},
    ],
  }},
  drafts: {{}},
  firstBlock: block,
  previousVariables: [],
  sessionId: "session-1",
}});
assert.deepEqual(calls.map((call) => call[0]), ["packages-check", "packages-install", "cell-call-reactive"]);
assert.deepEqual(calls.at(-1)[3], ["cell-1"]);

const graphLayout = loadModule({layoutPath}, (specifier) => require(specifier));
{{
  const linear = graphLayout.layoutDependencyGraph(["a", "b", "c"], {{ a: ["b"], b: ["c"] }}, [], (id) => id);
  const byId = Object.fromEntries(linear.nodes.map((node) => [node.blockId, node]));
  assert.ok(byId.a.x < byId.b.x && byId.b.x < byId.c.x, "linear chain layers left-to-right");
  assert.equal(linear.edges.filter((edge) => edge.isBackEdge).length, 0);
  const cyclic = graphLayout.layoutDependencyGraph(["a", "b"], {{ a: ["b"], b: ["a"] }}, [["a", "b"]], (id) => id);
  assert.equal(cyclic.edges.length, 2);
  assert.ok(cyclic.edges.every((edge) => edge.isBackEdge), "intra-cycle edges are back-edges");
  assert.ok(cyclic.nodes.every((node) => node.inCycle), "cycle nodes flagged inCycle");
}}

process.stdout.write(JSON.stringify({{
  directRun: outcome.notice.detail,
  automationRun: automationOutcome.notice.detail,
  automationCancelled: cancelledAutomation.notice.detail,
  failure: failed.notice.title,
  reactiveOrder: calls.map((call) => call[0]),
}}, null, 2));
}})().catch((error) => {{
  console.error(error);
  process.exit(1);
}});
"""


if __name__ == "__main__":
    raise SystemExit(main())
