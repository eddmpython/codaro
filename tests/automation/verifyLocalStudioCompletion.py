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
    ROOT / "output" / "test-runner" / "local-studio-browser" / "local-studio-report.json"
)
AUTOMATION_REPORT_PATH = (
    ROOT / "output" / "test-runner" / "automation-ide-audit" / "automation-ide-report.json"
)
REPORT_PATH = (
    ROOT
    / "output"
    / "test-runner"
    / "local-studio-browser"
    / "local-studio-completion-report.json"
)
REQUIRED_CASES = {
    "web-lesson-mobile",
    "local-mobile-chat",
    "local-learning-home-minimum",
    "local-learning-home-desktop",
    "local-strong-learning-desktop",
    "local-native-pathlib-assessment-progression-desktop",
    "local-native-zip-assessment-progression-desktop",
    "local-native-schedule-assessment-progression-desktop",
    "local-native-pathlib-lesson-desktop",
    "local-native-pathlib-versions-desktop",
    "local-native-pathlib-safety-desktop",
    "local-native-pathlib-identity-desktop",
    "local-native-zip-create-desktop",
    "local-native-zip-compression-desktop",
    "local-native-zip-roundtrip-desktop",
    "local-native-zip-integrity-desktop",
    "local-native-schedule-job-desktop",
    "local-native-schedule-register-desktop",
    "local-native-schedule-run-all-desktop",
    "local-native-schedule-cycle-desktop",
    "local-learning-evidence-desktop",
    "local-run-minimum",
    "local-home-minimum",
    "local-home-medium",
    "local-home-desktop",
    "local-automation-minimum",
    "local-automation-medium",
    "local-automation-desktop",
}
HOME_VIEWPORTS = {
    "local-home-minimum": {"width": 900, "height": 640},
    "local-home-medium": {"width": 1024, "height": 768},
    "local-home-desktop": {"width": 1440, "height": 900},
}
AUTOMATION_VIEWPORTS = {
    "local-automation-minimum": {"width": 900, "height": 640},
    "local-automation-medium": {"width": 1024, "height": 768},
    "local-automation-desktop": {"width": 1440, "height": 900},
}
NATIVE_ASSESSMENT_CASES = {
    "local-native-pathlib-assessment-progression-desktop",
    "local-native-zip-assessment-progression-desktop",
    "local-native-schedule-assessment-progression-desktop",
}
REQUIRED_AUTOMATION_REQUIREMENTS = {
    "automation-backend-product-boundary",
    "task-runner-safety-and-audit",
    "automation-loop-durability",
    "automation-frontend-surface",
    "automation-api-state-snapshot",
    "automation-persistent-session",
    "automation-tool-and-input-policy",
    "automation-authoring-loop",
    "automation-docs-and-objective-scorecard",
    "automation-agent-loop",
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


def auditFor(row: dict[str, Any]) -> dict[str, Any]:
    audit = row.get("audit")
    return audit if isinstance(audit, dict) else {}


def validateCaseInventory(
    browserReport: dict[str, Any],
    *,
    expectedGitHead: str,
) -> tuple[dict[str, dict[str, Any]], list[str]]:
    failures: list[str] = []
    if (
        browserReport.get("gate") != "local-studio-browser"
        or browserReport.get("status") != "passed"
        or browserReport.get("passed") is not True
    ):
        failures.append("Local Studio browser report is not passed")
    if browserReport.get("gitHead") != expectedGitHead:
        failures.append("Local Studio browser report is stale")
    cases = caseIndex(browserReport)
    missingCases = sorted(REQUIRED_CASES - set(cases))
    extraCases = sorted(set(cases) - REQUIRED_CASES)
    if missingCases or extraCases:
        failures.append(
            f"Local Studio case inventory drifted: missing={missingCases}, extra={extraCases}"
        )
    failedCases = sorted(
        name
        for name, row in cases.items()
        if (
            row.get("failures")
            or row.get("consoleErrors")
            or row.get("httpFailures")
            or row.get("assetFailures")
        )
    )
    if failedCases:
        failures.append(f"Local Studio browser cases failed: {failedCases}")
    localBoundaryFailures: list[str] = []
    for name, row in cases.items():
        if not name.startswith("local-"):
            continue
        audit = auditFor(row)
        viewport = row.get("viewport")
        if (
            audit.get("runtimeTier") != "local"
            or not isinstance(viewport, dict)
            or int(audit.get("documentWidth") or 0) > int(viewport.get("width") or 0)
            or audit.get("overlaps")
            or audit.get("unnamedButtons")
            or any((audit.get("captureRedactionSignals") or {}).values())
        ):
            localBoundaryFailures.append(name)
    if localBoundaryFailures:
        failures.append(
            f"Local runtime, layout, accessibility, or redaction boundary failed: "
            f"{sorted(localBoundaryFailures)}"
        )
    return cases, failures


def validateHomeAndAutomation(cases: dict[str, dict[str, Any]]) -> list[str]:
    failures: list[str] = []
    for name, viewport in HOME_VIEWPORTS.items():
        row = cases.get(name, {})
        audit = auditFor(row)
        if (
            row.get("viewport") != viewport
            or int(audit.get("localHomeSurfaceCount") or 0) != 1
            or int(audit.get("localHomeRuntimeOnlineCount") or 0) != 1
            or int(audit.get("localHomeResumeCount") or 0) < 1
            or int(audit.get("automationOperationStripCount") or 0) != 1
            or int(audit.get("localHomeOperationsCount") or 0) != 1
            or int(audit.get("localHomeCommandPanelCount") or 0) != 1
            or int(audit.get("localHomeVisibleCommandCount") or 0) != 3
            or int(audit.get("automationEStopControlCount") or 0) != 1
        ):
            failures.append(f"Local Home capability evidence is incomplete: {name}")

    for name, viewport in AUTOMATION_VIEWPORTS.items():
        row = cases.get(name, {})
        audit = auditFor(row)
        requiredCounts = (
            "automationSurfaceCount",
            "automationOperationStripCount",
            "automationRunInspectorCount",
            "automationTaskSelectorCount",
            "automationSelectedTaskCount",
            "automationTaskDetailCount",
            "automationEStopControlCount",
            "automationRunCommandCount",
            "automationSafetyConfirmCount",
            "automationStdoutCount",
            "automationStderrCount",
        )
        if (
            row.get("viewport") != viewport
            or audit.get("automationCapabilityState") != "operational"
            or audit.get("automationRuntime") != "local"
            or audit.get("automationSafetyState") != "confirmationRequired"
            or audit.get("automationRiskLevel") != "destructive"
            or int(audit.get("automationPermissionScopeCount") or 0) != 4
            or any(int(audit.get(key) or 0) < 1 for key in requiredCounts)
        ):
            failures.append(f"Local Automation safety or operation evidence is incomplete: {name}")
    return failures


def validateLearningAndArchive(cases: dict[str, dict[str, Any]]) -> list[str]:
    failures: list[str] = []
    for name in NATIVE_ASSESSMENT_CASES:
        evidence = cases.get(name, {}).get("checkCapabilityEvidence")
        if (
            not isinstance(evidence, dict)
            or evidence.get("checkKind") != "behavior"
            or evidence.get("evidence") != "practice"
            or evidence.get("state") != "verified"
            or int(evidence.get("strongEventCount") or 0) != 0
        ):
            failures.append(f"Local provisional native check boundary is incomplete: {name}")

    archiveEvidence = cases.get("local-learning-evidence-desktop", {}).get(
        "localArchiveWebRoundTripEvidence"
    )
    if (
        not isinstance(archiveEvidence, dict)
        or int(archiveEvidence.get("evidenceEventCount") or 0) < 2
        or archiveEvidence.get("portablePayloadsPreserved") is not True
        or archiveEvidence.get("runtimeTier") != "web"
        or not str(archiveEvidence.get("rootHash") or "").startswith("sha256-")
    ):
        failures.append("Web-to-Local-to-Web archive evidence is incomplete")

    navigationEvidence = cases.get("local-run-minimum", {}).get(
        "notebookKeyboardNavigationEvidence"
    )
    composition = (
        navigationEvidence.get("compositionGuards")
        if isinstance(navigationEvidence, dict)
        else None
    )
    if (
        not isinstance(navigationEvidence, dict)
        or int(navigationEvidence.get("cellCount") or 0) != 12
        or navigationEvidence.get("firstCellReached") is not True
        or navigationEvidence.get("lastCellReached") is not True
        or navigationEvidence.get("markdownVisited") is not True
        or not isinstance(composition, dict)
        or any(
            composition.get(key) is not True
            for key in (
                "codeCompositionPreservedFocus",
                "codeCompositionPreventedRunAndAdvance",
                "codePostCompositionBoundaryMoved",
                "markdownCompositionPreservedTextAndFocus",
                "markdownPostCompositionBoundaryMoved",
            )
        )
    ):
        failures.append("Local notebook keyboard or composition evidence is incomplete")
    return failures


def validateAutomationAudit(
    automationReport: dict[str, Any],
    *,
    expectedGitHead: str,
) -> list[str]:
    failures: list[str] = []
    if (
        automationReport.get("gate") != "automation-ide-audit"
        or automationReport.get("status") != "passed"
        or automationReport.get("passed") is not True
        or automationReport.get("score") != automationReport.get("maxScore")
    ):
        failures.append("Automation IDE audit is not fully passed")
    if automationReport.get("gitHead") != expectedGitHead:
        failures.append("Automation IDE audit is stale")
    rows = automationReport.get("requirements")
    requirements = {
        str(row.get("id")): row
        for row in rows
        if isinstance(rows, list) and isinstance(row, dict) and row.get("id")
    } if isinstance(rows, list) else {}
    missing = sorted(REQUIRED_AUTOMATION_REQUIREMENTS - set(requirements))
    extra = sorted(set(requirements) - REQUIRED_AUTOMATION_REQUIREMENTS)
    failed = sorted(
        name
        for name, row in requirements.items()
        if row.get("passed") is not True or row.get("missing")
    )
    if missing or extra or failed:
        failures.append(
            f"Automation IDE requirement inventory drifted: "
            f"missing={missing}, extra={extra}, failed={failed}"
        )
    return failures


def validateCompletionEvidence(
    browserReport: dict[str, Any],
    automationReport: dict[str, Any],
    *,
    expectedGitHead: str,
) -> list[str]:
    cases, failures = validateCaseInventory(
        browserReport,
        expectedGitHead=expectedGitHead,
    )
    failures.extend(validateHomeAndAutomation(cases))
    failures.extend(validateLearningAndArchive(cases))
    failures.extend(
        validateAutomationAudit(
            automationReport,
            expectedGitHead=expectedGitHead,
        )
    )
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
        automationReport = readMapping(AUTOMATION_REPORT_PATH)
        failures.extend(
            validateCompletionEvidence(
                browserReport,
                automationReport,
                expectedGitHead=gitHead,
            )
        )
    except (FileNotFoundError, json.JSONDecodeError, OSError, TypeError, ValueError) as exc:
        failures.append(
            f"Local Studio completion evidence could not be read: "
            f"{type(exc).__name__}: {exc}"
        )

    payload = {
        "schemaVersion": 1,
        "gate": "local-studio-completion",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "machineImplementationComplete": not failures,
        "claimScope": "machine-verifiable Local Studio implementation",
        "humanEvidenceClaimed": False,
        "releaseApprovalClaimed": False,
        "deferredConditionsOwner": "quality-release",
        "deferredConditions": [
            "Windows 10 22H2 Fixed Version conformance",
            "manual assistive-technology and zoom evidence",
            "representative user and independent product review evidence",
            "public Web-to-installed-Local release round trip",
        ],
        "gitHead": gitHead,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "requiredCaseCount": len(REQUIRED_CASES),
        "automationRequirementCount": len(REQUIRED_AUTOMATION_REQUIREMENTS),
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
        print("FAIL: Local Studio implementation evidence is incomplete", file=sys.stderr)
        return 1
    print("ok: Local Studio machine implementation is complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
