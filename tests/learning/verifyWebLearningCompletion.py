from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys
import time
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
BROWSER_REPORT_PATH = (
    ROOT / "output" / "test-runner" / "web-learning" / "web-learning-report.json"
)
ROUTES_REPORT_PATH = (
    ROOT / "output" / "test-runner" / "web-learning" / "web-learning-routes-report.json"
)
REPORT_PATH = (
    ROOT / "output" / "test-runner" / "web-learning" / "web-learning-completion-report.json"
)
EXPECTED_PATH_IDS = [
    "pythonFoundation",
    "dataReporting",
    "dataVisualization",
    "fileAutomation",
    "officeAutomation",
    "webMonitoring",
]
REQUIRED_CASES = {
    "landing-learn-mobile",
    "landing-learn-desktop",
    "landing-public-lesson-desktop",
    "landing-search-desktop",
    "landing-search-mobile",
    "web-learning-home-mobile",
    "web-learning-home-desktop",
    "web-zero-evidence-autosave-mobile",
    "web-lesson-mobile",
    "web-canonical-keyboard-desktop",
    "web-canonical-navigation-mobile",
    "web-day1-transfer-desktop",
    "web-day1-retrieval-desktop",
    "web-day30-capstone-progression-desktop",
    "web-seaborn-capstone-artifacts-desktop",
    "web-run-mobile",
    "web-run-desktop",
}


def readMapping(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"report root must be an object: {path.relative_to(ROOT).as_posix()}")
    return payload


def caseIndex(report: dict[str, Any]) -> dict[str, dict[str, Any]]:
    rows = report.get("cases")
    if not isinstance(rows, list):
        return {}
    return {
        str(row.get("name")): row
        for row in rows
        if isinstance(row, dict) and row.get("name")
    }


def validateCompletionEvidence(
    browserReport: dict[str, Any],
    routesReport: dict[str, Any],
    *,
    expectedGitHead: str,
) -> list[str]:
    failures: list[str] = []
    if (
        browserReport.get("gate") != "web-learning"
        or browserReport.get("status") != "passed"
        or browserReport.get("passed") is not True
    ):
        failures.append("Web learning browser report is not passed")
    if browserReport.get("gitHead") != expectedGitHead:
        failures.append("Web learning browser report is stale")
    if (
        routesReport.get("gate") != "web-learning-routes"
        or routesReport.get("status") != "passed"
        or routesReport.get("passed") is not True
    ):
        failures.append("Web learning route report is not passed")
    if routesReport.get("gitHead") != expectedGitHead:
        failures.append("Web learning route report is stale")
    routeSummary = routesReport.get("summary")
    if not isinstance(routeSummary, dict) or any(
        routeSummary.get(key) != 472
        for key in (
            "contractLessons",
            "generatedLessons",
            "lazyPayloads",
            "prerenderedRoutes",
            "sitemapRoutes",
            "searchRoutes",
        )
    ):
        failures.append("canonical public route coverage is incomplete")

    cases = caseIndex(browserReport)
    missingCases = sorted(REQUIRED_CASES - set(cases))
    extraCases = sorted(set(cases) - REQUIRED_CASES)
    if missingCases or extraCases:
        failures.append(
            f"Web learning case inventory drifted: missing={missingCases}, extra={extraCases}"
        )
    failedCases = sorted(
        name
        for name, row in cases.items()
        if row.get("failures") or row.get("consoleErrors") or row.get("assetFailures")
    )
    if failedCases:
        failures.append(f"Web learning browser cases failed: {failedCases}")

    pathRows = (
        cases.get("landing-learn-mobile", {})
        .get("learnPathEvidence", {})
        .get("paths", [])
    )
    if (
        not isinstance(pathRows, list)
        or [row.get("id") for row in pathRows if isinstance(row, dict)] != EXPECTED_PATH_IDS
        or any(
            not isinstance(row, dict)
            or not row.get("accessibleName")
            or not row.get("lessonRef")
            or int(row.get("webCount") or 0) < 1
            for row in pathRows
        )
    ):
        failures.append("six outcome paths lack accessible content or canonical lesson context")

    learnEvidence = cases.get("landing-learn-desktop", {}).get("learnSearchEvidence")
    if not isinstance(learnEvidence, dict):
        failures.append("Learn explorer search evidence is absent")
    else:
        if learnEvidence.get("accessibility") != {
            "controls": "learn-catalog",
            "describedBy": "learn-result-count",
            "catalogId": "learn-catalog",
            "resultsLabelledBy": "learn-search-results-title",
            "resultsDescribedBy": "learn-result-count",
            "countLive": "polite",
            "countAtomic": "true",
        }:
            failures.append("Learn explorer accessibility relationships are incomplete")
        ime = learnEvidence.get("ime")
        keyboard = learnEvidence.get("keyboard")
        if (
            not isinstance(ime, dict)
            or ime.get("baseline") != {
                key: ime.get("duringComposition", {}).get(key)
                for key in ("committedQuery", "resultCount", "rowCount", "search")
            }
            or ime.get("afterComposition") != ime.get("afterReload")
        ):
            failures.append("Learn explorer IME commit evidence is incomplete")
        if not isinstance(keyboard, dict) or not keyboard.get("enteredLessonUrl"):
            failures.append("Learn explorer keyboard lesson entry is incomplete")

    siteEvidence = cases.get("landing-search-desktop", {}).get("siteSearchEvidence")
    if (
        not isinstance(siteEvidence, dict)
        or siteEvidence.get("afterComposition") != siteEvidence.get("afterReload")
        or not siteEvidence.get("focusedResultHref")
        or siteEvidence.get("accessibility", {}).get("countAtomic") != "true"
    ):
        failures.append("public search entry, IME, or accessibility evidence is incomplete")

    canonicalCase = cases.get("web-canonical-keyboard-desktop", {})
    semantic = canonicalCase.get("canonicalSemanticEvidence")
    keyboard = canonicalCase.get("canonicalKeyboardEvidence")
    if (
        not isinstance(semantic, dict)
        or semantic.get("overviewLabelledBy") != "learning-lesson-title"
        or semantic.get("sectionLabelledBy") != semantic.get("sectionTitleId")
        or semantic.get("exerciseStatusCount") != 2
        or semantic.get("forbiddenControlCount") != 0
        or "다음 수정:" not in str(semantic.get("feedbackText") or "")
    ):
        failures.append("canonical lesson semantic or automatic feedback evidence is incomplete")
    if (
        not isinstance(keyboard, dict)
        or keyboard.get("titleFocused") is not True
        or keyboard.get("focusedNextLesson") != "day02_변수와데이터타입"
    ):
        failures.append("canonical lesson keyboard continuation is incomplete")

    archiveCase = cases.get("web-lesson-mobile", {})
    archiveAudit = archiveCase.get("audit")
    if (
        not isinstance(archiveAudit, dict)
        or int(archiveAudit.get("webStrongEvidenceEventCount") or 0) < 1
        or int(archiveAudit.get("webVerifiedSectionCount") or 0) != 1
        or archiveAudit.get("webLegacyReaderRejected") is not True
    ):
        failures.append("Web strong evidence, resume, or archive cutover evidence is incomplete")
    return failures


def currentGitHead() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    gitHead = currentGitHead()
    try:
        browserReport = readMapping(BROWSER_REPORT_PATH)
        routesReport = readMapping(ROUTES_REPORT_PATH)
        failures.extend(
            validateCompletionEvidence(
                browserReport,
                routesReport,
                expectedGitHead=gitHead,
            )
        )
    except (FileNotFoundError, json.JSONDecodeError, OSError, TypeError, ValueError) as exc:
        failures.append(f"Web learning completion evidence could not be read: {type(exc).__name__}: {exc}")

    payload = {
        "schemaVersion": 1,
        "gate": "web-learning-completion",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "machineImplementationComplete": not failures,
        "claimScope": "machine-verifiable Web learning implementation",
        "humanEvidenceClaimed": False,
        "releaseApprovalClaimed": False,
        "deferredConditionsOwner": "path-efficacy-and-platform-contracts",
        "deferredConditions": [
            "manual assistive-technology and representative learner evidence",
            "formal compatibility releases and telemetry retirement criteria",
            "independent security approval",
        ],
        "gitHead": gitHead,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "requiredCaseCount": len(REQUIRED_CASES),
        "featuredPathCount": len(EXPECTED_PATH_IDS),
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: Web learning implementation evidence is incomplete", file=sys.stderr)
        return 1
    print("ok: Web learning machine implementation is complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
