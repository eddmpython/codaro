from __future__ import annotations

from codaro.curriculum.taskFamily import buildTaskFamilyClosure, runCheckerDiscrimination
from codaro.curriculum.taxonomy import loadTaxonomy


def testReportAutomationTaskFamilyContractIsClosed() -> None:
    report = buildTaskFamilyClosure("reportAutomationFoundation")

    assert report.closed, report.errors
    assert len(report.taskFamilyIds) == 4
    assert len(report.rows) == 13


def testTaskFamilyOwnersAndClaimTargetOutcomesAreClosed() -> None:
    taxonomy = loadTaxonomy()
    domain = taxonomy.domainById("reportAutomationFoundation")

    assert domain is not None
    familyOutcomes = {
        outcomeId
        for family in taxonomy.taskFamilies
        if family.ownerDomainId == domain.id
        for outcomeId in family.outcomeIds
    }
    assert familyOutcomes == set(domain.targetOutcomes)
    assert {family.ownerClaimId for family in taxonomy.taskFamilies if family.ownerDomainId == domain.id} == {
        claim.id for claim in domain.capabilityClaims
    }


def testReportAutomationCheckerDiscriminatesAlternativesAndMutants() -> None:
    report = runCheckerDiscrimination("reportAutomationFoundation")

    assert report.passed, report.model_dump()
    assert report.referencePasses == 13
    assert report.alternativePasses == 13
    assert report.mutantRejections == 26
