from __future__ import annotations

import re
from typing import Any


CONTENT_HASH_RE = re.compile(r"^sha256-[0-9a-f]{64}$")
STAGES = ("E0", "E1", "E2", "E3")
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
)


class EfficacyStageInvalid(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


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


def _requireE0(candidate: dict[str, Any]) -> None:
    _requiredText(candidate, "curriculumOwner")
    _requiredText(candidate, "learningQaReviewer")
    if candidate.get("contentApproved") is not True:
        raise EfficacyStageInvalid("content-review-required", "E0에는 두 역할의 content approval이 필요합니다.")


def _requireE1(candidate: dict[str, Any]) -> None:
    if _participantCount(candidate, "representativeParticipants") < 8:
        raise EfficacyStageInvalid("formative-sample-too-small", "E1에는 경로당 대표 사용자 8명 이상이 필요합니다.")
    _requiredText(candidate, "usabilityReportHash")


def _requireE2(candidate: dict[str, Any]) -> None:
    if _participantCount(candidate, "noviceParticipants") < 20:
        raise EfficacyStageInvalid("learning-signal-sample-too-small", "E2에는 경로당 초보자 20명 이상이 필요합니다.")
    operations = candidate.get("researchOperations")
    if not isinstance(operations, dict):
        raise EfficacyStageInvalid("research-operations-required", "E2 연구 운영 계약이 없습니다.")
    missing = [field for field in RESEARCH_OPERATION_FIELDS if not _present(operations.get(field))]
    if missing:
        code = "missing-research-owner" if "researchOwner" in missing else "incomplete-research-operations"
        raise EfficacyStageInvalid(code, "E2 연구 운영 필드 누락: " + ", ".join(missing))
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
    _requiredText(candidate, "effectReportHash")


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


def _present(value: Any) -> bool:
    if isinstance(value, str):
        return bool(value.strip())
    return value is not None and value is not False
