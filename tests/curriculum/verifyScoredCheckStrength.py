from __future__ import annotations

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


REPORT_PATH = ROOT / "output/test-runner/learning-content/scored-check-strength-report.json"


def strongSectionMastery(payload: dict[str, Any]) -> list[dict[str, Any]]:
    sections = payload.get("sections") if isinstance(payload.get("sections"), list) else []
    return [
        section
        for section in sections
        if isinstance(section, dict)
        and section.get("assessmentMode") == "mastery"
        and isinstance(section.get("check"), dict)
        and isStrongCheckSpec(section["check"])
    ]


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    payloads = curriculumPayloads()
    assessedLessons = 0
    strongCheckCount = 0
    missingRequiredMissionCount = 0
    modeCounts = {"mastery": 0, "transfer": 0, "retrieval": 0}
    for lessonRef, payload in sorted(payloads.items()):
        assessment = payload.get("assessment") if isinstance(payload.get("assessment"), dict) else {}
        if not assessment:
            continue
        assessedLessons += 1
        mastery = strongSectionMastery(payload) + validAssessmentVariants(payload, "mastery")
        transfer = validAssessmentVariants(payload, "transfer")
        retrieval = validAssessmentVariants(payload, "retrieval")
        modes = {"mastery": mastery, "transfer": transfer, "retrieval": retrieval}
        for mode, checks in modes.items():
            if not checks:
                failures.append(f"{lessonRef}: required {mode} mission has no strong CheckSpec")
                missingRequiredMissionCount += 1
            else:
                modeCounts[mode] += 1
                strongCheckCount += len(checks)

    passed = not failures and assessedLessons == 467
    if assessedLessons != 467:
        failures.append(f"assessed lesson count differs: {assessedLessons} != 467")
    payload: dict[str, Any] = {
        "gate": "scored-check-strength",
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
            "strongRequiredMissionCount": strongCheckCount,
            "modeLessonCounts": modeCounts,
            "weakOnlyRequiredMissionCount": missingRequiredMissionCount,
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, payload)
    if failures:
        print("FAIL: required scored missions are not fully strong", file=sys.stderr)
        return 1
    print(f"ok: strong scored missions cover {assessedLessons} lessons")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
