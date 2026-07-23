from __future__ import annotations

import ast
from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import time
from typing import Any

import yaml

from learningLedgerAudit import currentGitHead


ROOT = Path(__file__).resolve().parents[2]
CURRICULA_DIR = ROOT / "curricula" / "python"
REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-quality-matrix" / "assessment-authoring-quality-report.json"
MODES = (
    ("mastery", "masteryVariants"),
    ("transfer", "transferVariants"),
    ("retrieval", "retrievalVariants"),
)


def main() -> int:
    startedAt = timestamp()
    started = time.monotonic()
    failures: list[dict[str, str]] = []
    fingerprints: dict[str, str] = {}
    checkIds: dict[str, str] = {}
    lessonCount = 0
    variantCount = 0
    reviewedLessonCount = 0
    explicitClaimScopeLessonCount = 0
    for path in sorted(CURRICULA_DIR.rglob("*.yaml")):
        if path.name == "schema.yaml":
            continue
        content = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        assessment = content.get("assessment") if isinstance(content.get("assessment"), dict) else {}
        if not assessment:
            continue
        lessonCount += 1
        rel = path.relative_to(CURRICULA_DIR).as_posix()
        for section in content.get("sections", []):
            if (
                isinstance(section, dict)
                and section.get("assessmentMode") == "mastery"
                and section.get("unseen") is not True
            ):
                failures.append(failure(
                    rel,
                    "mastery",
                    "visible mastery section must use a genuinely unseen task",
                    text(section.get("id")),
                ))
        authoring = assessment.get("authoring") if isinstance(assessment.get("authoring"), dict) else {}
        if authoring.get("independentReview") == "approved":
            reviewedLessonCount += 1
        lessonHasClaimScope = True
        modePrompts: dict[str, set[str]] = {}
        modeSolutions: dict[str, set[str]] = {}
        for mode, key in MODES:
            variants = assessment.get(key)
            if not isinstance(variants, list) or not variants:
                if mode == "mastery" and hasSectionMastery(content):
                    continue
                failures.append(failure(rel, mode, "missing authored assessment variant"))
                continue
            modePrompts[mode] = set()
            modeSolutions[mode] = set()
            for variant in variants:
                if not isinstance(variant, dict):
                    failures.append(failure(rel, mode, "variant must be a mapping"))
                    continue
                variantCount += 1
                variantId = text(variant.get("id"))
                exercise = variant.get("exercise") if isinstance(variant.get("exercise"), dict) else {}
                check = variant.get("check") if isinstance(variant.get("check"), dict) else {}
                prompt = text(exercise.get("prompt")).strip()
                starter = text(exercise.get("starterCode")).strip()
                solution = text(exercise.get("solution")).strip()
                if not text(variant.get("claimScope")):
                    lessonHasClaimScope = False
                if not variantId or not prompt or not starter or not solution:
                    failures.append(failure(rel, mode, "id, prompt, starter, and solution are required", variantId))
                    continue
                if starter == solution or solution in starter:
                    failures.append(failure(rel, mode, "starter exposes the authored solution", variantId))
                if prompt in modePrompts[mode] or solution in modeSolutions[mode]:
                    failures.append(failure(rel, mode, "same-mode prompt or solution is duplicated", variantId))
                modePrompts[mode].add(prompt)
                modeSolutions[mode].add(solution)
                _checkBehaviorCases(rel, mode, variantId, check, failures)
                checkId = text(check.get("id"))
                if not checkId:
                    failures.append(failure(rel, mode, "check id is missing", variantId))
                elif checkId in checkIds:
                    failures.append(failure(rel, mode, f"check id duplicates {checkIds[checkId]}", variantId))
                else:
                    checkIds[checkId] = f"{rel}:{variantId}"
                fingerprint = taskFingerprint(prompt, solution, check)
                if fingerprint in fingerprints:
                    failures.append(failure(rel, mode, f"authored task duplicates {fingerprints[fingerprint]}", variantId))
                else:
                    fingerprints[fingerprint] = f"{rel}:{variantId}"
                try:
                    ast.parse(solution, filename=rel, mode="exec")
                except SyntaxError as exc:
                    failures.append(failure(rel, mode, f"solution syntax error: {exc.msg}", variantId))
                if variant.get("unseen") is not True:
                    failures.append(failure(rel, mode, "assessment variant must use a genuinely unseen task", variantId))
                if mode == "retrieval" and intValue(variant.get("minimumDelayHours")) < 7 * 24:
                    failures.append(failure(rel, mode, "retrieval delay must be at least 7 days", variantId))
        if lessonHasClaimScope:
            explicitClaimScopeLessonCount += 1
        promptSets = [modePrompts.get(mode, set()) for mode, _ in MODES]
        solutionSets = [modeSolutions.get(mode, set()) for mode, _ in MODES]
        if all(promptSets) and set.intersection(*promptSets):
            failures.append(failure(rel, "progression", "mastery, transfer, and retrieval reuse the same prompt"))
        if all(solutionSets) and set.intersection(*solutionSets):
            failures.append(failure(rel, "progression", "mastery, transfer, and retrieval reuse the same solution"))
        transferIds = {
            text(variant.get("id"))
            for variant in assessment.get("transferVariants", [])
            if isinstance(variant, dict) and text(variant.get("id"))
        }
        for variant in assessment.get("retrievalVariants", []):
            if not isinstance(variant, dict):
                continue
            if set(variant.get("sourceSectionIds") or []) != transferIds:
                failures.append(failure(
                    rel,
                    "retrieval",
                    "retrieval must be scheduled from the accepted transfer variant",
                    text(variant.get("id")),
                ))

    payload = {
        "gate": "assessment-authoring-quality",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "completionEligible": not failures and reviewedLessonCount == lessonCount,
        "startedAt": startedAt,
        "completedAt": timestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "lessonCount": lessonCount,
        "variantCount": variantCount,
        "uniqueCheckIdCount": len(checkIds),
        "uniqueTaskFingerprintCount": len(fingerprints),
        "explicitClaimScopeLessonCount": explicitClaimScopeLessonCount,
        "independentReviewApprovedLessonCount": reviewedLessonCount,
        "independentReviewPendingLessonCount": lessonCount - reviewedLessonCount,
        "summary": {
            "independentReviewApprovedLessonCount": reviewedLessonCount,
            "independentReviewPendingLessonCount": lessonCount - reviewedLessonCount,
        },
        "failureCount": len(failures),
        "failures": failures[:100],
        "reportPath": displayPath(REPORT_PATH),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: assessment authoring quality violations found")
        return 1
    print(f"ok: {variantCount} authored variants are unique and non-revealing; independent review remains separate")
    return 0


def _checkBehaviorCases(
    rel: str,
    mode: str,
    variantId: str,
    check: dict[str, Any],
    failures: list[dict[str, str]],
) -> None:
    if check.get("kind") != "behavior":
        return
    payload = check.get("payload") if isinstance(check.get("payload"), dict) else {}
    cases = payload.get("cases") if isinstance(payload.get("cases"), list) else []
    if not cases:
        failures.append(failure(rel, mode, "behavior check needs hidden cases", variantId))
        return
    caseIds: set[str] = set()
    assertionCount = 0
    for case in cases:
        if not isinstance(case, dict):
            failures.append(failure(rel, mode, "behavior case must be a mapping", variantId))
            continue
        caseId = text(case.get("id"))
        if not caseId or caseId in caseIds:
            failures.append(failure(rel, mode, "behavior case ids must be unique and non-empty", variantId))
        caseIds.add(caseId)
        hasReturn = "expectedReturn" in case
        hasException = bool(text(case.get("expectedException")))
        if hasReturn == hasException:
            failures.append(failure(rel, mode, f"case {caseId} needs exactly one expected result", variantId))
        elif hasException:
            assertionCount += 1
        else:
            assertionCount += leafAssertionCount(case.get("expectedReturn"))
    expectedPaths = payload.get("expectedPaths") if isinstance(payload.get("expectedPaths"), list) else []
    assertionCount += len(expectedPaths)
    if len(cases) < 2 and assertionCount < 3:
        failures.append(
            failure(rel, mode, "behavior check needs two cases or at least three hidden result assertions", variantId)
        )


def hasSectionMastery(content: dict[str, Any]) -> bool:
    sections = content.get("sections") if isinstance(content.get("sections"), list) else []
    for section in sections:
        if not isinstance(section, dict) or section.get("assessmentMode") != "mastery":
            continue
        check = section.get("check") if isinstance(section.get("check"), dict) else {}
        if check.get("strength") == "strong" and check.get("version") == 1:
            return True
    return False


def leafAssertionCount(value: Any) -> int:
    if isinstance(value, dict):
        return sum(leafAssertionCount(item) for item in value.values())
    if isinstance(value, list):
        return sum(leafAssertionCount(item) for item in value)
    return 1


def taskFingerprint(prompt: str, solution: str, check: dict[str, Any]) -> str:
    payload = check.get("payload") if isinstance(check.get("payload"), dict) else {}
    value = {
        "prompt": prompt,
        "solutionAst": ast.dump(ast.parse(solution, mode="exec"), include_attributes=False),
        "cases": payload.get("cases"),
    }
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def failure(path: str, mode: str, detail: str, variantId: str = "") -> dict[str, str]:
    return {"path": path, "mode": mode, "variantId": variantId, "detail": detail}


def intValue(value: Any) -> int:
    return int(value) if isinstance(value, int) and not isinstance(value, bool) else 0


def text(value: Any) -> str:
    return "" if value is None else str(value)


def timestamp() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def displayPath(path: Path) -> str:
    return str(path.relative_to(ROOT))


if __name__ == "__main__":
    raise SystemExit(main())
