import { nestedCanonicalLearningEvents } from "@/lib/canonicalLearningEvidence";
import type {
  RegistryCapabilityDomain,
  RegistryTaskFamily,
  RegistryTaskVariant,
} from "@/lib/curriculaRegistry";
import type { LearningEvent } from "@/lib/learningEvent";
import { MasteryPolicy } from "@/lib/masteryPolicy";
import type { WebLearningAttemptEvidenceEvent } from "@/lib/webLearningEvidence";

export type AssuranceStage = "independent" | "mastered" | "practicing" | "transfer" | "unproven";
export type ApplicationStage = "artifact" | "integrated" | "none" | "rerun";

export type CapabilityProofReceipt = {
  artifactContentHashes: string[];
  creditEventId: string;
  evidenceTime: string;
  lessonRef: string;
  runtimeTier: string;
  sectionId: string;
  taskFamilyId: string;
  taskVariantId: string;
};

export type CapabilityProjection = {
  application: {
    receiptCount: number;
    receipts: CapabilityProofReceipt[];
    stage: ApplicationStage;
  };
  assuranceStage: AssuranceStage;
  claims: Array<{
    claimId: string;
    nextTaskFamilyId: string | null;
    requiredFamilyCount: number;
    stage: AssuranceStage;
    statement: string;
  }>;
  domainId: string;
  label: string;
  reviewDue: boolean;
  taskFamilies: Array<{
    label: string;
    outcomeIds: string[];
    receipts: CapabilityProofReceipt[];
    reviewDue: boolean;
    stage: AssuranceStage;
    taskFamilyId: string;
  }>;
};

const stageRank: Record<AssuranceStage, number> = {
  unproven: 0,
  practicing: 1,
  independent: 2,
  transfer: 3,
  mastered: 4,
};

export async function projectRegistryCapability(
  domain: RegistryCapabilityDomain,
  evidence: Iterable<WebLearningAttemptEvidenceEvent>,
  options: { asOf?: string } = {},
): Promise<CapabilityProjection> {
  const events = nestedCanonicalLearningEvents(evidence);
  const taskFamilies: CapabilityProjection["taskFamilies"] = [];
  for (const family of domain.taskFamilies) {
    const claim = domain.capabilityClaims.find((item) => item.id === family.ownerClaimId);
    const compatible = compatibleFamilyEvents(events, family, claim?.version ?? 0);
    const mastery = await new MasteryPolicy().reduce(compatible, options);
    const byOutcome = new Map(mastery.outcomes.map((outcome) => [outcome.outcomeId, outcome]));
    const stages = family.outcomeIds.map((outcomeId) => scoreStage(byOutcome.get(outcomeId)?.score ?? 0));
    const receipts = proofReceipts(
      compatible,
      new Set(family.outcomeIds.flatMap((outcomeId) => byOutcome.get(outcomeId)?.creditEventIds ?? [])),
    );
    taskFamilies.push({
      label: family.invariant,
      outcomeIds: family.outcomeIds,
      receipts,
      reviewDue: family.outcomeIds.some((outcomeId) => byOutcome.get(outcomeId)?.reviewDue === true),
      stage: minimumStage(stages),
      taskFamilyId: family.id,
    });
  }
  const familyById = new Map(taskFamilies.map((family) => [family.taskFamilyId, family]));
  const claims = domain.capabilityClaims.map((claim) => {
    const required = claim.requiredTaskFamilyIds.flatMap((familyId) => {
      const family = familyById.get(familyId);
      return family ? [family] : [];
    });
    const next = [...required].sort((left, right) => (
      stageRank[left.stage] - stageRank[right.stage] || left.taskFamilyId.localeCompare(right.taskFamilyId)
    ))[0];
    return {
      claimId: claim.id,
      nextTaskFamilyId: next && next.stage !== "mastered" ? next.taskFamilyId : null,
      requiredFamilyCount: required.length,
      stage: minimumStage(required.map((family) => family.stage)),
      statement: claim.statement,
    };
  });
  const assuranceStage = minimumStage(taskFamilies.map((family) => family.stage));
  const wholePolicy = await new MasteryPolicy().reduce(events, options);
  const rejectedApplicationIds = new Set(wholePolicy.invalidEventIds);
  for (const event of events) {
    if (event.kind !== "EvidenceTombstoned" || !Array.isArray(event.revokedCreditEventIds)) continue;
    event.revokedCreditEventIds.forEach((eventId: unknown) => rejectedApplicationIds.add(String(eventId)));
  }
  const applicationReceipts = applicationProofReceipts(events, domain, rejectedApplicationIds);
  return {
    application: {
      receiptCount: applicationReceipts.length,
      receipts: applicationReceipts,
      stage: !applicationReceipts.length
        ? "none"
        : stageRank[assuranceStage] >= stageRank.independent ? "integrated" : "artifact",
    },
    assuranceStage,
    claims,
    domainId: domain.id,
    label: domain.label,
    reviewDue: taskFamilies.some((family) => family.reviewDue),
    taskFamilies,
  };
}

function compatibleFamilyEvents(
  events: LearningEvent[],
  family: RegistryTaskFamily,
  claimVersion: number,
): LearningEvent[] {
  const variants = new Map(Object.values(family.variants).map((variant) => [variant.taskVariantId, variant]));
  const runIds = new Set(events.flatMap((event) => {
    if (event.kind !== "RunObserved") return [];
    const context = event.runContext as Record<string, unknown>;
    const variant = variants.get(String(context.taskVariantId ?? ""));
    return variant && compatibleRunContext(context, family, variant, claimVersion) ? [event.eventId] : [];
  }));
  const related = events.filter((event) => (
    runIds.has(event.eventId)
    || ("runEventId" in event && runIds.has(String(event.runEventId)))
  ));
  const creditIds = new Set(
    related.filter((event) => event.kind === "CreditGranted").map((event) => event.eventId),
  );
  return events.filter((event) => (
    related.includes(event)
    || (
      event.kind === "EvidenceTombstoned"
      && Array.isArray(event.revokedCreditEventIds)
      && event.revokedCreditEventIds.some((eventId: unknown) => creditIds.has(String(eventId)))
    )
  ));
}

function compatibleRunContext(
  context: Record<string, unknown>,
  family: RegistryTaskFamily,
  variant: RegistryTaskVariant,
  claimVersion: number,
) {
  return context.masteryPolicyVersion === 2
    && context.capabilityClaimId === family.ownerClaimId
    && context.capabilityClaimVersion === claimVersion
    && context.taskFamilyId === family.id
    && context.taskFamilyVersion === family.version
    && context.taskVariantVersion === variant.taskVariantVersion
    && context.checkSpecId === variant.checkSpecId
    && String(context.checkSpecVersion) === variant.checkSpecVersion
    && context.fixtureHash === variant.fixtureHash
    && sameStrings(context.outcomeIds, family.outcomeIds);
}

function applicationProofReceipts(
  events: LearningEvent[],
  domain: RegistryCapabilityDomain,
  rejectedCreditIds: Set<string>,
): CapabilityProofReceipt[] {
  const byId = new Map(events.map((event) => [event.eventId, event]));
  const validIds = new Set<string>();
  for (const credit of events) {
    if (credit.kind !== "CreditGranted") continue;
    if (rejectedCreditIds.has(credit.eventId)) continue;
    const slices = Array.isArray(credit.creditSlices) ? credit.creditSlices.filter(isRecord) : [];
    if (!slices.length || slices.some((slice) => slice.creditMode !== "capstone")) continue;
    const run = byId.get(String(credit.runEventId));
    if (!run || run.kind !== "RunObserved" || run.runStatus !== "success") continue;
    const context = run.runContext as Record<string, unknown>;
    const family = domain.taskFamilies.find((item) => item.id === context.taskFamilyId);
    const claim = domain.capabilityClaims.find((item) => item.id === family?.ownerClaimId);
    const variant = family?.applicationVariant;
    if (
      !family || !claim || !variant
      || context.tierUsed !== "local"
      || !compatibleRunContext(context, family, variant, claim.version)
      || context.artifactContractId !== family.artifactContractId
      || context.artifactContractVersion !== family.artifactContractVersion
      || !Array.isArray(run.artifactDescriptors)
      || !run.artifactDescriptors.length
    ) continue;
    const checks = (credit.checkEventIds as string[]).map((eventId) => byId.get(eventId));
    if (!checks.length || checks.some((check) => (
      !check || check.kind !== "CheckEvaluated" || check.strength !== "strong"
      || check.passed !== true || check.assessmentMode !== "capstone"
    ))) continue;
    validIds.add(credit.eventId);
  }
  return proofReceipts(events, validIds);
}

function proofReceipts(events: LearningEvent[], creditIds: Set<string>): CapabilityProofReceipt[] {
  const byId = new Map(events.map((event) => [event.eventId, event]));
  return [...creditIds].sort().flatMap((creditId) => {
    const credit = byId.get(creditId);
    if (!credit || credit.kind !== "CreditGranted") return [];
    const run = byId.get(String(credit.runEventId));
    if (!run || run.kind !== "RunObserved") return [];
    const context = run.runContext as Record<string, unknown>;
    const artifacts = Array.isArray(run.artifactDescriptors) ? run.artifactDescriptors.filter(isRecord) : [];
    return [{
      artifactContentHashes: artifacts.map((artifact) => String(artifact.contentHash ?? "")).filter(Boolean),
      creditEventId: creditId,
      evidenceTime: String(credit.evidenceTime),
      lessonRef: String(context.lessonRef),
      runtimeTier: String(context.tierUsed),
      sectionId: String(context.sectionId),
      taskFamilyId: String(context.taskFamilyId ?? ""),
      taskVariantId: String(context.taskVariantId),
    }];
  });
}

function minimumStage(stages: AssuranceStage[]): AssuranceStage {
  return [...stages].sort((left, right) => stageRank[left] - stageRank[right])[0] ?? "unproven";
}

function scoreStage(score: number): AssuranceStage {
  if (score >= 1) return "mastered";
  if (score >= 0.8) return "transfer";
  if (score >= 0.6) return "independent";
  if (score > 0) return "practicing";
  return "unproven";
}

function sameStrings(value: unknown, expected: string[]) {
  return Array.isArray(value)
    && value.every((item) => typeof item === "string")
    && value.length === expected.length
    && [...value].sort().every((item, index) => item === [...expected].sort()[index]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
