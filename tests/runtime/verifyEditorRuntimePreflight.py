from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EDITOR_DIR = ROOT / "editor"
NOTEBOOK_RUNTIME = EDITOR_DIR / "src" / "lib" / "notebookRuntime.ts"
AUTOMATION_CELL_RUNTIME = EDITOR_DIR / "src" / "lib" / "automationCellRuntime.ts"
LOCAL_RUNTIME = EDITOR_DIR / "src" / "lib" / "localRuntime.ts"
PACKAGE_INFERENCE = EDITOR_DIR / "src" / "lib" / "packageInference.ts"
PYTHON_STDLIB = EDITOR_DIR / "src" / "lib" / "pythonStdlib.ts"
LOCALE_COPY = EDITOR_DIR / "src" / "lib" / "localeCopy.ts"
DEP_GRAPH_LAYOUT = EDITOR_DIR / "src" / "lib" / "dependencyGraphLayout.ts"


def main() -> int:
    failures = sourceContractFailures()
    nodeFailure, nodeOutput = runRuntimeProbe()
    if nodeFailure:
        failures.append(nodeFailure)

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        if nodeOutput:
            print(nodeOutput, file=sys.stderr)
        return 1

    print(f"ok: editor runtime package preflight verified {nodeOutput}")
    return 0


def sourceContractFailures() -> list[str]:
    failures: list[str] = []
    for path in (NOTEBOOK_RUNTIME, AUTOMATION_CELL_RUNTIME, LOCAL_RUNTIME, PACKAGE_INFERENCE, PYTHON_STDLIB, LOCALE_COPY):
        if not path.is_file():
            failures.append(f"missing {path.relative_to(ROOT)}")

    if failures:
        return failures

    runtimeText = NOTEBOOK_RUNTIME.read_text(encoding="utf-8")
    automationCellText = AUTOMATION_CELL_RUNTIME.read_text(encoding="utf-8")
    localRuntimeText = LOCAL_RUNTIME.read_text(encoding="utf-8")
    inferenceText = PACKAGE_INFERENCE.read_text(encoding="utf-8")
    stdlibText = PYTHON_STDLIB.read_text(encoding="utf-8")
    localeText = LOCALE_COPY.read_text(encoding="utf-8")
    required = {
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
        AUTOMATION_CELL_RUNTIME: (
            "runAutomationCell",
            "runtime.automationCellDone",
            "runtime.automationCellFailed",
            "AutomationSessionCellPayload",
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
    }
    sourceByPath = {
        NOTEBOOK_RUNTIME: runtimeText,
        AUTOMATION_CELL_RUNTIME: automationCellText,
        LOCAL_RUNTIME: localRuntimeText,
        PACKAGE_INFERENCE: inferenceText,
        PYTHON_STDLIB: stdlibText,
        LOCALE_COPY: localeText,
    }
    for path, tokens in required.items():
        text = sourceByPath[path]
        for token in tokens:
            if token not in text:
                failures.append(f"{path.relative_to(ROOT)} missing {token}")
    return failures


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
    "runtime.automationCellDone": "자동화 셀 실행 완료",
    "runtime.automationCellFailed": "자동화 셀 실패",
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
const automationCellRuntime = loadModule({automationRuntimePath}, (specifier) => {{
  if (specifier === "@/lib/api") return {{ codaroApi: fakeApi }};
  if (specifier === "@/lib/localeCopy") return {{ translate }};
  if (specifier === "@/types") return {{}};
  return require(specifier);
}});
const runtime = loadModule({runtimePath}, (specifier) => {{
  if (specifier === "@/lib/api") return {{ codaroApi: fakeApi }};
  if (specifier === "@/lib/automationCellRuntime") return automationCellRuntime;
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
assert.match(automationOutcome.notice.title, /자동화 셀 실행 완료/);
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
