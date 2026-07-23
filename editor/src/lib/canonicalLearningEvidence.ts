import {
  learningEventDigest,
  sealLearningEvent,
  type CreditMode,
  type LearningEvent,
} from "@/lib/learningEvent";
import { MasteryPolicy } from "@/lib/masteryPolicy";
import type {
  WebStrongCheckEvidenceEvent,
  WebStrongCheckEvidenceInput,
} from "@/lib/webLearningEvidence";

export function nestedCanonicalLearningEvents(
  events: Iterable<WebStrongCheckEvidenceEvent>,
): LearningEvent[] {
  return [...events].flatMap((event) => event.canonicalEvents ?? []);
}

export async function buildCanonicalStrongCheckEvents(
  input: WebStrongCheckEvidenceInput,
  evidence: WebStrongCheckEvidenceEvent,
  priorEvents: Iterable<LearningEvent>,
): Promise<LearningEvent[]> {
  const prior = [...priorEvents];
  const lessonRef = evidence.lessonRef;
  const sectionId = input.sectionId?.trim() || input.blockId;
  const outcomeIds = uniqueText(input.outcomeIds ?? []);
  const mode = creditMode(input.assessmentMode);
  const deviceId = `codaro-${input.runtimeTier}-learning-evidence`;
  const epoch = "learning-epoch-v1";
  let lamport = nextLamport(prior);
  let deviceSequence = nextDeviceSequence(prior, deviceId);
  const envelope = (kind: LearningEvent["kind"], eventId: string) => ({
    deviceId,
    deviceSequence: String(deviceSequence++),
    epochRefByScope: {
      global: epoch,
      lesson: `${epoch}:${lessonRef}`,
    },
    eventId,
    kind,
    lamport: String(lamport++),
    learningEpoch: epoch,
    occurredAt: evidence.occurredAt,
    schemaVersion: 1,
  });
  const identity = evidence.eventId;
  const run = await sealLearningEvent({
    ...envelope("RunObserved", `${identity}:run`),
    completedAt: evidence.occurredAt,
    runContext: {
      attemptId: identity,
      checkEngineVersion: input.runtimeTier === "web" ? "browser-worker-v1" : "local-sandbox-v1",
      checkSpecId: input.checkId,
      checkSpecVersion: "1",
      fixtureHash: input.fixtureHash,
      lessonContentHash: await learningEventDigest({
        checkId: input.checkId,
        lessonRef,
        outcomeIds,
        sectionId,
      }),
      lessonRef,
      masteryPolicyVersion: 1,
      outcomeIds,
      packageSetHash: await learningEventDigest(evidence.packages ?? []),
      runId: identity,
      runtimeId: input.runtimeTier === "web" ? "pyproc" : "codaro-local",
      runtimeVersion: "1",
      sectionId,
      sourceCodeHash: evidence.sourceHash,
      taskVariantId: `${lessonRef}#${sectionId}`,
      tierUsed: input.runtimeTier === "web" ? "browser" : "local",
    },
    runStatus: "success",
    startedAt: evidence.occurredAt,
  });
  const check = await sealLearningEvent({
    ...envelope("CheckEvaluated", `${identity}:check`),
    assessmentMode: mode,
    checkId: input.checkId,
    errorClass: "",
    passed: true,
    recommendedHintLevel: 0,
    runEventId: run.eventId,
    strength: "strong",
    unseen: input.unseen === true,
  });
  const events = [run, check];
  if (input.aiHelpUsed) {
    events.push(await sealLearningEvent({
      ...envelope("SupportProvided", `${identity}:support`),
      answerReveal: false,
      hintLevel: 1,
      runEventId: run.eventId,
      supportId: "cell-assistant",
    }));
  }
  if (!outcomeIds.length) return events;

  const projection = await new MasteryPolicy().reduce(prior, { asOf: evidence.occurredAt });
  const stageByOutcome = new Map(projection.outcomes.map((outcome) => [outcome.outcomeId, outcome.stage]));
  const supportEventIds = events
    .filter((event) => event.kind === "SupportProvided")
    .map((event) => event.eventId);
  const credit = await sealLearningEvent({
    ...envelope("CreditGranted", `${identity}:credit`),
    appendReceiptAt: evidence.occurredAt,
    attemptFingerprint: evidence.attemptFingerprint,
    checkEventIds: [check.eventId],
    creditSlices: outcomeIds.map((outcomeId) => ({
      creditMode: mode,
      outcomeId,
      preAttemptState: stageByOutcome.get(outcomeId) ?? "unproven",
    })),
    evidenceTime: evidence.occurredAt,
    runEventId: run.eventId,
    supportEventIds,
  });
  const candidateProjection = await new MasteryPolicy().reduce([...prior, ...events, credit], {
    asOf: evidence.occurredAt,
  });
  return candidateProjection.invalidEventIds.includes(credit.eventId)
    ? events
    : [...events, credit];
}

function creditMode(value: WebStrongCheckEvidenceInput["assessmentMode"]): CreditMode {
  if (value === "mastery") return "capstone";
  if (value) return value;
  return "acquisition";
}

function nextLamport(events: LearningEvent[]): bigint {
  return events.reduce((maximum, event) => {
    const current = BigInt(event.lamport);
    return current > maximum ? current : maximum;
  }, 0n) + 1n;
}

function nextDeviceSequence(events: LearningEvent[], deviceId: string): bigint {
  return events.reduce((maximum, event) => {
    if (event.deviceId !== deviceId) return maximum;
    const current = BigInt(event.deviceSequence);
    return current > maximum ? current : maximum;
  }, 0n) + 1n;
}

function uniqueText(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
