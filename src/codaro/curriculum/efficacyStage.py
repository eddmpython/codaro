from __future__ import annotations

from dataclasses import asdict, dataclass
from enum import StrEnum
import re
from typing import Any
from urllib.parse import urlparse


CONTENT_HASH_RE = re.compile(r"^sha256-[0-9a-f]{64}$")
SENSITIVE_RESEARCH_VALUE_RE = re.compile(
    r"(?:[A-Za-z]:[\\/]|/(?:Users|home)/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|"
    r"(?:sk|ghp|github_pat|Bearer)[-_ :][A-Za-z0-9_-]{8,})",
    re.IGNORECASE,
)


class EfficacyStage(StrEnum):
    E0 = "E0"
    E1 = "E1"
    E2 = "E2"
    E3 = "E3"


STAGES = tuple(stage.value for stage in EfficacyStage)
CLAIMS = {
    "E0": "contentApproved",
    "E1": "usable",
    "E2": "learningSignal",
    "E3": "effectVerified",
}
RESEARCH_OPERATION_FIELDS = (
    "researchOwner",
    "privacyOwner",
    "recruitmentChannel",
    "budgetCeiling",
    "schedule",
    "consentVersion",
    "withdrawalRoute",
    "encryptedRawStore",
    "accessRoster",
    "deletionJob",
    "preregistrationUrl",
    "preregistrationHash",
    "consentReceiptHash",
    "withdrawalTestReceiptHash",
    "deletionTestReceiptHash",
    "redactionAuditHash",
)


class EfficacyStageInvalid(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class PathReleaseState:
    pathId: str
    stage: str
    allowedClaim: str
    visibility: str
    contentHash: str


def resolveEfficacyStage(candidate: dict[str, Any], *, currentContentHash: str) -> dict[str, Any]:
    pathId = _requiredText(candidate, "pathId")
    targetStage = _requiredText(candidate, "targetStage")
    if targetStage not in STAGES:
        raise EfficacyStageInvalid("unknown-efficacy-stage", f"지원하지 않는 efficacy stage: {targetStage}")
    contentHash = _requiredText(candidate, "contentHash")
    if not CONTENT_HASH_RE.fullmatch(contentHash) or contentHash != currentContentHash:
        raise EfficacyStageInvalid("stale-content-evidence", "현재 content hash와 다른 연구 근거는 사용할 수 없습니다.")

    _requireE0(candidate)
    if STAGES.index(targetStage) >= STAGES.index("E1"):
        _requireE1(candidate)
    if STAGES.index(targetStage) >= STAGES.index("E2"):
        _requireE2(candidate)
    if targetStage == "E3":
        _requireE3(candidate)
    return {
        "allowedClaim": CLAIMS[targetStage],
        "contentHash": contentHash,
        "pathId": pathId,
        "stage": targetStage,
    }


def resolveFeaturedPathStatus(
    candidate: dict[str, Any],
    *,
    currentContentHash: str,
) -> PathReleaseState:
    result = resolveEfficacyStage(candidate, currentContentHash=currentContentHash)
    visibility = {
        EfficacyStage.E0.value: "internal",
        EfficacyStage.E1.value: "beta",
        EfficacyStage.E2.value: "beta",
        EfficacyStage.E3.value: "featured",
    }[result["stage"]]
    return PathReleaseState(
        pathId=result["pathId"],
        stage=result["stage"],
        allowedClaim=result["allowedClaim"],
        visibility=visibility,
        contentHash=result["contentHash"],
    )


def resolvePathPortfolio(
    candidates: list[dict[str, Any]],
    *,
    currentContentHashes: dict[str, str],
) -> dict[str, dict[str, Any]]:
    results: dict[str, dict[str, Any]] = {}
    for candidate in candidates:
        pathId = str(candidate.get("pathId") or "")
        try:
            results[pathId] = {
                "passed": True,
                **resolveEfficacyStage(candidate, currentContentHash=currentContentHashes.get(pathId, "")),
            }
        except EfficacyStageInvalid as error:
            results[pathId] = {
                "code": error.code,
                "passed": False,
                "pathId": pathId,
            }
    return results


def productReleaseAggregate(
    candidates: list[dict[str, Any]],
    *,
    currentContentHashes: dict[str, str],
    shellReleaseEligible: bool,
) -> dict[str, Any]:
    portfolio = resolvePathPortfolio(candidates, currentContentHashes=currentContentHashes)
    pathStates: dict[str, dict[str, Any]] = {}
    failedPathIds: list[str] = []
    for candidate in candidates:
        pathId = str(candidate.get("pathId") or "")
        result = portfolio.get(pathId, {})
        if result.get("passed") is not True:
            failedPathIds.append(pathId)
            continue
        state = resolveFeaturedPathStatus(
            candidate,
            currentContentHash=currentContentHashes.get(pathId, ""),
        )
        pathStates[pathId] = asdict(state)
    featuredPathIds = sorted(
        pathId for pathId, state in pathStates.items() if state["visibility"] == "featured"
    )
    expectedPathIds = set(currentContentHashes)
    candidatePathIds = {str(candidate.get("pathId") or "") for candidate in candidates}
    allPathsEffectVerified = (
        bool(expectedPathIds)
        and candidatePathIds == expectedPathIds
        and not failedPathIds
        and set(featuredPathIds) == expectedPathIds
    )
    return {
        "shellReleaseEligible": shellReleaseEligible,
        "allPathsEffectVerified": allPathsEffectVerified,
        "featuredPathIds": featuredPathIds,
        "failedPathIds": sorted(failedPathIds),
        "pathStates": pathStates,
        "pathResults": portfolio,
    }


def _requireE0(candidate: dict[str, Any]) -> None:
    curriculumOwner = _requiredText(candidate, "curriculumOwner")
    learningQaReviewer = _requiredText(candidate, "learningQaReviewer")
    if curriculumOwner == learningQaReviewer:
        raise EfficacyStageInvalid(
            "content-review-independence-required",
            "curriculum owner와 learning QA reviewer는 서로 달라야 합니다.",
        )
    if candidate.get("contentApproved") is not True:
        raise EfficacyStageInvalid("content-review-required", "E0에는 두 역할의 content approval이 필요합니다.")


def _requireE1(candidate: dict[str, Any]) -> None:
    if _participantCount(candidate, "representativeParticipants") < 8:
        raise EfficacyStageInvalid("formative-sample-too-small", "E1에는 경로당 대표 사용자 8명 이상이 필요합니다.")
    _requiredHash(candidate, "usabilityReportHash")


def _requireE2(candidate: dict[str, Any]) -> None:
    if _participantCount(candidate, "noviceParticipants") < 20:
        raise EfficacyStageInvalid("learning-signal-sample-too-small", "E2에는 경로당 초보자 20명 이상이 필요합니다.")
    _requiredHash(candidate, "participantReportHash")
    operations = candidate.get("researchOperations")
    if not isinstance(operations, dict):
        raise EfficacyStageInvalid("research-operations-required", "E2 연구 운영 계약이 없습니다.")
    missing = [field for field in RESEARCH_OPERATION_FIELDS if not _present(operations.get(field))]
    if missing:
        code = "missing-research-owner" if "researchOwner" in missing else "incomplete-research-operations"
        raise EfficacyStageInvalid(code, "E2 연구 운영 필드 누락: " + ", ".join(missing))
    _validateResearchOperations(operations)
    measures = candidate.get("measures")
    requiredMeasures = {"pre", "post", "unseenTransfer"}
    if not isinstance(measures, list) or not requiredMeasures.issubset(set(measures)):
        raise EfficacyStageInvalid("unseen-measures-required", "E2에는 pre/post/unseen transfer 측정이 필요합니다.")
    if candidate.get("causalClaim") is True:
        raise EfficacyStageInvalid("causal-claim-forbidden", "E2 learning signal을 인과효과로 표현할 수 없습니다.")


def _requireE3(candidate: dict[str, Any]) -> None:
    if _participantCount(candidate, "participantsPerArm") < 60:
        raise EfficacyStageInvalid("confirmatory-arm-too-small", "E3에는 arm당 60명 이상의 hard floor가 필요합니다.")
    if candidate.get("powerStatus") not in {"active", "waitlist"}:
        raise EfficacyStageInvalid("powered-design-required", "E3에는 powered active/waitlist 설계가 필요합니다.")
    _requiredHash(candidate, "effectReportHash")


def _validateResearchOperations(operations: dict[str, Any]) -> None:
    researchOwner = _requiredText(operations, "researchOwner")
    privacyOwner = _requiredText(operations, "privacyOwner")
    if researchOwner == privacyOwner:
        raise EfficacyStageInvalid(
            "research-owner-independence-required",
            "research owner와 privacy owner는 서로 달라야 합니다.",
        )
    budgetCeiling = operations.get("budgetCeiling")
    if isinstance(budgetCeiling, bool) or not isinstance(budgetCeiling, int) or budgetCeiling <= 0:
        raise EfficacyStageInvalid(
            "invalid-research-budget",
            "research budgetCeiling은 양의 정수여야 합니다.",
        )
    withdrawalRoute = _requiredText(operations, "withdrawalRoute")
    parsedWithdrawal = urlparse(withdrawalRoute)
    if not withdrawalRoute.startswith("/") and not (
        parsedWithdrawal.scheme == "https" and parsedWithdrawal.netloc
    ):
        raise EfficacyStageInvalid(
            "invalid-withdrawal-route",
            "withdrawalRoute는 제품 내부 route 또는 HTTPS URL이어야 합니다.",
        )
    preregistrationUrl = _requiredText(operations, "preregistrationUrl")
    parsedPreregistration = urlparse(preregistrationUrl)
    if parsedPreregistration.scheme != "https" or not parsedPreregistration.netloc:
        raise EfficacyStageInvalid(
            "invalid-preregistration-url",
            "preregistrationUrl은 HTTPS URL이어야 합니다.",
        )
    deletionJob = operations.get("deletionJob")
    if (
        not isinstance(deletionJob, dict)
        or set(deletionJob) != {"jobId", "retentionDays"}
        or not isinstance(deletionJob.get("jobId"), str)
        or not deletionJob["jobId"].strip()
        or deletionJob.get("retentionDays") != 90
    ):
        raise EfficacyStageInvalid(
            "invalid-deletion-job",
            "deletionJob은 jobId와 정확한 90일 retention을 가져야 합니다.",
        )
    for field in ("encryptedRawStore", "accessRoster", "recruitmentChannel", "schedule"):
        value = _requiredText(operations, field)
        if SENSITIVE_RESEARCH_VALUE_RE.search(value):
            raise EfficacyStageInvalid(
                "research-operations-sensitive-data",
                f"연구 운영 계약에는 secret·email·사용자 filesystem path를 기록할 수 없습니다: {field}",
            )
    for field in (
        "preregistrationHash",
        "consentReceiptHash",
        "withdrawalTestReceiptHash",
        "deletionTestReceiptHash",
        "redactionAuditHash",
    ):
        _requiredHash(operations, field)


def _participantCount(candidate: dict[str, Any], key: str) -> int:
    value = candidate.get(key)
    if isinstance(value, bool) or not isinstance(value, int):
        return 0
    return value


def _requiredText(value: dict[str, Any], key: str) -> str:
    item = value.get(key)
    if not isinstance(item, str) or not item.strip():
        code = "missing-research-owner" if key == "researchOwner" else f"missing-{key}"
        raise EfficacyStageInvalid(code, f"필수 efficacy 필드가 없습니다: {key}")
    return item.strip()


def _requiredHash(value: dict[str, Any], key: str) -> str:
    item = value.get(key)
    if not isinstance(item, str) or CONTENT_HASH_RE.fullmatch(item) is None:
        raise EfficacyStageInvalid(
            f"invalid-{key}",
            f"효능 증거 SHA-256이 유효하지 않습니다: {key}",
        )
    return item


def _present(value: Any) -> bool:
    if isinstance(value, str):
        return bool(value.strip())
    return value is not None and value is not False
