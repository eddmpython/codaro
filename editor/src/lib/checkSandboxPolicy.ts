import decision from "@/lib/generatedContracts/checkSandboxFeasibilityDecision.json";
import type { StrongLearningCheckSpecV1 } from "@/lib/learningCheckSpec";

export type CheckSandboxCapability = "localRequired" | "provisional" | "strong";

type CheckKind = StrongLearningCheckSpecV1["kind"];
type RuntimeTier = "local" | "web";

export function resolveCheckSandboxCapability(
  runtimeTier: RuntimeTier,
  checkKind: CheckKind,
): CheckSandboxCapability {
  if (decision.enforcementState !== "enforced") return "provisional";
  if (runtimeTier === "local") {
    return decision.localWindows.provisionalExecutorMayGrantStrongCredit
      ? "strong"
      : "provisional";
  }
  if (decision.browser.strongKinds.includes(checkKind)) return "strong";
  if (decision.browser.localRequiredKinds.includes(checkKind)) return "localRequired";
  return "provisional";
}

export function checkSandboxCapabilityMessage(capability: CheckSandboxCapability): string {
  if (capability === "localRequired") {
    return "이 검증은 OS 격리가 필요한 동작 검사라서 Local에서 실행해야 합니다.";
  }
  if (capability === "provisional") {
    return "동작은 확인했지만 OS 격리 검증기가 준비되지 않아 강한 학습 증거로 저장하지 않았습니다.";
  }
  return "";
}
