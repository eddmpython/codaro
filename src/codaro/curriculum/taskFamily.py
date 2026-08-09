from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field

from .localStrongCheck import runLocalStrongCheck
from .taxonomy import CurriculumTaxonomy, TaskFamilyDef, loadTaxonomy


ASSESSMENT_COLLECTIONS = {
    "acquisition": "masteryVariants",
    "transfer": "transferVariants",
    "retrieval": "retrievalVariants",
    "application": "applicationVariants",
}


class TaskFamilyClosureRow(BaseModel):
    taskFamilyId: str
    mode: str
    lessonRef: str
    sectionId: str
    checkSpecId: str
    caseIds: list[str] = Field(default_factory=list)


class TaskFamilyClosureReport(BaseModel):
    domainId: str
    claimIds: list[str]
    taskFamilyIds: list[str]
    rows: list[TaskFamilyClosureRow]
    errors: list[str] = Field(default_factory=list)

    @property
    def closed(self) -> bool:
        return not self.errors


class CheckerDiscriminationReport(BaseModel):
    referencePasses: int = 0
    alternativePasses: int = 0
    mutantRejections: int = 0
    falseRejects: list[str] = Field(default_factory=list)
    falseAccepts: list[str] = Field(default_factory=list)

    @property
    def passed(self) -> bool:
        return not self.falseRejects and not self.falseAccepts


def buildTaskFamilyClosure(
    domainId: str,
    *,
    taxonomy: CurriculumTaxonomy | None = None,
    curriculaRoot: Path | None = None,
) -> TaskFamilyClosureReport:
    resolvedTaxonomy = taxonomy or loadTaxonomy()
    root = curriculaRoot or _defaultCurriculaRoot()
    domain = resolvedTaxonomy.domainById(domainId)
    if domain is None:
        return TaskFamilyClosureReport(
            domainId=domainId,
            claimIds=[],
            taskFamilyIds=[],
            rows=[],
            errors=[f"unknown domain '{domainId}'"],
        )
    familyIds = [
        familyId
        for claim in domain.capabilityClaims
        for familyId in claim.requiredTaskFamilyIds
    ]
    rows: list[TaskFamilyClosureRow] = []
    errors: list[str] = []
    for familyId in familyIds:
        family = resolvedTaxonomy.taskFamilyById(familyId)
        if family is None:
            errors.append(f"{familyId}: task family is missing")
            continue
        familyRows, familyErrors = _closeFamily(root, family)
        rows.extend(familyRows)
        errors.extend(familyErrors)
    return TaskFamilyClosureReport(
        domainId=domainId,
        claimIds=[claim.id for claim in domain.capabilityClaims],
        taskFamilyIds=familyIds,
        rows=rows,
        errors=errors,
    )


def runCheckerDiscrimination(
    domainId: str,
    *,
    taxonomy: CurriculumTaxonomy | None = None,
    curriculaRoot: Path | None = None,
) -> CheckerDiscriminationReport:
    resolvedTaxonomy = taxonomy or loadTaxonomy()
    root = curriculaRoot or _defaultCurriculaRoot()
    domain = resolvedTaxonomy.domainById(domainId)
    report = CheckerDiscriminationReport()
    if domain is None:
        report.falseRejects.append(f"unknown domain '{domainId}'")
        return report
    for claim in domain.capabilityClaims:
        for familyId in claim.requiredTaskFamilyIds:
            family = resolvedTaxonomy.taskFamilyById(familyId)
            if family is None:
                report.falseRejects.append(f"{familyId}: task family is missing")
                continue
            variants = list(family.variants.items())
            if family.applicationVariant is not None:
                variants.append(("application", family.applicationVariant))
            for mode, variantRef in variants:
                section = _loadVariant(root, family, mode)
                exercise = _mapValue(section.get("exercise"))
                check = _mapValue(section.get("check"))
                solution = _textValue(exercise.get("solution"))
                starter = _textValue(exercise.get("starterCode"))
                label = f"{family.id}/{variantRef.taskVariantId}"
                _expectPass(report, check, solution, f"{label}:reference", "reference")
                for alternative in family.checkerCorpus.validAlternatives:
                    if alternative == "commentPreserving":
                        source = solution.rstrip() + "\n# 계약과 무관한 표현 차이\n"
                    else:
                        report.falseRejects.append(f"{label}: unknown alternative {alternative}")
                        continue
                    _expectPass(report, check, source, f"{label}:{alternative}", "alternative")
                for mutation in family.checkerCorpus.requiredMutations:
                    if mutation == "zeroEdit":
                        source = starter
                    elif mutation == "constantReturn":
                        source = _constantReturnMutation(check)
                    else:
                        reason = family.checkerCorpus.notApplicable.get(mutation)
                        if reason:
                            continue
                        report.falseAccepts.append(f"{label}: unknown required mutation {mutation}")
                        continue
                    _expectReject(report, check, source, f"{label}:{mutation}")
    return report


def _closeFamily(root: Path, family: TaskFamilyDef) -> tuple[list[TaskFamilyClosureRow], list[str]]:
    rows: list[TaskFamilyClosureRow] = []
    errors: list[str] = []
    declaredCases = {
        caseId
        for evidenceSlice in family.evidenceSlices
        for caseId in evidenceSlice.caseIds
    }
    observedCases: set[str] = set()
    variants = list(family.variants.items())
    if family.applicationVariant is not None:
        variants.append(("application", family.applicationVariant))
    for mode, variantRef in variants:
        try:
            section = _loadVariant(root, family, mode)
        except ValueError as error:
            errors.append(str(error))
            continue
        expectedFields: dict[str, object] = {
            "assessmentRole": "application" if mode == "application" else "assurance",
            "capabilityClaimId": family.ownerClaimId,
            "taskFamilyId": family.id,
            "taskFamilyVersion": family.version,
            "taskVariantId": variantRef.taskVariantId,
            "taskVariantVersion": variantRef.taskVariantVersion,
        }
        expectedMode = "capstone" if mode == "application" else "acquisition" if mode == "acquisition" else mode
        actualMode = section.get("assessmentMode") or section.get("mode")
        if actualMode == "mastery":
            actualMode = "acquisition"
        if actualMode != expectedMode:
            errors.append(f"{family.id}/{mode}: assessmentMode mismatch")
        for fieldName, expected in expectedFields.items():
            if section.get(fieldName) != expected:
                errors.append(f"{family.id}/{mode}: {fieldName} mismatch")
        check = _mapValue(section.get("check"))
        if check.get("id") != variantRef.checkSpecId:
            errors.append(f"{family.id}/{mode}: checkSpecId mismatch")
        if check.get("fixtureHash") != variantRef.fixtureHash:
            errors.append(f"{family.id}/{mode}: fixtureHash mismatch")
        if check.get("strength") != "strong":
            errors.append(f"{family.id}/{mode}: strong check is required")
        payload = _mapValue(check.get("payload"))
        caseIds = [
            _textValue(case.get("id"))
            for case in _arrayOfMaps(payload.get("cases"))
            if _textValue(case.get("id"))
        ]
        observedCases.update(caseIds)
        rows.append(TaskFamilyClosureRow(
            taskFamilyId=family.id,
            mode=mode,
            lessonRef=variantRef.lessonRef,
            sectionId=variantRef.sectionId,
            checkSpecId=variantRef.checkSpecId,
            caseIds=caseIds,
        ))
    if observedCases != declaredCases:
        errors.append(
            f"{family.id}: evidence slice cases mismatch, "
            f"missing={sorted(observedCases - declaredCases)}, stale={sorted(declaredCases - observedCases)}"
        )
    return rows, errors


def _loadVariant(root: Path, family: TaskFamilyDef, mode: str) -> dict[str, Any]:
    variantRef = family.applicationVariant if mode == "application" else family.variants[mode]
    if variantRef is None:
        raise ValueError(f"{family.id}/{mode}: variant is missing")
    path = _lessonPath(root, variantRef.lessonRef)
    payload = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    assessment = _mapValue(payload.get("assessment"))
    collection = ASSESSMENT_COLLECTIONS[mode]
    matches = [
        variant
        for variant in _arrayOfMaps(assessment.get(collection))
        if variant.get("id") == variantRef.sectionId
    ]
    if len(matches) != 1:
        raise ValueError(f"{family.id}/{mode}: expected one section '{variantRef.sectionId}'")
    return matches[0]


def _lessonPath(root: Path, lessonRef: str) -> Path:
    category, contentId = lessonRef.split("/", 1)
    matches = [
        path
        for path in root.rglob(f"{contentId}.yaml")
        if path.parent.name == category
    ]
    if len(matches) != 1:
        raise ValueError(f"lesson '{lessonRef}' resolved to {len(matches)} files")
    return matches[0]


def _expectPass(
    report: CheckerDiscriminationReport,
    check: dict[str, Any],
    source: str,
    label: str,
    kind: str,
) -> None:
    result = runLocalStrongCheck(check, source)
    if result.get("passed") is not True:
        report.falseRejects.append(label)
    elif kind == "reference":
        report.referencePasses += 1
    else:
        report.alternativePasses += 1


def _expectReject(
    report: CheckerDiscriminationReport,
    check: dict[str, Any],
    source: str,
    label: str,
) -> None:
    result = runLocalStrongCheck(check, source)
    if result.get("passed") is True:
        report.falseAccepts.append(label)
    else:
        report.mutantRejections += 1


def _constantReturnMutation(check: dict[str, Any]) -> str:
    payload = _mapValue(check.get("payload"))
    entry = _textValue(payload.get("entry"))
    cases = _arrayOfMaps(payload.get("cases"))
    first = cases[0] if cases else {}
    value = first.get("expectedReturn")
    encoded = repr(json.loads(json.dumps(value, ensure_ascii=False)))
    return f"def {entry}(*args):\n    return {encoded}\n"


def _defaultCurriculaRoot() -> Path:
    return Path(__file__).resolve().parents[3] / "curricula" / "python"


def _mapValue(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _arrayOfMaps(value: Any) -> list[dict[str, Any]]:
    return [item for item in value if isinstance(item, dict)] if isinstance(value, list) else []


def _textValue(value: Any) -> str:
    return "" if value is None else str(value)
