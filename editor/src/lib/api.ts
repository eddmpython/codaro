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
  CurriculumLessonPayload,
  DiagnosticExportPayload,
  DiagnosticSummary,
  EStopStatus,
  ExecutionResult,
  OauthAuthorizePayload,
  OauthStatusPayload,
  PackageInfo,
  PackageInstallResult,
  ProviderDiagnostic,
  ProviderValidationPayload,
  ProgressSummary,
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
  ) => postJson<{ results: ExecutionResult[]; executionOrder: string[] }>(
    `/api/kernel/${sessionId}/execute-reactive`,
    { blockId, blocks },
  ),
  variables: (sessionId: string) => requestJson<VariableInfo[]>(`/api/kernel/${sessionId}/variables`),
  resetSession: (sessionId: string) => postJson<{ status: string }>(`/api/kernel/${sessionId}/reset`, {}),
  packagesList: () => requestJson<PackageInfo[]>("/api/packages/list"),
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
