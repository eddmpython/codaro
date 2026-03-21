import { apiUrl } from "../basePath";

export interface AiProviderCatalog {
  catalog: AiProviderEntry[];
}

export interface AiProviderEntry {
  id: string;
  label: string;
  description: string;
  authKind: string;
  supportsRoles: string[];
  defaultModel: string | null;
}

export interface AiProfilePayload {
  version: number;
  revision: number;
  defaultProvider: string;
  providers: Record<string, AiProviderProfilePayload>;
  roles: Record<string, AiRoleBinding>;
  temperature: number;
  maxTokens: number;
  ready: boolean;
  activeProvider: string | null;
  activeModel: string | null;
}

export interface AiProviderProfilePayload {
  model: string | null;
  baseUrl: string | null;
  secretConfigured: boolean;
}

export interface AiRoleBinding {
  provider: string | null;
  model: string | null;
}

export interface AiConversation {
  conversationId: string;
  role: string;
}

export interface AiChatResponse {
  conversationId: string;
  answer: string;
  provider: string;
  model: string;
  usage: Record<string, number> | null;
  toolCalls: AiToolCallResult[];
}

export interface AiToolCallResult {
  toolCallId: string;
  name: string;
  result: Record<string, unknown>;
}

export interface OAuthAuthorizeResponse {
  authUrl: string;
  state: string;
}

export interface OAuthStatusResponse {
  done: boolean;
  error: string | null;
}

async function parseJson<T>(response: Response, fallback: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }
  let message = fallback;
  try {
    const payload = await response.json();
    if (payload?.detail) message = payload.detail;
  } catch {
    /* ignore parse error */
  }
  throw new Error(message);
}

export async function getProviders(): Promise<AiProviderCatalog> {
  const res = await fetch(apiUrl("/api/ai/providers"));
  return parseJson(res, "Failed to load AI providers.");
}

export async function getProfile(): Promise<AiProfilePayload> {
  const res = await fetch(apiUrl("/api/ai/profile"));
  return parseJson(res, "Failed to load AI profile.");
}

export async function updateProfile(payload: {
  provider?: string;
  model?: string;
  role?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}): Promise<AiProfilePayload & { revision: number }> {
  const res = await fetch(apiUrl("/api/ai/profile"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res, "Failed to update AI profile.");
}

export async function saveSecret(provider: string, apiKey: string): Promise<unknown> {
  const res = await fetch(apiUrl("/api/ai/profile/secrets"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, apiKey }),
  });
  return parseJson(res, "Failed to save secret.");
}

export async function clearSecret(provider: string): Promise<unknown> {
  const res = await fetch(apiUrl("/api/ai/profile/secrets"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, clear: true }),
  });
  return parseJson(res, "Failed to clear secret.");
}

export async function validateProvider(
  provider: string,
  model?: string,
): Promise<{ valid: boolean; model?: string; error?: string }> {
  const params = new URLSearchParams({ provider });
  if (model) params.set("model", model);
  const res = await fetch(apiUrl(`/api/ai/provider/validate?${params}`), { method: "POST" });
  return parseJson(res, "Failed to validate provider.");
}

export async function getModels(provider: string): Promise<{ models: string[] }> {
  const res = await fetch(apiUrl(`/api/ai/models/${encodeURIComponent(provider)}`));
  return parseJson(res, "Failed to load models.");
}

export async function createConversation(
  role: string = "copilot",
  systemPrompt?: string,
): Promise<AiConversation> {
  const params = new URLSearchParams({ role });
  if (systemPrompt) params.set("systemPrompt", systemPrompt);
  const res = await fetch(apiUrl(`/api/ai/conversations?${params}`), { method: "POST" });
  return parseJson(res, "Failed to create conversation.");
}

export async function listConversations(): Promise<{ conversations: AiConversation[] }> {
  const res = await fetch(apiUrl("/api/ai/conversations"));
  return parseJson(res, "Failed to list conversations.");
}

export async function deleteConversation(conversationId: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/ai/conversations/${encodeURIComponent(conversationId)}`), {
    method: "DELETE",
  });
  return parseJson(res, "Failed to delete conversation.");
}

export async function sendChatMessage(payload: {
  conversationId?: string;
  message: string;
  sessionId?: string;
  provider?: string;
  role?: string;
}): Promise<AiChatResponse> {
  const res = await fetch(apiUrl("/api/ai/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res, "Failed to send chat message.");
}

export interface StreamEvent {
  type: "start" | "token" | "tool_results" | "done";
  conversationId?: string;
  content?: string;
  answer?: string;
  provider?: string;
  model?: string;
  usage?: Record<string, number> | null;
  toolCalls?: AiToolCallResult[];
}

export async function streamChatMessage(
  payload: {
    conversationId?: string;
    message: string;
    sessionId?: string;
    provider?: string;
    role?: string;
  },
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const res = await fetch(apiUrl("/api/ai/chat/stream"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errPayload = await res.json().catch(() => ({}));
    throw new Error((errPayload as Record<string, string>)?.detail ?? "Stream request failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6)) as StreamEvent;
          onEvent(event);
        } catch {
          /* ignore parse error */
        }
      }
    }
  }
}

export async function oauthAuthorize(): Promise<OAuthAuthorizeResponse> {
  const res = await fetch(apiUrl("/api/oauth/authorize"));
  return parseJson(res, "Failed to start OAuth flow.");
}

export async function oauthStatus(): Promise<OAuthStatusResponse> {
  const res = await fetch(apiUrl("/api/oauth/status"));
  return parseJson(res, "OAuth status check failed.");
}

export async function oauthLogout(): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl("/api/oauth/logout"), { method: "POST" });
  return parseJson(res, "Failed to logout.");
}

export function subscribeProfileEvents(onUpdate: (profile: AiProfilePayload) => void): () => void {
  const es = new EventSource(apiUrl("/api/ai/profile/events"));
  es.addEventListener("profile_changed", (e) => {
    try {
      const data = JSON.parse(e.data) as AiProfilePayload;
      onUpdate(data);
    } catch {
      /* ignore parse error */
    }
  });
  return () => es.close();
}
