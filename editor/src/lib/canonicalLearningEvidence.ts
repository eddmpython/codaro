import {
  learningEventDigest,
  sealLearningEvent,
  type CreditMode,
  type LearningEvent,
} from "@/lib/learningEvent";
import { MasteryPolicy } from "@/lib/masteryPolicy";
import type {
  WebLearningAttemptEvidenceEvent,
  WebStrongCheckEvidenceEvent,
  WebStrongCheckEvidenceInput,
} from "@/lib/webLearningEvidence";

export function nestedCanonicalLearningEvents(
  events: Iterable<WebLearningAttemptEvidenceEvent>,
): LearningEvent[] {
  return [...events].flatMap((event) => event.canonicalEvents ?? []);
}

export async function buildCanonicalStrongCheckEvents(
  input: WebStrongCheckEvidenceInput,
  evidence: WebLearningAttemptEvidenceEvent,
  priorEvents: Iterable<LearningEvent>,
): Promise<LearningEvent[]> {
  const prior = [...priorEvents];
  const lessonRef = evidence.lessonRef;
  const sectionId = input.sectionId?.trim() || input.blockId;
  const outcomeIds = uniqueText(input.outcomeIds ?? []);
  const mode = creditMode(input.assessmentMode);
  const policyVersion = evidence.kind === "AttemptObserved" ? 2 : 1;
  const taskVariantId = input.taskVariantId?.trim() || `${lessonRef}#${sectionId}`;
  const exposureReceiptIds = priorExposureReceiptIds(prior, taskVariantId);
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
      masteryPolicyVersion: policyVersion,
      outcomeIds,
      packageSetHash: await learningEventDigest(evidence.packages ?? []),
      runId: identity,
      runtimeId: input.runtimeTier === "web" ? "pyproc" : "codaro-local",
      runtimeVersion: "1",
      sectionId,
      sourceCodeHash: evidence.sourceHash,
      taskVariantId,
      tierUsed: input.runtimeTier === "web" ? "browser" : "local",
      ...(input.capabilityClaimId ? { capabilityClaimId: input.capabilityClaimId } : {}),
      ...(input.capabilityClaimVersion ? { capabilityClaimVersion: input.capabilityClaimVersion } : {}),
      ...(input.taskFamilyId ? { taskFamilyId: input.taskFamilyId } : {}),
      ...(input.taskFamilyVersion ? { taskFamilyVersion: input.taskFamilyVersion } : {}),
      ...(input.taskVariantVersion ? { taskVariantVersion: input.taskVariantVersion } : {}),
      ...(input.artifactContractId ? { artifactContractId: input.artifactContractId } : {}),
      ...(input.artifactContractVersion ? { artifactContractVersion: input.artifactContractVersion } : {}),
      ...(exposureReceiptIds.length ? { exposureReceiptIds } : {}),
    },
    artifactDescriptors: evidence.artifacts ?? [],
    runStatus: evidence.kind === "AttemptObserved" ? evidence.runStatus : "success",
    startedAt: evidence.occurredAt,
  });
  const check = await sealLearningEvent({
    ...envelope("CheckEvaluated", `${identity}:check`),
    assessmentMode: mode,
    checkId: input.checkId,
    errorClass: evidence.kind === "AttemptObserved" ? evidence.errorClass : "",
    passed: evidence.kind === "AttemptObserved" ? evidence.passed : true,
    recommendedHintLevel: evidence.kind === "AttemptObserved" ? evidence.recommendedHintLevel : 0,
    runEventId: run.eventId,
    strength: evidence.strength,
    unseen: input.unseen === true,
  });
  const events = [run, check];
  if (input.aiHelpUsed || input.answerReveal) {
    events.push(await sealLearningEvent({
      ...envelope("SupportProvided", `${identity}:support`),
      answerReveal: input.answerReveal === true,
      hintLevel: input.aiHelpUsed ? 1 : 0,
      runEventId: run.eventId,
      supportId: "cell-assistant",
    }));
  }
  const explicitCreditRole = input.assessmentRole === "assurance" || input.assessmentRole === "application";
  const roleAllowsMode = input.assessmentRole === "application"
    ? mode === "capstone"
    : input.assessmentRole === "assurance" && mode !== "capstone";
  const applicationProofReady = input.assessmentRole !== "application" || (
    input.runtimeTier === "local"
    && Boolean(input.artifactContractId)
    && Boolean(input.artifactContractVersion)
    && (evidence.artifacts ?? []).some((artifact) => (
      artifact.origin === "created" && artifact.kind !== "directory"
    ))
  );
  const attemptEligible = evidence.kind === "AttemptObserved" && (
    evidence.passed
    && evidence.runStatus === "success"
    && evidence.strength === "strong"
    && Boolean(input.taskFamilyId)
    && explicitCreditRole
    && roleAllowsMode
    && applicationProofReady
  );
  if (!outcomeIds.length || !attemptEligible) return events;

  const appendReceiptAt = new Date().toISOString();
  const projection = await new MasteryPolicy().reduce(prior, { asOf: appendReceiptAt });
  const stageByOutcome = new Map(projection.outcomes.map((outcome) => [outcome.outcomeId, outcome.stage]));
  const supportEventIds = events
    .filter((event) => event.kind === "SupportProvided")
    .map((event) => event.eventId);
  const credit = await sealLearningEvent({
    ...envelope("CreditGranted", `${identity}:credit`),
    appendReceiptAt,
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
    asOf: appendReceiptAt,
  });
  return candidateProjection.invalidEventIds.includes(credit.eventId)
    ? events
    : [...events, credit];
}

function creditMode(value: WebStrongCheckEvidenceInput["assessmentMode"]): CreditMode {
  if (value === "mastery") return "acquisition";
  if (value) return value;
  return "acquisition";
}

function priorExposureReceiptIds(events: LearningEvent[], taskVariantId: string): string[] {
  const runVariantById = new Map(
    events
      .filter((event) => event.kind === "RunObserved")
      .map((event) => [event.eventId, String((event.runContext as Record<string, unknown>).taskVariantId)]),
  );
  return events
    .filter((event) => event.kind === "SupportProvided")
    .filter((event) => Number(event.hintLevel) > 0 || event.answerReveal === true)
    .filter((event) => runVariantById.get(String(event.runEventId)) === taskVariantId)
    .map((event) => event.eventId)
    .sort();
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
