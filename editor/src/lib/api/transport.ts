import {
  applyAssistantStreamProtocolEvent,
  initialAssistantStreamState,
  parseAssistantStreamEvent,
  type StreamEvent,
} from "@/lib/assistantStream";
import type {
  AiChatRequest,
  AiChatResponse,
  ProviderDiagnostic,
} from "@/types";

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
  if (typeof document === "undefined") return true;
  return document.querySelector<HTMLMetaElement>('meta[name="codaro-runtime-tier"]')?.content === "local";
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
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

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function postJson<T>(
  path: string,
  body: unknown,
  init: Omit<RequestInit, "body" | "method"> = {},
): Promise<T> {
  return requestJson<T>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function putJson<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
  });
}

export function deleteJson<T>(path: string): Promise<T> {
  return requestJson<T>(path, { method: "DELETE" });
}

export async function postStreamChat(
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
  if (!response.body) throw new Error("stream body unavailable");

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
      if (event) handleEvent(event);
    }
  }
  const tail = parseAssistantStreamEvent(buffer);
  if (tail) handleEvent(tail);
  if (streamState.error) throw new CodaroApiError(503, streamState.error, streamState.diagnostic);
  if (!streamState.donePayload) throw new Error("stream finished without done event");
  return streamState.donePayload;
}

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
    return { message: detail.message ?? fallback, diagnostic: detail };
  }
  if (payload.error) {
    return {
      message: payload.error.message ?? payload.message ?? fallback,
      diagnostic: payload.error,
    };
  }
  return { message: typeof detail === "string" ? detail : payload.message ?? fallback };
}

function isProviderDiagnostic(value: unknown): value is ProviderDiagnostic {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function optional<T>(
  load: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; online: boolean; error?: string }> {
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
