from __future__ import annotations

import hashlib
from pathlib import Path

from .pathPromotion import PathPromotionState, resolvePathPromotionState
from .taskFamily import buildTaskFamilyClosure, runCheckerDiscrimination
from .taxonomy import loadTaxonomy


REPORT_AUTOMATION_LESSONS = (
    "30days/day01_헬로월드",
    "30days/day02_변수와데이터타입",
    "30days/day03_연산자",
    "30days/day04_문자열기초",
    "30days/day07_리스트기초",
    "30days/day10_집합",
    "30days/day13_조건문",
    "30days/day15_함수기초",
    "30days/day18_모듈과import",
    "30days/day20_예외처리",
    "30days/day30_최종프로젝트",
)


def evaluateReportAutomationPublication(*, runDiscrimination: bool = True) -> PathPromotionState:
    taxonomy = loadTaxonomy()
    domain = taxonomy.domainById("reportAutomationFoundation")
    closure = buildTaskFamilyClosure("reportAutomationFoundation", taxonomy=taxonomy)
    familyIds = {
        family.id
        for family in taxonomy.taskFamilies
        if family.ownerDomainId == "reportAutomationFoundation"
    }
    capstone = taxonomy.taskFamilyById("python.report.delivery")
    discriminationPassed = (
        runCheckerDiscrimination("reportAutomationFoundation", taxonomy=taxonomy).passed
        if runDiscrimination
        else True
    )
    pathStructure = bool(
        domain
        and all(lessonRef in taxonomy.lessonOutcomes for lessonRef in REPORT_AUTOMATION_LESSONS)
        and set(domain.targetOutcomes) == {
            outcomeId
            for family in taxonomy.taskFamilies
            if family.ownerDomainId == domain.id
            for outcomeId in family.outcomeIds
        }
    )
    assessmentProgression = closure.closed and len(closure.rows) == 13
    capstoneContract = bool(
        capstone
        and capstone.applicationVariant
        and capstone.artifactContractId == "python.report.json.v1"
        and capstone.artifactContractVersion == 1
    )
    authoringIntegrity = bool(
        domain
        and familyIds == {
            familyId
            for claim in domain.capabilityClaims
            for familyId in claim.requiredTaskFamilyIds
        }
        and all(claim.version > 0 for claim in domain.capabilityClaims)
        and all(family.version > 0 for family in taxonomy.taskFamilies if family.id in familyIds)
    )
    capstonePath = _curriculaRoot() / "basics" / "30days" / "day30_최종프로젝트.yaml"
    contentHash = "sha256-" + hashlib.sha256(capstonePath.read_bytes()).hexdigest()
    return resolvePathPromotionState(
        pathId="reportAutomationFoundation",
        contentHash=contentHash,
        machineChecks={
            "pathStructure": pathStructure,
            "assessmentProgression": assessmentProgression,
            "capstoneContract": capstoneContract,
            "solutionExecution": discriminationPassed,
            "authoringIntegrity": authoringIntegrity,
        },
        capabilityContractComplete=(
            pathStructure
            and assessmentProgression
            and capstoneContract
            and discriminationPassed
            and authoringIntegrity
        ),
    )


def _curriculaRoot() -> Path:
    return Path(__file__).resolve().parents[3] / "curricula" / "python"
