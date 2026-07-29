from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
import hashlib
import json
import re
from typing import Any
from urllib.parse import urlparse


SHA256_RE = re.compile(r"^sha256-[0-9a-f]{64}$")
COMPATIBILITY_TOMBSTONES = (
    "/codaro/app/serviceWorker.js",
    "/codaro/serviceWorker.js",
)
COMPATIBILITY_SCOPES = (
    "/codaro/app/",
    "/codaro/run/",
)


class CompatibilityMilestone(StrEnum):
    C0 = "C0"
    C1 = "C1"
    C2 = "C2"
    C3 = "C3"


class CompatibilityReleaseInvalid(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


def verifyCompatibilityRelease(candidate: dict[str, Any]) -> dict[str, Any]:
    milestoneValue = _requiredText(candidate, "milestone")
    try:
        milestone = CompatibilityMilestone(milestoneValue)
    except ValueError as exc:
        raise CompatibilityReleaseInvalid(
            "unknown-compatibility-milestone",
            f"지원하지 않는 compatibility milestone: {milestoneValue}",
        ) from exc

    facts: dict[str, Any] = {}
    facts["C0"] = _verifyC0(candidate)
    if milestone >= CompatibilityMilestone.C1:
        facts["C1"] = _verifyC1(candidate, c0TreeHash=facts["C0"]["treeHash"])
    if milestone >= CompatibilityMilestone.C2:
        facts["C2"] = _verifyC2(candidate)
    if milestone >= CompatibilityMilestone.C3:
        facts["C3"] = _verifyC3(candidate)

    compatibilityMode = {
        CompatibilityMilestone.C0: "frozen-app",
        CompatibilityMilestone.C1: "frozen-app-and-current-run",
        CompatibilityMilestone.C2: "owned-tombstone",
        CompatibilityMilestone.C3: "retired",
    }[milestone]
    return {
        "milestone": milestone.value,
        "compatibilityMode": compatibilityMode,
        "appAssetsRetired": milestone is CompatibilityMilestone.C3,
        "tombstoneRequired": milestone is CompatibilityMilestone.C2,
        "facts": facts,
    }


def telemetryPolicyHash(policy: dict[str, Any]) -> str:
    unsigned = {key: value for key, value in policy.items() if key != "sha256"}
    encoded = json.dumps(
        unsigned,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return "sha256-" + hashlib.sha256(encoded).hexdigest()


def _verifyC0(candidate: dict[str, Any]) -> dict[str, Any]:
    releaseArchiveUrl = _httpsUrl(candidate, "releaseArchiveUrl")
    releaseArchiveHash = _hash(candidate, "releaseArchiveSha256")
    deployedTreeHash = _hash(candidate, "deployedTreeSha256")
    deployedCrawlHash = _hash(candidate, "deployedCrawlSha256")
    if deployedTreeHash != deployedCrawlHash:
        raise CompatibilityReleaseInvalid(
            "deployed-crawl-mismatch",
            "C0 deployed crawl과 frozen tree hash가 다릅니다.",
        )
    return {
        "releaseArchiveUrl": releaseArchiveUrl,
        "releaseArchiveSha256": releaseArchiveHash,
        "treeHash": deployedTreeHash,
        "deployedCrawlMatches": True,
    }


def _verifyC1(candidate: dict[str, Any], *, c0TreeHash: str) -> dict[str, Any]:
    stableReleaseIds = _stableReleaseIds(candidate, minimum=1)
    appTreeHash = _hash(candidate, "appTreeSha256")
    runTreeHash = _hash(candidate, "runTreeSha256")
    if appTreeHash != c0TreeHash:
        raise CompatibilityReleaseInvalid(
            "c0-composition-mismatch",
            "C1 app tree가 C0 frozen tree와 다릅니다.",
        )
    if runTreeHash == appTreeHash:
        raise CompatibilityReleaseInvalid(
            "run-app-tree-collision",
            "C1 current run tree와 frozen app tree가 같을 수 없습니다.",
        )
    if candidate.get("outputCollisionCount") != 0:
        raise CompatibilityReleaseInvalid(
            "composition-output-collision",
            "C1 composition output collision은 0이어야 합니다.",
        )
    scopes = candidate.get("serviceWorkerScopes")
    if scopes != list(COMPATIBILITY_SCOPES):
        raise CompatibilityReleaseInvalid(
            "service-worker-scope-drift",
            "C1 service worker scope는 app과 run 하위로 고정돼야 합니다.",
        )
    for field, code in (
        ("directReloadPassed", "direct-reload-required"),
        ("deepReloadPassed", "deep-reload-required"),
        ("coldOnlinePythonPassed", "cold-online-python-required"),
    ):
        _requiredTrue(candidate, field, code)
    return {
        "stableReleaseIds": stableReleaseIds,
        "appTreeSha256": appTreeHash,
        "runTreeSha256": runTreeHash,
        "rollbackArchiveSha256": _hash(candidate, "rollbackArchiveSha256"),
        "scopeAuditSha256": _hash(candidate, "scopeAuditSha256"),
        "outputCollisionCount": 0,
    }


def _verifyC2(candidate: dict[str, Any]) -> dict[str, Any]:
    stableReleaseIds = _stableReleaseIds(candidate, minimum=2)
    if len(stableReleaseIds) != 2:
        raise CompatibilityReleaseInvalid(
            "two-release-history-required",
            "C2에는 서로 다른 stable release 두 개가 필요합니다.",
        )
    for field, code in (
        ("compatibilityPagePassed", "compatibility-page-required"),
        ("queryRoundTripPassed", "query-roundtrip-required"),
        ("hashRoundTripPassed", "hash-roundtrip-required"),
        ("backForwardPassed", "back-forward-required"),
        ("ownedCacheOnly", "owned-cache-boundary-required"),
        ("exactUnregisterPassed", "exact-unregister-required"),
    ):
        _requiredTrue(candidate, field, code)
    tombstones = candidate.get("tombstonePaths")
    if tombstones != list(COMPATIBILITY_TOMBSTONES):
        raise CompatibilityReleaseInvalid(
            "compatibility-tombstone-drift",
            "C2 tombstone path가 workflow 소유 범위와 다릅니다.",
        )
    return {
        "stableReleaseIds": stableReleaseIds,
        "tombstonePaths": tombstones,
        "unregisterReleaseMarker": _requiredText(candidate, "unregisterReleaseMarker"),
        "navigationAuditSha256": _hash(candidate, "navigationAuditSha256"),
        "ownedCacheAuditSha256": _hash(candidate, "ownedCacheAuditSha256"),
    }


def _verifyC3(candidate: dict[str, Any]) -> dict[str, Any]:
    policy = candidate.get("telemetryPolicy")
    report = candidate.get("telemetryReport")
    if not isinstance(policy, dict):
        raise CompatibilityReleaseInvalid(
            "telemetry-policy-required",
            "C3 telemetry threshold policy가 없습니다.",
        )
    if not isinstance(report, dict):
        raise CompatibilityReleaseInvalid(
            "telemetry-report-required",
            "C3 telemetry report가 없습니다.",
        )
    expectedPolicyFields = {
        "sealedAt",
        "minimumWindowDays",
        "minimumEligibleSessions",
        "maximumLegacyRequestRate",
        "sha256",
    }
    if set(policy) != expectedPolicyFields:
        raise CompatibilityReleaseInvalid(
            "telemetry-policy-schema-invalid",
            "C3 telemetry policy schema가 닫힌 계약과 다릅니다.",
        )
    if policy.get("minimumWindowDays") != 28:
        raise CompatibilityReleaseInvalid(
            "telemetry-window-policy-invalid",
            "C3 minimum telemetry window는 28일이어야 합니다.",
        )
    minimumEligibleSessions = _positiveInt(
        policy.get("minimumEligibleSessions"),
        code="telemetry-sample-policy-invalid",
    )
    maximumRate = policy.get("maximumLegacyRequestRate")
    if (
        isinstance(maximumRate, bool)
        or not isinstance(maximumRate, (int, float))
        or not 0 <= float(maximumRate) <= 1
    ):
        raise CompatibilityReleaseInvalid(
            "telemetry-rate-policy-invalid",
            "C3 legacy request threshold는 0과 1 사이여야 합니다.",
        )
    policyHash = policy.get("sha256")
    if not isinstance(policyHash, str) or policyHash != telemetryPolicyHash(policy):
        raise CompatibilityReleaseInvalid(
            "telemetry-policy-hash-mismatch",
            "C3 telemetry policy hash가 canonical payload와 다릅니다.",
        )

    expectedReportFields = {
        "windowStartedAt",
        "windowEndedAt",
        "eligibleSessions",
        "legacyRequests",
        "reportSha256",
    }
    if set(report) != expectedReportFields:
        raise CompatibilityReleaseInvalid(
            "telemetry-report-schema-invalid",
            "C3 telemetry report schema가 닫힌 계약과 다릅니다.",
        )
    sealedAt = _timestamp(policy.get("sealedAt"), "telemetryPolicy.sealedAt")
    startedAt = _timestamp(report.get("windowStartedAt"), "telemetryReport.windowStartedAt")
    endedAt = _timestamp(report.get("windowEndedAt"), "telemetryReport.windowEndedAt")
    if sealedAt > startedAt:
        raise CompatibilityReleaseInvalid(
            "telemetry-policy-sealed-too-late",
            "C3 threshold policy는 관측 window 전에 봉인돼야 합니다.",
        )
    observedDays = (endedAt - startedAt).total_seconds() / 86_400
    if observedDays < 28:
        raise CompatibilityReleaseInvalid(
            "telemetry-window-too-short",
            "C3 telemetry window가 28일보다 짧습니다.",
        )
    eligibleSessions = _positiveInt(
        report.get("eligibleSessions"),
        code="telemetry-sample-too-small",
    )
    if eligibleSessions < minimumEligibleSessions:
        raise CompatibilityReleaseInvalid(
            "telemetry-sample-too-small",
            "C3 telemetry eligible session이 봉인한 threshold보다 적습니다.",
        )
    legacyRequests = report.get("legacyRequests")
    if (
        isinstance(legacyRequests, bool)
        or not isinstance(legacyRequests, int)
        or legacyRequests < 0
    ):
        raise CompatibilityReleaseInvalid(
            "telemetry-legacy-count-invalid",
            "C3 legacy request count가 유효하지 않습니다.",
        )
    legacyRequestRate = legacyRequests / eligibleSessions
    if legacyRequestRate > float(maximumRate):
        raise CompatibilityReleaseInvalid(
            "telemetry-threshold-not-met",
            "C3 legacy request rate가 봉인한 threshold보다 높습니다.",
        )
    _hash(report, "reportSha256")
    _hash(candidate, "retirementDiffSha256")
    _requiredTrue(candidate, "previousUrlSmokePassed", "previous-url-smoke-required")
    return {
        "observedDays": round(observedDays, 4),
        "eligibleSessions": eligibleSessions,
        "legacyRequests": legacyRequests,
        "legacyRequestRate": round(legacyRequestRate, 8),
        "maximumLegacyRequestRate": float(maximumRate),
        "policySha256": policyHash,
        "reportSha256": report["reportSha256"],
        "retirementDiffSha256": candidate["retirementDiffSha256"],
        "previousUrlSmokePassed": True,
    }


def _stableReleaseIds(candidate: dict[str, Any], *, minimum: int) -> list[str]:
    value = candidate.get("stableReleaseIds")
    if (
        not isinstance(value, list)
        or len(value) < minimum
        or any(not isinstance(item, str) or not item.strip() for item in value)
        or len(value) != len(set(value))
    ):
        raise CompatibilityReleaseInvalid(
            "stable-release-history-invalid",
            "stableReleaseIds는 중복 없는 release ID 목록이어야 합니다.",
        )
    return value


def _requiredText(candidate: dict[str, Any], field: str) -> str:
    value = candidate.get(field)
    if not isinstance(value, str) or not value.strip():
        raise CompatibilityReleaseInvalid(
            f"missing-{field}",
            f"compatibility evidence 필드가 없습니다: {field}",
        )
    return value.strip()


def _hash(candidate: dict[str, Any], field: str) -> str:
    value = candidate.get(field)
    if not isinstance(value, str) or SHA256_RE.fullmatch(value) is None:
        raise CompatibilityReleaseInvalid(
            f"invalid-{field}",
            f"compatibility evidence hash가 유효하지 않습니다: {field}",
        )
    return value


def _httpsUrl(candidate: dict[str, Any], field: str) -> str:
    value = _requiredText(candidate, field)
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.netloc:
        raise CompatibilityReleaseInvalid(
            f"invalid-{field}",
            f"compatibility evidence URL은 HTTPS여야 합니다: {field}",
        )
    return value


def _requiredTrue(candidate: dict[str, Any], field: str, code: str) -> None:
    if candidate.get(field) is not True:
        raise CompatibilityReleaseInvalid(code, f"{field} 통과 증거가 필요합니다.")


def _timestamp(value: Any, field: str) -> datetime:
    if not isinstance(value, str) or not value:
        raise CompatibilityReleaseInvalid(
            f"invalid-{field}",
            f"{field} timestamp가 필요합니다.",
        )
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise CompatibilityReleaseInvalid(
            f"invalid-{field}",
            f"{field} timestamp가 ISO-8601 형식이 아닙니다.",
        ) from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise CompatibilityReleaseInvalid(
            f"invalid-{field}",
            f"{field} timestamp에는 timezone이 필요합니다.",
        )
    return parsed.astimezone(UTC)


def _positiveInt(value: Any, *, code: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise CompatibilityReleaseInvalid(code, "양의 정수 값이 필요합니다.")
    return value
