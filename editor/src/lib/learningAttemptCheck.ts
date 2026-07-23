import type { ExecutionResult } from "@/types";
import { executeBrowserStrongCheck } from "@/lib/browserLearningCheckExecutor";
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
  const actual = normalizeOutput(result.stdout);
  const expected = normalizeOutput(textValue(checkConfig?.outputExact));
  const deterministic = isDeterministicPracticeCheckConfig(checkConfig);
  const strongSpec = parseStrongLearningCheckSpec(checkConfig);

  if (!new Set(["success", "ok", "done"]).has(status)) {
    return {
      actual,
      checkId: strongSpec?.id ?? "",
      evidence: "none",
      executor: strongSpec ? (runtimeTier === "local" ? "local-sandbox" : "browser-worker") : "none",
      expected,
      feedback: "실행 오류를 먼저 고치세요. 다시 실행하면 검증도 자동으로 이어집니다.",
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
      feedback: runtimeTier === "local" && checked.passed
        ? `${checked.detail} Local 증거 저장소에 자동 기록합니다.`
        : checked.detail,
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
      feedback: "실행 결과는 확인했지만 이 실습의 자동 완료 기준은 아직 준비 중이라 진행 완료로 기록하지 않았습니다.",
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
    feedback: "출력이 목표와 정확히 일치해 이번 연습 기록에 자동 반영했습니다.",
    fixtureHash: "",
    passed: true,
    source,
    state: "verified",
  };
}

export function isDeterministicPracticeCheckConfig(checkConfig: Record<string, unknown> | undefined): boolean {
  return checkConfig?.type === "outputExact" && typeof checkConfig.outputExact === "string";
}

function normalizeOutput(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

function displayOutput(value: string): string {
  return value ? `“${value.replace(/\n/g, " ↵ ")}”` : "빈 출력";
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}
