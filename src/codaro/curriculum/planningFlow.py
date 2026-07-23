from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field

from .learnerState import LearnerStateStore
from .osCache import CurriculumOsCache
from .planComposer import MasterPlan, PlanGoal, composeMasterPlan
from .progress import ProgressTracker


class CurriculumPlanningError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass(frozen=True)
class CurriculumMasterPlanInput:
    domain: str | None = None
    outcomes: list[str] = field(default_factory=list)
    excludeCompleted: bool = True
    excludeKeys: list[str] = field(default_factory=list)
    skipMasteredOutcomes: bool = False
    maxMinutes: int = 0
    projectIntent: str = ""
    deliverableOnly: bool = False
    adaptiveSkip: bool = True


def composeCurriculumMasterPlan(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
    learnerStateStore: LearnerStateStore | None,
    request: CurriculumMasterPlanInput,
    learningEvents: Iterable[Mapping[str, object]] = (),
) -> MasterPlan:
    taxonomy = curriculumOs.taxonomy()
    if request.domain and not taxonomy.domainById(request.domain):
        raise CurriculumPlanningError(
            "curriculum_unknown_domain",
            f"Unknown domain: {request.domain}",
        )
    for outcomeId in request.outcomes:
        if not taxonomy.hasOutcome(outcomeId):
            raise CurriculumPlanningError(
                "curriculum_unknown_outcome",
                f"Unknown outcome: {outcomeId}",
            )
    return composeMasterPlan(
        PlanGoal(
            domain=request.domain,
            outcomes=request.outcomes,
            excludeCompleted=request.excludeCompleted,
            excludeKeys=request.excludeKeys,
            skipMasteredOutcomes=request.skipMasteredOutcomes,
            maxMinutes=request.maxMinutes,
            projectIntent=request.projectIntent,
            deliverableOnly=request.deliverableOnly,
            adaptiveSkip=request.adaptiveSkip,
        ),
        curriculumOs.graph(),
        taxonomy,
        progressTracker,
        learnerStateStore=learnerStateStore,
        learningEvents=learningEvents,
    )


def buildCurriculumGapsPayload(
    *,
    curriculumOs: CurriculumOsCache,
    domain: str | None = None,
) -> dict[str, object]:
    taxonomy = curriculumOs.taxonomy()
    graph = curriculumOs.graph()
    covered = graph.coveredOutcomes()
    domainsOfInterest = taxonomy.domains
    if domain:
        singleDomain = taxonomy.domainById(domain)
        if singleDomain is None:
            raise CurriculumPlanningError(
                "curriculum_unknown_domain",
                f"Unknown domain: {domain}",
            )
        domainsOfInterest = [singleDomain]

    gaps: list[dict[str, object]] = []
    for currentDomain in domainsOfInterest:
        missing = [outcomeId for outcomeId in currentDomain.targetOutcomes if outcomeId not in covered]
        if missing:
            gaps.append({
                "domainId": currentDomain.id,
                "domainLabel": currentDomain.label,
                "missing": [
                    {
                        "outcomeId": outcomeId,
                        "outcomeLabel": taxonomy.outcomeLabel(outcomeId),
                    }
                    for outcomeId in missing
                ],
            })
    return {"gaps": gaps}
