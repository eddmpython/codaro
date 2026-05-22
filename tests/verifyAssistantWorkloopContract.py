from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EDITOR_DIR = ROOT / "editor"
WORK_LOOP = EDITOR_DIR / "src" / "lib" / "workLoop.ts"
ASSISTANT_PANEL = EDITOR_DIR / "src" / "components" / "assistant" / "assistantPanel.tsx"


def main() -> int:
    failures = sourceContractFailures()
    nodeFailure, nodeOutput = runWorkLoopRuntimeProbe()
    if nodeFailure:
        failures.append(nodeFailure)

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        if nodeOutput:
            print(nodeOutput, file=sys.stderr)
        return 1

    print(f"ok: assistant workloop contract verified {nodeOutput}")
    return 0


def sourceContractFailures() -> list[str]:
    failures: list[str] = []
    for path in (WORK_LOOP, ASSISTANT_PANEL):
        if not path.is_file():
            failures.append(f"missing {path.relative_to(ROOT)}")

    if failures:
        return failures

    workLoopText = WORK_LOOP.read_text(encoding="utf-8")
    panelText = ASSISTANT_PANEL.read_text(encoding="utf-8")
    required = {
        WORK_LOOP: (
            "traceWorkloopDetail",
            "toolResultDetail",
            "clarification-gate",
            "turn-error",
            "workLabelFromToolCall",
            "packages-check",
            "packages-install",
            "cell-call",
            "durationMs",
            "skipped",
            "sectionCount",
            "exerciseCellCount",
        ),
        ASSISTANT_PANEL: (
            "AssistantTraceDetails",
            "TraceWorkloopRow",
            "traceWorkloopRowDetail",
            "raw trace",
            "event {eventCount} · tool {toolCount} · error {errorCount} · policy {policyCount}",
        ),
    }
    for path, tokens in required.items():
        text = workLoopText if path == WORK_LOOP else panelText
        for token in tokens:
            if token not in text:
                failures.append(f"{path.relative_to(ROOT)} missing {token}")
    return failures


def runWorkLoopRuntimeProbe() -> tuple[str | None, str]:
    node = shutil.which("node")
    if not node:
        return "node is required for assistant workloop verification", ""

    script = nodeProbeScript()
    result = subprocess.run(
        [node, "-e", script],
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
        return "assistant workloop runtime probe failed", output
    return None, output


def nodeProbeScript() -> str:
    workLoopPath = json.dumps(str(WORK_LOOP), ensure_ascii=False)
    editorDir = json.dumps(str(EDITOR_DIR), ensure_ascii=False)
    return f"""
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require(require.resolve("esbuild", {{ paths: [{editorDir}] }}));
const workLoopPath = {workLoopPath};
const source = fs.readFileSync(workLoopPath, "utf8");
const transformed = esbuild.transformSync(source, {{
  loader: "ts",
  format: "cjs",
  platform: "node",
  target: "es2022",
}});
const moduleObject = {{ exports: {{}} }};
function customRequire(specifier) {{
  if (specifier === "@/lib/localeCopy") return {{ getActiveLocale: () => "ko" }};
  return require(specifier);
}}
new Function("exports", "require", "module", "__filename", "__dirname", transformed.code)(
  moduleObject.exports,
  customRequire,
  moduleObject,
  workLoopPath,
  path.dirname(workLoopPath),
);
const {{
  finishAssistantWorkLoop,
  normalizeAssistantTrace,
}} = moduleObject.exports;

function response(trace, toolCalls = []) {{
  return {{
    answer: "",
    provider: "fake",
    model: "test",
    toolCalls,
    trace,
  }};
}}

function finish(trace, toolCalls = []) {{
  return finishAssistantWorkLoop({{ steps: undefined, response: response(trace, toolCalls) }});
}}

function findStep(result, label) {{
  const step = (result.steps || []).find((item) => item.label === label);
  assert.ok(step, `missing step ${{label}} in ${{JSON.stringify(result.steps)}}`);
  return step;
}}

const clarification = finish({{
  traceId: "trace-clarification",
  eventCount: 2,
  toolCount: 0,
  workloop: [{{
    eventIndex: 1,
    elapsedMs: 12,
    eventType: "clarification-gate",
    workLabel: "작업 전 확인 질문",
    workDetail: "핵심 질문 3개 · 작업 기준: 초급 / 실습 중심 / 현재 Codaro 로컬 Python과 uv 패키지 설치",
    category: "learning",
    lane: "safety",
    target: "clarification-gate",
  }}],
}});
const clarificationStep = findStep(clarification, "작업 전 확인 질문");
assert.equal(clarificationStep.status, "done");
assert.match(clarificationStep.detail, /작업 기준/);
assert.equal(clarificationStep.category, "learning");
assert.equal(clarificationStep.lane, "safety");
assert.equal(clarificationStep.target, "clarification-gate");

const providerError = finish({{
  traceId: "trace-provider-error",
  eventCount: 2,
  toolCount: 0,
  errorCount: 1,
  workloop: [{{
    eventIndex: 1,
    elapsedMs: 18,
    eventType: "turn-error",
    workLabel: "provider 오류",
    workDetail: "provider 응답 처리 중단",
    error: "provider broken",
    status: "error",
    category: "provider",
    lane: "safety",
    target: "provider-loop",
  }}],
}});
const providerErrorStep = findStep(providerError, "provider 오류");
assert.equal(providerErrorStep.status, "error");
assert.match(providerErrorStep.detail, /provider 응답 처리 중단/);
assert.match(providerErrorStep.detail, /provider broken/);
assert.equal(providerErrorStep.error, "provider broken");

const toolRun = finish({{
  traceId: "trace-tools",
  toolSequence: ["packages-check", "packages-install", "cell-call"],
  policyViolationCount: 0,
}}, [
  {{
    toolCallId: "call-check",
    name: "packages-check",
    arguments: {{ names: ["pandas"] }},
    result: {{ missing: ["pandas"] }},
    status: "done",
    category: "files",
    lane: "read",
  }},
  {{
    toolCallId: "call-install",
    name: "packages-install",
    arguments: {{ name: "pandas" }},
    workDetail: "pandas를 uv로 설치",
    result: {{ success: true, package: "pandas", installer: "uv", environment: "project .venv", durationMs: 42 }},
    status: "done",
    category: "files",
    lane: "write",
  }},
  {{
    toolCallId: "call-cell",
    name: "cell-call",
    arguments: {{ blockId: "cell-1", operation: "check" }},
    result: {{ passed: true, status: "ok" }},
    status: "done",
    category: "runtime",
    lane: "cell-call",
  }},
]);
const packageCheck = findStep(toolRun, "라이브러리 확인");
const packageInstall = findStep(toolRun, "uv 라이브러리 설치");
const cellCall = findStep(toolRun, "셀 실행/검증");
assert.match(packageCheck.detail, /pandas 누락 확인/);
assert.match(packageInstall.detail, /pandas 설치 완료/);
assert.match(packageInstall.detail, /uv/);
assert.match(packageInstall.detail, /project \\.venv/);
assert.match(packageInstall.detail, /42ms/);
assert.match(cellCall.detail, /cell-1 검증 통과/);
assert.deepEqual((toolRun.trace || {{}}).toolSequence, ["packages-check", "packages-install", "cell-call"]);

const curriculumRun = finish({{
  traceId: "trace-curriculum",
  toolSequence: ["write-curriculum-yaml"],
}}, [
  {{
    toolCallId: "call-yaml",
    name: "write-curriculum-yaml",
    arguments: {{ yamlContent: "meta:\\n  title: pandas 기초" }},
    workDetail: "구조화된 YAML을 섹션 카드와 실행 셀로 변환",
    result: {{
      title: "pandas 기초",
      sectionCount: 2,
      exerciseCellCount: 2,
      runtimePackageCount: 1,
      loadedInEditor: true,
    }},
    status: "done",
    category: "learning",
    lane: "curriculum",
  }},
]);
const curriculumStep = findStep(curriculumRun, "커리큘럼 YAML 전개");
assert.match(curriculumStep.detail, /pandas 기초/);
assert.match(curriculumStep.detail, /섹션 카드 2개/);
assert.match(curriculumStep.detail, /실습 셀 2개/);
assert.match(curriculumStep.detail, /실행 패키지 1개/);
assert.match(curriculumStep.detail, /에디터 반영/);
assert.doesNotMatch(curriculumStep.detail, /구조화된 YAML을 섹션 카드와 실행 셀로 변환/);

const curriculumGapRun = finish({{
  traceId: "trace-curriculum-gap",
  toolSequence: ["write-curriculum-yaml"],
}}, [
  {{
    toolCallId: "call-yaml-gap",
    name: "write-curriculum-yaml",
    arguments: {{ yamlContent: "meta:\\n  title: pandas 기초" }},
    result: {{
      title: "pandas 기초",
      sectionCount: 1,
      exerciseCellCount: 1,
      contractGapCount: 2,
      loadedInEditor: true,
    }},
    status: "done",
    category: "learning",
    lane: "curriculum",
  }},
]);
const curriculumGapStep = findStep(curriculumGapRun, "커리큘럼 YAML 전개");
assert.match(curriculumGapStep.detail, /계약 gap 2개/);

const skippedInstall = finish({{
  traceId: "trace-skip-install",
}}, [
  {{
    toolCallId: "call-skip-install",
    name: "packages-install",
    arguments: {{ name: "pandas" }},
    result: {{ success: true, package: "pandas", installer: "uv", environment: "project .venv", skipped: true }},
    status: "done",
    category: "files",
    lane: "write",
  }},
]);
const skippedStep = findStep(skippedInstall, "uv 라이브러리 설치");
assert.match(skippedStep.detail, /pandas 이미 준비됨/);
assert.match(skippedStep.detail, /project \\.venv/);

const policy = finish({{
  traceId: "trace-policy",
  policyViolationCount: 1,
  policyViolations: [{{
    policyCode: "dependency-preflight-required",
    toolName: "cell-call",
    message: "packages-check가 필요합니다.",
  }}],
}});
const policyStep = findStep(policy, "도구 정책 확인");
assert.equal(policyStep.status, "error");
assert.match(policyStep.detail, /dependency-preflight-required/);
assert.match(policyStep.detail, /packages-check가 필요합니다/);

const normalized = normalizeAssistantTrace({{
  traceId: "trace-normalize",
  toolSequence: ["read-cells", 42, "cell-call"],
  workloop: [
    {{ eventIndex: 1, eventType: "turn-error", workLabel: "provider 오류", error: "broken" }},
    "bad",
  ],
  events: [
    {{ eventIndex: 0, eventType: "turn-start", payload: {{ prompt: "x" }} }},
    1,
  ],
}});
assert.deepEqual(normalized.toolSequence, ["read-cells", "cell-call"]);
assert.equal(normalized.workloop.length, 1);
assert.equal(normalized.events.length, 1);

process.stdout.write(JSON.stringify({{
  clarification: clarificationStep.detail,
  providerError: providerErrorStep.detail,
  tools: [packageCheck.label, packageInstall.label, cellCall.label, curriculumStep.label],
  policy: policyStep.detail,
}}, null, 2));
"""


if __name__ == "__main__":
    raise SystemExit(main())
