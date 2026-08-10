import { nestedCanonicalLearningEvents } from "@/lib/canonicalLearningEvidence";
import { evidenceAvailabilityTime, parseEvidenceTime } from "@/lib/evidenceTime";
import type { LearningEvent } from "@/lib/learningEvent";
import { MasteryPolicy } from "@/lib/masteryPolicy";
import type { WebLearningAttemptEvidenceEvent } from "@/lib/webLearningEvidence";
import policyContract from "@/lib/generatedContracts/masteryPolicy.v2.json";

const RETRIEVAL_MINIMUM_HOURS = policyContract.retrievalWindowDays.minimum * 24;

export type AssessmentQueueContract = {
  assessmentMode: "capstone" | "retrieval" | "transfer";
  minimumDelayHours: number;
  outcomeIds: string[];
  sectionId: string;
  sourceSectionIds: string[];
};

type AcceptedCredit = {
  evidenceTime: number;
  outcomeIds: string[];
  sectionId: string;
};

export async function dueAssessmentSectionIds(
  contracts: Iterable<AssessmentQueueContract>,
  evidenceEvents: Iterable<WebLearningAttemptEvidenceEvent>,
  now = Date.now(),
): Promise<Set<string>> {
  if (!Number.isFinite(now)) throw new Error("assessment queue time must be finite");
  const canonicalEvents = nestedCanonicalLearningEvents(evidenceEvents);
  const projection = await new MasteryPolicy().reduce(canonicalEvents, { asOf: new Date(now).toISOString() });
  const accepted = acceptedCredits(canonicalEvents, [
    ...projection.invalidEventIds,
    ...projection.deferredCreditEventIds,
  ], projection.outcomes.flatMap(
    (outcome) => outcome.creditEventIds,
  ));
  const masteryByOutcome = new Map(projection.outcomes.map((outcome) => [outcome.outcomeId, outcome]));
  const due = new Set<string>();

  for (const contract of contracts) {
    if (contract.assessmentMode === "capstone") {
      const sourceCompleted = accepted.some((credit) => contract.sourceSectionIds.includes(credit.sectionId));
      // A capstone is also the gateway from verified learning evidence to a reusable
      // capability. Keep it mounted after credit so its promotion action cannot
      // disappear between evidence persistence and the learner's next click.
      if (sourceCompleted) due.add(contract.sectionId);
      continue;
    }
    const completed = accepted.filter((credit) => credit.sectionId === contract.sectionId);
    if (contract.assessmentMode === "transfer") {
      if (!completed.length && accepted.some((credit) => contract.sourceSectionIds.includes(credit.sectionId))) {
        due.add(contract.sectionId);
      }
      continue;
    }
    if (completed.length) {
      const outcomeIds = contract.outcomeIds.length
        ? contract.outcomeIds
        : completed.flatMap((credit) => credit.outcomeIds);
      if (outcomeIds.some((outcomeId) => masteryByOutcome.get(outcomeId)?.reviewDue === true)) {
        due.add(contract.sectionId);
      }
      continue;
    }
    const sourceTimes = accepted
      .filter((credit) => contract.sourceSectionIds.includes(credit.sectionId))
      .map((credit) => credit.evidenceTime)
      .filter(Number.isFinite);
    const sourceTime = sourceTimes.length ? Math.max(...sourceTimes) : null;
    const delayHours = Math.max(RETRIEVAL_MINIMUM_HOURS, contract.minimumDelayHours || 0);
    if (sourceTime !== null && now >= sourceTime + delayHours * 3_600_000) {
      due.add(contract.sectionId);
    }
  }
  return due;
}

function acceptedCredits(
  events: LearningEvent[],
  invalidEventIds: string[],
  creditEventIds: string[],
): AcceptedCredit[] {
  const invalid = new Set(invalidEventIds);
  const acceptedIds = new Set(creditEventIds.filter((eventId) => !invalid.has(eventId)));
  const byId = new Map(events.map((event) => [event.eventId, event]));
  const credits: AcceptedCredit[] = [];
  for (const eventId of acceptedIds) {
    const credit = byId.get(eventId);
    if (!credit || credit.kind !== "CreditGranted") continue;
    const run = byId.get(String(credit.runEventId));
    if (!run || run.kind !== "RunObserved") continue;
    const context = run.runContext as Record<string, unknown>;
    const slices = Array.isArray(credit.creditSlices)
      ? credit.creditSlices.filter(isRecord)
      : [];
    const evidenceTime = evidenceAvailabilityTime(parseEvidenceTime(
      credit.evidenceTime,
      credit.appendReceiptAt,
    ));
    credits.push({
      evidenceTime,
      outcomeIds: slices.map((slice) => String(slice.outcomeId ?? "")).filter(Boolean),
      sectionId: String(context.sectionId),
    });
  }
  return credits;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
