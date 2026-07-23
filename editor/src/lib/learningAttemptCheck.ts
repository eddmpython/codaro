import type { ExecutionResult } from "@/types";
import { executeBrowserStrongCheck } from "@/lib/browserLearningCheckExecutor";
import { stringifyData } from "@/lib/displayFormat";
import { parseStrongLearningCheckSpec } from "@/lib/learningCheckSpec";
import { executeLocalStrongCheck } from "@/lib/localLearningCheckExecutor";
import type { LearningEvidenceArtifact, LearningEvidencePackageAsset } from "@/lib/webLearningEvidence";

export type LearningAttemptCheck = {
  actual: string;
  artifacts?: LearningEvidenceArtifact[];
  checkId: string;
  evidence: "none" | "practice" | "strong";
  executor: "browser-worker" | "local-sandbox" | "practice" | "none";
  expected: string;
  feedback: string;
  fixtureHash: string;
  packages?: LearningEvidencePackageAsset[];
  passed: boolean;
  source: string;
  state: "error" | "mismatch" | "unsupported" | "verified";
};

export async function evaluateLearningAttempt(
  checkConfig: Record<string, unknown> | undefined,
  result: ExecutionResult,
  source: string,
  runtimeTier: "local" | "web",
): Promise<LearningAttemptCheck> {
  const status = result.status.toLowerCase();
  const expected = normalizeOutput(textValue(checkConfig?.outputExact));
  const deterministic = isDeterministicPracticeCheckConfig(checkConfig);
  const actual = deterministic
    ? practiceActualOutput(result)
    : normalizeOutput(result.stdout);
  const strongSpec = parseStrongLearningCheckSpec(checkConfig);

  if (!new Set(["success", "ok", "done"]).has(status)) {
    return {
      actual,
      checkId: strongSpec?.id ?? "",
      evidence: "none",
      executor: strongSpec ? (runtimeTier === "local" ? "local-sandbox" : "browser-worker") : "none",
      expected,
      feedback: "오류 메시지를 확인하고 코드를 고친 뒤 다시 실행해 보세요.",
      fixtureHash: strongSpec?.fixtureHash ?? "",
      passed: false,
      source,
      state: "error",
    };
  }
  if (strongSpec) {
    const checked = runtimeTier === "local"
      ? await executeLocalStrongCheck(strongSpec, source)
      : await executeBrowserStrongCheck(strongSpec, source);
    return {
      actual: checked.actual,
      artifacts: checked.artifacts,
      checkId: strongSpec.id,
      evidence: checked.passed ? "strong" : "none",
      executor: checked.executor,
      expected: checked.expected,
      feedback: learnerFeedback(checked.state, checked.detail),
      fixtureHash: strongSpec.fixtureHash,
      packages: strongSpec.packageAssets.map((asset) => ({
        ...asset,
        schemaVersion: 1,
      })),
      passed: checked.passed,
      source,
      state: checked.state,
    };
  }
  if (!deterministic) {
    return {
      actual,
      checkId: "",
      evidence: "none",
      executor: "none",
      expected: "",
      feedback: "이 연습은 자동 확인을 지원하지 않습니다. 출력과 목표를 직접 비교해 보세요.",
      fixtureHash: "",
      passed: false,
      source,
      state: "unsupported",
    };
  }
  if (actual !== expected) {
    return {
      actual,
      checkId: "",
      evidence: "none",
      executor: "practice",
      expected,
      feedback: `기대 출력은 ${displayOutput(expected)}이고, 현재 출력은 ${displayOutput(actual)}입니다.`,
      fixtureHash: "",
      passed: false,
      source,
      state: "mismatch",
    };
  }
  return {
    actual,
    checkId: "",
    evidence: "practice",
    executor: "practice",
    expected,
    feedback: "목표한 출력과 일치합니다.",
    fixtureHash: "",
    passed: true,
    source,
    state: "verified",
  };
}

export function isDeterministicPracticeCheckConfig(checkConfig: Record<string, unknown> | undefined): boolean {
  return checkConfig?.type === "outputExact" && typeof checkConfig.outputExact === "string";
}

export function practiceActualOutput(result: ExecutionResult): string {
  const stdout = normalizeOutput(result.stdout);
  if (stdout) return stdout;

  const displayValue = stringifyData(result.data);
  const value = result.type === "text" && typeof result.data === "string"
    ? decodePythonStringRepr(displayValue)
    : displayValue;
  return normalizeOutput(value);
}

function normalizeOutput(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

function decodePythonStringRepr(value: string): string {
  const trimmed = value.trim();
  const quote = trimmed.at(0);
  if ((quote !== "'" && quote !== "\"") || trimmed.at(-1) !== quote) return value;

  const body = trimmed.slice(1, -1);
  let decoded = "";
  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];
    if (character !== "\\" || index === body.length - 1) {
      decoded += character;
      continue;
    }

    const escaped = body[index + 1];
    const simpleEscape = {
      "\\": "\\",
      "'": "'",
      "\"": "\"",
      a: "\x07",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
      v: "\v",
    }[escaped];
    if (simpleEscape !== undefined) {
      decoded += simpleEscape;
      index += 1;
      continue;
    }

    const width = escaped === "x" ? 2 : escaped === "u" ? 4 : escaped === "U" ? 8 : 0;
    const hex = width ? body.slice(index + 2, index + 2 + width) : "";
    if (width && hex.length === width && /^[0-9a-f]+$/i.test(hex)) {
      const codePoint = Number.parseInt(hex, 16);
      if (codePoint <= 0x10ffff) {
        decoded += String.fromCodePoint(codePoint);
        index += width + 1;
        continue;
      }
    }

    decoded += `\\${escaped}`;
    index += 1;
  }
  return decoded;
}

function displayOutput(value: string): string {
  return value ? `“${value.replace(/\n/g, " ↵ ")}”` : "빈 출력";
}

function learnerFeedback(
  state: "error" | "mismatch" | "unsupported" | "verified",
  detail: string,
): string {
  if (state === "verified") return "목표대로 동작했습니다.";
  if (state === "mismatch") return detail;
  if (state === "unsupported") {
    return "이 브라우저에서는 자동 확인을 사용할 수 없습니다. 출력과 목표를 직접 비교해 보세요.";
  }
  return "자동 확인을 마치지 못했습니다. 잠시 뒤 셀을 다시 실행해 주세요.";
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}
