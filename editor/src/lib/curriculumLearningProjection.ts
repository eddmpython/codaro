import { nestedCanonicalLearningEvents } from "@/lib/canonicalLearningEvidence";
import type { CreditMode, LearningEvent } from "@/lib/learningEvent";
import { MasteryPolicy, type MasteryProjection, type OutcomeMasteryState } from "@/lib/masteryPolicy";
import type { WebStrongCheckEvidenceEvent } from "@/lib/webLearningEvidence";
import type { ProgressSummary, ReviewItem, ReviewListPayload } from "@/types";

const DAY_MS = 86_400_000;

export type LessonRetrievalContract = {
  checkId: string;
  minimumDelayHours: number;
  outcomeIds: string[];
  sectionId: string;
  sourceSectionIds: string[];
};

export type LessonProgressContract = {
  category: string;
  contentId: string;
  evidenceLessonRefs?: string[];
  lessonRef: string;
  requiredOutcomeIds: string[];
  retrievals: LessonRetrievalContract[];
  title: string;
};

export type CanonicalLessonProgress = LessonProgressContract & {
  completedAt: string | null;
  creditedOutcomeIds: string[];
  lastEvidenceAt: string | null;
  reviewDueAt: string | null;
  reviewIntervalDays: number;
  reviewLastResult: ReviewItem["lastResult"];
  reviewOutcomeIds: string[];
  reviewStreak: number;
  runtimeTiers: Array<"browser" | "local">;
};

export type CanonicalCurriculumLearningProjection = {
  invalidEventIds: string[];
  lessons: CanonicalLessonProgress[];
  mastery: MasteryProjection;
  projectedAt: string;
};

type AcceptedCredit = {
  creditMode: CreditMode;
  eventId: string;
  evidenceAt: string;
  lessonRef: string;
  outcomeIds: string[];
  sectionId: string;
  tierUsed: "browser" | "local";
};

export async function projectCanonicalCurriculumLearning(
  evidenceEvents: Iterable<WebStrongCheckEvidenceEvent>,
  lessonContracts: Iterable<LessonProgressContract>,
  options: { asOf?: string | Date } = {},
): Promise<CanonicalCurriculumLearningProjection> {
  const strongEvents = [...evidenceEvents];
  const canonicalEvents = nestedCanonicalLearningEvents(strongEvents);
  const projectedAt = projectionTimestamp(options.asOf);
  const mastery = await new MasteryPolicy().reduce(canonicalEvents, { asOf: projectedAt });
  const credits = acceptedCredits(canonicalEvents, mastery);
  const creditsByLesson = groupBy(credits, (credit) => credit.lessonRef);
  const evidenceByLesson = groupBy(strongEvents, (event) => event.lessonRef);
  const masteryByOutcome = new Map(mastery.outcomes.map((outcome) => [outcome.outcomeId, outcome]));

  const lessons = [...lessonContracts]
    .map((contract) => {
      const evidenceLessonRefs = unique([contract.lessonRef, ...(contract.evidenceLessonRefs ?? [])]);
      return projectLesson(
        contract,
        evidenceLessonRefs.flatMap((lessonRef) => creditsByLesson.get(lessonRef) ?? []),
        evidenceLessonRefs.flatMap((lessonRef) => evidenceByLesson.get(lessonRef) ?? []),
        masteryByOutcome,
        projectedAt,
      );
    })
    .sort((left, right) => left.lessonRef.localeCompare(right.lessonRef));

  return {
    invalidEventIds: [...mastery.invalidEventIds],
    lessons,
    mastery,
    projectedAt,
  };
}

export function progressSummaryFromCanonicalProjection(
  projection: CanonicalCurriculumLearningProjection,
): ProgressSummary {
  const categoryProgress: NonNullable<ProgressSummary["categoryProgress"]> = {};
  for (const lesson of projection.lessons) {
    const current = categoryProgress[lesson.category] ?? { accessed: 0, completed: 0 };
    current.accessed += 1;
    if (lesson.completedAt) current.completed += 1;
    categoryProgress[lesson.category] = current;
  }
  const resume = [...projection.lessons]
    .filter((lesson) => !lesson.completedAt && lesson.lastEvidenceAt)
    .sort((left, right) => Date.parse(String(right.lastEvidenceAt)) - Date.parse(String(left.lastEvidenceAt)))[0] ?? null;
  const masteryOutcomes = projection.mastery.outcomes;
  return {
    categoryProgress,
    creditedOutcomeCount: masteryOutcomes.filter((outcome) => outcome.creditEventIds.length > 0).length,
    independentOutcomeCount: masteryOutcomes.filter((outcome) => outcome.score >= 0.6).length,
    masteredOutcomeCount: masteryOutcomes.filter((outcome) => outcome.score >= 1).length,
    resume: resume ? { category: resume.category, contentId: resume.contentId } : null,
    reviewDueOutcomeCount: masteryOutcomes.filter((outcome) => outcome.reviewDue).length,
    totalAccessed: projection.lessons.length,
    totalCompleted: projection.lessons.filter((lesson) => Boolean(lesson.completedAt)).length,
    updatedAt: latestTimestamp(
      projection.lessons.map((lesson) => lesson.lastEvidenceAt),
    ) ?? projection.projectedAt,
  };
}

export function reviewListFromCanonicalProjection(
  projection: CanonicalCurriculumLearningProjection,
): ReviewListPayload {
  const projectedAt = Date.parse(projection.projectedAt);
  const reviews = projection.lessons
    .filter((lesson) => lesson.reviewDueAt && Date.parse(lesson.reviewDueAt) <= projectedAt)
    .map((lesson): ReviewItem => {
      const dueAt = String(lesson.reviewDueAt);
      return {
        category: lesson.category,
        contentId: lesson.contentId,
        daysOverdue: Math.max(0, Math.floor((projectedAt - Date.parse(dueAt)) / DAY_MS)),
        ease: 2.5,
        interval: lesson.reviewIntervalDays,
        lastResult: lesson.reviewLastResult,
        lessonKey: lesson.lessonRef,
        nextReviewAt: dueAt,
        streak: lesson.reviewStreak,
        title: lesson.title,
      };
    })
    .sort((left, right) => (
      right.daysOverdue - left.daysOverdue
      || compareTimestamps(left.nextReviewAt, right.nextReviewAt)
      || left.lessonKey.localeCompare(right.lessonKey)
    ));
  return { reviews: reviews.slice(0, 12), totalDue: reviews.length };
}

function projectLesson(
  contract: LessonProgressContract,
  credits: AcceptedCredit[],
  evidenceEvents: WebStrongCheckEvidenceEvent[],
  masteryByOutcome: Map<string, OutcomeMasteryState>,
  projectedAt: string,
): CanonicalLessonProgress {
  const orderedCredits = [...credits].sort((left, right) => (
    compareTimestamps(left.evidenceAt, right.evidenceAt) || left.eventId.localeCompare(right.eventId)
  ));
  const creditedOutcomeIds = unique(orderedCredits.flatMap((credit) => credit.outcomeIds));
  const completedAt = completionTimestamp(orderedCredits, contract.requiredOutcomeIds);
  const review = projectLessonReview(contract, orderedCredits, masteryByOutcome, projectedAt);
  return {
    ...contract,
    completedAt,
    creditedOutcomeIds,
    lastEvidenceAt: latestTimestamp([
      ...evidenceEvents.map((event) => event.occurredAt),
      ...orderedCredits.map((credit) => credit.evidenceAt),
    ]),
    reviewDueAt: review.dueAt,
    reviewIntervalDays: review.intervalDays,
    reviewLastResult: review.lastResult,
    reviewOutcomeIds: review.outcomeIds,
    reviewStreak: review.streak,
    runtimeTiers: unique(orderedCredits.map((credit) => credit.tierUsed)).sort(),
  };
}

function projectLessonReview(
  contract: LessonProgressContract,
  credits: AcceptedCredit[],
  masteryByOutcome: Map<string, OutcomeMasteryState>,
  projectedAt: string,
): {
  dueAt: string | null;
  intervalDays: number;
  lastResult: ReviewItem["lastResult"];
  outcomeIds: string[];
  streak: number;
} {
  if (!contract.retrievals.length) {
    return { dueAt: null, intervalDays: 0, lastResult: "fresh", outcomeIds: [], streak: 0 };
  }
  const dueCandidates: Array<{ dueAt: string; intervalDays: number; outcomeIds: string[] }> = [];
  const retrievalCredits = credits.filter((credit) => credit.creditMode === "retrieval");

  for (const retrieval of contract.retrievals) {
    const completedRetrieval = retrievalCredits
      .filter((credit) => credit.sectionId === retrieval.sectionId)
      .sort((left, right) => compareTimestamps(right.evidenceAt, left.evidenceAt))[0];
    const sourceCredits = credits.filter((credit) => (
      retrieval.sourceSectionIds.length
        ? retrieval.sourceSectionIds.includes(credit.sectionId)
        : credit.outcomeIds.some((outcomeId) => retrieval.outcomeIds.includes(outcomeId))
    ));
    const latestSource = sourceCredits.sort((left, right) => compareTimestamps(right.evidenceAt, left.evidenceAt))[0];
    if (
      !latestSource
      || (completedRetrieval && Date.parse(completedRetrieval.evidenceAt) >= Date.parse(latestSource.evidenceAt))
    ) continue;
    const intervalDays = Math.max(1, Math.ceil(retrieval.minimumDelayHours / 24));
    dueCandidates.push({
      dueAt: new Date(Date.parse(latestSource.evidenceAt) + retrieval.minimumDelayHours * 3_600_000).toISOString(),
      intervalDays,
      outcomeIds: retrieval.outcomeIds,
    });
  }

  const dueMastery = contract.requiredOutcomeIds
    .map((outcomeId) => masteryByOutcome.get(outcomeId))
    .filter((outcome): outcome is OutcomeMasteryState => Boolean(
      outcome?.reviewDue
      && retrievalCredits.some((credit) => credit.outcomeIds.includes(String(outcome?.outcomeId))),
    ));
  for (const outcome of dueMastery) {
    dueCandidates.push({
      dueAt: outcome.dueAt ?? outcome.lastEvidenceTime ?? projectedAt,
      intervalDays: outcome.dueAt && outcome.lastEvidenceTime
        ? Math.max(1, Math.round((Date.parse(outcome.dueAt) - Date.parse(outcome.lastEvidenceTime)) / DAY_MS))
        : 1,
      outcomeIds: [outcome.outcomeId],
    });
  }

  const earliest = dueCandidates
    .filter((candidate) => Number.isFinite(Date.parse(candidate.dueAt)))
    .sort((left, right) => compareTimestamps(left.dueAt, right.dueAt))[0];
  return {
    dueAt: earliest?.dueAt ?? null,
    intervalDays: earliest?.intervalDays ?? 0,
    lastResult: retrievalCredits.length ? "success" : "fresh",
    outcomeIds: unique(dueCandidates.flatMap((candidate) => candidate.outcomeIds)),
    streak: retrievalCredits.length,
  };
}

function acceptedCredits(events: LearningEvent[], mastery: MasteryProjection): AcceptedCredit[] {
  const invalidIds = new Set(mastery.invalidEventIds);
  const acceptedIds = new Set(
    mastery.outcomes.flatMap((outcome) => outcome.creditEventIds).filter((eventId) => !invalidIds.has(eventId)),
  );
  const eventsById = new Map<string, LearningEvent>();
  for (const event of events) {
    if (!eventsById.has(event.eventId)) eventsById.set(event.eventId, event);
  }
  const credits: AcceptedCredit[] = [];
  for (const eventId of acceptedIds) {
    const credit = eventsById.get(eventId);
    if (!credit || credit.kind !== "CreditGranted") continue;
    const run = eventsById.get(String(credit.runEventId));
    if (!run || run.kind !== "RunObserved") continue;
    const context = run.runContext as Record<string, unknown>;
    const slices = Array.isArray(credit.creditSlices)
      ? credit.creditSlices.filter(isRecord)
      : [];
    const outcomeIds = unique(slices.map((slice) => String(slice.outcomeId ?? "")).filter(Boolean));
    const creditMode = slices[0]?.creditMode;
    const tierUsed = context.tierUsed;
    if (
      !outcomeIds.length
      || !new Set(["acquisition", "capstone", "reinforcement", "retrieval", "transfer"]).has(String(creditMode))
      || !new Set(["browser", "local"]).has(String(tierUsed))
    ) continue;
    credits.push({
      creditMode: creditMode as CreditMode,
      eventId,
      evidenceAt: String(credit.evidenceTime),
      lessonRef: String(context.lessonRef),
      outcomeIds,
      sectionId: String(context.sectionId),
      tierUsed: tierUsed as "browser" | "local",
    });
  }
  return credits;
}

function completionTimestamp(credits: AcceptedCredit[], requiredOutcomeIds: string[]): string | null {
  const required = new Set(unique(requiredOutcomeIds));
  if (!required.size) return null;
  const covered = new Set<string>();
  for (const credit of credits) {
    for (const outcomeId of credit.outcomeIds) {
      if (required.has(outcomeId)) covered.add(outcomeId);
    }
    if ([...required].every((outcomeId) => covered.has(outcomeId))) return credit.evidenceAt;
  }
  return null;
}

function projectionTimestamp(value: string | Date | undefined): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  return new Date().toISOString();
}

function latestTimestamp(values: Array<string | null | undefined>): string | null {
  const valid = values.filter((value): value is string => (
    typeof value === "string" && Number.isFinite(Date.parse(value))
  ));
  return valid.sort((left, right) => compareTimestamps(right, left))[0] ?? null;
}

function compareTimestamps(left: string, right: string): number {
  return Date.parse(left) - Date.parse(right);
}

function groupBy<T>(values: Iterable<T>, key: (value: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const value of values) {
    const itemKey = key(value);
    grouped.set(itemKey, [...(grouped.get(itemKey) ?? []), value]);
  }
  return grouped;
}

function unique<T>(values: Iterable<T>): T[] {
  return [...new Set(values)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
