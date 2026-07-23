import { postJson, postStreamChat, putJson, requestJson } from "./transport";
import type { AiChatRequest, AiChatResponse, AiProfile, AiProviderCatalogPayload, AiToolCatalogPayload, OauthAuthorizePayload, OauthStatusPayload, ProviderValidationPayload } from "@/types";
import type { StreamEvent } from "@/lib/assistantStream";

export const providerApi = {
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
oauthLogout: () => postJson<{ ok: boolean }>("/api/oauth/logout", {})
};
