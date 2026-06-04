import type {
  AiChatRequest,
  AiChatResponse,
  AiProfile,
  AiProviderCatalogPayload,
  AiToolCatalogPayload,
  AuditPayload,
  BootstrapPayload,
  CheckResult,
  CodaroDocument,
  CurriculumCategoriesPayload,
  CurriculumContentsPayload,
  CurriculumGapsPayload,
  CurriculumLessonPayload,
  CurriculumTaxonomyPayload,
  AnalyticsListPayload,
  AnalyticsSummaryPayload,
  CheckProposalsPayload,
  CurriculumQualityReportPayload,
  LessonStatsPayload,
  MasteryReportPayload,
  ReviewListPayload,
  ReviewStatePayload,
  LearnerSnapshotPayload,
  LearnerOutcomePayload,
  DiagnosticExportPayload,
  DiagnosticSummary,
  EStopStatus,
  ExecutionResult,
  MasterPlanPayload,
  MasterPlanRequestBody,
  OauthAuthorizePayload,
  OauthStatusPayload,
  PackageEnvironment,
  PackageInfo,
  PackageInstallCommand,
  PackageInstallResult,
  ProviderDiagnostic,
  ProviderValidationPayload,
  ProgressSummary,
  ReactiveDiagnostics,
  SchedulerStatus,
  SharePackListPayload,
  SharePackAutomationPayload,
  SharePackPreview,
  SharePackRecord,
  SharePackStatusPayload,
  TaskDefinition,
  TaskListPayload,
  TaskRun,
  VariableInfo,
} from "@/types";
import {
  applyAssistantStreamProtocolEvent,
  initialAssistantStreamState,
  parseAssistantStreamEvent,
  type StreamEvent,
} from "@/lib/assistantStream";

const configuredApiBase = import.meta.env.VITE_CODARO_API_BASE?.replace(/\/$/, "") ?? "";

// 리액티브 실행 응답 — 결과 + 진단 묶음(진단 필드는 옵셔널: 오프라인/구버전 경로 호환).
export type ReactiveResponse = {
  results: ExecutionResult[];
  executionOrder: string[];
} & Partial<ReactiveDiagnostics>;

export class CodaroApiError extends Error {
  readonly status: number;
  readonly diagnostic?: ProviderDiagnostic;

  constructor(status: number, message: string, diagnostic?: ProviderDiagnostic) {
    super(message);
    this.name = "CodaroApiError";
    this.status = status;
    this.diagnostic = diagnostic;
  }
}

export function shouldUseApi() {
  if (configuredApiBase) return true;
  if (typeof window === "undefined") return true;
  return !/^517\d$/.test(window.location.port);
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${configuredApiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    let diagnostic: ProviderDiagnostic | undefined;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      const parsed = parseApiErrorPayload(payload, detail);
      detail = parsed.message;
      diagnostic = parsed.diagnostic;
    } catch {
      detail = response.statusText;
    }
    throw new CodaroApiError(response.status, `${response.status} ${detail}`, diagnostic);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

function putJson<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
  });
}

function deleteJson<T>(path: string): Promise<T> {
  return requestJson<T>(path, { method: "DELETE" });
}

async function postStreamChat(
  path: string,
  body: AiChatRequest,
  onEvent: (event: StreamEvent) => void,
): Promise<AiChatResponse> {
  const response = await fetch(`${configuredApiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    let detail = response.statusText;
    let diagnostic: ProviderDiagnostic | undefined;
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      const parsed = parseApiErrorPayload(payload, detail);
      detail = parsed.message;
      diagnostic = parsed.diagnostic;
    } catch {
      detail = response.statusText;
    }
    throw new CodaroApiError(response.status, `${response.status} ${detail}`, diagnostic);
  }

  if (!response.body) {
    throw new Error("stream body unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamState = initialAssistantStreamState(body);

  const handleEvent = (event: StreamEvent) => {
    streamState = applyAssistantStreamProtocolEvent(streamState, event);
    onEvent(event);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const rawEvent of events) {
      const event = parseAssistantStreamEvent(rawEvent);
      if (!event) continue;
      handleEvent(event);
    }
  }

  const tail = parseAssistantStreamEvent(buffer);
  if (tail) {
    handleEvent(tail);
  }

  if (streamState.error) {
    throw new CodaroApiError(503, streamState.error, streamState.diagnostic);
  }

  if (!streamState.donePayload) {
    throw new Error("stream finished without done event");
  }
  return streamState.donePayload;
}

export const codaroApi = {
  health: () => requestJson<{ status: string }>("/api/health"),
  bootstrap: () => requestJson<BootstrapPayload>("/api/bootstrap"),
  systemDiagnostics: () => requestJson<DiagnosticSummary>("/api/system/diagnostics"),
  systemDiagnosticsExport: () => requestJson<DiagnosticExportPayload>("/api/system/diagnostics/export"),
  loadDocument: (path: string) => postJson<{ path: string; document: CodaroDocument; exists: boolean }>(
    "/api/document/load",
    { path },
  ),
  saveDocument: (path: string, document: CodaroDocument) => postJson<{ path: string }>("/api/document/save", {
    path,
    document,
  }),
  createSession: (workingDirectory?: string | null) => postJson<{ sessionId: string; status: string }>(
    "/api/kernel/create",
    { workingDirectory: workingDirectory ?? null },
  ),
  executeCode: (sessionId: string, code: string, blockId?: string | null) => postJson<ExecutionResult>(
    `/api/kernel/${sessionId}/execute`,
    { code, blockId: blockId ?? null },
  ),
  executeReactive: (
    sessionId: string,
    blockId: string,
    blocks: Array<{ id: string; type: "code" | "markdown"; content: string }>,
    notebookName?: string | null,
  ) => postJson<ReactiveResponse>(
    `/api/kernel/${sessionId}/execute-reactive`,
    { blockId, blocks, notebookName: notebookName ?? null },
  ),
  setUiValue: (
    sessionId: string,
    payload: {
      blockId: string;
      elementId: string;
      value: unknown;
      blocks: Array<{ id: string; type: "code" | "markdown"; content: string }>;
    },
  ) => postJson<ReactiveResponse>(
    `/api/kernel/${sessionId}/set-ui-value`,
    payload,
  ),
  removeCell: (sessionId: string, blockId: string) => postJson<{ status: string }>(
    `/api/kernel/${sessionId}/remove-cell`,
    { code: "", blockId },
  ),
  variables: (sessionId: string) => requestJson<VariableInfo[]>(`/api/kernel/${sessionId}/variables`),
  resetSession: (sessionId: string) => postJson<{ status: string }>(`/api/kernel/${sessionId}/reset`, {}),
  complete: (payload: {
    prefix: string;
    suffix?: string;
    context?: { variables?: Array<{ name: string; type?: string }>; blocks?: Array<{ type: string; content: string }> };
    provider?: string | null;
  }) => postJson<{ completions: string[]; provider: string; model: string | null }>("/api/ai/complete", {
    prefix: payload.prefix,
    suffix: payload.suffix ?? "",
    context: payload.context ?? null,
    provider: payload.provider ?? null,
  }),
  sendUiEvent: (
    sessionId: string,
    payload: { callbackId: string; eventType?: string; payload?: unknown; blockId?: string | null },
  ) => postJson<{
    status: string;
    callbackId: string;
    eventType: string;
    result?: unknown;
    error?: string | null;
    reactiveTrigger?: string[];
    affectedVariables?: string[];
  }>(
    `/api/kernel/${sessionId}/ui-event`,
    {
      callbackId: payload.callbackId,
      eventType: payload.eventType ?? "invoke",
      payload: payload.payload ?? null,
      blockId: payload.blockId ?? null,
    },
  ),
  packagesList: () => requestJson<PackageInfo[]>("/api/packages/list"),
  packageEnvironment: () => requestJson<PackageEnvironment>("/api/packages/environment"),
  packageInstallCommand: (names: string[]) => postJson<PackageInstallCommand>(
    "/api/packages/install-command",
    { names },
  ),
  packageInstall: (name: string) => postJson<PackageInstallResult>("/api/packages/install", { name }),
  sessionPackagesList: (sessionId: string) => requestJson<PackageInfo[]>(`/api/kernel/${sessionId}/packages/list`),
  sessionPackageInstall: (sessionId: string, name: string) =>
    postJson<PackageInstallResult>(`/api/kernel/${sessionId}/packages/install`, { name }),
  curriculumCategories: () => requestJson<CurriculumCategoriesPayload>("/api/curriculum/categories"),
  curriculumContents: (category: string) => requestJson<CurriculumContentsPayload>(
    `/api/curriculum/contents/${encodeURIComponent(category)}`,
  ),
  curriculumLesson: (category: string, contentId: string) => requestJson<CurriculumLessonPayload>(
    `/api/curriculum/content/${encodeURIComponent(category)}/${encodeURIComponent(contentId)}`,
  ),
  curriculumTaxonomy: () => requestJson<CurriculumTaxonomyPayload>("/api/curriculum/taxonomy"),
  curriculumMasterPlan: (payload: MasterPlanRequestBody) =>
    postJson<MasterPlanPayload>("/api/curriculum/master-plan", payload),
  curriculumGaps: (domain?: string) => requestJson<CurriculumGapsPayload>(
    domain
      ? `/api/curriculum/gaps?domain=${encodeURIComponent(domain)}`
      : "/api/curriculum/gaps",
  ),
  curriculumMastery: () => requestJson<MasteryReportPayload>("/api/curriculum/mastery"),
  learnerSnapshot: () => requestJson<LearnerSnapshotPayload>("/api/learner/snapshot"),
  learnerOutcome: (outcomeId: string) =>
    requestJson<LearnerOutcomePayload>(
      `/api/learner/outcome/${encodeURIComponent(outcomeId)}`,
    ),
  curriculumValidateOutcome: (outcomeId: string, validated: boolean) =>
    postJson<{ outcomeId: string; validated: boolean }>(
      "/api/curriculum/outcomes/validate",
      { outcomeId, validated },
    ),
  curriculumReviews: () => requestJson<ReviewListPayload>("/api/curriculum/reviews"),
  curriculumRecordReview: (category: string, contentId: string, success: boolean) =>
    postJson<ReviewStatePayload>(
      `/api/curriculum/reviews/${encodeURIComponent(category)}/${encodeURIComponent(contentId)}`,
      { success },
    ),
  curriculumAnalytics: (days: number = 30) =>
    requestJson<AnalyticsListPayload>(`/api/curriculum/analytics?days=${days}`),
  curriculumAnalyticsSummary: () =>
    requestJson<AnalyticsSummaryPayload>("/api/curriculum/analytics/summary"),
  curriculumLessonStats: () =>
    requestJson<LessonStatsPayload>("/api/curriculum/lesson-stats"),
  curriculumCheckProposals: () =>
    requestJson<CheckProposalsPayload>("/api/curriculum/check-proposals"),
  curriculumQualityReport: () =>
    requestJson<CurriculumQualityReportPayload>("/api/curriculum/quality-report"),
  progress: () => requestJson<ProgressSummary>("/api/curriculum/progress"),
  updateProgress: (category: string, contentId: string, missionId: string, totalMissions: number) =>
    postJson<Record<string, unknown>>("/api/curriculum/progress", {
      category,
      contentId,
      missionId,
      totalMissions,
    }),
  checkExercise: (payload: {
    sessionId: string;
    studentCode: string;
    expectedCode?: string;
    checkType?: string;
    variableName?: string;
    expectedValue?: string;
    requiredPatterns?: string[];
    hints?: string[];
    currentHintLevel?: number;
    category?: string;
    contentId?: string;
    sectionId?: string;
    prediction?: {
      expectedShape: string;
      expectedDtype: string;
      expectedValue: string;
      expectedError: string;
    } | null;
  }) => postJson<CheckResult>("/api/curriculum/check", payload),
  tasks: () => requestJson<TaskListPayload>("/api/tasks"),
  runTask: (taskId: string) => postJson<TaskRun>(`/api/tasks/${encodeURIComponent(taskId)}/run`, {}),
  schedulerStatus: () => requestJson<SchedulerStatus>("/api/scheduler/status"),
  eStop: () => requestJson<EStopStatus>("/api/automation/e-stop"),
  triggerEStop: (reason: string) => postJson<EStopStatus>("/api/automation/e-stop", { reason }),
  clearEStop: () => deleteJson<EStopStatus>("/api/automation/e-stop"),
  audit: () => requestJson<AuditPayload>("/api/automation/audit?limit=8"),
  sharePackStatus: () => requestJson<SharePackStatusPayload>("/api/share/packs/status"),
  sharePacks: () => requestJson<SharePackListPayload>("/api/share/packs"),
  inspectSharePack: (source: string) => postJson<SharePackPreview>("/api/share/packs/inspect", { source }),
  installSharePack: (source: string) => postJson<{ pack: SharePackRecord }>("/api/share/packs/install", { source }),
  exportSharePack: (sourceDir: string, outputPath: string) => postJson<{ outputPath: string }>(
    "/api/share/packs/export",
    { sourceDir, outputPath },
  ),
  sharePackCurriculum: (packId: string, path: string, version?: string | null) => {
    const params = new URLSearchParams({ path });
    if (version) params.set("version", version);
    return requestJson<CurriculumLessonPayload>(
      `/api/share/packs/${encodeURIComponent(packId)}/curriculum?${params.toString()}`,
    );
  },
  sharePackAutomation: (packId: string, path: string, version?: string | null) => {
    const params = new URLSearchParams({ path });
    if (version) params.set("version", version);
    return requestJson<SharePackAutomationPayload>(
      `/api/share/packs/${encodeURIComponent(packId)}/automation?${params.toString()}`,
    );
  },
  createSharePackAutomationTask: (packId: string, payload: {
    path: string;
    name?: string;
    description?: string;
    schedule?: string | null;
    version?: string | null;
  }) => {
    const params = new URLSearchParams();
    if (payload.version) params.set("version", payload.version);
    const query = params.toString();
    return postJson<{ task: TaskDefinition }>(
      `/api/share/packs/${encodeURIComponent(packId)}/automation-task${query ? `?${query}` : ""}`,
      {
        path: payload.path,
        name: payload.name ?? "",
        description: payload.description ?? "",
        schedule: payload.schedule ?? null,
      },
    );
  },
  uninstallSharePack: (packId: string, version?: string | null) => {
    const params = new URLSearchParams();
    if (version) params.set("version", version);
    const query = params.toString();
    return deleteJson<{ ok: boolean }>(`/api/share/packs/${encodeURIComponent(packId)}${query ? `?${query}` : ""}`);
  },
  aiProviders: () => requestJson<AiProviderCatalogPayload>("/api/ai/providers"),
  aiTools: () => requestJson<AiToolCatalogPayload>("/api/ai/tools"),
  aiProfile: () => requestJson<AiProfile>("/api/ai/profile"),
  validateAiProvider: (provider: string, model?: string | null, probe = "availability") => {
    const params = new URLSearchParams({ provider });
    if (model) params.set("model", model);
    if (probe) params.set("probe", probe);
    return postJson<ProviderValidationPayload>(`/api/ai/provider/validate?${params.toString()}`, {});
  },
  updateAiProfile: (payload: {
    provider?: string | null;
    model?: string | null;
    role?: string | null;
    baseUrl?: string | null;
    temperature?: number | null;
    maxTokens?: number | null;
    systemPrompt?: string | null;
  }) => putJson<AiProfile>("/api/ai/profile", payload),
  saveAiSecret: (provider: string, apiKey: string | null, clear = false) => postJson<AiProfile>(
    "/api/ai/profile/secrets",
    { provider, apiKey, clear },
  ),
  teacherChat: (payload: AiChatRequest) => postJson<AiChatResponse>("/api/ai/chat", payload),
  teacherChatStream: (payload: AiChatRequest, onEvent: (event: StreamEvent) => void) =>
    postStreamChat("/api/ai/chat/stream", payload, onEvent),
  oauthAuthorize: () => requestJson<OauthAuthorizePayload>("/api/oauth/authorize"),
  oauthStatus: () => requestJson<OauthStatusPayload>("/api/oauth/status"),
  oauthLogout: () => postJson<{ ok: boolean }>("/api/oauth/logout", {}),
  putJson,
  requestJson,
};

type ApiErrorPayload = {
  detail?: string | ProviderDiagnostic;
  message?: string;
  error?: ProviderDiagnostic;
};

function parseApiErrorPayload(payload: ApiErrorPayload, fallback: string): {
  message: string;
  diagnostic?: ProviderDiagnostic;
} {
  const detail = payload.detail;
  if (isProviderDiagnostic(detail)) {
    return {
      message: detail.message ?? fallback,
      diagnostic: detail,
    };
  }
  if (payload.error) {
    return {
      message: payload.error.message ?? payload.message ?? fallback,
      diagnostic: payload.error,
    };
  }
  return {
    message: typeof detail === "string" ? detail : payload.message ?? fallback,
  };
}

function isProviderDiagnostic(value: unknown): value is ProviderDiagnostic {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function optional<T>(load: () => Promise<T>, fallback: T): Promise<{ data: T; online: boolean; error?: string }> {
  try {
    return { data: await load(), online: true };
  } catch (error) {
    return {
      data: fallback,
      online: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
