import { curriculumApi } from "@/lib/api/curriculumApi";
import {
  projectRegistryCapability,
  type CapabilityProjection,
} from "@/lib/capabilityProjection";
import { registryCapabilityDomain } from "@/lib/curriculaRegistry";
import { readLearningEvidenceEvents } from "@/lib/learningEvidenceOperations";

const REPORT_AUTOMATION_DOMAIN_ID = "reportAutomationFoundation";

export async function loadReportAutomationCapability(): Promise<CapabilityProjection | null> {
  const [domain, evidence] = await Promise.all([
    registryCapabilityDomain(REPORT_AUTOMATION_DOMAIN_ID),
    readLearningEvidenceEvents(),
  ]);
  if (!domain) return null;
  const localProjection = await projectRegistryCapability(
    domain,
    evidence,
    { asOf: new Date().toISOString() },
  );
  const remote = await curriculumApi.curriculumCapability(domain.id).catch(() => null);
  return isCapabilityProjection(remote)
    ? mergeCapabilityProjection(localProjection, remote)
    : localProjection;
}

function mergeCapabilityProjection(
  local: CapabilityProjection,
  remote: CapabilityProjection,
): CapabilityProjection {
  const rank: Record<CapabilityProjection["application"]["stage"], number> = {
    none: 0,
    artifact: 1,
    integrated: 2,
    rerun: 3,
  };
  return rank[remote.application.stage] > rank[local.application.stage]
    ? { ...local, application: remote.application }
    : local;
}

function isCapabilityProjection(value: unknown): value is CapabilityProjection {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Partial<CapabilityProjection>;
  return row.domainId === REPORT_AUTOMATION_DOMAIN_ID
    && typeof row.assuranceStage === "string"
    && Array.isArray(row.claims)
    && Array.isArray(row.taskFamilies)
    && Boolean(row.application && typeof row.application.stage === "string");
}
