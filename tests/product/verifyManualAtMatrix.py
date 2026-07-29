from __future__ import annotations

from datetime import UTC, datetime, timedelta
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import time
from typing import Any, Callable, TypedDict

import yaml


ROOT = Path(__file__).resolve().parents[2]
MATRIX_PATH = ROOT / "tests/product/manual-at.matrix.yml"
REPORT_PATH = ROOT / "output/test-runner/astryx-journey/manual-at-report.json"
EVIDENCE_ROOT = "docs/evidence/astryx-journey"
PRODUCT_SOURCE_PATHS = (
    "assets/brand",
    "curricula",
    "editor",
    "landing",
    "launcher",
    "src/codaro",
)
NATIVE_REPORT_PATH = (
    "output/test-runner/product-browser-webview2-evergreen/"
    "webview2-product-smoke-report.json"
)
NATIVE_CASES = (
    "local-home-900x640",
    "local-automation-1440x900",
    "local-automation-state-matrix-1440x900",
    "local-notebook-keyboard-12-cells",
    "local-shell-keyboard-forced-colors-900x640",
)
SHA256_PATTERN = re.compile(r"sha256-[0-9a-f]{64}")
GIT_HEAD_PATTERN = re.compile(r"(?:[0-9a-f]{40}|[0-9a-f]{64})")
PLACEHOLDER_IDENTITIES = {
    "anonymous",
    "pending",
    "placeholder",
    "tbd",
    "test",
    "tester",
    "unknown",
}
EXPECTED_SCENARIOS: dict[str, dict[str, Any]] = {
    "web-windows-nvda-chromium": {
        "target": {
            "surface": "web",
            "osFamily": "Windows",
            "osRelease": "supported",
            "browserFamily": "Chromium",
            "assistiveTechnology": "NVDA",
        },
        "requiredChecks": (
            "landmark-heading-navigation",
            "codemirror-enter-exit",
            "run-retry-keyboard",
            "result-announced-once",
        ),
    },
    "web-windows-nvda-firefox": {
        "target": {
            "surface": "web",
            "osFamily": "Windows",
            "osRelease": "supported",
            "browserFamily": "Firefox",
            "assistiveTechnology": "NVDA",
        },
        "requiredChecks": (
            "landmark-heading-navigation",
            "codemirror-enter-exit",
            "run-retry-keyboard",
            "result-announced-once",
        ),
    },
    "web-macos-voiceover-safari": {
        "target": {
            "surface": "web",
            "osFamily": "macOS",
            "osRelease": "supported",
            "browserFamily": "Safari",
            "assistiveTechnology": "VoiceOver",
        },
        "requiredChecks": (
            "rotor-landmark-heading-navigation",
            "codemirror-enter-exit",
            "run-retry-keyboard",
            "result-announced-once",
        ),
    },
    "web-ios-voiceover-safari": {
        "target": {
            "surface": "web",
            "osFamily": "iOS",
            "osRelease": "supported",
            "browserFamily": "Safari",
            "assistiveTechnology": "VoiceOver",
        },
        "requiredChecks": (
            "rotor-landmark-heading-navigation",
            "codemirror-enter-exit",
            "virtual-keyboard",
            "result-announced-once",
        ),
    },
    "web-android-talkback-chrome": {
        "target": {
            "surface": "web",
            "osFamily": "Android",
            "osRelease": "supported",
            "browserFamily": "Chrome",
            "assistiveTechnology": "TalkBack",
        },
        "requiredChecks": (
            "swipe-navigation",
            "codemirror-enter-exit",
            "run-retry-keyboard",
            "result-announced-once",
        ),
    },
    "local-windows10-narrator-webview2": {
        "target": {
            "surface": "local",
            "osFamily": "Windows",
            "osRelease": "Windows 10 22H2",
            "browserFamily": "WebView2",
            "assistiveTechnology": "Narrator",
        },
        "requiredChecks": (
            "landmark-heading-navigation",
            "codemirror-enter-exit",
            "result-announced-once",
            "dialog-focus-return",
            "run-retry-local-estop-keyboard",
            "korean-ime-no-shortcut-conflict",
            "forced-colors-state-distinction",
        ),
    },
}


class ManualAtMatrix(TypedDict):
    schemaVersion: int
    matrixId: str
    manualScenarios: list[dict[str, Any]]
    study: dict[str, Any]
    independentReviews: list[dict[str, Any]]


class ManualAtReport(TypedDict):
    schemaVersion: int
    audit: str
    status: str
    passed: bool
    machineEligible: bool
    completionEligible: bool
    gitHead: str
    facts: dict[str, Any]
    completionBlockers: list[str]
    failures: list[str]


RevisionValidator = Callable[[str, str, tuple[str, ...], Path], None]


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead(root: Path = ROOT) -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
    )
    value = result.stdout.strip().lower()
    if GIT_HEAD_PATTERN.fullmatch(value) is None:
        raise ValueError("current Git head is invalid")
    return value


def loadMapping(path: Path) -> dict[str, Any]:
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"YAML root must be a mapping: {path}")
    return payload


def validateProductRevision(
    productGitHead: str,
    currentHead: str,
    productSourcePaths: tuple[str, ...],
    root: Path,
) -> None:
    if GIT_HEAD_PATTERN.fullmatch(productGitHead) is None:
        raise ValueError("productGitHead must be a full lowercase Git commit")
    exists = subprocess.run(
        ("git", "cat-file", "-e", f"{productGitHead}^{{commit}}"),
        cwd=root,
        capture_output=True,
        timeout=30,
    )
    if exists.returncode != 0:
        raise ValueError(f"productGitHead is unavailable: {productGitHead}")
    ancestor = subprocess.run(
        ("git", "merge-base", "--is-ancestor", productGitHead, currentHead),
        cwd=root,
        capture_output=True,
        timeout=30,
    )
    if ancestor.returncode != 0:
        raise ValueError(f"productGitHead is not an ancestor of the current commit: {productGitHead}")
    committedDrift = subprocess.run(
        ("git", "diff", "--quiet", productGitHead, currentHead, "--", *productSourcePaths),
        cwd=root,
        timeout=30,
    )
    workingDrift = subprocess.run(
        ("git", "diff", "--quiet", "HEAD", "--", *productSourcePaths),
        cwd=root,
        timeout=30,
    )
    stagedDrift = subprocess.run(
        ("git", "diff", "--cached", "--quiet", "HEAD", "--", *productSourcePaths),
        cwd=root,
        timeout=30,
    )
    if any(result.returncode != 0 for result in (committedDrift, workingDrift, stagedDrift)):
        raise ValueError(f"product sources changed after manual evidence commit: {productGitHead}")


def parseObservedAt(value: Any, *, label: str) -> str:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{label} observedAt is required")
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"{label} observedAt is not ISO-8601") from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise ValueError(f"{label} observedAt must include a timezone")
    if parsed.astimezone(UTC) > datetime.now(UTC) + timedelta(minutes=5):
        raise ValueError(f"{label} observedAt is in the future")
    return value


def requireIdentity(value: Any, *, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} is required")
    normalized = value.strip()
    if normalized.lower() in PLACEHOLDER_IDENTITIES:
        raise ValueError(f"{label} uses a placeholder identity")
    return normalized


def verifyEvidence(
    value: Any,
    *,
    label: str,
    root: Path,
    evidenceRoot: str,
) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not value:
        raise ValueError(f"{label} evidence must contain at least one artifact")
    verified: list[dict[str, Any]] = []
    prefix = PurePosixPath(evidenceRoot)
    for index, artifact in enumerate(value):
        itemLabel = f"{label} evidence[{index}]"
        if not isinstance(artifact, dict) or set(artifact) != {"path", "sha256"}:
            raise ValueError(f"{itemLabel} must contain only path and sha256")
        relativeValue = artifact.get("path")
        expectedHash = artifact.get("sha256")
        if not isinstance(relativeValue, str) or not relativeValue:
            raise ValueError(f"{itemLabel} path is required")
        relative = PurePosixPath(relativeValue)
        if relative.is_absolute() or ".." in relative.parts or not relative.is_relative_to(prefix):
            raise ValueError(f"{itemLabel} path must stay under {evidenceRoot}")
        if not isinstance(expectedHash, str) or SHA256_PATTERN.fullmatch(expectedHash) is None:
            raise ValueError(f"{itemLabel} sha256 is invalid")
        path = root.joinpath(*relative.parts)
        if not path.is_file():
            raise ValueError(f"{itemLabel} file is missing: {relativeValue}")
        actualHash = "sha256-" + hashlib.sha256(path.read_bytes()).hexdigest()
        if actualHash != expectedHash:
            raise ValueError(f"{itemLabel} hash mismatch: {relativeValue}")
        verified.append({"path": relativeValue, "sha256": actualHash, "bytes": path.stat().st_size})
    return verified


def verifyExecutedRevision(
    entry: dict[str, Any],
    *,
    label: str,
    currentHead: str,
    productSourcePaths: tuple[str, ...],
    root: Path,
    revisionValidator: RevisionValidator,
) -> str:
    productGitHead = entry.get("productGitHead")
    if (
        not isinstance(productGitHead, str)
        or GIT_HEAD_PATTERN.fullmatch(productGitHead) is None
    ):
        raise ValueError(f"{label} productGitHead must be a full lowercase Git commit")
    revisionValidator(productGitHead, currentHead, productSourcePaths, root)
    return productGitHead


def verifyManualScenarios(
    value: Any,
    *,
    root: Path,
    evidenceRoot: str,
    currentHead: str,
    productSourcePaths: tuple[str, ...],
    revisionValidator: RevisionValidator,
) -> dict[str, Any]:
    if not isinstance(value, list):
        raise ValueError("manualScenarios must be a list")
    entries: dict[str, dict[str, Any]] = {}
    for entry in value:
        if not isinstance(entry, dict) or not isinstance(entry.get("id"), str):
            raise ValueError("manual scenario must be a mapping with an id")
        scenarioId = entry["id"]
        if scenarioId in entries:
            raise ValueError(f"duplicate manual scenario: {scenarioId}")
        entries[scenarioId] = entry
    if set(entries) != set(EXPECTED_SCENARIOS):
        missing = sorted(set(EXPECTED_SCENARIOS) - set(entries))
        extra = sorted(set(entries) - set(EXPECTED_SCENARIOS))
        raise ValueError(f"manual scenario set drifted: missing={missing}, extra={extra}")

    statuses: dict[str, str] = {}
    verifiedEvidence: dict[str, list[dict[str, Any]]] = {}
    testers: list[str] = []
    for scenarioId, expected in EXPECTED_SCENARIOS.items():
        entry = entries[scenarioId]
        label = f"manual scenario {scenarioId}"
        if set(entry) != {
            "id",
            "target",
            "requiredChecks",
            "status",
            "actual",
            "tester",
            "observedAt",
            "productGitHead",
            "checkResults",
            "findings",
            "evidence",
        }:
            raise ValueError(f"{label} has an invalid closed schema")
        if entry.get("target") != expected["target"]:
            raise ValueError(f"{label} target drifted")
        requiredChecks = entry.get("requiredChecks")
        if requiredChecks != list(expected["requiredChecks"]):
            raise ValueError(f"{label} requiredChecks drifted")
        status = entry.get("status")
        if status not in {"pending", "passed", "failed"}:
            raise ValueError(f"{label} status must be pending, passed, or failed")
        statuses[scenarioId] = status
        if status == "pending":
            emptyFields = (
                entry.get("actual") is None
                and entry.get("tester") is None
                and entry.get("observedAt") is None
                and entry.get("productGitHead") is None
                and entry.get("checkResults") == {}
                and entry.get("findings") == []
                and entry.get("evidence") == []
            )
            if not emptyFields:
                raise ValueError(f"{label} pending entry must not contain unverified results")
            continue

        actual = entry.get("actual")
        if not isinstance(actual, dict) or set(actual) != {
            "osVersion",
            "browserVersion",
            "assistiveTechnologyVersion",
            "locale",
        }:
            raise ValueError(f"{label} actual versions and locale are required")
        for field, actualValue in actual.items():
            if not isinstance(actualValue, str) or not actualValue.strip():
                raise ValueError(f"{label} actual.{field} is required")
        target = expected["target"]
        versionExpectations = {
            "osVersion": str(target["osFamily"]),
            "browserVersion": str(target["browserFamily"]),
            "assistiveTechnologyVersion": str(target["assistiveTechnology"]),
        }
        for field, family in versionExpectations.items():
            actualVersion = actual[field]
            if family.lower() not in actualVersion.lower() or re.search(r"\d", actualVersion) is None:
                raise ValueError(f"{label} actual.{field} must contain the family and exact version")
        if (
            target["osRelease"] != "supported"
            and str(target["osRelease"]).lower() not in actual["osVersion"].lower()
        ):
            raise ValueError(f"{label} actual.osVersion does not match the required release")
        tester = requireIdentity(entry.get("tester"), label=f"{label} tester")
        testers.append(tester)
        parseObservedAt(entry.get("observedAt"), label=label)
        verifyExecutedRevision(
            entry,
            label=label,
            currentHead=currentHead,
            productSourcePaths=productSourcePaths,
            root=root,
            revisionValidator=revisionValidator,
        )
        checkResults = entry.get("checkResults")
        if not isinstance(checkResults, dict) or set(checkResults) != set(expected["requiredChecks"]):
            raise ValueError(f"{label} checkResults must match requiredChecks")
        if any(not isinstance(result, bool) for result in checkResults.values()):
            raise ValueError(f"{label} checkResults must be boolean")
        findings = entry.get("findings")
        if not isinstance(findings, list) or any(not isinstance(item, str) or not item for item in findings):
            raise ValueError(f"{label} findings must be a string list")
        if status == "passed" and (not all(checkResults.values()) or findings):
            raise ValueError(f"{label} passed entry contains a failed check or finding")
        if status == "failed" and all(checkResults.values()) and not findings:
            raise ValueError(f"{label} failed entry has no failed check or finding")
        verifiedEvidence[scenarioId] = verifyEvidence(
            entry.get("evidence"),
            label=label,
            root=root,
            evidenceRoot=evidenceRoot,
        )
    passed = sorted(scenarioId for scenarioId, status in statuses.items() if status == "passed")
    return {
        "required": len(EXPECTED_SCENARIOS),
        "passed": len(passed),
        "passedIds": passed,
        "remainingIds": sorted(set(EXPECTED_SCENARIOS) - set(passed)),
        "statuses": statuses,
        "testers": sorted(set(testers)),
        "verifiedEvidence": verifiedEvidence,
        "complete": len(passed) == len(EXPECTED_SCENARIOS),
    }


def verifyStudy(
    value: Any,
    *,
    root: Path,
    evidenceRoot: str,
    currentHead: str,
    productSourcePaths: tuple[str, ...],
    revisionValidator: RevisionValidator,
) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError("study must be a mapping")
    if set(value) != {
        "id",
        "status",
        "cohort",
        "claimBoundary",
        "requiredParticipants",
        "minimumUnassistedRate",
        "maximumElapsedSeconds",
        "researchOwner",
        "privacyOwner",
        "observedAt",
        "productGitHead",
        "participants",
        "evidence",
    }:
        raise ValueError("study has an invalid closed schema")
    expected = {
        "id": "first-strong-check-file-automation",
        "cohort": "basic-python-users-new-to-file-automation",
        "claimBoundary": "not-generalized-beyond-recruited-cohort",
        "requiredParticipants": 12,
        "minimumUnassistedRate": 0.8,
        "maximumElapsedSeconds": 180,
    }
    for key, expectedValue in expected.items():
        if value.get(key) != expectedValue:
            raise ValueError(f"study {key} drifted")
    status = value.get("status")
    if status not in {"pending", "passed", "failed"}:
        raise ValueError("study status must be pending, passed, or failed")
    if status == "pending":
        emptyFields = (
            value.get("researchOwner") is None
            and value.get("privacyOwner") is None
            and value.get("observedAt") is None
            and value.get("productGitHead") is None
            and value.get("participants") == []
            and value.get("evidence") == []
        )
        if not emptyFields:
            raise ValueError("pending study must not contain unverified results")
        return {
            "status": status,
            "participants": 0,
            "unassistedSuccesses": 0,
            "unassistedRate": 0.0,
            "complete": False,
        }

    requireIdentity(value.get("researchOwner"), label="study researchOwner")
    researchOwner = requireIdentity(value.get("researchOwner"), label="study researchOwner")
    privacyOwner = requireIdentity(value.get("privacyOwner"), label="study privacyOwner")
    if researchOwner == privacyOwner:
        raise ValueError("study researchOwner and privacyOwner must be distinct")
    parseObservedAt(value.get("observedAt"), label="study")
    verifyExecutedRevision(
        value,
        label="study",
        currentHead=currentHead,
        productSourcePaths=productSourcePaths,
        root=root,
        revisionValidator=revisionValidator,
    )
    participants = value.get("participants")
    if not isinstance(participants, list) or len(participants) != expected["requiredParticipants"]:
        raise ValueError("study must contain exactly 12 participant summaries")
    participantIds: set[str] = set()
    successes = 0
    for index, participant in enumerate(participants):
        label = f"study participant[{index}]"
        if not isinstance(participant, dict) or set(participant) != {
            "participantId",
            "consentRecorded",
            "firstStrongCheckReached",
            "facilitatorHelp",
            "elapsedSeconds",
        }:
            raise ValueError(f"{label} has an invalid closed schema")
        participantId = requireIdentity(participant.get("participantId"), label=f"{label} participantId")
        if "@" in participantId or participantId in participantIds:
            raise ValueError(f"{label} participantId must be unique and pseudonymous")
        participantIds.add(participantId)
        if participant.get("consentRecorded") is not True:
            raise ValueError(f"{label} consentRecorded must be true")
        if not isinstance(participant.get("firstStrongCheckReached"), bool):
            raise ValueError(f"{label} firstStrongCheckReached must be boolean")
        if not isinstance(participant.get("facilitatorHelp"), bool):
            raise ValueError(f"{label} facilitatorHelp must be boolean")
        elapsed = participant.get("elapsedSeconds")
        if not isinstance(elapsed, int) or isinstance(elapsed, bool) or elapsed < 0:
            raise ValueError(f"{label} elapsedSeconds must be a non-negative integer")
        if (
            participant["firstStrongCheckReached"]
            and not participant["facilitatorHelp"]
            and elapsed <= expected["maximumElapsedSeconds"]
        ):
            successes += 1
    rate = successes / len(participants)
    verifiedEvidence = verifyEvidence(
        value.get("evidence"),
        label="study",
        root=root,
        evidenceRoot=evidenceRoot,
    )
    eligible = rate >= expected["minimumUnassistedRate"]
    if status == "passed" and not eligible:
        raise ValueError("passed study does not meet the unassisted completion threshold")
    if status == "failed" and eligible:
        raise ValueError("failed study meets the declared completion threshold")
    return {
        "status": status,
        "participants": len(participants),
        "unassistedSuccesses": successes,
        "unassistedRate": round(rate, 4),
        "verifiedEvidence": verifiedEvidence,
        "owners": [researchOwner, privacyOwner],
        "complete": status == "passed" and eligible,
    }


def verifyIndependentReviews(
    value: Any,
    *,
    root: Path,
    evidenceRoot: str,
    currentHead: str,
    productSourcePaths: tuple[str, ...],
    revisionValidator: RevisionValidator,
    disallowedReviewers: set[str],
) -> dict[str, Any]:
    if not isinstance(value, list):
        raise ValueError("independentReviews must be a list")
    entries: dict[str, dict[str, Any]] = {}
    for entry in value:
        if not isinstance(entry, dict) or entry.get("discipline") not in {
            "product-design",
            "accessibility",
        }:
            raise ValueError("independent review discipline is invalid")
        discipline = entry["discipline"]
        if discipline in entries:
            raise ValueError(f"duplicate independent review: {discipline}")
        entries[discipline] = entry
    if set(entries) != {"product-design", "accessibility"}:
        raise ValueError("product-design and accessibility reviews are both required")

    passed: list[str] = []
    reviewers: set[str] = set()
    for discipline, entry in entries.items():
        label = f"{discipline} review"
        if set(entry) != {
            "discipline",
            "status",
            "reviewer",
            "relationship",
            "observedAt",
            "productGitHead",
            "decision",
            "findings",
            "evidence",
        }:
            raise ValueError(f"{label} has an invalid closed schema")
        status = entry.get("status")
        if status not in {"pending", "passed", "failed"}:
            raise ValueError(f"{label} status must be pending, passed, or failed")
        if status == "pending":
            emptyFields = (
                entry.get("reviewer") is None
                and entry.get("relationship") is None
                and entry.get("observedAt") is None
                and entry.get("productGitHead") is None
                and entry.get("decision") is None
                and entry.get("findings") == []
                and entry.get("evidence") == []
            )
            if not emptyFields:
                raise ValueError(f"{label} pending entry must not contain unverified results")
            continue
        reviewer = requireIdentity(entry.get("reviewer"), label=f"{label} reviewer")
        if reviewer in reviewers or reviewer in disallowedReviewers:
            raise ValueError(f"{label} reviewer must be independent and unique")
        reviewers.add(reviewer)
        if entry.get("relationship") != "independent":
            raise ValueError(f"{label} relationship must be independent")
        parseObservedAt(entry.get("observedAt"), label=label)
        verifyExecutedRevision(
            entry,
            label=label,
            currentHead=currentHead,
            productSourcePaths=productSourcePaths,
            root=root,
            revisionValidator=revisionValidator,
        )
        findings = entry.get("findings")
        if not isinstance(findings, list) or any(not isinstance(item, str) or not item for item in findings):
            raise ValueError(f"{label} findings must be a string list")
        decision = entry.get("decision")
        if status == "passed" and (decision != "approve" or findings):
            raise ValueError(f"{label} passed entry must approve without findings")
        if status == "failed" and (decision != "reject" or not findings):
            raise ValueError(f"{label} failed entry must reject with findings")
        verifyEvidence(
            entry.get("evidence"),
            label=label,
            root=root,
            evidenceRoot=evidenceRoot,
        )
        if status == "passed":
            passed.append(discipline)
    return {
        "required": 2,
        "passed": len(passed),
        "passedDisciplines": sorted(passed),
        "remainingDisciplines": sorted(set(entries) - set(passed)),
        "reviewers": sorted(reviewers),
        "complete": len(passed) == 2,
    }


def verifyNativeEvidence(
    value: Any,
    *,
    root: Path,
    currentHead: str,
) -> dict[str, Any]:
    expected = {
        "gate": "product-browser-webview2-evergreen",
        "reportPath": NATIVE_REPORT_PATH,
        "requiredCases": list(NATIVE_CASES),
    }
    if value != expected:
        raise ValueError("automatedNativeEvidence contract drifted")
    reportPath = root.joinpath(*PurePosixPath(NATIVE_REPORT_PATH).parts)
    result: dict[str, Any] = {
        "gate": expected["gate"],
        "reportPath": NATIVE_REPORT_PATH,
        "requiredCases": list(NATIVE_CASES),
        "complete": False,
    }
    if not reportPath.is_file():
        result["reason"] = "report-missing"
        return result
    try:
        report = json.loads(reportPath.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        result["reason"] = "report-invalid"
        return result
    if not isinstance(report, dict):
        result["reason"] = "report-invalid"
        return result
    cases = report.get("cases")
    indexed = {
        case.get("id"): case
        for case in cases
        if isinstance(cases, list) and isinstance(case, dict) and isinstance(case.get("id"), str)
    } if isinstance(cases, list) else {}
    current = report.get("gitHead") == currentHead
    passed = report.get("passed") is True and report.get("status") == "passed"
    requiredPassed = all(
        isinstance(indexed.get(caseId), dict) and indexed[caseId].get("passed") is True
        for caseId in NATIVE_CASES
    )
    runtime = report.get("runtime")
    runtimeCaptured = (
        isinstance(runtime, dict)
        and isinstance(runtime.get("windowsVersion"), str)
        and bool(runtime.get("windowsVersion"))
        and isinstance(runtime.get("browser"), str)
        and bool(runtime.get("browser"))
    )
    result.update(
        {
            "gitHead": report.get("gitHead"),
            "currentGitHead": current,
            "passed": passed,
            "requiredCasesPassed": requiredPassed,
            "runtimeCaptured": runtimeCaptured,
            "complete": current and passed and requiredPassed and runtimeCaptured,
        }
    )
    if not result["complete"]:
        result["reason"] = "report-stale-or-incomplete"
    return result


def evaluateManualAtMatrix(
    matrix: dict[str, Any],
    *,
    root: Path,
    currentHead: str,
    revisionValidator: RevisionValidator = validateProductRevision,
) -> tuple[dict[str, Any], list[str]]:
    if set(matrix) != {
        "schemaVersion",
        "matrixId",
        "evidenceRoot",
        "productSourcePaths",
        "automatedNativeEvidence",
        "manualScenarios",
        "study",
        "independentReviews",
    }:
        raise ValueError("manual accessibility matrix has an invalid closed schema")
    if matrix.get("schemaVersion") != 1 or matrix.get("matrixId") != "astryx-journey-manual-at-v1":
        raise ValueError("manual accessibility matrix identity is invalid")
    if matrix.get("evidenceRoot") != EVIDENCE_ROOT:
        raise ValueError("manual accessibility evidenceRoot drifted")
    if matrix.get("productSourcePaths") != list(PRODUCT_SOURCE_PATHS):
        raise ValueError("manual accessibility productSourcePaths drifted")
    native = verifyNativeEvidence(
        matrix.get("automatedNativeEvidence"),
        root=root,
        currentHead=currentHead,
    )
    manual = verifyManualScenarios(
        matrix.get("manualScenarios"),
        root=root,
        evidenceRoot=EVIDENCE_ROOT,
        currentHead=currentHead,
        productSourcePaths=PRODUCT_SOURCE_PATHS,
        revisionValidator=revisionValidator,
    )
    study = verifyStudy(
        matrix.get("study"),
        root=root,
        evidenceRoot=EVIDENCE_ROOT,
        currentHead=currentHead,
        productSourcePaths=PRODUCT_SOURCE_PATHS,
        revisionValidator=revisionValidator,
    )
    reviews = verifyIndependentReviews(
        matrix.get("independentReviews"),
        root=root,
        evidenceRoot=EVIDENCE_ROOT,
        currentHead=currentHead,
        productSourcePaths=PRODUCT_SOURCE_PATHS,
        revisionValidator=revisionValidator,
        disallowedReviewers=set(manual["testers"]) | set(study.get("owners", [])),
    )
    blockers: list[str] = []
    if not native["complete"]:
        blockers.append(
            "current-commit native WebView2 installed-product report is missing, stale, or incomplete"
        )
    if not manual["complete"]:
        blockers.append(
            "manual assistive-technology scenarios remain: " + ", ".join(manual["remainingIds"])
        )
    if not study["complete"]:
        blockers.append(
            "12-person first-strong-check study has not met the 80% unassisted-within-180-seconds threshold"
        )
    if not reviews["complete"]:
        blockers.append(
            "independent reviews remain: " + ", ".join(reviews["remainingDisciplines"])
        )
    return {
        "nativeWebView2": native,
        "manualScenarios": manual,
        "study": study,
        "independentReviews": reviews,
    }, blockers


def verifyManualAtMatrix(
    *,
    matrixPath: Path = MATRIX_PATH,
    reportPath: Path = REPORT_PATH,
    root: Path = ROOT,
    gitHead: str | None = None,
    revisionValidator: RevisionValidator = validateProductRevision,
) -> ManualAtReport:
    startedAt = utcTimestamp()
    started = time.monotonic()
    currentHead = gitHead or currentGitHead(root)
    failures: list[str] = []
    facts: dict[str, Any] = {}
    blockers: list[str] = []
    try:
        matrix = loadMapping(matrixPath)
        facts, blockers = evaluateManualAtMatrix(
            matrix,
            root=root,
            currentHead=currentHead,
            revisionValidator=revisionValidator,
        )
    except (OSError, ValueError, yaml.YAMLError, subprocess.SubprocessError) as error:
        failures.append(str(error))
    completionEligible = not failures and not blockers
    payload: ManualAtReport = {
        "schemaVersion": 1,
        "audit": "manual-at-matrix",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "machineEligible": not failures,
        "completionEligible": completionEligible,
        "gitHead": currentHead,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "completionBlockers": blockers,
        "failures": failures,
        "matrixPath": matrixPath.relative_to(root).as_posix(),
        "reportPath": reportPath.relative_to(root).as_posix(),
    }
    reportPath.parent.mkdir(parents=True, exist_ok=True)
    reportPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload


def main() -> int:
    payload = verifyManualAtMatrix()
    if not payload["passed"]:
        print("FAIL: manual accessibility matrix contract failed", file=sys.stderr)
        for failure in payload["failures"]:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(
        "ok: manual accessibility matrix verified "
        f"(completionEligible={str(payload['completionEligible']).lower()})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
