import policyContract from "@/lib/generatedContracts/masteryPolicy.v1.json";
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
  dueAt: string | null;
};

export type MasteryProjection = {
  policyVersion: 1;
  outcomes: OutcomeMasteryState[];
  invalidEventIds: string[];
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
  dueAt: number | null;
};

const contract = policyContract as {
  policyId: "mastery-policy-v1";
  version: 1;
  creditEventKind: "CreditGranted";
  nonCreditEventKinds: string[];
  modePriority: CreditMode[];
  scores: Record<Exclude<MasteryStage, "reviewDue">, number>;
  independentMaxHintLevel: number;
  higherStageMaxHintLevel: number;
  minimumDistinctTaskVariantsForMastered: number;
  retrievalWindowDays: { minimum: number; maximum: number };
};

export class MasteryPolicy {
  private readonly modeRank = new Map(contract.modePriority.map((mode, index) => [mode, index]));

  constructor() {
    if (contract.policyId !== "mastery-policy-v1" || contract.version !== 1 || contract.creditEventKind !== "CreditGranted") {
      throw new Error("mastery policy contract identity is invalid");
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
    let states = new Map<string, OutcomeAccumulator>();

    for (const event of ordered) {
      if (event.kind === "CheckEvaluated") {
        this.applyRetrievalFailure(event, runs, states);
        continue;
      }
      if (event.kind !== contract.creditEventKind || revoked.has(event.eventId)) continue;
      const before = cloneStates(states);
      if (!this.applyCredit(event, { runs, checks, supports, orderIndex, states })) {
        states = before;
        invalidEventIds.add(event.eventId);
      }
    }

    const projectionTime = this.projectionTime(options.asOf, ordered);
    if (projectionTime !== null) {
      for (const state of states.values()) {
        if (state.dueAt !== null && projectionTime >= state.dueAt) state.reviewDue = true;
      }
    }
    return {
      policyVersion: 1,
      outcomes: [...states.values()]
        .map((state) => this.buildOutcomeState(state))
        .sort((left, right) => left.outcomeId.localeCompare(right.outcomeId)),
      invalidEventIds: [...invalidEventIds].sort(),
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
      orderIndex: Map<string, number>;
      states: Map<string, OutcomeAccumulator>;
    },
  ): boolean {
    const eventPosition = input.orderIndex.get(event.eventId) ?? -1;
    const runEventId = String(event.runEventId);
    const run = input.runs.get(runEventId);
    if (!run || (input.orderIndex.get(runEventId) ?? eventPosition) >= eventPosition || run.runStatus !== "success") return false;
    const selectedChecks = (event.checkEventIds as string[]).map((eventId) => input.checks.get(eventId));
    if (selectedChecks.some((check) => !check)) return false;
    const checks = selectedChecks as LearningEvent[];
    if (checks.some((check) => (
      check.runEventId !== runEventId
      || check.strength !== "strong"
      || check.passed !== true
      || (input.orderIndex.get(check.eventId) ?? eventPosition) >= eventPosition
    ))) return false;
    const selectedSupports = (event.supportEventIds as string[]).map((eventId) => input.supports.get(eventId));
    if (selectedSupports.some((support) => !support)) return false;
    const supports = selectedSupports as LearningEvent[];
    if (supports.some((support) => (
      support.runEventId !== runEventId
      || (input.orderIndex.get(support.eventId) ?? eventPosition) >= eventPosition
    ))) return false;
    const maxHintUsed = Math.max(0, ...supports.map((support) => Number(support.hintLevel)));
    const answerReveal = supports.some((support) => support.answerReveal === true);
    const strongestMode = checks
      .map((check) => check.assessmentMode as CreditMode)
      .reduce((left, right) => ((this.modeRank.get(left) ?? -1) >= (this.modeRank.get(right) ?? -1) ? left : right));
    const unseen = checks.every((check) => check.unseen === true);
    const context = run.runContext as Record<string, unknown>;
    const taskVariantId = String(context.taskVariantId);
    const fixtureHash = String(context.fixtureHash);
    const outcomeIds = context.outcomeIds as string[];
    const evidenceTime = Date.parse(String(event.evidenceTime));
    const fingerprint = String(event.attemptFingerprint);

    for (const rawSlice of event.creditSlices as Record<string, unknown>[]) {
      const outcomeId = String(rawSlice.outcomeId);
      const mode = rawSlice.creditMode as CreditMode;
      if (mode !== strongestMode || !outcomeIds.includes(outcomeId)) return false;
      const state = input.states.get(outcomeId) ?? emptyState(outcomeId);
      input.states.set(outcomeId, state);
      if (state.dueAt !== null && evidenceTime >= state.dueAt) state.reviewDue = true;
      if (rawSlice.preAttemptState !== causalStage(state) || state.fingerprints.has(fingerprint)) return false;
      if (!this.advance(state, { mode, unseen, maxHintUsed, answerReveal, taskVariantId, fixtureHash, evidenceTime })) return false;
      state.fingerprints.add(fingerprint);
      state.creditEventIds.push(event.eventId);
      if (!state.taskVariantIds.includes(taskVariantId)) state.taskVariantIds.push(taskVariantId);
      if (!state.fixtureHashes.includes(fixtureHash)) state.fixtureHashes.push(fixtureHash);
      state.lastEvidenceTime = evidenceTime;
    }
    return true;
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
      evidenceTime: number;
    },
  ): boolean {
    const independentEligible = input.unseen
      && !input.answerReveal
      && input.maxHintUsed <= contract.independentMaxHintLevel;
    const higherStageEligible = input.unseen
      && !input.answerReveal
      && input.maxHintUsed <= contract.higherStageMaxHintLevel;
    if (new Set<CreditMode>(["acquisition", "reinforcement", "capstone"]).has(input.mode)) {
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
        && input.evidenceTime >= state.dueAt;
      if (renewingMastery) {
        if (!higherStageEligible) return false;
        state.reviewDue = false;
        state.dueAt = input.evidenceTime + contract.retrievalWindowDays.maximum * 86_400_000;
        return true;
      }
      if (stageRank(state.baseStage) < stageRank("transfer") || !higherStageEligible || state.lastEvidenceTime === null) return false;
      if (state.taskVariantIds.includes(input.taskVariantId)) return false;
      const elapsedDays = (input.evidenceTime - state.lastEvidenceTime) / 86_400_000;
      if (elapsedDays < contract.retrievalWindowDays.minimum || elapsedDays > contract.retrievalWindowDays.maximum) return false;
      const variants = new Set([...state.taskVariantIds, input.taskVariantId]);
      if (variants.size < contract.minimumDistinctTaskVariantsForMastered) return false;
      state.baseStage = "mastered";
      state.reviewDue = false;
      state.dueAt = input.evidenceTime + contract.retrievalWindowDays.maximum * 86_400_000;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
