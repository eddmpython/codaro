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

type StreamEvent = {
  type?: string;
  conversationId?: string;
  delta?: string;
  content?: string;
  answer?: string;
  provider?: string;
  model?: string | null;
  usage?: unknown;
  toolCalls?: AiChatResponse["toolCalls"];
};

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
    try {
      const payload = (await response.json()) as {
        detail?: string;
        message?: string;
        error?: { message?: string };
      };
      detail = payload.detail ?? payload.message ?? payload.error?.message ?? detail;
    } catch {
      detail = response.statusText;
    }
    throw new Error(`${response.status} ${detail}`);
  }

  if (!response.body) {
    throw new Error("stream body unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let donePayload: AiChatResponse | null = null;
  let streamConversationId = body.conversationId ?? "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const rawEvent of events) {
      const event = parseStreamEvent(rawEvent);
      if (!event) continue;
      if (event.conversationId) {
        streamConversationId = event.conversationId;
      }
      onEvent(event);
      if (event.type === "done") {
        donePayload = {
          conversationId: event.conversationId ?? streamConversationId,
          answer: event.answer ?? event.content ?? "",
          provider: event.provider ?? "",
          model: event.model,
          usage: event.usage,
          toolCalls: event.toolCalls ?? [],
        };
      }
    }
  }

  const tail = parseStreamEvent(buffer);
  if (tail) {
    if (tail.conversationId) {
      streamConversationId = tail.conversationId;
    }
    onEvent(tail);
    if (tail.type === "done") {
      donePayload = {
        conversationId: tail.conversationId ?? streamConversationId,
        answer: tail.answer ?? tail.content ?? "",
        provider: tail.provider ?? "",
        model: tail.model,
        usage: tail.usage,
        toolCalls: tail.toolCalls ?? [],
      };
    }
  }

  if (!donePayload) {
    throw new Error("stream finished without done event");
  }
  return donePayload;
}

function parseStreamEvent(rawEvent: string): StreamEvent | null {
  const data = rawEvent
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();
  if (!data) return null;
  return JSON.parse(data) as StreamEvent;
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
