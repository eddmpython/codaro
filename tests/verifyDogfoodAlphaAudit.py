from __future__ import annotations

from datetime import UTC, datetime
import json
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
import time
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MINIMUM_SCORE = 9
DOGFOOD_ALPHA_REPORT_PATH = ROOT / "output" / "test-runner" / "dogfood-alpha-audit" / "dogfood-alpha-report.json"


@dataclass(frozen=True)
class DogfoodRequirement:
    requirementId: str
    requirement: str
    evidenceChecks: tuple[tuple[str, tuple[str, ...]], ...]
    forbiddenChecks: tuple[tuple[str, tuple[str, ...]], ...] = field(default_factory=tuple)

    def evaluate(self) -> dict[str, Any]:
        evidence: list[str] = []
        missing: list[str] = []
        for relPath, needles in self.evidenceChecks:
            found, absent = fileNeedleReport(relPath, needles)
            evidence.extend(found)
            missing.extend(absent)
        for relPath, needles in self.forbiddenChecks:
            absent, present = fileForbiddenNeedleReport(relPath, needles)
            evidence.extend(absent)
            missing.extend(present)
        return {
            "id": self.requirementId,
            "passed": not missing,
            "requirement": self.requirement,
            "evidence": evidence,
            "missing": missing,
        }


DOGFOOD_REQUIREMENTS = (
    DogfoodRequirement(
        requirementId="first-user-flow-is-versioned",
        requirement="The first-user provider to goal-discovery to learning to recovery flow is a versioned product contract.",
        evidenceChecks=(
            ("docs/skills/ops/product/dogfood-alpha.md", (
                "첫 실행",
                "Provider 설정",
                "질문",
                "clarification",
                "추천·조합 우선",
                "resolve-learning-goal",
                "search-curricula",
                "compose-master-plan",
                "YAML 생성",
                "실제 gap일 때만",
                "학습카드 렌더링",
                "실습 셀 입력",
                "셀 실행",
                "피드백",
                "실패 복구",
            )),
            ("tests/verifyDogfoodAlphaAudit.py", (
                "DOGFOOD_REQUIREMENTS",
                "first-user-flow-is-versioned",
                "learning-goal-discovery-before-authoring",
                "learning-card-completion-path",
                "product-quality-judgement-gates",
            )),
            ("editor/src/lib/chatStartExamples.ts", (
                "CHAT_START_EXAMPLE_DEFINITIONS",
                "chat.example.pandas.prompt",
                "chat.example.browser.prompt",
                "chat.example.automation.prompt",
                "curriculumGoalExamples",
                "curriculum.goal.example.pandas.prompt",
                "surface: \"curriculum\"",
                "surface: \"automation\"",
                "flowRole: surfaceFlowRole(example.surface)",
            )),
            ("editor/src/components/chat/chatSurface.tsx", (
                "data-chat-start-example=\"true\"",
                "data-chat-start-surface={example.surface}",
                "data-chat-start-flow-role={example.flowRole}",
                "data-chat-start-second-loop={example.flowRole === \"secondLoop\" ? \"true\" : undefined}",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="learning-goal-discovery-before-authoring",
        requirement="A clear learning request recommends or composes existing curricula before authoring new YAML.",
        evidenceChecks=(
            ("docs/skills/architecture/teacher-tool-loop.md", (
                "추천·조합 우선 (goal-discovery)",
                "`resolve-learning-goal`",
                "`search-curricula`",
                "`compose-master-plan`",
                "기존 레슨이 목표를 덮지 못하는 갭일 때만 `write-curriculum-yaml`",
            )),
            ("src/codaro/ai/conversation.py", (
                "Once the learning goal is clear, do not jump straight to authoring a new lesson",
                "call resolve-learning-goal to map the goal to domains",
                "search-curricula to find lessons that already cover it",
                "compose-master-plan to assemble an ordered learning path",
                "Only call write-curriculum-yaml to author a new lesson when no existing lesson covers the goal",
                "If existing lessons cover the goal, recommend the composed path instead of authoring a duplicate lesson",
            )),
            ("src/codaro/ai/teacher/skillRegistry.py", (
                "skillId=\"goal-discovery\"",
                "requiredTools=(\"resolve-learning-goal\", \"search-curricula\", \"compose-master-plan\")",
                "갭일 때만 write-curriculum-yaml",
            )),
            ("src/codaro/ai/teacher/intakePolicy.py", (
                "FIRST recommend or combine what already exists",
                "call resolve-learning-goal",
                "search-curricula",
                "compose-master-plan",
                "Only call write-curriculum-yaml",
            )),
            ("editor/src/lib/assistantContext.ts", (
                "For learning requests, first call resolve-learning-goal",
                "then search-curricula",
                "then compose-master-plan",
                "Only call write-curriculum-yaml when compose-master-plan shows a real gap",
                "compose-master-plan이 기존 레슨으로 덮지 못하는 실제 gap",
            )),
            ("tests/testTeacherArchitecture.py", (
                "testTeacherSkillRegistryLocksGoalDiscoveryBeforeYamlAuthoring",
                "resolve-learning-goal",
                "search-curricula",
                "compose-master-plan",
                "authoring a duplicate lesson",
            )),
            ("tests/testIntakePolicy.py", (
                "testActionDirectiveSteersTowardRecommendThenCompose",
                "resolve-learning-goal",
                "search-curricula",
                "compose-master-plan",
                "Only call write-curriculum-yaml",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="provider-oauth-recovery-boundary",
        requirement="Provider connection and OAuth failures are separated into user-readable recovery actions.",
        evidenceChecks=(
            ("docs/skills/architecture/live-provider-ops.md", (
                "token 없음",
                "state mismatch",
                "OAuth consent 거부",
                "network timeout/connection",
                "OAuth provider compatibility",
                "check-permission",
                "configure-api-key",
                "configure-base-url",
            )),
            ("src/codaro/ai/providerErrors.py", (
                "provider_permission_denied",
                "check-permission",
                "Provider 권한이 허용되지 않았습니다",
            )),
            ("tests/verifyProviderSettingsPlaywright.py", (
                "permission_denied",
                "권한 문제",
                "check-permission",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="provider-not-ready-fallback-before-live-call",
        requirement="When the API is online but the provider is not ready, chat uses local fallback and opens provider setup before making a live provider call.",
        evidenceChecks=(
            ("docs/skills/ops/product/dogfood-alpha.md", (
                "연결 전에는 fallback 안내만 보며 연결 후에는 실제 provider 응답",
            )),
            ("editor/src/hooks/useAssistantTurnState.ts", (
                "const providerReady = providerProfileReady(profile)",
                "if (!apiOnline || !providerReady)",
                "buildAssistantLocalTurnApplication",
                "providerConnectionRequiredNotice()",
                "openProviderConnectionPromptOnce",
                "shouldOpenProviderConnectionPrompt",
                "shouldResetProviderConnectionPrompt",
                "onProviderConnectionRequired?.()",
                "runAssistantProviderTurn",
            )),
            ("editor/src/lib/providerConnection.ts", (
                "export function providerConnectionRequiredNotice",
                "export function shouldOpenProviderConnectionPrompt",
                "export function shouldResetProviderConnectionPrompt",
                "translate(\"provider.connectionRequired.title\")",
                "translate(\"assistant.providerLoginRequired\")",
            )),
            ("tests/testFrontendBoundary.py", (
                "testAssistantTurnUsesLocalFallbackBeforeProviderWhenProfileIsNotReady",
                "providerFallbackIndex < providerCallIndex",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="chat-scope-splits-learning-from-automation-authoring",
        requirement="Chat keeps learning-about-automation requests in current learning and routes validated recipe/task requests into automation authoring.",
        evidenceChecks=(
            ("editor/src/lib/teacherScope.ts", (
                "function hasLearningIntent(value: string): boolean",
                "function hasAutomationAuthoringIntent(value: string): boolean",
                "if (hasLearningIntent(normalized)) return \"curriculum\"",
                "if (hasAutomationAuthoringIntent(normalized)) return \"automation\"",
                "dry-?run",
            )),
            ("tests/testFrontendBoundary.py", (
                "testTeacherScopeSeparatesAutomationLearningFromAutomationAuthoring",
                "hasLearningIntent(normalized)",
                "hasAutomationAuthoringIntent(normalized)",
            )),
            ("editor/src/lib/assistantContext.ts", (
                "Do not turn automation authoring requests into curriculum YAML",
                "자동화 작성 요청을 커리큘럼 YAML로 바꾸지 않는다",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="live-provider-smoke-path",
        requirement="The opt-in live provider gate covers real answer, teacher answer, clarification, goal-discovery, gap-only YAML tool loop, and cell-call loop.",
        evidenceChecks=(
            ("tests/verifyAiLiveSmoke.py", (
                "live credential missing",
                "runShortAnswerCase",
                "runTeacherAnswerCase",
                "runClarificationGateCase",
                "runToolLoopCase",
                "runCellCallLoopCase",
                "resolve-learning-goal",
                "search-curricula",
                "compose-master-plan",
                "composeGapCount",
                "goalDiscoveryComplete",
                "write-curriculum-yaml",
                "packages-check",
                "cell-call",
                "toolLoopTuningSignals",
            )),
            ("docs/skills/architecture/live-provider-ops.md", (
                "실제 provider 응답",
                "모호한 학습 요청이 provider 호출 전에",
                "resolve-learning-goal → search-curricula → compose-master-plan",
                "gap을 보고할 때만 `packages-check → write-curriculum-yaml`",
                "write-curriculum-yaml",
                "packages-check → cell-call",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="learning-card-completion-path",
        requirement="Structured lessons render one section card with snippet copy, direct exercise editor, result, and check.",
        evidenceChecks=(
            ("docs/skills/architecture/learning-yaml-contract.md", (
                "title → subtitle → goal → why → explanation → tips → snippet → exercise → result → check",
                "우측 상단 복사 버튼",
                "바로 보이는 실제 입력 editor",
                "data-learning-exercise-input-role=\"student-practice\"",
                "data-learning-section-card",
            )),
            ("docs/skills/architecture/frontend-product-surface.md", (
                "실제 입력 에디터를 바로 보여준다",
                "예제 스니펫",
                "해당 셀 안의 도움 요청 팝오버",
                "브랜드 아바타",
                "레슨마다 다른 실무 흐름",
            )),
            ("tests/verifyLearningSectionCardContract.py", (
                "data-learning-exercise-input-role",
                "data-code-payload-copy",
                "data-cell-ai-popover",
                "Codaro avatar",
            )),
        ),
        forbiddenChecks=(
            ("docs/skills/architecture/frontend-product-surface.md", (
                "클릭해서 직접 입력하세요",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="workloop-trace-progress-path",
        requirement="Workloop and trace expose readable progress for the full cycle without raw JSON as the default view.",
        evidenceChecks=(
            ("docs/skills/architecture/teacher-tool-loop.md", (
                "raw JSON",
                "clarification-gate",
                "tool-policy-violation",
                "turn-error",
                "사용자용 `trace.workloop` row",
            )),
            ("editor/src/lib/workLoop.ts", (
                "traceWorkloopDetail",
                "toolResultDetail",
                "packages-check",
                "packages-install",
                "cell-call",
                "clarification-gate",
                "turn-error",
            )),
            ("tests/verifyAssistantWorkloopContract.py", (
                "작업 전 확인 질문",
                "provider 응답 처리 중단",
                "packages-check",
                "packages-install",
                "cell-call",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="runtime-failure-recovery-path",
        requirement="Runtime, package, provider, OAuth, and cell execution failures have separated recovery surfaces.",
        evidenceChecks=(
            ("docs/skills/architecture/execution-engine.md", (
                "packages-check → packages-install → cell-call",
                "editor-runtime-preflight",
            )),
            ("docs/skills/architecture/live-provider-ops.md", (
                "다시 로그인",
                "네트워크 문제",
                "권한 문제",
                "API 키 입력",
                "Base URL 입력",
            )),
            ("tests/verifyEditorRuntimePreflight.py", (
                "packages-check",
                "packages-install",
                "cell-call",
                "uv",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="automation-second-loop-provider-e2e",
        requirement="Automation is verified as a second loop that reads cells, writes a dry-run recipe, checks packages, validates a cell, then registers a task.",
        evidenceChecks=(
            ("docs/skills/architecture/automation-authoring-loop.md", (
                "read-cells",
                "write-automation-recipe",
                "packages-check",
                "cell-call",
                "create-automation-task",
                "DRY_RUN = True",
            )),
            ("src/codaro/ai/teacher/evalHarness.py", (
                "automation-authoring-second-loop",
                "read-cells",
                "write-automation-recipe",
                "packages-check",
                "cell-call",
                "create-automation-task",
                "forbiddenTools=(\"write-curriculum-yaml\",)",
            )),
            ("tests/verifyTeacherGoldenE2e.py", (
                "runAutomationAuthoringCase",
                "AutomationAuthoringExecutor",
                "automation authoring leaked into curriculum YAML",
                "provider did not receive successful cell-call result before task registration",
                "task registration did not preserve dry-run recipe validation",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="product-quality-judgement-gates",
        requirement="Product quality judgement is blocked on named gates plus the first-user audit.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"dogfood-alpha-audit\"",
                "\"product-quality-audit\"",
                "\"quality-cycle\"",
                "PRODUCT_QUALITY_GATES",
                "tests/verifyDogfoodAlphaAudit.py",
                "tests/verifyProductQualityAudit.py",
                "\"backend\"",
                "\"diagnostic-summary-contract\"",
                "\"provider-settings-browser\"",
                "\"ai-live-smoke\"",
                "\"install-launcher-smoke\"",
                "\"runtime-recovery-contract\"",
                "\"runtime-recovery-browser\"",
                "\"curriculum-quality-matrix\"",
                "\"onboarding-browser\"",
                "\"frontend-performance-budget\"",
                "\"assistant-workloop-contract\"",
                "\"learning-card-browser\"",
                "\"docs\"",
                "\"landing-build\"",
                "\"launcher-test\"",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`dogfood-alpha-audit`",
                "`product-quality-audit`",
                "`quality-cycle`",
                "사용자 플로우 audit",
                "provider 연결",
                "질문",
                "clarification",
                "YAML 생성",
                "학습카드 렌더링",
                "실습 셀 입력",
                "셀 실행",
                "피드백",
                "실패 복구",
                "제품이 잘 만들어졌는지 보는 반복 검증 단위",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="dogfood-ops-ssot",
        requirement="The dogfood alpha standard lives in docs/skills product operations and the SSOT map points to it.",
        evidenceChecks=(
            ("docs/skills/ops/product/dogfood-alpha.md", (
                "dogfood alpha",
                "잘 만들어진 제품 품질 판단",
                "증거 기반",
                "docs/skills",
                "main",
                "논리 단위 커밋",
                "푸시",
            )),
            ("docs/skills/ops/README.md", (
                "dogfood-alpha",
                "local alpha",
            )),
            ("docs/skills/README.md", (
                "dogfood-alpha",
            )),
            ("docs/skills/architecture/ssot-map.md", (
                "dogfood alpha",
                "docs/skills/ops/product/dogfood-alpha.md",
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="goal-completion-is-evidence-based",
        requirement="The goal cannot be marked complete without audit payloads that expose score and failures.",
        evidenceChecks=(
            ("tests/verifyDogfoodAlphaAudit.py", (
                "MINIMUM_SCORE = 9",
                "requiredScore",
                "requirementFailures",
                "dogfood alpha audit score",
            )),
            ("docs/skills/ops/product/dogfood-alpha.md", (
                "목표 완료 선언",
                "gate 결과",
                "credential",
                "브라우저 gate",
            )),
        ),
    ),
)


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    results = tuple(requirement.evaluate() for requirement in DOGFOOD_REQUIREMENTS)
    payload = buildAuditPayload(results)
    payload.update({
        "gate": "dogfood-alpha-audit",
        "status": "passed" if payload["passed"] else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": reportDisplayPath(DOGFOOD_ALPHA_REPORT_PATH),
        "summary": dogfoodAuditSummary(results),
    })
    writeDogfoodAlphaReport(payload)

    if not payload["passed"]:
        print("FAIL: dogfood alpha audit score is below threshold or explicit requirements failed", file=sys.stderr)
        print(json.dumps(payload, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1

    print(f"ok: dogfood alpha audit score {payload['score']}/{payload['maxScore']}")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


def buildAuditPayload(results: tuple[dict[str, Any], ...]) -> dict[str, Any]:
    score = sum(1 for result in results if result["passed"])
    requirementFailures = [result["id"] for result in results if not result["passed"]]
    payload = {
        "score": score,
        "maxScore": len(results),
        "minimumScore": MINIMUM_SCORE,
        "requiredScore": len(results),
        "requirementFailures": requirementFailures,
        "passed": score >= MINIMUM_SCORE and not requirementFailures,
        "requirements": list(results),
    }
    return payload


def dogfoodAuditSummary(results: tuple[dict[str, Any], ...]) -> dict[str, Any]:
    passedIds = [str(result["id"]) for result in results if result["passed"]]
    failedIds = [str(result["id"]) for result in results if not result["passed"]]
    return {
        "allRequirementsPassed": not failedIds,
        "passedRequirementCount": len(passedIds),
        "failedRequirementCount": len(failedIds),
        "passedRequirementIds": passedIds,
        "failedRequirementIds": failedIds,
        "firstUserFlowCovered": "first-user-flow-is-versioned" in passedIds,
        "goalDiscoveryCovered": "learning-goal-discovery-before-authoring" in passedIds,
        "providerRecoveryCovered": "provider-oauth-recovery-boundary" in passedIds,
        "learningCompletionCovered": "learning-card-completion-path" in passedIds,
        "workloopTraceCovered": "workloop-trace-progress-path" in passedIds,
        "runtimeRecoveryCovered": "runtime-failure-recovery-path" in passedIds,
        "automationSecondLoopCovered": "automation-second-loop-provider-e2e" in passedIds,
    }


def writeDogfoodAlphaReport(payload: dict[str, Any]) -> Path:
    DOGFOOD_ALPHA_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    DOGFOOD_ALPHA_REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return DOGFOOD_ALPHA_REPORT_PATH


def reportDisplayPath(reportPath: Path) -> str:
    try:
        return str(reportPath.relative_to(ROOT))
    except ValueError:
        return str(reportPath)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def fileNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    evidence: list[str] = []
    missing: list[str] = []
    for needle in needles:
        if needle in text:
            evidence.append(f"{relPath}: {needle}")
        else:
            missing.append(f"{relPath}: missing {needle}")
    return evidence, missing


def fileForbiddenNeedleReport(relPath: str, needles: tuple[str, ...]) -> tuple[list[str], list[str]]:
    path = ROOT / relPath
    if not path.is_file():
        return [], [f"{relPath}: missing file"]
    text = path.read_text(encoding="utf-8")
    evidence: list[str] = []
    failures: list[str] = []
    for needle in needles:
        if needle in text:
            failures.append(f"{relPath}: forbidden {needle}")
        else:
            evidence.append(f"{relPath}: absent forbidden {needle}")
    return evidence, failures


if __name__ == "__main__":
    raise SystemExit(main())
