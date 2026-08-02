from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from codaro.curriculum.efficacyStage import (
    CONTENT_HASH_RE,
    EfficacyStageInvalid,
    resolveFeaturedPathStatus,
)


MACHINE_CHECK_KEYS = (
    "pathStructure",
    "assessmentProgression",
    "capstoneContract",
    "solutionExecution",
    "authoringIntegrity",
)
HUMAN_STAGE_BLOCKERS = {
    None: (
        "content-review-required",
        "formative-evidence-required",
        "learning-signal-evidence-required",
        "confirmatory-evidence-required",
    ),
    "E0": (
        "formative-evidence-required",
        "learning-signal-evidence-required",
        "confirmatory-evidence-required",
    ),
    "E1": (
        "learning-signal-evidence-required",
        "confirmatory-evidence-required",
    ),
    "E2": ("confirmatory-evidence-required",),
    "E3": (),
}


class PathPromotionInvalid(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class PathPromotionState:
    pathId: str
    machineStage: str
    machineReady: bool
    machineChecks: dict[str, bool]
    humanEfficacyStage: str | None
    allowedClaim: str
    visibility: str
    promotionEligible: bool
    contentHash: str
    blockers: tuple[str, ...]


def resolvePathPromotionState(
    *,
    pathId: str,
    contentHash: str,
    machineChecks: dict[str, bool],
    efficacyCandidate: dict[str, Any] | None = None,
) -> PathPromotionState:
    normalizedPathId = pathId.strip() if isinstance(pathId, str) else ""
    if not normalizedPathId:
        raise PathPromotionInvalid("path-id-required", "path promotion에는 pathId가 필요합니다.")
    if not isinstance(contentHash, str) or CONTENT_HASH_RE.fullmatch(contentHash) is None:
        raise PathPromotionInvalid(
            "invalid-current-content-hash",
            "path promotion에는 현재 capstone의 SHA-256 content hash가 필요합니다.",
        )
    normalizedChecks = _validateMachineChecks(machineChecks)
    failedChecks = tuple(key for key in MACHINE_CHECK_KEYS if not normalizedChecks[key])
    machineReady = not failedChecks
    blockers = [f"machine-check-failed:{key}" for key in failedChecks]
    humanStage: str | None = None
    humanClaim = "none"
    humanVisibility = "provisional"

    if efficacyCandidate is not None:
        candidatePathId = efficacyCandidate.get("pathId")
        if candidatePathId != normalizedPathId:
            raise PathPromotionInvalid(
                "efficacy-path-mismatch",
                "효능 증거의 pathId가 승격 대상과 다릅니다.",
            )
        try:
            releaseState = resolveFeaturedPathStatus(
                efficacyCandidate,
                currentContentHash=contentHash,
            )
        except EfficacyStageInvalid as error:
            raise PathPromotionInvalid(error.code, str(error)) from error
        humanStage = releaseState.stage
        humanClaim = releaseState.allowedClaim
        humanVisibility = releaseState.visibility

    blockers.extend(HUMAN_STAGE_BLOCKERS[humanStage])

    promotionEligible = machineReady and humanStage == "E3"
    if promotionEligible:
        allowedClaim = humanClaim
        visibility = humanVisibility
    elif machineReady and humanStage is not None:
        allowedClaim = humanClaim
        visibility = humanVisibility
    elif machineReady:
        allowedClaim = "machineVerified"
        visibility = "provisional"
    else:
        allowedClaim = "none"
        visibility = "provisional"

    return PathPromotionState(
        pathId=normalizedPathId,
        machineStage="M0" if machineReady else "unverified",
        machineReady=machineReady,
        machineChecks=normalizedChecks,
        humanEfficacyStage=humanStage,
        allowedClaim=allowedClaim,
        visibility=visibility,
        promotionEligible=promotionEligible,
        contentHash=contentHash,
        blockers=tuple(blockers),
    )


def resolvePathPromotionPortfolio(
    candidates: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    results: dict[str, dict[str, Any]] = {}
    for candidate in candidates:
        pathId = str(candidate.get("pathId") or "")
        try:
            state = resolvePathPromotionState(
                pathId=pathId,
                contentHash=candidate.get("contentHash"),
                machineChecks=candidate.get("machineChecks"),
                efficacyCandidate=candidate.get("efficacyCandidate"),
            )
            results[pathId] = {"passed": True, **asdict(state)}
        except PathPromotionInvalid as error:
            results[pathId] = {
                "code": error.code,
                "passed": False,
                "pathId": pathId,
            }
    return results


def _validateMachineChecks(value: object) -> dict[str, bool]:
    if not isinstance(value, dict) or set(value) != set(MACHINE_CHECK_KEYS):
        raise PathPromotionInvalid(
            "invalid-machine-check-contract",
            "path promotion machine check 집합이 현재 계약과 다릅니다.",
        )
    if any(not isinstance(value[key], bool) for key in MACHINE_CHECK_KEYS):
        raise PathPromotionInvalid(
            "invalid-machine-check-result",
            "path promotion machine check 결과는 boolean이어야 합니다.",
        )
    return {key: value[key] for key in MACHINE_CHECK_KEYS}
