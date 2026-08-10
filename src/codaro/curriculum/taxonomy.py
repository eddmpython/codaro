"""Curriculum OS 분류 체계 로더.

`curricula/python/_taxonomy.yml`을 SSOT로 읽어서 outcomes/domains/lesson 매핑을
제공한다. 레슨 YAML의 meta.outcomes/meta.prerequisites가 있으면 그쪽이 우선이고,
taxonomy.lessonOutcomes는 backfill 용도다.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable, Literal

import yaml
from pydantic import BaseModel, Field


class OutcomeDef(BaseModel):
    id: str
    label: str
    description: str = ""


class ApplicationRequirementDef(BaseModel):
    artifactContractId: str
    artifactContractVersion: int = 1
    automationHandoff: str = "supported"


class CapabilityClaimDef(BaseModel):
    id: str
    statement: str
    allowedTools: list[str] = Field(default_factory=list)
    inferenceBoundary: list[str] = Field(default_factory=list)
    requiredTaskFamilyIds: list[str] = Field(default_factory=list)
    applicationRequirement: ApplicationRequirementDef | None = None
    version: int = 1


class EvidenceSliceDef(BaseModel):
    outcomeId: str
    caseIds: list[str] = Field(default_factory=list)


class TaskFamilyVariantDef(BaseModel):
    taskVariantId: str
    taskVariantVersion: int = 1
    lessonRef: str
    sectionId: str
    checkSpecId: str
    checkSpecVersion: str = "1"
    fixtureHash: str


class CheckerCorpusDef(BaseModel):
    validAlternatives: list[str] = Field(default_factory=list)
    requiredMutations: list[str] = Field(default_factory=list)
    notApplicable: dict[str, str] = Field(default_factory=dict)


class TaskFamilyDef(BaseModel):
    id: str
    version: int = 1
    ownerDomainId: str
    ownerClaimId: str
    outcomeIds: list[str] = Field(default_factory=list)
    invariant: str
    inferenceBoundary: list[str] = Field(default_factory=list)
    evidenceSlices: list[EvidenceSliceDef] = Field(default_factory=list)
    variants: dict[str, TaskFamilyVariantDef] = Field(default_factory=dict)
    applicationVariant: TaskFamilyVariantDef | None = None
    checkerCorpus: CheckerCorpusDef = Field(default_factory=CheckerCorpusDef)
    artifactContractId: str | None = None
    artifactContractVersion: int | None = None


class DomainDef(BaseModel):
    id: str
    label: str
    description: str = ""
    targetOutcomes: list[str] = Field(default_factory=list)
    capstoneLessonRef: str | None = None
    capabilityClaims: list[CapabilityClaimDef] = Field(default_factory=list)
    prerequisitePolicy: Literal["closure", "targetOnly"] = "closure"


class LessonOutcomeRecord(BaseModel):
    outcomes: list[str] = Field(default_factory=list)
    prerequisites: list[str] = Field(default_factory=list)
    estimatedMinutes: int = 0
    practicalDomain: list[str] = Field(default_factory=list)
    sectionOutcomes: dict[str, list[str]] = Field(default_factory=dict)
    lessonRole: str = "concept"


class CurriculumTaxonomy(BaseModel):
    outcomes: list[OutcomeDef] = Field(default_factory=list)
    domains: list[DomainDef] = Field(default_factory=list)
    taskFamilies: list[TaskFamilyDef] = Field(default_factory=list)
    lessonOutcomes: dict[str, LessonOutcomeRecord] = Field(default_factory=dict)

    def outcomeById(self, outcomeId: str) -> OutcomeDef | None:
        for outcome in self.outcomes:
            if outcome.id == outcomeId:
                return outcome
        return None

    def domainById(self, domainId: str) -> DomainDef | None:
        for domain in self.domains:
            if domain.id == domainId:
                return domain
        return None

    def taskFamilyById(self, taskFamilyId: str) -> TaskFamilyDef | None:
        for taskFamily in self.taskFamilies:
            if taskFamily.id == taskFamilyId:
                return taskFamily
        return None

    def hasOutcome(self, outcomeId: str) -> bool:
        return self.outcomeById(outcomeId) is not None

    def outcomeLabel(self, outcomeId: str) -> str:
        outcome = self.outcomeById(outcomeId)
        return outcome.label if outcome else outcomeId

    def lessonRecord(self, category: str, contentId: str) -> LessonOutcomeRecord | None:
        return self.lessonOutcomes.get(f"{category}/{contentId}")

    def validate(self) -> list[str]:
        """그래프 무결성 검증 — 모르는 outcome 참조나 cycle 가능성을 잡는다."""
        errors: list[str] = []
        knownOutcomes = {outcome.id for outcome in self.outcomes}
        knownDomains = {domain.id for domain in self.domains}
        familyIds = [family.id for family in self.taskFamilies]
        duplicateFamilies = {familyId for familyId in familyIds if familyIds.count(familyId) > 1}
        for familyId in sorted(duplicateFamilies):
            errors.append(f"duplicate task family '{familyId}'")
        for domain in self.domains:
            for outcomeId in domain.targetOutcomes:
                if outcomeId not in knownOutcomes:
                    errors.append(
                        f"domain {domain.id}: unknown outcome '{outcomeId}'"
                    )
            if domain.capstoneLessonRef and domain.capstoneLessonRef not in self.lessonOutcomes:
                errors.append(
                    f"domain {domain.id}: unknown capstone lesson '{domain.capstoneLessonRef}'"
                )
            claimIds = [claim.id for claim in domain.capabilityClaims]
            for claimId in sorted({claimId for claimId in claimIds if claimIds.count(claimId) > 1}):
                errors.append(f"domain {domain.id}: duplicate capability claim '{claimId}'")
            for claim in domain.capabilityClaims:
                if claim.version < 1:
                    errors.append(f"claim {claim.id}: version must be positive")
                if not claim.statement.strip():
                    errors.append(f"claim {claim.id}: statement is required")
                for familyId in claim.requiredTaskFamilyIds:
                    family = self.taskFamilyById(familyId)
                    if family is None:
                        errors.append(f"claim {claim.id}: unknown task family '{familyId}'")
                    elif family.ownerDomainId != domain.id or family.ownerClaimId != claim.id:
                        errors.append(f"claim {claim.id}: task family '{familyId}' owner mismatch")
        for family in self.taskFamilies:
            if family.version < 1:
                errors.append(f"task family {family.id}: version must be positive")
            if family.artifactContractId and (family.artifactContractVersion or 0) < 1:
                errors.append(f"task family {family.id}: artifact contract version is required")
            if family.artifactContractId and family.applicationVariant is None:
                errors.append(f"task family {family.id}: artifact contract requires application variant")
            if family.ownerDomainId not in knownDomains:
                errors.append(f"task family {family.id}: unknown owner domain '{family.ownerDomainId}'")
                continue
            domain = self.domainById(family.ownerDomainId)
            claim = next((item for item in (domain.capabilityClaims if domain else []) if item.id == family.ownerClaimId), None)
            if claim is None:
                errors.append(f"task family {family.id}: unknown owner claim '{family.ownerClaimId}'")
            elif family.id not in claim.requiredTaskFamilyIds:
                errors.append(f"task family {family.id}: owner claim does not require it")
            if set(family.outcomeIds) - set(domain.targetOutcomes if domain else []):
                errors.append(f"task family {family.id}: outcome outside owner domain")
            sliceOutcomes = [evidenceSlice.outcomeId for evidenceSlice in family.evidenceSlices]
            if set(sliceOutcomes) != set(family.outcomeIds):
                errors.append(f"task family {family.id}: evidence slices must cover every outcome exactly")
            if len(sliceOutcomes) != len(set(sliceOutcomes)):
                errors.append(f"task family {family.id}: duplicate evidence slice outcome")
            for evidenceSlice in family.evidenceSlices:
                if evidenceSlice.outcomeId not in knownOutcomes:
                    errors.append(f"task family {family.id}: unknown outcome '{evidenceSlice.outcomeId}'")
                if not evidenceSlice.caseIds:
                    errors.append(f"task family {family.id}: evidence slice requires case ids")
            requiredModes = {"acquisition", "transfer", "retrieval"}
            if set(family.variants) != requiredModes:
                errors.append(f"task family {family.id}: acquisition, transfer, retrieval variants are required")
            variantIds = [variant.taskVariantId for variant in family.variants.values()]
            if len(variantIds) != len(set(variantIds)):
                errors.append(f"task family {family.id}: task variant ids must be distinct")
            for mode, variant in family.variants.items():
                if variant.taskVariantVersion < 1:
                    errors.append(f"task family {family.id}: {mode} variant version must be positive")
                if variant.lessonRef not in self.lessonOutcomes:
                    errors.append(f"task family {family.id}: unknown variant lesson '{variant.lessonRef}'")
            if not family.checkerCorpus.validAlternatives:
                errors.append(f"task family {family.id}: valid alternative corpus is required")
            if not family.checkerCorpus.requiredMutations:
                errors.append(f"task family {family.id}: required mutation corpus is required")
        for key, record in self.lessonOutcomes.items():
            for outcomeId in record.outcomes:
                if outcomeId not in knownOutcomes:
                    errors.append(
                        f"lesson {key}: unknown outcome '{outcomeId}'"
                    )
            for outcomeId in record.prerequisites:
                if outcomeId not in knownOutcomes:
                    errors.append(
                        f"lesson {key}: unknown prerequisite '{outcomeId}'"
                    )
            ownOutcomes = set(record.outcomes)
            for sectionId, sectionOutcomes in record.sectionOutcomes.items():
                for outcomeId in sectionOutcomes:
                    if outcomeId not in knownOutcomes:
                        errors.append(
                            f"lesson {key} §{sectionId}: unknown outcome '{outcomeId}'"
                        )
                    elif outcomeId not in ownOutcomes:
                        errors.append(
                            f"lesson {key} §{sectionId}: section outcome '{outcomeId}' not in lesson outcomes"
                        )
        return errors


def _defaultTaxonomyPath() -> Path:
    configured = os.environ.get("CODARO_STUDY_DIR")
    if configured:
        return Path(configured).expanduser().resolve() / "_taxonomy.yml"
    devRoot = Path(__file__).resolve().parents[3] / "curricula" / "python"
    if devRoot.exists():
        return devRoot / "_taxonomy.yml"
    return Path(__file__).resolve().parent.parent / "curricula" / "python" / "_taxonomy.yml"


def loadTaxonomy(path: str | Path | None = None) -> CurriculumTaxonomy:
    """Taxonomy YAML을 읽어서 검증된 모델로 반환한다.

    검증 에러는 ValueError로 묶어 던진다 — 잘못된 taxonomy는 빠르게 실패시킨다.
    """
    target = Path(path) if path else _defaultTaxonomyPath()
    if not target.exists():
        return CurriculumTaxonomy()
    with open(target, "r", encoding="utf-8") as file:
        payload = yaml.safe_load(file) or {}
    taxonomy = CurriculumTaxonomy(**payload)
    errors = taxonomy.validate()
    if errors:
        raise ValueError(
            "Curriculum taxonomy validation failed:\n  - "
            + "\n  - ".join(errors)
        )
    return taxonomy


def mergeLessonRecord(
    fromMeta: dict | None,
    fromTaxonomy: LessonOutcomeRecord | None,
) -> LessonOutcomeRecord:
    """레슨 메타 우선, taxonomy fallback으로 LessonOutcomeRecord 생성."""
    metaPayload = fromMeta or {}
    outcomes: Iterable[str] = (
        metaPayload.get("outcomes")
        if isinstance(metaPayload.get("outcomes"), list)
        else None
    ) or (fromTaxonomy.outcomes if fromTaxonomy else [])
    prerequisites: Iterable[str] = (
        metaPayload.get("prerequisites")
        if isinstance(metaPayload.get("prerequisites"), list)
        else None
    ) or (fromTaxonomy.prerequisites if fromTaxonomy else [])
    estimatedMinutes = metaPayload.get("estimatedMinutes")
    if not isinstance(estimatedMinutes, int) or estimatedMinutes <= 0:
        estimatedMinutes = fromTaxonomy.estimatedMinutes if fromTaxonomy else 0
    practicalDomain: Iterable[str] = (
        metaPayload.get("practicalDomain")
        if isinstance(metaPayload.get("practicalDomain"), list)
        else None
    ) or (fromTaxonomy.practicalDomain if fromTaxonomy else [])
    metaSectionOutcomes = metaPayload.get("sectionOutcomes")
    if isinstance(metaSectionOutcomes, dict):
        sectionOutcomes = {
            str(sid): [str(o) for o in sids if isinstance(o, str)]
            for sid, sids in metaSectionOutcomes.items()
            if isinstance(sids, list)
        }
    elif fromTaxonomy:
        sectionOutcomes = {k: list(v) for k, v in fromTaxonomy.sectionOutcomes.items()}
    else:
        sectionOutcomes = {}
    metaLessonRole = metaPayload.get("lessonRole")
    if isinstance(metaLessonRole, str) and metaLessonRole in {"concept", "practice", "project"}:
        lessonRole = metaLessonRole
    elif fromTaxonomy:
        lessonRole = fromTaxonomy.lessonRole
    else:
        lessonRole = "concept"
    return LessonOutcomeRecord(
        outcomes=[str(o) for o in outcomes if isinstance(o, str)],
        prerequisites=[str(p) for p in prerequisites if isinstance(p, str)],
        estimatedMinutes=int(estimatedMinutes or 0),
        practicalDomain=[str(d) for d in practicalDomain if isinstance(d, str)],
        sectionOutcomes=sectionOutcomes,
        lessonRole=lessonRole,
    )
