from __future__ import annotations

import json
from collections.abc import Iterable, Mapping
from copy import deepcopy
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from importlib.resources import files
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from .learningEvent import (
    LearningEventError,
    learningEventOrderKey,
    validateLearningEvent,
)


MasteryStage = Literal[
    "unproven",
    "practicing",
    "independent",
    "transfer",
    "mastered",
    "reviewDue",
]


class OutcomeMasteryState(BaseModel):
    model_config = ConfigDict(extra="forbid")

    outcomeId: str
    stage: MasteryStage = "unproven"
    score: float = 0.0
    reviewDue: bool = False
    creditEventIds: list[str] = Field(default_factory=list)
    taskVariantIds: list[str] = Field(default_factory=list)
    fixtureHashes: list[str] = Field(default_factory=list)
    lastEvidenceTime: str | None = None
    dueAt: str | None = None


class MasteryProjection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    policyVersion: int = 1
    outcomes: list[OutcomeMasteryState] = Field(default_factory=list)
    invalidEventIds: list[str] = Field(default_factory=list)


@dataclass(slots=True)
class _OutcomeAccumulator:
    outcomeId: str
    baseStage: str = "unproven"
    reviewDue: bool = False
    creditEventIds: list[str] = field(default_factory=list)
    taskVariantIds: list[str] = field(default_factory=list)
    fixtureHashes: list[str] = field(default_factory=list)
    fingerprints: set[str] = field(default_factory=set)
    lastEvidenceTime: datetime | None = None
    dueAt: datetime | None = None

    @property
    def causalStage(self) -> str:
        return "reviewDue" if self.reviewDue else self.baseStage


class MasteryPolicy:
    def __init__(self) -> None:
        policyPath = files("codaro.generatedContracts").joinpath("masteryPolicy.v1.json")
        self._contract = json.loads(policyPath.read_text(encoding="utf-8"))
        self._validateContract()
        self._scores: dict[str, float] = {
            key: float(value)
            for key, value in self._contract["scores"].items()
        }
        self._modeRank = {
            mode: index
            for index, mode in enumerate(self._contract["modePriority"])
        }

    @property
    def version(self) -> int:
        return int(self._contract["version"])

    def reduce(
        self,
        events: Iterable[object],
        *,
        asOf: str | datetime | None = None,
    ) -> MasteryProjection:
        normalized, invalidEventIds = self._normalizeEvents(events)
        revoked = {
            eventId
            for event in normalized
            if event["kind"] == "EvidenceTombstoned"
            for eventId in event["revokedCreditEventIds"]
        }
        ordered = sorted(normalized, key=learningEventOrderKey)
        orderIndex = {str(event["eventId"]): index for index, event in enumerate(ordered)}
        runs = {str(event["eventId"]): event for event in ordered if event["kind"] == "RunObserved"}
        checks = {str(event["eventId"]): event for event in ordered if event["kind"] == "CheckEvaluated"}
        supports = {str(event["eventId"]): event for event in ordered if event["kind"] == "SupportProvided"}
        states: dict[str, _OutcomeAccumulator] = {}

        for event in ordered:
            kind = str(event["kind"])
            if kind == "CheckEvaluated":
                self._applyRetrievalFailure(event, runs, states)
                continue
            if kind != self._contract["creditEventKind"] or event["eventId"] in revoked:
                continue
            before = deepcopy(states)
            if not self._applyCredit(
                event,
                runs=runs,
                checks=checks,
                supports=supports,
                orderIndex=orderIndex,
                states=states,
            ):
                states = before
                invalidEventIds.add(str(event["eventId"]))

        projectionTime = self._projectionTime(asOf, ordered)
        if projectionTime is not None:
            for state in states.values():
                if state.dueAt is not None and projectionTime >= state.dueAt:
                    state.reviewDue = True
        outcomes = [self._buildOutcomeState(state) for state in states.values()]
        return MasteryProjection(
            policyVersion=self.version,
            outcomes=sorted(outcomes, key=lambda item: item.outcomeId),
            invalidEventIds=sorted(invalidEventIds),
        )

    def _normalizeEvents(self, events: Iterable[object]) -> tuple[list[dict[str, Any]], set[str]]:
        normalized: list[dict[str, Any]] = []
        invalidEventIds: set[str] = set()
        seen: dict[str, dict[str, Any]] = {}
        nonCreditKinds = set(self._contract["nonCreditEventKinds"])
        for raw in events:
            rawEventId = str(raw.get("eventId") or "") if isinstance(raw, Mapping) else ""
            rawKind = str(raw.get("kind") or "") if isinstance(raw, Mapping) else ""
            if rawKind in nonCreditKinds and rawKind not in {
                "RunObserved",
                "CheckEvaluated",
                "SupportProvided",
                "MigrationImported",
            }:
                continue
            try:
                event = validateLearningEvent(raw)
            except LearningEventError:
                if rawKind == "MigrationImported":
                    continue
                invalidEventIds.add(rawEventId or "<missing-event-id>")
                continue
            eventId = str(event["eventId"])
            existing = seen.get(eventId)
            if existing is not None:
                if existing != event:
                    invalidEventIds.add(eventId)
                continue
            seen[eventId] = event
            normalized.append(event)
        return normalized, invalidEventIds

    def _applyRetrievalFailure(
        self,
        check: Mapping[str, Any],
        runs: Mapping[str, Mapping[str, Any]],
        states: dict[str, _OutcomeAccumulator],
    ) -> None:
        if (
            check["assessmentMode"] != "retrieval"
            or check["strength"] != "strong"
            or check["passed"] is not False
        ):
            return
        run = runs.get(str(check["runEventId"]))
        if run is None:
            return
        context = run["runContext"]
        for outcomeId in context["outcomeIds"]:
            state = states.get(str(outcomeId))
            if state is not None and self._stageRank(state.baseStage) >= self._stageRank("transfer"):
                state.reviewDue = True

    def _applyCredit(
        self,
        event: Mapping[str, Any],
        *,
        runs: Mapping[str, Mapping[str, Any]],
        checks: Mapping[str, Mapping[str, Any]],
        supports: Mapping[str, Mapping[str, Any]],
        orderIndex: Mapping[str, int],
        states: dict[str, _OutcomeAccumulator],
    ) -> bool:
        eventId = str(event["eventId"])
        eventPosition = orderIndex[eventId]
        runEventId = str(event["runEventId"])
        run = runs.get(runEventId)
        if run is None or orderIndex.get(runEventId, eventPosition) >= eventPosition:
            return False
        if run["runStatus"] != "success":
            return False
        selectedChecks = [checks.get(str(checkId)) for checkId in event["checkEventIds"]]
        if any(check is None for check in selectedChecks):
            return False
        checked = [check for check in selectedChecks if check is not None]
        if any(
            check["runEventId"] != runEventId
            or check["strength"] != "strong"
            or check["passed"] is not True
            or orderIndex.get(str(check["eventId"]), eventPosition) >= eventPosition
            for check in checked
        ):
            return False
        selectedSupports = [supports.get(str(supportId)) for supportId in event["supportEventIds"]]
        if any(support is None for support in selectedSupports):
            return False
        supportRows = [support for support in selectedSupports if support is not None]
        if any(
            support["runEventId"] != runEventId
            or orderIndex.get(str(support["eventId"]), eventPosition) >= eventPosition
            for support in supportRows
        ):
            return False
        maxHintUsed = max((int(support["hintLevel"]) for support in supportRows), default=0)
        answerReveal = any(bool(support["answerReveal"]) for support in supportRows)
        strongestMode = max(
            (str(check["assessmentMode"]) for check in checked),
            key=self._modeRank.__getitem__,
        )
        unseen = all(bool(check["unseen"]) for check in checked)
        context = run["runContext"]
        taskVariantId = str(context["taskVariantId"])
        fixtureHash = str(context["fixtureHash"])
        evidenceTime = self._parseTimestamp(str(event["evidenceTime"]))
        fingerprint = str(event["attemptFingerprint"])

        for creditSlice in event["creditSlices"]:
            outcomeId = str(creditSlice["outcomeId"])
            mode = str(creditSlice["creditMode"])
            if mode != strongestMode or outcomeId not in context["outcomeIds"]:
                return False
            state = states.setdefault(outcomeId, _OutcomeAccumulator(outcomeId=outcomeId))
            if state.dueAt is not None and evidenceTime >= state.dueAt:
                state.reviewDue = True
            if creditSlice["preAttemptState"] != state.causalStage:
                return False
            if fingerprint in state.fingerprints:
                return False
            if not self._advance(
                state,
                mode=mode,
                unseen=unseen,
                maxHintUsed=maxHintUsed,
                answerReveal=answerReveal,
                taskVariantId=taskVariantId,
                fixtureHash=fixtureHash,
                evidenceTime=evidenceTime,
            ):
                return False
            state.fingerprints.add(fingerprint)
            state.creditEventIds.append(eventId)
            if taskVariantId not in state.taskVariantIds:
                state.taskVariantIds.append(taskVariantId)
            if fixtureHash not in state.fixtureHashes:
                state.fixtureHashes.append(fixtureHash)
            state.lastEvidenceTime = evidenceTime
        return True

    def _advance(
        self,
        state: _OutcomeAccumulator,
        *,
        mode: str,
        unseen: bool,
        maxHintUsed: int,
        answerReveal: bool,
        taskVariantId: str,
        fixtureHash: str,
        evidenceTime: datetime,
    ) -> bool:
        independentEligible = (
            unseen
            and not answerReveal
            and maxHintUsed <= int(self._contract["independentMaxHintLevel"])
        )
        higherStageEligible = (
            unseen
            and not answerReveal
            and maxHintUsed <= int(self._contract["higherStageMaxHintLevel"])
        )
        if mode in {"acquisition", "reinforcement", "capstone"}:
            if independentEligible and self._stageRank(state.baseStage) < self._stageRank("independent"):
                state.baseStage = "independent"
            elif state.baseStage == "unproven":
                state.baseStage = "practicing"
            state.reviewDue = False
            return True
        if mode == "transfer":
            if self._stageRank(state.baseStage) < self._stageRank("independent") or not higherStageEligible:
                return False
            if taskVariantId in state.taskVariantIds:
                return False
            state.baseStage = "transfer"
            state.reviewDue = False
            return True
        if mode == "retrieval":
            renewingMastery = (
                state.baseStage == "mastered"
                and state.dueAt is not None
                and evidenceTime >= state.dueAt
            )
            if renewingMastery:
                if not higherStageEligible:
                    return False
                state.reviewDue = False
                state.dueAt = evidenceTime + timedelta(
                    days=int(self._contract["retrievalWindowDays"]["maximum"])
                )
                return True
            if self._stageRank(state.baseStage) < self._stageRank("transfer") or not higherStageEligible:
                return False
            if taskVariantId in state.taskVariantIds:
                return False
            if state.lastEvidenceTime is None:
                return False
            elapsed = evidenceTime - state.lastEvidenceTime
            window = self._contract["retrievalWindowDays"]
            if elapsed < timedelta(days=int(window["minimum"])):
                return False
            if elapsed > timedelta(days=int(window["maximum"])):
                return False
            distinctVariants = len(set(state.taskVariantIds) | {taskVariantId})
            if distinctVariants < int(self._contract["minimumDistinctTaskVariantsForMastered"]):
                return False
            state.baseStage = "mastered"
            state.reviewDue = False
            state.dueAt = evidenceTime + timedelta(days=int(window["maximum"]))
            return True
        return False

    def _buildOutcomeState(self, state: _OutcomeAccumulator) -> OutcomeMasteryState:
        stage: MasteryStage = "reviewDue" if state.reviewDue else state.baseStage  # type: ignore[assignment]
        return OutcomeMasteryState(
            outcomeId=state.outcomeId,
            stage=stage,
            score=self._scores[state.baseStage],
            reviewDue=state.reviewDue,
            creditEventIds=list(state.creditEventIds),
            taskVariantIds=list(state.taskVariantIds),
            fixtureHashes=list(state.fixtureHashes),
            lastEvidenceTime=self._formatTimestamp(state.lastEvidenceTime),
            dueAt=self._formatTimestamp(state.dueAt),
        )

    def _projectionTime(
        self,
        value: str | datetime | None,
        events: list[Mapping[str, Any]],
    ) -> datetime | None:
        if isinstance(value, datetime):
            if value.tzinfo is None:
                raise ValueError("asOf must include a timezone")
            return value
        if isinstance(value, str):
            return self._parseTimestamp(value)
        receipts = [
            self._parseTimestamp(str(event["appendReceiptAt"]))
            for event in events
            if event["kind"] == "CreditGranted"
        ]
        return max(receipts, default=None)

    @staticmethod
    def _parseTimestamp(value: str) -> datetime:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))

    @staticmethod
    def _formatTimestamp(value: datetime | None) -> str | None:
        if value is None:
            return None
        return value.astimezone(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")

    @staticmethod
    def _stageRank(stage: str) -> int:
        base = "mastered" if stage == "reviewDue" else stage
        return {
            "unproven": 0,
            "practicing": 1,
            "independent": 2,
            "transfer": 3,
            "mastered": 4,
        }[base]

    def _validateContract(self) -> None:
        if self._contract.get("policyId") != "mastery-policy-v1" or self._contract.get("version") != 1:
            raise RuntimeError("mastery policy contract identity is invalid")
        expectedStages = {"unproven", "practicing", "independent", "transfer", "mastered"}
        if set(self._contract.get("scores", {})) != expectedStages:
            raise RuntimeError("mastery policy score stages are invalid")
        if self._contract.get("creditEventKind") != "CreditGranted":
            raise RuntimeError("mastery policy credit event kind is invalid")
