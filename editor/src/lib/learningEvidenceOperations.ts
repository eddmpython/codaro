import { codaroApi, shouldUseApi } from "@/lib/api";
import {
  buildCanonicalStrongCheckEvents,
  nestedCanonicalLearningEvents,
} from "@/lib/canonicalLearningEvidence";
import {
  appendWebStrongCheckEvidenceEventTransaction,
  attachCanonicalEventsToStrongEvidence,
  createWebStrongCheckEvidenceEvent,
  importWebLearningEvidenceArchive,
  listWebStrongCheckEvidence,
  replaceWebLearningEvidenceArchive,
  serializeWebLearningEvidenceArchive,
  summarizeWebLearningEvidence,
  type WebLearningEvidenceImportReceipt,
  type WebLearningEvidenceSummary,
  type WebStrongCheckEvidenceEvent,
  type WebStrongCheckEvidenceInput,
} from "@/lib/webLearningEvidence";

export function learningEvidenceRuntimeTier(): "local" | "web" {
  return shouldUseApi() ? "local" : "web";
}

export function usesLocalLearningEvidence(): boolean {
  return learningEvidenceRuntimeTier() === "local";
}

export function readLearningEvidenceSummary(): Promise<WebLearningEvidenceSummary> {
  return usesLocalLearningEvidence() ? codaroApi.learningEvidenceSummary() : summarizeWebLearningEvidence();
}

export async function exportLearningEvidenceArchive(): Promise<string> {
  if (!usesLocalLearningEvidence()) return serializeWebLearningEvidenceArchive();
  return `${JSON.stringify(await codaroApi.learningEvidenceArchive(), null, 2)}\n`;
}

export async function importLearningEvidenceArchive(rawArchive: string): Promise<WebLearningEvidenceImportReceipt> {
  const localRuntime = usesLocalLearningEvidence();
  const receipt = localRuntime
    ? await codaroApi.importLearningEvidence(JSON.parse(rawArchive) as Record<string, unknown>)
    : await importWebLearningEvidenceArchive(rawArchive);
  return receipt;
}

export async function replaceLearningEvidenceArchive(rawArchive: string): Promise<void> {
  if (usesLocalLearningEvidence()) {
    throw new Error("Local 학습 archive는 서버의 원자 import 경로에서만 복원할 수 있습니다.");
  }
  await replaceWebLearningEvidenceArchive(rawArchive);
}

export async function readLearningEvidenceEvents(
  category?: string,
  contentId?: string,
): Promise<WebStrongCheckEvidenceEvent[]> {
  const lessonRef = category && contentId ? `${category}/${contentId}` : undefined;
  if (!usesLocalLearningEvidence()) return listWebStrongCheckEvidence(lessonRef);
  const archive = await codaroApi.learningEvidenceArchive();
  if (!Array.isArray(archive.events)) return [];
  return archive.events
    .filter(isStrongCheckEvidenceEvent)
    .filter((event) => !lessonRef || event.lessonRef === lessonRef);
}

export async function storeStrongLearningEvidence(input: WebStrongCheckEvidenceInput): Promise<void> {
  const baseEvent = await createWebStrongCheckEvidenceEvent(input);
  const priorStrongEvents = await readLearningEvidenceEvents();
  const canonicalEvents = await buildCanonicalStrongCheckEvents(
    input,
    baseEvent,
    nestedCanonicalLearningEvents(priorStrongEvents),
  );
  const event = await attachCanonicalEventsToStrongEvidence(baseEvent, canonicalEvents);
  if (usesLocalLearningEvidence()) {
    await codaroApi.appendLearningEvidence(event as unknown as Record<string, unknown>);
    return;
  }
  await appendWebStrongCheckEvidenceEventTransaction(event);
}

function isStrongCheckEvidenceEvent(value: unknown): value is WebStrongCheckEvidenceEvent {
  if (!isRecord(value)) return false;
  return value.kind === "StrongCheckVerified"
    && typeof value.checkId === "string"
    && typeof value.lessonRef === "string"
    && typeof value.occurredAt === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
