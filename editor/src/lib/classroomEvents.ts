import { recordAssignmentEvent } from "@/lib/classroomOperations";
import { loadActiveAssignmentSession } from "@/lib/classroomSession";
import type { AssignmentEventType, CheckResult } from "@/types";
const ASSIGNMENT_OUTBOX_KEY = "codaro:assignment-outbox";
const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\b(api[_-]?key|token|secret)\s*[:=]\s*["']?[^,\s"']+/gi,
];

type AssignmentEventRecordPayload = {
  assignmentId: string;
  participantId: string;
  participantToken: string;
  eventId?: string;
  eventType: AssignmentEventType;
  sectionId?: string;
  category?: string;
  contentId?: string;
  payload?: Record<string, unknown>;
};

export async function recordAssignmentLearningEvent(args: {
  eventType: AssignmentEventType;
  sectionId?: string;
  category?: string;
  contentId?: string;
  payload?: Record<string, unknown>;
}): Promise<boolean> {
  const session = loadActiveAssignmentSession();
  if (!session?.participantId || !session.participantToken) return false;
  const eventPayload: AssignmentEventRecordPayload = {
    assignmentId: session.assignmentId,
    participantId: session.participantId,
    participantToken: session.participantToken,
    eventId: createEventId(),
    eventType: args.eventType,
    sectionId: args.sectionId ?? "",
    category: args.category ?? "",
    contentId: args.contentId ?? "",
    payload: args.payload ?? {},
  };
  try {
    await recordAssignmentEvent(eventPayload);
    await flushAssignmentEventOutbox();
    return true;
  } catch {
    enqueueAssignmentEvent(eventPayload);
    return false;
  }
}

export async function recordAssignmentCheckEvent(request: {
  category?: string;
  contentId?: string;
  sectionId?: string;
  currentHintLevel?: number;
  checkType?: string;
}, result: CheckResult): Promise<boolean> {
  const eventType: AssignmentEventType = result.passed ? "checkPassed" : "checkFailed";
  return recordAssignmentLearningEvent({
    eventType,
    sectionId: request.sectionId,
    category: request.category,
    contentId: request.contentId,
    payload: {
      checkType: request.checkType ?? "",
      hintLevel: result.hintLevel ?? request.currentHintLevel ?? 0,
      feedback: limitText(result.feedback),
      detail: limitText(result.detail),
      studentOutput: limitText(result.studentOutput),
      expectedOutput: limitText(result.expectedOutput),
      creditedOutcomes: result.creditedOutcomes ?? [],
      autoValidatedOutcomes: result.autoValidatedOutcomes ?? [],
      misconceptionMatches: (result.misconceptionMatches ?? []).map((match) => ({
        misconceptionId: match.misconceptionId,
        outcomeId: match.outcomeId,
        label: match.label,
        repeatStatus: match.repeatStatus,
        hitCount: match.hitCount,
      })),
      predictionDiff: result.predictionDiff ?? null,
      nextAction: result.nextAction ?? null,
    },
  });
}

export async function recordAssignmentMissionEvent(args: {
  category: string;
  contentId: string;
  missionId: string;
  totalMissions: number;
  lessonCompleted: boolean;
}): Promise<void> {
  await recordAssignmentLearningEvent({
    eventType: "missionCompleted",
    sectionId: args.missionId,
    category: args.category,
    contentId: args.contentId,
    payload: {
      missionId: args.missionId,
      totalMissions: args.totalMissions,
    },
  });
  if (args.lessonCompleted) {
    await recordAssignmentLearningEvent({
      eventType: "lessonCompleted",
      category: args.category,
      contentId: args.contentId,
      payload: {
        totalMissions: args.totalMissions,
      },
    });
  }
}

export async function flushAssignmentEventOutbox(): Promise<void> {
  if (typeof window === "undefined") return;
  const pending = readOutbox();
  if (!pending.length) return;
  const remaining: AssignmentEventRecordPayload[] = [];
  for (const item of pending) {
    try {
      await recordAssignmentEvent(item);
    } catch {
      remaining.push(item);
    }
  }
  window.localStorage.setItem(ASSIGNMENT_OUTBOX_KEY, JSON.stringify(remaining));
}

function enqueueAssignmentEvent(payload: AssignmentEventRecordPayload): void {
  if (typeof window === "undefined") return;
  const pending = readOutbox();
  pending.push(payload);
  window.localStorage.setItem(ASSIGNMENT_OUTBOX_KEY, JSON.stringify(pending.slice(-100)));
}

function readOutbox(): AssignmentEventRecordPayload[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(ASSIGNMENT_OUTBOX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isAssignmentEventRecordPayload) : [];
  } catch {
    return [];
  }
}

function isAssignmentEventRecordPayload(value: unknown): value is AssignmentEventRecordPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.assignmentId === "string" &&
    typeof payload.participantId === "string" &&
    typeof payload.participantToken === "string" &&
    typeof payload.eventType === "string"
  );
}

function createEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ev-${crypto.randomUUID()}`;
  }
  return `ev-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function limitText(value: string | undefined, max = 1000): string {
  if (!value) return "";
  const redacted = redactText(value);
  return redacted.length > max ? `${redacted.slice(0, max)}...` : redacted;
}

function redactText(value: string): string {
  return SECRET_PATTERNS.reduce((current, pattern) => current.replace(pattern, "[redacted]"), value);
}
