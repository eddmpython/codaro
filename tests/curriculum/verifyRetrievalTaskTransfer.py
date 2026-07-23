from __future__ import annotations

import json
import sys
import time
from typing import Any

from learningLedgerAudit import (
    ROOT,
    curriculumPayloads,
    currentGitHead,
    isStrongCheckSpec,
    utcTimestamp,
    validAssessmentVariants,
    writeReport,
)


REPORT_PATH = ROOT / "output/test-runner/learning-content/retrieval-task-transfer-report.json"


def masteryTasks(payload: dict[str, Any]) -> list[dict[str, Any]]:
    sections = payload.get("sections") if isinstance(payload.get("sections"), list) else []
    sectionTasks = [
        section
        for section in sections
        if isinstance(section, dict)
        and section.get("assessmentMode") == "mastery"
        and isinstance(section.get("check"), dict)
        and isStrongCheckSpec(section["check"])
    ]
    return sectionTasks + validAssessmentVariants(payload, "mastery")


def taskSignature(task: dict[str, Any]) -> str:
    exercise = task.get("exercise") if isinstance(task.get("exercise"), dict) else {}
    check = task.get("check") if isinstance(task.get("check"), dict) else {}
    payload = check.get("payload") if isinstance(check.get("payload"), dict) else {}
    signature = {
        "prompt": str(exercise.get("prompt") or "").strip(),
        "starterCode": str(exercise.get("starterCode") or "").strip(),
        "payload": payload,
    }
    return json.dumps(signature, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def promptStarter(task: dict[str, Any]) -> tuple[str, str]:
    exercise = task.get("exercise") if isinstance(task.get("exercise"), dict) else {}
    return (
        str(exercise.get("prompt") or "").strip(),
        str(exercise.get("starterCode") or "").strip(),
    )


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    payloads = curriculumPayloads()
    assessedLessons = 0
    distinctLessons = 0
    for lessonRef, payload in sorted(payloads.items()):
        assessment = payload.get("assessment") if isinstance(payload.get("assessment"), dict) else {}
        if not assessment:
            continue
        assessedLessons += 1
        modes = {
            "mastery": masteryTasks(payload),
            "transfer": validAssessmentVariants(payload, "transfer"),
            "retrieval": validAssessmentVariants(payload, "retrieval"),
        }
        if any(not tasks for tasks in modes.values()):
            failures.append(f"{lessonRef}: assessment progression is incomplete")
            continue
        signatures = {mode: {taskSignature(task) for task in tasks} for mode, tasks in modes.items()}
        promptStarters = {mode: {promptStarter(task) for task in tasks} for mode, tasks in modes.items()}
        overlap = (
            signatures["mastery"] & signatures["transfer"]
            or signatures["mastery"] & signatures["retrieval"]
            or signatures["transfer"] & signatures["retrieval"]
        )
        promptOverlap = (
            promptStarters["mastery"] & promptStarters["transfer"]
            or promptStarters["mastery"] & promptStarters["retrieval"]
            or promptStarters["transfer"] & promptStarters["retrieval"]
        )
        if overlap or promptOverlap:
            failures.append(f"{lessonRef}: mastery, transfer, and retrieval reuse the same task")
            continue
        distinctLessons += 1

    passed = not failures and assessedLessons == 467 and distinctLessons == assessedLessons
    payload: dict[str, Any] = {
        "gate": "retrieval-task-transfer",
        "passed": passed,
        "status": "passed" if passed else "failed",
        "completionEligible": passed,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "sourceLessonCount": len(payloads),
            "assessedLessonCount": assessedLessons,
            "distinctProgressionLessonCount": distinctLessons,
            "minimumRetrievalDelayHours": 24,
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, payload)
    if not passed:
        print("FAIL: retrieval and transfer tasks are not distinct", file=sys.stderr)
        return 1
    print(f"ok: distinct mastery, transfer, retrieval tasks {distinctLessons}/{assessedLessons}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
