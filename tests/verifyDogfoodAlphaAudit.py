from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MINIMUM_SCORE = 9


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
        requirement="The first-user provider to learning to recovery flow is a versioned product contract.",
        evidenceChecks=(
            ("docs/skills/ops/product/dogfood-alpha.md", (
                "첫 실행",
                "Provider 설정",
                "질문",
                "clarification",
                "YAML 생성",
                "학습카드 렌더링",
                "실습 셀 입력",
                "셀 실행",
                "피드백",
                "실패 복구",
            )),
            ("tests/verifyDogfoodAlphaAudit.py", (
                "DOGFOOD_REQUIREMENTS",
                "first-user-flow-is-versioned",
                "learning-card-completion-path",
                "service-judgement-gates",
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
        requirementId="live-provider-smoke-path",
        requirement="The opt-in live provider gate covers real answer, teacher answer, clarification, YAML tool loop, and cell-call loop.",
        evidenceChecks=(
            ("tests/verifyAiLiveSmoke.py", (
                "live credential missing",
                "runShortAnswerCase",
                "runTeacherAnswerCase",
                "runClarificationGateCase",
                "runToolLoopCase",
                "runCellCallLoopCase",
                "write-curriculum-yaml",
                "packages-check",
                "cell-call",
                "toolLoopTuningSignals",
            )),
            ("docs/skills/architecture/live-provider-ops.md", (
                "실제 provider 응답",
                "모호한 학습 요청이 provider 호출 전에",
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
                "학습 아키텍처 캔버스",
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
        requirementId="service-judgement-gates",
        requirement="Service readiness is blocked on named gates plus the first-user audit.",
        evidenceChecks=(
            ("tests/run.py", (
                "\"dogfood-alpha-audit\"",
                "tests/verifyDogfoodAlphaAudit.py",
                "\"backend\"",
                "\"editor-build\"",
                "\"provider-settings-browser\"",
                "\"ai-live-smoke\"",
                "\"learning-card-contract\"",
                "\"learning-card-browser\"",
                "\"assistant-workloop-contract\"",
                "\"docs\"",
                "\"landing-build\"",
            )),
            ("docs/skills/ops/foundation/testing-and-gates.md", (
                "`dogfood-alpha-audit`",
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
            )),
        ),
    ),
    DogfoodRequirement(
        requirementId="dogfood-ops-ssot",
        requirement="The dogfood alpha standard lives in docs/skills product operations and the SSOT map points to it.",
        evidenceChecks=(
            ("docs/skills/ops/product/dogfood-alpha.md", (
                "dogfood alpha",
                "서비스 출시 판단",
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
    results = tuple(requirement.evaluate() for requirement in DOGFOOD_REQUIREMENTS)
    payload = buildAuditPayload(results)

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
