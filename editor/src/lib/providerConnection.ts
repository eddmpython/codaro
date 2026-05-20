import { CodaroApiError, codaroApi } from "@/lib/api";
import type { AiProfile, AppNotice, ProviderDiagnostic, ProviderValidationPayload } from "@/types";

export type ProviderActionResult = {
  closeSettings?: boolean;
  notice: AppNotice;
  openSettings?: boolean;
  profile?: AiProfile;
};

export type ProviderAssistantFailure = {
  action?: "connect-provider";
  content: string;
  notice: AppNotice;
};

export function openProviderSettings(apiOnline: boolean): ProviderActionResult {
  if (apiOnline) {
    return {
      openSettings: true,
      notice: {
        tone: "default",
        title: "Provider 설정",
        detail: "연결할 provider를 선택하세요.",
      },
    };
  }
  return {
    notice: {
      tone: "warning",
      title: "Provider 연결 불가",
      detail: "서버 세션이 없어서 실제 provider 연결은 사용할 수 없습니다.",
    },
  };
}

export async function loginOauthProvider(providerId = "oauth-chatgpt"): Promise<ProviderActionResult> {
  if (providerId !== "oauth-chatgpt") {
    await codaroApi.updateAiProfile({ provider: providerId });
  }
  const auth = await codaroApi.oauthAuthorize();
  window.open(auth.authUrl, "_blank", "noopener,noreferrer");

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await sleep(1000);
    const status = await codaroApi.oauthStatus();
    if (!status.done) continue;
    if (status.error) {
      throw new CodaroApiError(
        Number(status.diagnostic?.statusCode ?? 503),
        status.message ?? status.error,
        status.diagnostic ?? undefined,
      );
    }
    const profile = await codaroApi.aiProfile();
    return withProviderValidation(profile, {
      closeSettings: true,
      profile,
    });
  }

  return {
    notice: {
      tone: "warning",
      title: "Provider 로그인 대기 중",
      detail: "로그인 탭을 완료한 뒤 상태를 다시 확인하세요.",
    },
  };
}

export async function logoutOauthProvider(providerId = "oauth-chatgpt"): Promise<ProviderActionResult> {
  await codaroApi.oauthLogout();
  const profile = await codaroApi.aiProfile();
  return {
    notice: { tone: "success", title: "Provider 로그아웃됨", detail: providerId },
    profile,
  };
}

export async function selectProvider(providerId: string): Promise<ProviderActionResult> {
  const profile = await codaroApi.updateAiProfile({ provider: providerId });
  const latestProfile = await codaroApi.aiProfile().catch(() => profile);
  return withProviderValidation(latestProfile, {
    profile: latestProfile,
  });
}

export async function saveApiProvider(providerId: string, apiKey: string, baseUrl?: string): Promise<ProviderActionResult> {
  if (baseUrl) {
    await codaroApi.updateAiProfile({ provider: providerId, baseUrl });
  }
  const profile = await codaroApi.saveAiSecret(providerId, apiKey);
  const latestProfile = await codaroApi.aiProfile().catch(() => profile);
  return withProviderValidation(latestProfile, {
    profile: latestProfile,
  });
}

export function providerAuthFailureNotice(error: unknown): AppNotice {
  const diagnostic = providerDiagnosticFromError(error);
  return {
    tone: "error",
    title: "Provider 로그인 실패",
    detail: diagnostic?.message ?? errorMessage(error),
  };
}

export function providerAssistantFailure(error: unknown): ProviderAssistantFailure {
  const diagnostic = providerDiagnosticFromError(error);
  const authIssue = isProviderAuthError(error);
  const content = authIssue
    ? diagnostic?.message ?? "Provider 로그인이 필요합니다. Provider 설정에서 브라우저 로그인을 완료한 뒤 다시 요청하세요."
    : diagnostic?.message ?? errorMessage(error);
  return {
    action: authIssue ? "connect-provider" : undefined,
    content,
    notice: {
      tone: "error",
      title: authIssue ? "Provider 연결 필요" : "Provider 사용 불가",
      detail: content,
    },
  };
}

export function isProviderAuthError(error: unknown) {
  const diagnostic = providerDiagnosticFromError(error);
  if (diagnostic?.action && ["connect-provider", "relogin-provider", "restart-login"].includes(diagnostic.action)) {
    return true;
  }
  const normalized = errorMessage(error).toLowerCase();
  return (
    normalized.includes("oauth authentication required") ||
    normalized.includes("authentication expired") ||
    normalized.includes("please login") ||
    normalized.includes("re-login") ||
    normalized.includes("no saved token") ||
    normalized.includes("token refresh failed") ||
    normalized.includes("oauth") ||
    normalized.includes("auth") ||
    normalized.includes("login")
  );
}

function providerDiagnosticFromError(error: unknown): ProviderDiagnostic | undefined {
  if (error instanceof CodaroApiError) return error.diagnostic;
  if (isRecord(error) && isRecord(error.diagnostic)) return error.diagnostic as ProviderDiagnostic;
  return undefined;
}

async function withProviderValidation(
  profile: AiProfile,
  base: Omit<ProviderActionResult, "notice">,
): Promise<ProviderActionResult> {
  const provider = String(profile.activeProvider ?? profile.defaultProvider ?? "");
  if (!provider) {
    return {
      ...base,
      notice: { tone: "warning", title: "Provider 확인 필요", detail: "선택된 provider가 없습니다." },
    };
  }
  const validation = await validateProvider(provider, profile.activeModel);
  if (validation.valid) {
    return {
      ...base,
      notice: {
        tone: "success",
        title: "Provider 연결됨",
        detail: validation.model ? `${provider} · ${validation.model}` : providerName(profile),
      },
    };
  }
  return {
    ...base,
    notice: {
      tone: "warning",
      title: "Provider 확인 필요",
      detail: validation.diagnostic?.message ?? validation.error ?? "Provider 연결 상태를 확인하지 못했습니다.",
    },
  };
}

async function validateProvider(provider: string, model?: unknown): Promise<ProviderValidationPayload> {
  try {
    return await codaroApi.validateAiProvider(provider, typeof model === "string" ? model : undefined);
  } catch (error) {
    const diagnostic = providerDiagnosticFromError(error);
    return {
      valid: false,
      error: diagnostic?.message ?? errorMessage(error),
      diagnostic,
    };
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function providerName(profile: AiProfile | null) {
  return String(profile?.activeProvider ?? profile?.provider ?? profile?.defaultProvider ?? "provider 없음");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
