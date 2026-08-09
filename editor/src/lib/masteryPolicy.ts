import policyContract from "@/lib/generatedContracts/masteryPolicy.v2.json";
import {
  clockAnomalies,
  evidenceAvailabilityTime,
  parseEvidenceTime,
  type ClockAnomaly,
  type EvidenceTime,
} from "@/lib/evidenceTime";
import {
  compareLearningEvents,
  type CreditMode,
  type LearningEvent,
  type MasteryStage,
  validateLearningEvent,
} from "@/lib/learningEvent";

export type OutcomeMasteryState = {
  outcomeId: string;
  stage: MasteryStage;
  score: number;
  reviewDue: boolean;
  creditEventIds: string[];
  taskVariantIds: string[];
  fixtureHashes: string[];
  lastEvidenceTime: string | null;
  lastAppendReceiptAt: string | null;
  dueAt: string | null;
};

export type MasteryProjection = {
  policyVersion: 2;
  outcomes: OutcomeMasteryState[];
  invalidEventIds: string[];
  deferredCreditEventIds: string[];
  clockAnomalies: ClockAnomaly[];
};

type OutcomeAccumulator = {
  outcomeId: string;
  baseStage: Exclude<MasteryStage, "reviewDue">;
  reviewDue: boolean;
  creditEventIds: string[];
  taskVariantIds: string[];
  fixtureHashes: string[];
  fingerprints: Set<string>;
  lastEvidenceTime: number | null;
  lastAppendReceiptAt: number | null;
  dueAt: number | null;
};

const contract = policyContract as {
  policyId: "mastery-policy-v2";
  version: 2;
  creditEventKind: "CreditGranted";
  nonCreditEventKinds: string[];
  modePriority: CreditMode[];
  scores: Record<Exclude<MasteryStage, "reviewDue">, number>;
  independentMaxHintLevel: number;
  higherStageMaxHintLevel: number;
  minimumDistinctTaskVariantsForMastered: number;
  clockPolicy: {
    maximumFutureSkewSeconds: number;
    maximumElapsedDivergenceSeconds: number;
  };
  retrievalWindowDays: { minimum: number; freshnessTarget: number };
};

export class MasteryPolicy {
  private readonly modeRank = new Map(contract.modePriority.map((mode, index) => [mode, index]));

  constructor() {
    if (contract.policyId !== "mastery-policy-v2" || contract.version !== 2 || contract.creditEventKind !== "CreditGranted") {
      throw new Error("mastery policy contract identity is invalid");
    }
    if (
      !Number.isInteger(contract.clockPolicy.maximumFutureSkewSeconds)
      || contract.clockPolicy.maximumFutureSkewSeconds < 0
      || !Number.isInteger(contract.clockPolicy.maximumElapsedDivergenceSeconds)
      || contract.clockPolicy.maximumElapsedDivergenceSeconds < 0
    ) {
      throw new Error("mastery policy clock policy is invalid");
    }
  }

  async reduce(events: Iterable<unknown>, options: { asOf?: string | Date } = {}): Promise<MasteryProjection> {
    const { normalized, invalidEventIds } = await this.normalizeEvents(events);
    const revoked = new Set(
      normalized
        .filter((event) => event.kind === "EvidenceTombstoned")
        .flatMap((event) => event.revokedCreditEventIds as string[]),
    );
    const ordered = [...normalized].sort(compareLearningEvents);
    const orderIndex = new Map(ordered.map((event, index) => [event.eventId, index]));
    const runs = eventMap(ordered, "RunObserved");
    const checks = eventMap(ordered, "CheckEvaluated");
    const supports = eventMap(ordered, "SupportProvided");
    const exposedVariants = buildExposedVariants(ordered, runs);
    let states = new Map<string, OutcomeAccumulator>();
    const deferredCreditEventIds = new Set<string>();
    const anomalies: ClockAnomaly[] = [];

    for (const event of ordered) {
      if (event.kind === "CheckEvaluated") {
        this.applyRetrievalFailure(event, runs, states);
        continue;
      }
      if (event.kind !== contract.creditEventKind || revoked.has(event.eventId)) continue;
      const before = cloneStates(states);
      const result = this.applyCredit(event, { runs, checks, supports, exposedVariants, orderIndex, states });
      if (!result.accepted) {
        states = before;
        invalidEventIds.add(event.eventId);
        continue;
      }
      anomalies.push(...result.anomalies);
      if (result.deferred) deferredCreditEventIds.add(event.eventId);
    }

    const projectionTime = this.projectionTime(options.asOf, ordered);
    if (projectionTime !== null) {
      for (const state of states.values()) {
        if (state.dueAt !== null && projectionTime >= state.dueAt) state.reviewDue = true;
      }
    }
    return {
      policyVersion: 2,
      outcomes: [...states.values()]
        .map((state) => this.buildOutcomeState(state))
        .sort((left, right) => left.outcomeId.localeCompare(right.outcomeId)),
      invalidEventIds: [...invalidEventIds].sort(),
      deferredCreditEventIds: [...deferredCreditEventIds].sort(),
      clockAnomalies: anomalies.sort(compareClockAnomalies),
    };
  }

  private async normalizeEvents(events: Iterable<unknown>): Promise<{
    normalized: LearningEvent[];
    invalidEventIds: Set<string>;
  }> {
    const normalized: LearningEvent[] = [];
    const invalidEventIds = new Set<string>();
    const seen = new Map<string, string>();
    const canonicalNonCreditKinds = new Set(["RunObserved", "CheckEvaluated", "SupportProvided", "MigrationImported"]);
    for (const raw of events) {
      const rawRecord = isRecord(raw) ? raw : {};
      const rawEventId = typeof rawRecord.eventId === "string" ? rawRecord.eventId : "";
      const rawKind = typeof rawRecord.kind === "string" ? rawRecord.kind : "";
      if (contract.nonCreditEventKinds.includes(rawKind) && !canonicalNonCreditKinds.has(rawKind)) continue;
      let event: LearningEvent;
      try {
        event = await validateLearningEvent(raw);
      } catch {
        if (rawKind === "MigrationImported") continue;
        invalidEventIds.add(rawEventId || "<missing-event-id>");
        continue;
      }
      const serialized = JSON.stringify(event);
      const existing = seen.get(event.eventId);
      if (existing !== undefined) {
        if (existing !== serialized) invalidEventIds.add(event.eventId);
        continue;
      }
      seen.set(event.eventId, serialized);
      normalized.push(event);
    }
    return { normalized, invalidEventIds };
  }

  private applyRetrievalFailure(
    check: LearningEvent,
    runs: Map<string, LearningEvent>,
    states: Map<string, OutcomeAccumulator>,
  ): void {
    if (check.assessmentMode !== "retrieval" || check.strength !== "strong" || check.passed !== false) return;
    const run = runs.get(String(check.runEventId));
    if (!run) return;
    const context = run.runContext as Record<string, unknown>;
    for (const outcomeId of context.outcomeIds as string[]) {
      const state = states.get(outcomeId);
      if (state && stageRank(state.baseStage) >= stageRank("transfer")) state.reviewDue = true;
    }
  }

  private applyCredit(
    event: LearningEvent,
    input: {
      runs: Map<string, LearningEvent>;
      checks: Map<string, LearningEvent>;
      supports: Map<string, LearningEvent>;
      exposedVariants: Map<string, Set<string>>;
      orderIndex: Map<string, number>;
      states: Map<string, OutcomeAccumulator>;
    },
  ): { accepted: boolean; deferred: boolean; anomalies: ClockAnomaly[] } {
    const rejected = { accepted: false, deferred: false, anomalies: [] as ClockAnomaly[] };
    const eventPosition = input.orderIndex.get(event.eventId) ?? -1;
    const runEventId = String(event.runEventId);
    const run = input.runs.get(runEventId);
    if (!run || (input.orderIndex.get(runEventId) ?? eventPosition) >= eventPosition || run.runStatus !== "success") return rejected;
    const selectedChecks = (event.checkEventIds as string[]).map((eventId) => input.checks.get(eventId));
    if (selectedChecks.some((check) => !check)) return rejected;
    const checks = selectedChecks as LearningEvent[];
    if (checks.some((check) => (
      check.runEventId !== runEventId
      || check.strength !== "strong"
      || check.passed !== true
      || (input.orderIndex.get(check.eventId) ?? eventPosition) >= eventPosition
    ))) return rejected;
    const selectedSupports = (event.supportEventIds as string[]).map((eventId) => input.supports.get(eventId));
    if (selectedSupports.some((support) => !support)) return rejected;
    const supports = selectedSupports as LearningEvent[];
    if (supports.some((support) => (
      support.runEventId !== runEventId
      || (input.orderIndex.get(support.eventId) ?? eventPosition) >= eventPosition
    ))) return rejected;
    const maxHintUsed = Math.max(0, ...supports.map((support) => Number(support.hintLevel)));
    const answerReveal = supports.some((support) => support.answerReveal === true);
    const strongestMode = checks
      .map((check) => check.assessmentMode as CreditMode)
      .reduce((left, right) => ((this.modeRank.get(left) ?? -1) >= (this.modeRank.get(right) ?? -1) ? left : right));
    const unseen = checks.every((check) => check.unseen === true);
    const context = run.runContext as Record<string, unknown>;
    const contextPolicyVersion = Number(context.masteryPolicyVersion);
    const taskVariantId = String(context.taskVariantId);
    const fixtureHash = String(context.fixtureHash);
    const outcomeIds = context.outcomeIds as string[];
    const evidenceTime = parseEvidenceTime(event.evidenceTime, event.appendReceiptAt);
    const fingerprint = String(event.attemptFingerprint);
    const priorExposureIds = new Set(
      [...(input.exposedVariants.get(taskVariantId) ?? new Set<string>())].filter(
        (eventId) => (input.orderIndex.get(eventId) ?? eventPosition) < eventPosition,
      ),
    );
    const declaredExposureIds = new Set(
      Array.isArray(context.exposureReceiptIds) ? context.exposureReceiptIds.map(String) : [],
    );
    if (contextPolicyVersion === 2 && [...priorExposureIds].some((eventId) => !declaredExposureIds.has(eventId))) {
      return rejected;
    }
    if (contextPolicyVersion === 2 && priorExposureIds.size) return rejected;
    if (contextPolicyVersion === 2 && strongestMode === "capstone") {
      const validApplicationSlices = (event.creditSlices as Record<string, unknown>[]).every((rawSlice) => (
        rawSlice.creditMode === "capstone" && outcomeIds.includes(String(rawSlice.outcomeId))
      ));
      return unseen
        && !answerReveal
        && maxHintUsed <= contract.higherStageMaxHintLevel
        && validApplicationSlices
        ? { accepted: true, deferred: false, anomalies: [] }
        : rejected;
    }
    const prepared: Array<{
      outcomeId: string;
      mode: CreditMode;
      state: OutcomeAccumulator;
    }> = [];

    for (const rawSlice of event.creditSlices as Record<string, unknown>[]) {
      const outcomeId = String(rawSlice.outcomeId);
      const rawMode = rawSlice.creditMode as CreditMode;
      if (rawMode !== strongestMode || !outcomeIds.includes(outcomeId)) return rejected;
      const mode = contextPolicyVersion === 1 && rawMode === "capstone" ? "acquisition" : rawMode;
      const state = input.states.get(outcomeId) ?? emptyState(outcomeId);
      input.states.set(outcomeId, state);
      if (state.dueAt !== null && evidenceAvailabilityTime(evidenceTime) >= state.dueAt) state.reviewDue = true;
      if (rawSlice.preAttemptState !== causalStage(state) || state.fingerprints.has(fingerprint)) return rejected;
      prepared.push({ outcomeId, mode, state });
    }
    const eventAnomalies = prepared.flatMap(({ outcomeId, mode, state }) => clockAnomalies(
      evidenceTime,
      {
        creditEventId: event.eventId,
        outcomeId,
        previous: state.lastEvidenceTime === null || state.lastAppendReceiptAt === null
          ? null
          : {
            evidenceTime: state.lastEvidenceTime,
            appendReceiptAt: state.lastAppendReceiptAt,
          },
        delayed: mode === "retrieval",
        ...contract.clockPolicy,
      },
    ));
    if (eventAnomalies.length && prepared.some(({ mode }) => mode === "retrieval")) {
      for (const { mode, state } of prepared) {
        if (mode === "retrieval" && stageRank(state.baseStage) >= stageRank("transfer")) {
          state.reviewDue = true;
        }
      }
      return { accepted: true, deferred: true, anomalies: eventAnomalies };
    }

    for (const { mode, state } of prepared) {
      if (!this.advance(state, { mode, unseen, maxHintUsed, answerReveal, taskVariantId, fixtureHash, evidenceTime })) return rejected;
      state.fingerprints.add(fingerprint);
      state.creditEventIds.push(event.eventId);
      if (!state.taskVariantIds.includes(taskVariantId)) state.taskVariantIds.push(taskVariantId);
      if (!state.fixtureHashes.includes(fixtureHash)) state.fixtureHashes.push(fixtureHash);
      state.lastEvidenceTime = Math.max(evidenceTime.evidenceTime, state.lastEvidenceTime ?? evidenceTime.evidenceTime);
      state.lastAppendReceiptAt = Math.max(
        evidenceTime.appendReceiptAt,
        state.lastAppendReceiptAt ?? evidenceTime.appendReceiptAt,
      );
    }
    return { accepted: true, deferred: false, anomalies: eventAnomalies };
  }

  private advance(
    state: OutcomeAccumulator,
    input: {
      mode: CreditMode;
      unseen: boolean;
      maxHintUsed: number;
      answerReveal: boolean;
      taskVariantId: string;
      fixtureHash: string;
      evidenceTime: EvidenceTime;
    },
  ): boolean {
    const independentEligible = input.unseen
      && !input.answerReveal
      && input.maxHintUsed <= contract.independentMaxHintLevel;
    const higherStageEligible = input.unseen
      && !input.answerReveal
      && input.maxHintUsed <= contract.higherStageMaxHintLevel;
    if (new Set<CreditMode>(["acquisition", "reinforcement"]).has(input.mode)) {
      if (independentEligible && stageRank(state.baseStage) < stageRank("independent")) state.baseStage = "independent";
      else if (state.baseStage === "unproven") state.baseStage = "practicing";
      state.reviewDue = false;
      return true;
    }
    if (input.mode === "transfer") {
      if (stageRank(state.baseStage) < stageRank("independent") || !higherStageEligible) return false;
      if (state.taskVariantIds.includes(input.taskVariantId)) return false;
      state.baseStage = "transfer";
      state.reviewDue = false;
      return true;
    }
    if (input.mode === "retrieval") {
      const renewingMastery = state.baseStage === "mastered"
        && state.dueAt !== null
        && evidenceAvailabilityTime(input.evidenceTime) >= state.dueAt;
      if (renewingMastery) {
        if (!higherStageEligible) return false;
        state.reviewDue = false;
        state.dueAt = evidenceAvailabilityTime(input.evidenceTime)
          + contract.retrievalWindowDays.freshnessTarget * 86_400_000;
        return true;
      }
      if (
        stageRank(state.baseStage) < stageRank("transfer")
        || !higherStageEligible
        || state.lastEvidenceTime === null
        || state.lastAppendReceiptAt === null
      ) return false;
      if (state.taskVariantIds.includes(input.taskVariantId)) return false;
      const evidenceElapsedDays = (input.evidenceTime.evidenceTime - state.lastEvidenceTime) / 86_400_000;
      const receiptElapsedDays = (input.evidenceTime.appendReceiptAt - state.lastAppendReceiptAt) / 86_400_000;
      if (
        evidenceElapsedDays < contract.retrievalWindowDays.minimum
        || receiptElapsedDays < contract.retrievalWindowDays.minimum
      ) return false;
      const variants = new Set([...state.taskVariantIds, input.taskVariantId]);
      if (variants.size < contract.minimumDistinctTaskVariantsForMastered) return false;
      state.baseStage = "mastered";
      state.reviewDue = false;
      state.dueAt = evidenceAvailabilityTime(input.evidenceTime)
        + contract.retrievalWindowDays.freshnessTarget * 86_400_000;
      return true;
    }
    return false;
  }

  private buildOutcomeState(state: OutcomeAccumulator): OutcomeMasteryState {
    return {
      outcomeId: state.outcomeId,
      stage: state.reviewDue ? "reviewDue" : state.baseStage,
      score: contract.scores[state.baseStage],
      reviewDue: state.reviewDue,
      creditEventIds: [...state.creditEventIds],
      taskVariantIds: [...state.taskVariantIds],
      fixtureHashes: [...state.fixtureHashes],
      lastEvidenceTime: timestamp(state.lastEvidenceTime),
      lastAppendReceiptAt: timestamp(state.lastAppendReceiptAt),
      dueAt: timestamp(state.dueAt),
    };
  }

  private projectionTime(value: string | Date | undefined, events: LearningEvent[]): number | null {
    if (value instanceof Date) return value.getTime();
    if (typeof value === "string") {
      const parsed = Date.parse(value);
      if (!Number.isFinite(parsed)) throw new Error("asOf must be an ISO timestamp");
      return parsed;
    }
    const receipts = events
      .filter((event) => event.kind === "CreditGranted")
      .map((event) => Date.parse(String(event.appendReceiptAt)));
    return receipts.length ? Math.max(...receipts) : null;
  }
}

function eventMap(events: LearningEvent[], kind: LearningEvent["kind"]): Map<string, LearningEvent> {
  return new Map(events.filter((event) => event.kind === kind).map((event) => [event.eventId, event]));
}

function buildExposedVariants(
  events: LearningEvent[],
  runs: Map<string, LearningEvent>,
): Map<string, Set<string>> {
  const exposed = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.kind !== "SupportProvided") continue;
    if (Number(event.hintLevel) <= 0 && event.answerReveal !== true) continue;
    const run = runs.get(String(event.runEventId));
    if (!run) continue;
    const context = run.runContext as Record<string, unknown>;
    const taskVariantId = String(context.taskVariantId);
    const receipts = exposed.get(taskVariantId) ?? new Set<string>();
    receipts.add(event.eventId);
    exposed.set(taskVariantId, receipts);
  }
  return exposed;
}

function emptyState(outcomeId: string): OutcomeAccumulator {
  return {
    outcomeId,
    baseStage: "unproven",
    reviewDue: false,
    creditEventIds: [],
    taskVariantIds: [],
    fixtureHashes: [],
    fingerprints: new Set(),
    lastEvidenceTime: null,
    lastAppendReceiptAt: null,
    dueAt: null,
  };
}

function cloneStates(states: Map<string, OutcomeAccumulator>): Map<string, OutcomeAccumulator> {
  return new Map([...states].map(([key, value]) => [key, {
    ...value,
    creditEventIds: [...value.creditEventIds],
    taskVariantIds: [...value.taskVariantIds],
    fixtureHashes: [...value.fixtureHashes],
    fingerprints: new Set(value.fingerprints),
  }]));
}

function causalStage(state: OutcomeAccumulator): MasteryStage {
  return state.reviewDue ? "reviewDue" : state.baseStage;
}

function stageRank(stage: Exclude<MasteryStage, "reviewDue">): number {
  return { unproven: 0, practicing: 1, independent: 2, transfer: 3, mastered: 4 }[stage];
}

function timestamp(value: number | null): string | null {
  return value === null ? null : new Date(value).toISOString();
}

function compareClockAnomalies(left: ClockAnomaly, right: ClockAnomaly): number {
  for (const [leftValue, rightValue] of [
    [left.creditEventId, right.creditEventId],
    [left.outcomeId, right.outcomeId],
    [left.reason, right.reason],
  ]) {
    if (leftValue !== rightValue) return leftValue < rightValue ? -1 : 1;
  }
  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
