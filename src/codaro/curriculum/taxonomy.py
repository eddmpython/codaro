"""Curriculum OS 분류 체계 로더.

`curricula/python/_taxonomy.yml`을 SSOT로 읽어서 outcomes/domains/lesson 매핑을
제공한다. 레슨 YAML의 meta.outcomes/meta.prerequisites가 있으면 그쪽이 우선이고,
taxonomy.lessonOutcomes는 backfill 용도다.
"""
from __future__ import annotations

from pathlib import Path
from typing import Iterable

import yaml
from pydantic import BaseModel, Field


class OutcomeDef(BaseModel):
    id: str
    label: str
    description: str = ""


class DomainDef(BaseModel):
    id: str
    label: str
    description: str = ""
    targetOutcomes: list[str] = Field(default_factory=list)


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
        for domain in self.domains:
            for outcomeId in domain.targetOutcomes:
                if outcomeId not in knownOutcomes:
                    errors.append(
                        f"domain {domain.id}: unknown outcome '{outcomeId}'"
                    )
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
    return Path(__file__).resolve().parents[3] / "curricula" / "python" / "_taxonomy.yml"


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
