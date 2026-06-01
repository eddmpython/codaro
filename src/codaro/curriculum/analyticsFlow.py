from __future__ import annotations

import time

from .analyticsTimeline import AnalyticsTimeline, buildSnapshot
from .learnerState import LearnerStateStore
from .learnerStateBridge import UnifiedMasteryReport, buildUnifiedMastery
from .osCache import CurriculumOsCache
from .outcomeMastery import MasteryReport, computeMastery, masteredOutcomeIds
from .progress import ProgressTracker


class CurriculumAnalyticsError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class CurriculumAnalyticsFlow:
    def __init__(
        self,
        *,
        curriculumOs: CurriculumOsCache,
        progressTracker: ProgressTracker,
        learnerStateStore: LearnerStateStore | None,
        analyticsTimeline: AnalyticsTimeline,
        refreshIntervalSeconds: float = 30.0,
    ) -> None:
        self._curriculumOs = curriculumOs
        self._progressTracker = progressTracker
        self._learnerStateStore = learnerStateStore
        self._analyticsTimeline = analyticsTimeline
        self._refreshIntervalSeconds = refreshIntervalSeconds
        self._lastRefreshAt = 0.0

    def masteryReport(self) -> MasteryReport:
        taxonomy = self._curriculumOs.taxonomy()
        graph = self._curriculumOs.graph()
        validated = self._progressTracker.listValidatedOutcomes()
        return computeMastery(graph, taxonomy, self._progressTracker, validated)

    def unifiedMasteryReport(self) -> UnifiedMasteryReport:
        taxonomy = self._curriculumOs.taxonomy()
        graph = self._curriculumOs.graph()
        return buildUnifiedMastery(
            self._progressTracker,
            self._learnerStateStore,
            taxonomy,
            graph,
        )

    def analyticsPayload(self, *, days: int = 30) -> dict[str, object]:
        self.refreshSnapshot()
        snapshots = self._analyticsTimeline.loadRange()
        if days > 0 and len(snapshots) > days:
            snapshots = snapshots[-days:]
        return {
            "snapshots": [snapshot.model_dump() for snapshot in snapshots],
            "totalSnapshots": len(snapshots),
        }

    def analyticsSummaryPayload(self) -> dict[str, object]:
        self.refreshSnapshot()
        snapshots = self._analyticsTimeline.loadRange()
        if not snapshots:
            return {"available": False}
        latest = snapshots[-1]
        first = snapshots[0]
        recent30 = snapshots[-30:] if len(snapshots) > 30 else snapshots
        hintHistogram: dict[str, int] = {}
        domainTouches: dict[str, int] = {}
        for snapshot in recent30:
            for key, value in snapshot.hintLevelHistogram.items():
                hintHistogram[key] = hintHistogram.get(key, 0) + value
            for domain in snapshot.domainsTouched:
                domainTouches[domain] = domainTouches.get(domain, 0) + 1
        return {
            "available": True,
            "firstDate": first.date,
            "latestDate": latest.date,
            "currentMastered": latest.masteredCount,
            "totalOutcomes": latest.totalOutcomes,
            "recent30": {
                "lessons": sum(snapshot.lessonsCompletedToday for snapshot in recent30),
                "sections": sum(snapshot.sectionsCompletedToday for snapshot in recent30),
                "credits": sum(snapshot.creditsToday for snapshot in recent30),
                "hintHistogram": hintHistogram,
                "domainTouches": dict(sorted(domainTouches.items(), key=lambda item: -item[1])),
            },
            "totalSnapshots": len(snapshots),
        }

    def refreshSnapshot(self) -> bool:
        now = time.monotonic()
        if now - self._lastRefreshAt < self._refreshIntervalSeconds:
            return False
        self._lastRefreshAt = now
        snapshot = buildSnapshot(self._progressTracker, self.masteryReport())
        return self._analyticsTimeline.append(snapshot)


def buildOutcomeMasteryPayload(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
    domain: str | None = None,
    minLevel: float = 0.0,
) -> dict[str, object]:
    taxonomy = curriculumOs.taxonomy()
    if domain and not taxonomy.domainById(domain):
        raise CurriculumAnalyticsError(
            "curriculum_unknown_domain",
            f"Unknown domain: {domain}",
        )
    report = computeMastery(
        curriculumOs.graph(),
        taxonomy,
        progressTracker,
        progressTracker.listValidatedOutcomes(),
    )
    outcomes = [
        entry.model_dump()
        for entry in report.outcomes
        if entry.level >= float(minLevel)
    ]
    if domain:
        target = taxonomy.domainById(domain)
        if target is not None:
            wanted = set(target.targetOutcomes)
            outcomes = [outcome for outcome in outcomes if outcome["outcomeId"] in wanted]
    domains = [entry.model_dump() for entry in report.domains]
    if domain:
        domains = [entry for entry in domains if entry["domainId"] == domain]
    return {
        "outcomes": outcomes,
        "domains": domains,
        "masteredOutcomeCount": report.masteredOutcomeCount,
        "totalOutcomeCount": report.totalOutcomeCount,
        "masteredOutcomeIds": sorted(masteredOutcomeIds(report)),
    }
