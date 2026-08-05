from __future__ import annotations

import json
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[2]
EDITOR = ROOT / "editor"
CONTRACT = ROOT / "contracts/checkSandboxFeasibilityDecision.json"
GENERATED = EDITOR / "src/lib/generatedContracts/checkSandboxFeasibilityDecision.json"
POLICY = EDITOR / "src/lib/checkSandboxPolicy.ts"
BROWSER_EXECUTOR = EDITOR / "src/lib/browserLearningCheckExecutor.ts"
LOCAL_EXECUTOR = EDITOR / "src/lib/localLearningCheckExecutor.ts"
LEARNING_ATTEMPT = EDITOR / "src/lib/learningAttemptCheck.ts"


def test_generated_sandbox_decision_matches_source() -> None:
    assert GENERATED.read_bytes() == CONTRACT.read_bytes()
    assert json.loads(CONTRACT.read_text(encoding="utf-8"))["enforcementState"] == "enforced"
    assert "LOCAL_CHECK_TRANSPORT_GRACE_MS = 80_000" in LOCAL_EXECUTOR.read_text(encoding="utf-8")


def test_runtime_policy_requires_native_isolation_before_local_strong_evidence() -> None:
    script = f"""
(async () => {{
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const path = require("node:path");
  const esbuild = require(require.resolve("esbuild", {{ paths: [{json.dumps(str(EDITOR))}] }}));
  global.window = {{ clearTimeout, setTimeout }};

  function load(filePath, customRequire) {{
    const transformed = esbuild.transformSync(fs.readFileSync(filePath, "utf8"), {{
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

  const decision = JSON.parse(fs.readFileSync({json.dumps(str(CONTRACT))}, "utf8"));
  const policy = load({json.dumps(str(POLICY))}, (specifier) => {{
    if (specifier === "@/lib/generatedContracts/checkSandboxFeasibilityDecision.json") return decision;
    if (specifier === "@/lib/learningOutputMatch") return {{
      matchLearningOutput: (expected, actual) => ({{
        feedback: expected === actual ? "목표한 출력과 일치합니다." : "출력이 다릅니다.",
        passed: expected === actual,
        tier: "exact",
      }}),
      normalizeLearningOutput: (value) => value,
    }};
    if (specifier === "@/lib/learningCheckSpec") return {{}};
    return require(specifier);
  }});
  assert.equal(policy.resolveCheckSandboxCapability("web", "output"), "strong");
  assert.equal(policy.resolveCheckSandboxCapability("web", "variable"), "strong");
  assert.equal(policy.resolveCheckSandboxCapability("web", "behavior"), "localRequired");
  assert.equal(policy.resolveCheckSandboxCapability("local", "output"), "strong");

  const behaviorSpec = {{
    executor: "browser-worker",
    fixture: {{ directories: [], env: {{}}, files: [], stdin: [] }},
    fixtureHash: "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    fixtureId: "policy-fixture",
    id: "policy-behavior",
    kind: "behavior",
    packageAssets: [],
    payload: {{
      cases: [{{ arguments: [{{ value: 1 }}], expectedReturn: 1, id: "case-1" }}],
      entry: "solve",
      expectedPaths: [],
      normalizeReturnPaths: [],
    }},
    strength: "strong",
    timeoutMs: 1000,
    version: 1,
  }};
  let browserBootCalls = 0;
  const browserExecutor = load({json.dumps(str(BROWSER_EXECUTOR))}, (specifier) => {{
    if (specifier === "@/lib/browserPythonRuntime") return {{
      getBrowserPythonRuntimeInfo: async () => {{
        browserBootCalls += 1;
        throw new Error("browser runtime must not boot");
      }},
    }};
    if (specifier === "@/lib/checkSandboxPolicy") return policy;
    if (specifier === "@/lib/learningOutputMatch") return {{
      matchLearningOutput: (expected, actual) => ({{
        feedback: expected === actual ? "목표한 출력과 일치합니다." : "출력이 다릅니다.",
        passed: expected === actual,
        tier: "exact",
      }}),
      normalizeLearningOutput: (value) => value,
    }};
    if (specifier === "@/lib/learningCheckSpec") return {{
      normalizeLearningOutput: (value) => value,
      verifyLearningFixtureHash: async () => true,
    }};
    if (specifier === "@/lib/webLearningEvidence") return {{}};
    return require(specifier);
  }});
  const blocked = await browserExecutor.executeBrowserStrongCheck(behaviorSpec, "def solve(value): return value");
  assert.equal(blocked.state, "unsupported");
  assert.equal(blocked.passed, false);
  assert.match(blocked.detail, /Local/);
  assert.equal(browserBootCalls, 0);

  let localCalls = 0;
  let localIsolation = "python-audit-hook";
  let localWindowsBuild = null;
  const localExecutor = load({json.dumps(str(LOCAL_EXECUTOR))}, (specifier) => {{
    if (specifier === "@/lib/api") return {{
      CodaroApiError: class CodaroApiError extends Error {{}},
      codaroApi: {{
        localStrongCheck: async () => {{
          localCalls += 1;
          return {{
            actual: "ok",
            detail: "provisional pass",
            executor: "local-sandbox",
            expected: "ok",
            isolation: localIsolation,
            passed: true,
            state: "verified",
            windowsBuild: localWindowsBuild,
          }};
        }},
      }},
    }};
    if (specifier === "@/lib/checkSandboxPolicy") return policy;
    if (specifier === "@/lib/learningOutputMatch") return {{
      matchLearningOutput: (expected, actual) => ({{
        feedback: expected === actual ? "목표한 출력과 일치합니다." : "출력이 다릅니다.",
        passed: expected === actual,
        tier: "exact",
      }}),
      normalizeLearningOutput: (value) => value,
    }};
    if (specifier === "@/lib/learningCheckSpec") return {{}};
    return require(specifier);
  }});
  const provisional = await localExecutor.executeLocalStrongCheck({{ ...behaviorSpec, kind: "output" }}, "print('ok')");
  assert.equal(provisional.passed, true);
  assert.equal(provisional.strongEligible, false);
  assert.match(provisional.detail, /강한 학습 증거/);
  assert.equal(localCalls, 1);

  localIsolation = "windows-appcontainer";
  localWindowsBuild = 19045;
  const native = await localExecutor.executeLocalStrongCheck({{ ...behaviorSpec, kind: "output" }}, "print('ok')");
  assert.equal(native.passed, true);
  assert.equal(native.strongEligible, true);
  assert.equal(native.detail, "provisional pass");
  assert.equal(localCalls, 2);

  localWindowsBuild = 19044;
  const unsupportedBuild = await localExecutor.executeLocalStrongCheck(
    {{ ...behaviorSpec, kind: "output" }},
    "print('ok')",
  );
  assert.equal(unsupportedBuild.passed, true);
  assert.equal(unsupportedBuild.strongEligible, false);
  assert.match(unsupportedBuild.detail, /강한 학습 증거/);
  assert.equal(localCalls, 3);
  localWindowsBuild = 19045;

  let localAttemptResult = provisional;
  const attempt = load({json.dumps(str(LEARNING_ATTEMPT))}, (specifier) => {{
    if (specifier === "@/lib/browserLearningCheckExecutor") return {{
      executeBrowserStrongCheck: async () => {{ throw new Error("unexpected browser executor"); }},
    }};
    if (specifier === "@/lib/displayFormat") return {{ stringifyData: String }};
    if (specifier === "@/lib/learningOutputMatch") return {{
      matchLearningOutput: (expected, actual) => ({{
        feedback: expected === actual ? "목표한 출력과 일치합니다." : "출력이 다릅니다.",
        passed: expected === actual,
        tier: "exact",
      }}),
      normalizeLearningOutput: (value) => value,
    }};
    if (specifier === "@/lib/learningCheckSpec") return {{ parseStrongLearningCheckSpec: () => behaviorSpec }};
    if (specifier === "@/lib/localLearningCheckExecutor") return {{
      executeLocalStrongCheck: async () => localAttemptResult,
    }};
    if (specifier === "@/types" || specifier === "@/lib/webLearningEvidence") return {{}};
    return require(specifier);
  }});
  const checked = await attempt.evaluateLearningAttempt(
    {{}},
    {{ data: "", status: "ok", stdout: "", type: "text" }},
    "print('ok')",
    "local",
  );
  assert.equal(checked.passed, true);
  assert.equal(checked.evidence, "practice");
  assert.match(checked.feedback, /강한 학습 증거/);

  localAttemptResult = native;
  const nativeChecked = await attempt.evaluateLearningAttempt(
    {{}},
    {{ data: "", status: "ok", stdout: "", type: "text" }},
    "print('ok')",
    "local",
  );
  assert.equal(nativeChecked.passed, true);
  assert.equal(nativeChecked.evidence, "strong");
  assert.equal(nativeChecked.feedback, "목표대로 동작했습니다.");
}})().catch((error) => {{
  console.error(error);
  process.exit(1);
}});
"""
    completed = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
        check=False,
    )
    assert completed.returncode == 0, completed.stderr or completed.stdout
