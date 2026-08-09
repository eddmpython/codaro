from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any, Literal

from pydantic import BaseModel, Field

from .learningEvent import learningEventOrderKey, validateLearningEvent
from .masteryPolicy import MasteryPolicy
from .taxonomy import CurriculumTaxonomy, TaskFamilyDef


AssuranceStage = Literal["unproven", "practicing", "independent", "transfer", "mastered"]
ApplicationStage = Literal["none", "artifact", "integrated"]

STAGE_RANK: dict[str, int] = {
    "unproven": 0,
    "practicing": 1,
    "independent": 2,
    "transfer": 3,
    "mastered": 4,
}


class ProofReceipt(BaseModel):
    creditEventId: str
    runEventId: str
    taskFamilyId: str
    taskVariantId: str
    lessonRef: str
    sectionId: str
    evidenceTime: str
    runtimeTier: str
    artifactContentHashes: list[str] = Field(default_factory=list)


class TaskFamilyProof(BaseModel):
    taskFamilyId: str
    label: str
    stage: AssuranceStage
    reviewDue: bool = False
    outcomeIds: list[str]
    receipts: list[ProofReceipt] = Field(default_factory=list)


class CapabilityClaimProof(BaseModel):
    claimId: str
    statement: str
    version: int
    stage: AssuranceStage
    reviewDue: bool = False
    requiredFamilyCount: int
    familyStageCounts: dict[str, int] = Field(default_factory=dict)
    nextTaskFamilyId: str | None = None


class ApplicationProof(BaseModel):
    stage: ApplicationStage = "none"
    receiptCount: int = 0
    receipts: list[ProofReceipt] = Field(default_factory=list)


class CapabilityProjection(BaseModel):
    domainId: str
    label: str
    assuranceStage: AssuranceStage
    reviewDue: bool = False
    claims: list[CapabilityClaimProof]
    taskFamilies: list[TaskFamilyProof]
    application: ApplicationProof
    invalidEventIds: list[str] = Field(default_factory=list)


def projectCapability(
    taxonomy: CurriculumTaxonomy,
    domainId: str,
    events: Iterable[Mapping[str, object]],
    *,
    asOf: str | None = None,
) -> CapabilityProjection:
    domain = taxonomy.domainById(domainId)
    if domain is None:
        raise ValueError(f"unknown domain '{domainId}'")
    normalized, invalidEventIds = _normalizedEvents(events)
    familyProofs: list[TaskFamilyProof] = []
    for claim in domain.capabilityClaims:
        for familyId in claim.requiredTaskFamilyIds:
            family = taxonomy.taskFamilyById(familyId)
            if family is None:
                continue
            compatible = _compatibleFamilyEvents(normalized, family, claim.version)
            mastery = MasteryPolicy().reduce(compatible, asOf=asOf)
            outcomeById = {outcome.outcomeId: outcome for outcome in mastery.outcomes}
            stages = [
                _scoreStage(outcomeById[outcomeId].score) if outcomeId in outcomeById else "unproven"
                for outcomeId in family.outcomeIds
            ]
            stage = min(stages, key=lambda value: STAGE_RANK[value]) if stages else "unproven"
            reviewDue = any(outcomeById.get(outcomeId) and outcomeById[outcomeId].reviewDue for outcomeId in family.outcomeIds)
            receiptIds = {
                eventId
                for outcomeId in family.outcomeIds
                if outcomeId in outcomeById
                for eventId in outcomeById[outcomeId].creditEventIds
            }
            familyProofs.append(TaskFamilyProof(
                taskFamilyId=family.id,
                label=family.invariant,
                stage=stage,
                reviewDue=reviewDue,
                outcomeIds=list(family.outcomeIds),
                receipts=_proofReceipts(compatible, receiptIds),
            ))
            invalidEventIds.update(mastery.invalidEventIds)
    familyById = {family.taskFamilyId: family for family in familyProofs}
    claimProofs: list[CapabilityClaimProof] = []
    for claim in domain.capabilityClaims:
        required = [familyById[familyId] for familyId in claim.requiredTaskFamilyIds if familyId in familyById]
        claimStage = min(
            (family.stage for family in required),
            key=lambda value: STAGE_RANK[value],
            default="unproven",
        )
        stageCounts = {
            stage: sum(family.stage == stage for family in required)
            for stage in STAGE_RANK
        }
        nextFamily = min(
            required,
            key=lambda family: (STAGE_RANK[family.stage], family.taskFamilyId),
            default=None,
        )
        claimProofs.append(CapabilityClaimProof(
            claimId=claim.id,
            statement=claim.statement,
            version=claim.version,
            stage=claimStage,
            reviewDue=any(family.reviewDue for family in required),
            requiredFamilyCount=len(required),
            familyStageCounts=stageCounts,
            nextTaskFamilyId=nextFamily.taskFamilyId if nextFamily and STAGE_RANK[nextFamily.stage] < STAGE_RANK["mastered"] else None,
        ))
    assuranceStage = min(
        (family.stage for family in familyProofs),
        key=lambda value: STAGE_RANK[value],
        default="unproven",
    )
    application = _projectApplication(
        normalized,
        taxonomy=taxonomy,
        domainId=domainId,
        assuranceStage=assuranceStage,
    )
    return CapabilityProjection(
        domainId=domain.id,
        label=domain.label,
        assuranceStage=assuranceStage,
        reviewDue=any(family.reviewDue for family in familyProofs),
        claims=claimProofs,
        taskFamilies=familyProofs,
        application=application,
        invalidEventIds=sorted(invalidEventIds),
    )


def _compatibleFamilyEvents(
    events: list[dict[str, Any]],
    family: TaskFamilyDef,
    claimVersion: int,
) -> list[dict[str, Any]]:
    variantById = {variant.taskVariantId: variant for variant in family.variants.values()}
    runIds: set[str] = set()
    for event in events:
        if event.get("kind") != "RunObserved":
            continue
        context = event.get("runContext") if isinstance(event.get("runContext"), dict) else {}
        variant = variantById.get(str(context.get("taskVariantId") or ""))
        if variant is None:
            continue
        if (
            context.get("masteryPolicyVersion") != 2
            or context.get("capabilityClaimId") != family.ownerClaimId
            or context.get("capabilityClaimVersion") != claimVersion
            or context.get("taskFamilyId") != family.id
            or context.get("taskFamilyVersion") != family.version
            or context.get("taskVariantVersion") != variant.taskVariantVersion
            or context.get("checkSpecId") != variant.checkSpecId
            or str(context.get("checkSpecVersion")) != variant.checkSpecVersion
            or context.get("fixtureHash") != variant.fixtureHash
            or set(context.get("outcomeIds") or []) != set(family.outcomeIds)
        ):
            continue
        runIds.add(str(event["eventId"]))
    compatible = [
        event for event in events
        if event.get("eventId") in runIds or event.get("runEventId") in runIds
    ]
    creditIds = {str(event["eventId"]) for event in compatible if event.get("kind") == "CreditGranted"}
    compatible.extend(
        event for event in events
        if event.get("kind") == "EvidenceTombstoned"
        and creditIds.intersection(str(item) for item in event.get("revokedCreditEventIds", []))
    )
    return compatible


def _projectApplication(
    events: list[dict[str, Any]],
    *,
    taxonomy: CurriculumTaxonomy,
    domainId: str,
    assuranceStage: AssuranceStage,
) -> ApplicationProof:
    domain = taxonomy.domainById(domainId)
    if domain is None:
        return ApplicationProof()
    familyIds = {
        familyId
        for claim in domain.capabilityClaims
        for familyId in claim.requiredTaskFamilyIds
    }
    eventsById = {str(event["eventId"]): event for event in events}
    invalidCreditIds = set(MasteryPolicy().reduce(events).invalidEventIds)
    revokedCreditIds = {
        str(creditId)
        for event in events
        if event.get("kind") == "EvidenceTombstoned"
        for creditId in event.get("revokedCreditEventIds", [])
    }
    receiptIds: set[str] = set()
    for event in events:
        if event.get("kind") != "CreditGranted":
            continue
        if str(event["eventId"]) in invalidCreditIds | revokedCreditIds:
            continue
        slices = event.get("creditSlices") if isinstance(event.get("creditSlices"), list) else []
        if not slices or any(sliceValue.get("creditMode") != "capstone" for sliceValue in slices if isinstance(sliceValue, dict)):
            continue
        run = eventsById.get(str(event.get("runEventId") or ""))
        if not run or run.get("kind") != "RunObserved" or run.get("runStatus") != "success":
            continue
        context = run.get("runContext") if isinstance(run.get("runContext"), dict) else {}
        family = taxonomy.taskFamilyById(str(context.get("taskFamilyId") or ""))
        if family is None or family.id not in familyIds or context.get("masteryPolicyVersion") != 2:
            continue
        applicationVariant = family.applicationVariant
        ownerClaim = next(
            (claim for claim in domain.capabilityClaims if claim.id == family.ownerClaimId),
            None,
        )
        if applicationVariant is None or ownerClaim is None:
            continue
        if (
            context.get("tierUsed") != "local"
            or context.get("capabilityClaimId") != ownerClaim.id
            or context.get("capabilityClaimVersion") != ownerClaim.version
            or context.get("taskFamilyVersion") != family.version
            or context.get("taskVariantId") != applicationVariant.taskVariantId
            or context.get("taskVariantVersion") != applicationVariant.taskVariantVersion
            or context.get("checkSpecId") != applicationVariant.checkSpecId
            or str(context.get("checkSpecVersion")) != applicationVariant.checkSpecVersion
            or context.get("fixtureHash") != applicationVariant.fixtureHash
            or set(context.get("outcomeIds") or []) != set(family.outcomeIds)
        ):
            continue
        if family.artifactContractId and (
            context.get("artifactContractId") != family.artifactContractId
            or
            context.get("artifactContractVersion") != family.artifactContractVersion
            or not run.get("artifactDescriptors")
        ):
            continue
        checkIds = [str(value) for value in event.get("checkEventIds", [])]
        checks = [eventsById.get(checkId) for checkId in checkIds]
        if not checks or any(
            not check
            or check.get("runEventId") != run.get("eventId")
            or check.get("checkId") != applicationVariant.checkSpecId
            or check.get("strength") != "strong"
            or check.get("passed") is not True
            or check.get("assessmentMode") != "capstone"
            for check in checks
        ):
            continue
        receiptIds.add(str(event["eventId"]))
    receipts = _proofReceipts(events, receiptIds)
    if not receipts:
        return ApplicationProof()
    stage: ApplicationStage = (
        "integrated"
        if STAGE_RANK[assuranceStage] >= STAGE_RANK["independent"]
        else "artifact"
    )
    return ApplicationProof(
        stage=stage,
        receiptCount=len(receipts),
        receipts=receipts,
    )


def _proofReceipts(events: list[dict[str, Any]], creditIds: set[str]) -> list[ProofReceipt]:
    eventsById = {str(event["eventId"]): event for event in events}
    receipts: list[ProofReceipt] = []
    for creditId in sorted(creditIds):
        credit = eventsById.get(creditId)
        if not credit:
            continue
        run = eventsById.get(str(credit.get("runEventId") or ""))
        if not run:
            continue
        context = run.get("runContext") if isinstance(run.get("runContext"), dict) else {}
        artifacts = run.get("artifactDescriptors") if isinstance(run.get("artifactDescriptors"), list) else []
        receipts.append(ProofReceipt(
            creditEventId=creditId,
            runEventId=str(run["eventId"]),
            taskFamilyId=str(context.get("taskFamilyId") or ""),
            taskVariantId=str(context.get("taskVariantId") or ""),
            lessonRef=str(context.get("lessonRef") or ""),
            sectionId=str(context.get("sectionId") or ""),
            evidenceTime=str(credit.get("evidenceTime") or ""),
            runtimeTier=str(context.get("tierUsed") or ""),
            artifactContentHashes=[
                str(artifact.get("contentHash"))
                for artifact in artifacts
                if isinstance(artifact, dict) and artifact.get("contentHash")
            ],
        ))
    return receipts


def _normalizedEvents(events: Iterable[Mapping[str, object]]) -> tuple[list[dict[str, Any]], set[str]]:
    normalized: list[dict[str, Any]] = []
    invalid: set[str] = set()
    for raw in events:
        try:
            event = validateLearningEvent(raw)
        except (TypeError, ValueError):
            eventId = raw.get("eventId") if isinstance(raw, Mapping) else None
            if isinstance(eventId, str) and eventId:
                invalid.add(eventId)
            continue
        normalized.append(event)
    return sorted(normalized, key=learningEventOrderKey), invalid


def _scoreStage(score: float) -> AssuranceStage:
    if score >= 1:
        return "mastered"
    if score >= 0.8:
        return "transfer"
    if score >= 0.6:
        return "independent"
    if score > 0:
        return "practicing"
    return "unproven"
