export type LearningEventKind =
  | "RunObserved"
  | "CheckEvaluated"
  | "SupportProvided"
  | "CreditGranted"
  | "MigrationImported"
  | "EvidenceTombstoned";

export type MasteryStage =
  | "unproven"
  | "practicing"
  | "independent"
  | "transfer"
  | "mastered"
  | "reviewDue";

export type CreditMode = "acquisition" | "reinforcement" | "transfer" | "retrieval" | "capstone";

export type LearningEvent = Record<string, unknown> & {
  schemaVersion: 1;
  eventId: string;
  kind: LearningEventKind;
  occurredAt: string;
  payloadHash: string;
  learningEpoch: string;
  epochRefByScope: { global: string; path?: string; lesson?: string };
  deviceId: string;
  deviceSequence: string;
  lamport: string;
};

const eventKinds = new Set<LearningEventKind>([
  "RunObserved",
  "CheckEvaluated",
  "SupportProvided",
  "CreditGranted",
  "MigrationImported",
  "EvidenceTombstoned",
]);
const creditModes = new Set<CreditMode>(["acquisition", "reinforcement", "transfer", "retrieval", "capstone"]);
const masteryStages = new Set<MasteryStage>(["unproven", "practicing", "independent", "transfer", "mastered", "reviewDue"]);
const counterPattern = /^(0|[1-9][0-9]*)$/;
const hashPattern = /^sha256-(?:[0-9a-f]{64}|[A-Za-z0-9_-]{43}|[A-Za-z0-9+/]{43}=)$/;

export function stableLearningJson(value: unknown): string {
  return JSON.stringify(normalizeJson(value));
}

export async function learningEventDigest(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(stableLearningJson(value));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return `sha256-${[...digest].map((item) => item.toString(16).padStart(2, "0")).join("")}`;
}

export function learningEventOrderKey(value: LearningEvent): [bigint, string, bigint, string] {
  return [BigInt(value.lamport), value.deviceId, BigInt(value.deviceSequence), value.eventId];
}

export function compareLearningEvents(left: LearningEvent, right: LearningEvent): number {
  const leftKey = learningEventOrderKey(left);
  const rightKey = learningEventOrderKey(right);
  for (let index = 0; index < leftKey.length; index += 1) {
    const leftValue = leftKey[index];
    const rightValue = rightKey[index];
    if (leftValue === rightValue) continue;
    return leftValue < rightValue ? -1 : 1;
  }
  return 0;
}

export async function sealLearningEvent(core: Record<string, unknown>): Promise<LearningEvent> {
  if ("payloadHash" in core) throw new Error("LearningEvent core must not contain payloadHash");
  const normalized = normalizeJson(core);
  if (!isRecord(normalized)) throw new Error("LearningEvent core must be an object");
  validateEventShape(normalized, false);
  return {
    ...normalized,
    payloadHash: await learningEventDigest(normalized),
  } as LearningEvent;
}

export async function validateLearningEvent(value: unknown): Promise<LearningEvent> {
  const normalized = normalizeJson(value);
  if (!isRecord(normalized)) throw new Error("LearningEvent must be an object");
  validateEventShape(normalized, true);
  const { payloadHash, ...core } = normalized;
  if (payloadHash !== await learningEventDigest(core)) {
    throw new Error("LearningEvent payloadHash does not match its canonical payload");
  }
  return normalized as LearningEvent;
}

function validateEventShape(value: Record<string, unknown>, requirePayloadHash: boolean): void {
  const required = [
    "schemaVersion", "eventId", "kind", "occurredAt", "learningEpoch",
    "epochRefByScope", "deviceId", "deviceSequence", "lamport",
  ];
  if (requirePayloadHash) required.push("payloadHash");
  requireFields(value, required, "LearningEvent envelope");
  if (value.schemaVersion !== 1) throw new Error("LearningEvent schemaVersion is unsupported");
  requireText(value, "eventId");
  requireText(value, "deviceId");
  requireText(value, "learningEpoch");
  requireTimestamp(value, "occurredAt");
  if (typeof value.kind !== "string" || !eventKinds.has(value.kind as LearningEventKind)) {
    throw new Error("LearningEvent kind is unsupported");
  }
  for (const field of ["deviceSequence", "lamport"]) {
    if (typeof value[field] !== "string" || !counterPattern.test(value[field])) {
      throw new Error(`LearningEvent ${field} must be a decimal string`);
    }
  }
  const epochRefs = requireRecord(value, "epochRefByScope");
  requireText(epochRefs, "global");
  if (Object.keys(epochRefs).some((key) => !new Set(["global", "path", "lesson"]).has(key))) {
    throw new Error("LearningEvent epochRefByScope contains an unknown scope");
  }
  if (requirePayloadHash) requireHash(value, "payloadHash");

  const validators: Record<LearningEventKind, (event: Record<string, unknown>) => void> = {
    RunObserved: validateRunObserved,
    CheckEvaluated: validateCheckEvaluated,
    SupportProvided: validateSupportProvided,
    CreditGranted: validateCreditGranted,
    MigrationImported: validateMigrationImported,
    EvidenceTombstoned: validateEvidenceTombstoned,
  };
  validators[value.kind as LearningEventKind](value);
}

function validateRunObserved(value: Record<string, unknown>): void {
  requireFields(value, ["runContext", "startedAt", "completedAt", "runStatus"], "RunObserved");
  const context = requireRecord(value, "runContext");
  const contextFields = [
    "attemptId", "runId", "lessonRef", "sectionId", "outcomeIds", "taskVariantId",
    "lessonContentHash", "sourceCodeHash", "checkSpecId", "checkSpecVersion",
    "checkEngineVersion", "masteryPolicyVersion", "fixtureHash", "tierUsed",
    "runtimeId", "runtimeVersion", "packageSetHash",
  ];
  requireFields(context, contextFields, "RunContext");
  for (const field of [
    "attemptId", "runId", "lessonRef", "sectionId", "taskVariantId", "checkSpecId",
    "checkSpecVersion", "checkEngineVersion", "runtimeId", "runtimeVersion",
  ]) requireText(context, field);
  const lessonRef = String(context.lessonRef);
  if (lessonRef.split("/").length !== 2 || lessonRef.startsWith("/") || lessonRef.endsWith("/")) {
    throw new Error("RunContext lessonRef must be category/contentId");
  }
  const outcomeIds = requireTextList(context, "outcomeIds");
  if (new Set(outcomeIds).size !== outcomeIds.length) throw new Error("RunContext outcomeIds must be unique");
  for (const field of ["lessonContentHash", "sourceCodeHash", "fixtureHash", "packageSetHash"]) {
    requireHash(context, field);
  }
  if (context.masteryPolicyVersion !== 1) throw new Error("RunContext masteryPolicyVersion is unsupported");
  if (!new Set(["browser", "local"]).has(String(context.tierUsed))) throw new Error("RunContext tierUsed is invalid");
  requireTimestamp(value, "startedAt");
  requireTimestamp(value, "completedAt");
  if (!new Set(["success", "error", "stopped", "timeout"]).has(String(value.runStatus))) {
    throw new Error("RunObserved runStatus is invalid");
  }
}

function validateCheckEvaluated(value: Record<string, unknown>): void {
  requireFields(value, [
    "runEventId", "checkId", "strength", "passed", "assessmentMode",
    "unseen", "errorClass", "recommendedHintLevel",
  ], "CheckEvaluated");
  requireText(value, "runEventId");
  requireText(value, "checkId");
  if (!new Set(["weak", "strong"]).has(String(value.strength))) throw new Error("CheckEvaluated strength is invalid");
  if (typeof value.passed !== "boolean" || typeof value.unseen !== "boolean") {
    throw new Error("CheckEvaluated passed and unseen must be booleans");
  }
  if (!creditModes.has(value.assessmentMode as CreditMode)) throw new Error("CheckEvaluated assessmentMode is invalid");
  if (typeof value.errorClass !== "string") throw new Error("CheckEvaluated errorClass must be a string");
  if (!isNonNegativeInteger(value.recommendedHintLevel)) throw new Error("CheckEvaluated recommendedHintLevel is invalid");
}

function validateSupportProvided(value: Record<string, unknown>): void {
  requireFields(value, ["runEventId", "hintLevel", "answerReveal", "supportId"], "SupportProvided");
  requireText(value, "runEventId");
  requireText(value, "supportId");
  if (!isNonNegativeInteger(value.hintLevel)) throw new Error("SupportProvided hintLevel is invalid");
  if (typeof value.answerReveal !== "boolean") throw new Error("SupportProvided answerReveal must be a boolean");
}

function validateCreditGranted(value: Record<string, unknown>): void {
  requireFields(value, [
    "runEventId", "checkEventIds", "supportEventIds", "attemptFingerprint",
    "creditSlices", "evidenceTime", "appendReceiptAt",
  ], "CreditGranted");
  requireText(value, "runEventId");
  const checkIds = requireTextList(value, "checkEventIds");
  const supportIds = requireTextList(value, "supportEventIds");
  if (!checkIds.length || new Set(checkIds).size !== checkIds.length) throw new Error("CreditGranted check IDs are invalid");
  if (new Set(supportIds).size !== supportIds.length) throw new Error("CreditGranted support IDs are invalid");
  requireHash(value, "attemptFingerprint");
  requireTimestamp(value, "evidenceTime");
  requireTimestamp(value, "appendReceiptAt");
  if (!Array.isArray(value.creditSlices) || !value.creditSlices.length) throw new Error("CreditGranted creditSlices must be non-empty");
  const outcomeIds: string[] = [];
  for (const rawSlice of value.creditSlices) {
    if (!isRecord(rawSlice)) throw new Error("CreditGranted credit slice must be an object");
    requireFields(rawSlice, ["outcomeId", "creditMode", "preAttemptState"], "CreditSlice");
    requireText(rawSlice, "outcomeId");
    if (!creditModes.has(rawSlice.creditMode as CreditMode)) throw new Error("CreditSlice creditMode is invalid");
    if (!masteryStages.has(rawSlice.preAttemptState as MasteryStage)) throw new Error("CreditSlice preAttemptState is invalid");
    outcomeIds.push(String(rawSlice.outcomeId));
  }
  if (new Set(outcomeIds).size !== outcomeIds.length) throw new Error("CreditGranted may contain one slice per outcome");
}

function validateMigrationImported(value: Record<string, unknown>): void {
  requireFields(value, ["sourceKind", "sourceRecordHash", "recordCount", "creditEligibility"], "MigrationImported");
  requireText(value, "sourceKind");
  requireHash(value, "sourceRecordHash");
  if (!isNonNegativeInteger(value.recordCount)) throw new Error("MigrationImported recordCount is invalid");
  if (value.creditEligibility !== "none") throw new Error("MigrationImported cannot grant mastery credit");
}

function validateEvidenceTombstoned(value: Record<string, unknown>): void {
  requireFields(value, ["scope", "parentEpoch", "newEpoch", "frontierByDevice", "revokedCreditEventIds"], "EvidenceTombstoned");
  for (const field of ["scope", "parentEpoch", "newEpoch"]) requireText(value, field);
  const scope = String(value.scope);
  if (scope !== "global" && !scope.startsWith("path:") && !scope.startsWith("lesson:")) {
    throw new Error("EvidenceTombstoned scope is invalid");
  }
  const frontier = requireRecord(value, "frontierByDevice");
  if (Object.values(frontier).some((counter) => typeof counter !== "string" || !counterPattern.test(counter))) {
    throw new Error("EvidenceTombstoned frontier counter is invalid");
  }
  const revoked = requireTextList(value, "revokedCreditEventIds");
  if (new Set(revoked).size !== revoked.length) throw new Error("EvidenceTombstoned revoked IDs must be unique");
}

function normalizeJson(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\r\n?/g, "\n").normalize("NFC");
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("LearningEvent canonical JSON rejects non-finite numbers");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key.normalize("NFC"), normalizeJson(item)] as const)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)),
    );
  }
  throw new Error(`LearningEvent contains a non-JSON value: ${typeof value}`);
}

function requireFields(value: Record<string, unknown>, fields: string[], label: string): void {
  const missing = fields.filter((field) => !(field in value));
  if (missing.length) throw new Error(`${label} is missing fields: ${missing.join(", ")}`);
}

function requireRecord(value: Record<string, unknown>, field: string): Record<string, unknown> {
  const item = value[field];
  if (!isRecord(item)) throw new Error(`${field} must be an object`);
  return item;
}

function requireText(value: Record<string, unknown>, field: string): void {
  if (typeof value[field] !== "string" || !value[field]) throw new Error(`${field} must be a non-empty string`);
}

function requireHash(value: Record<string, unknown>, field: string): void {
  if (typeof value[field] !== "string" || !hashPattern.test(value[field])) throw new Error(`${field} must be a canonical SHA-256 value`);
}

function requireTimestamp(value: Record<string, unknown>, field: string): void {
  const timestamp = value[field];
  if (
    typeof timestamp !== "string"
    || !/(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp)
    || !Number.isFinite(Date.parse(timestamp))
  ) {
    throw new Error(`${field} must be an ISO timestamp with a timezone`);
  }
}

function requireTextList(value: Record<string, unknown>, field: string): string[] {
  const item = value[field];
  if (!Array.isArray(item) || item.some((entry) => typeof entry !== "string" || !entry)) {
    throw new Error(`${field} must be a list of non-empty strings`);
  }
  return item as string[];
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
