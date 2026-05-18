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
  EStopStatus,
  ExecutionResult,
  OauthAuthorizePayload,
  OauthStatusPayload,
  ProgressSummary,
  SchedulerStatus,
  TaskListPayload,
  TaskRun,
  VariableInfo,
} from "@/types";

const configuredApiBase = import.meta.env.VITE_CODARO_API_BASE?.replace(/\/$/, "") ?? "";

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
    try {
      const payload = (await response.json()) as {
        detail?: string;
        message?: string;
        error?: {
          code?: string;
          message?: string;
        };
      };
      detail = payload.detail ?? payload.message ?? payload.error?.message ?? detail;
    } catch {
      detail = response.statusText;
    }
    throw new Error(`${response.status} ${detail}`);
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

export const codaroApi = {
  health: () => requestJson<{ status: string }>("/api/health"),
  bootstrap: () => requestJson<BootstrapPayload>("/api/bootstrap"),
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
  aiProviders: () => requestJson<AiProviderCatalogPayload>("/api/ai/providers"),
  aiTools: () => requestJson<AiToolCatalogPayload>("/api/ai/tools"),
  aiProfile: () => requestJson<AiProfile>("/api/ai/profile"),
  teacherChat: (payload: AiChatRequest) => postJson<AiChatResponse>("/api/ai/chat", payload),
  oauthAuthorize: () => requestJson<OauthAuthorizePayload>("/api/oauth/authorize"),
  oauthStatus: () => requestJson<OauthStatusPayload>("/api/oauth/status"),
  oauthLogout: () => postJson<{ ok: boolean }>("/api/oauth/logout", {}),
  putJson,
  requestJson,
};

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
