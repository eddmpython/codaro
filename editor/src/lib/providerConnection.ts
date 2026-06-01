import { CodaroApiError, codaroApi } from "@/lib/api";
import { translate } from "@/lib/localeCopy";
import { providerProfileName } from "@/lib/providerProfile";
import type {
  AiProfile,
  AppNotice,
  ProviderDiagnostic,
  ProviderValidationPayload,
  ProviderValidationSnapshot,
} from "@/types";

export type ProviderActionResult = {
  closeSettings?: boolean;
  notice: AppNotice;
  openSettings?: boolean;
  profile?: AiProfile;
  validation?: ProviderValidationSnapshot;
};

export type ProviderAssistantFailure = {
  action?: "connect-provider";
  content: string;
  diagnostic?: ProviderDiagnostic;
  notice: AppNotice;
};

export type ProviderConnectionPromptInput = {
  alreadyPrompted: boolean;
  apiOnline: boolean;
  connectionRequired: boolean;
};

export type ProviderConnectionPromptResetInput = {
  apiOnline: boolean;
  providerReady: boolean;
};

const providerSettingsActions = new Set([
  "check-network",
  "check-provider-compatibility",
  "connect-provider",
  "relogin-provider",
  "restart-login",
  "configure-api-key",
  "configure-base-url",
  "check-permission",
]);

export function openProviderSettings(apiOnline: boolean): ProviderActionResult {
  if (apiOnline) {
    return {
      openSettings: true,
      notice: {
        tone: "default",
        title: translate("provider.openSettings.title"),
        detail: translate("provider.openSettings.detail"),
      },
    };
  }
  return {
    notice: {
      tone: "warning",
      title: translate("provider.connectUnavailable.title"),
      detail: translate("provider.connectUnavailable.detail"),
    },
  };
}

export function providerConnectionRequiredNotice(): AppNotice {
  return {
    tone: "warning",
    title: translate("provider.connectionRequired.title"),
    detail: translate("assistant.providerLoginRequired"),
  };
}

export function shouldOpenProviderConnectionPrompt({
  alreadyPrompted,
  apiOnline,
  connectionRequired,
}: ProviderConnectionPromptInput): boolean {
  return apiOnline && connectionRequired && !alreadyPrompted;
}

export function shouldResetProviderConnectionPrompt({
  apiOnline,
  providerReady,
}: ProviderConnectionPromptResetInput): boolean {
  return !apiOnline || providerReady;
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
    }, "login");
  }

  return {
    notice: {
      tone: "warning",
      title: translate("provider.loginPending.title"),
      detail: translate("provider.loginPending.detail"),
    },
    validation: snapshotProviderValidation(providerId, {
      valid: false,
      diagnostic: {
        action: "restart-login",
        code: "oauth_login_timeout",
        message: translate("provider.loginTimeout.message"),
        provider: providerId,
        recoverable: true,
      },
    }, "login"),
  };
}

export function providerOauthLoginPending(providerId = "oauth-chatgpt"): ProviderValidationSnapshot {
  return snapshotProviderValidation(providerId, {
    valid: false,
    pending: true,
    diagnostic: {
      code: "oauth_login_polling",
      message: translate("provider.loginPolling.message"),
      provider: providerId,
      recoverable: true,
    },
  }, "login");
}

export async function logoutOauthProvider(providerId = "oauth-chatgpt"): Promise<ProviderActionResult> {
  await codaroApi.oauthLogout();
  const profile = await codaroApi.aiProfile();
  return {
    notice: { tone: "success", title: translate("provider.loggedOut.title"), detail: providerId },
    profile,
    validation: snapshotProviderValidation(providerId, {
      valid: false,
      diagnostic: {
        action: "connect-provider",
        code: "provider_logged_out",
        message: translate("provider.loggedOut.message"),
        provider: providerId,
        recoverable: true,
      },
    }, "logout"),
  };
}

export async function selectProvider(providerId: string): Promise<ProviderActionResult> {
  const profile = await codaroApi.updateAiProfile({ provider: providerId });
  const latestProfile = await codaroApi.aiProfile().catch(() => profile);
  return withProviderValidation(latestProfile, {
    profile: latestProfile,
  }, "select");
}

export async function saveApiProvider(providerId: string, apiKey: string, baseUrl?: string): Promise<ProviderActionResult> {
  if (baseUrl) {
    await codaroApi.updateAiProfile({ provider: providerId, baseUrl });
  }
  const profile = await codaroApi.saveAiSecret(providerId, apiKey);
  const latestProfile = await codaroApi.aiProfile().catch(() => profile);
  return withProviderValidation(latestProfile, {
    profile: latestProfile,
  }, "save");
}

export async function validateProviderAction(providerId: string, model?: string | null): Promise<ProviderActionResult> {
  const validation = await validateProvider(providerId, model, "response");
  if (validation.valid) {
    return {
      notice: {
        tone: "success",
        title: translate("provider.responseVerified.title"),
        detail: validation.model ? `${providerId} · ${validation.model}` : providerId,
      },
      validation: snapshotProviderValidation(providerId, validation, "manual"),
    };
  }
  return {
    notice: {
      tone: "warning",
      title: translate("provider.needsCheck.title"),
      detail: validation.diagnostic?.message ?? validation.error ?? translate("provider.verifyFailed.detail"),
    },
    validation: snapshotProviderValidation(providerId, validation, "manual"),
  };
}

export function providerValidationFailure(
  providerId: string,
  error: unknown,
  phase: ProviderValidationSnapshot["phase"] = "failure",
): ProviderValidationSnapshot {
  const diagnostic = providerDiagnosticFromError(error);
  return snapshotProviderValidation(providerId, {
    valid: false,
    error: diagnostic?.message ?? errorMessage(error),
    diagnostic,
  }, phase);
}

export function providerAuthFailureNotice(error: unknown): AppNotice {
  const diagnostic = providerDiagnosticFromError(error);
  return {
    tone: "error",
    title: translate("provider.loginFailed.title"),
    detail: diagnostic?.message ?? errorMessage(error),
  };
}

export function providerActionFailureNotice(title: string, error: unknown): AppNotice {
  const diagnostic = providerDiagnosticFromError(error);
  return {
    tone: "error",
    title,
    detail: diagnostic?.message ?? errorMessage(error).replace(/^\d+\s+/, ""),
  };
}

export function providerAssistantFailure(error: unknown): ProviderAssistantFailure {
  const diagnostic = providerDiagnosticFromError(error);
  const authIssue = isProviderAuthError(error);
  const content = authIssue
    ? diagnostic?.message ?? translate("assistant.providerLoginRequired")
    : diagnostic?.message ?? errorMessage(error);
  return {
    action: authIssue ? "connect-provider" : undefined,
    content,
    diagnostic,
    notice: {
      tone: "error",
      title: authIssue ? translate("provider.connectionRequired.title") : translate("provider.unavailable.title"),
      detail: content,
    },
  };
}

export function isProviderAuthError(error: unknown) {
  const diagnostic = providerDiagnosticFromError(error);
  if (diagnostic?.action) {
    return providerSettingsActions.has(diagnostic.action);
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
  phase: ProviderValidationSnapshot["phase"],
): Promise<ProviderActionResult> {
  const provider = String(profile.activeProvider ?? profile.defaultProvider ?? "");
  if (!provider) {
    return {
      ...base,
      notice: { tone: "warning", title: translate("provider.needsCheck.title"), detail: translate("provider.noneSelected.detail") },
    };
  }
  const validation = await validateProvider(provider, profile.activeModel, "response");
  const validationSnapshot = snapshotProviderValidation(provider, validation, phase);
  if (validation.valid) {
    return {
      ...base,
      notice: {
        tone: "success",
        title: translate("provider.connected.title"),
        detail: validation.model ? `${provider} · ${validation.model}` : providerProfileName(profile),
      },
      validation: validationSnapshot,
    };
  }
  const failureBase = base.closeSettings ? { ...base, closeSettings: false, openSettings: true } : base;
  return {
    ...failureBase,
    notice: {
      tone: "warning",
      title: translate("provider.needsCheck.title"),
      detail: validation.diagnostic?.message ?? validation.error ?? translate("provider.connectionUnknown.detail"),
    },
    validation: validationSnapshot,
  };
}

async function validateProvider(provider: string, model?: unknown, probe = "availability"): Promise<ProviderValidationPayload> {
  try {
    return await codaroApi.validateAiProvider(provider, typeof model === "string" ? model : undefined, probe);
  } catch (error) {
    const diagnostic = providerDiagnosticFromError(error) ?? providerNetworkDiagnostic(provider, error);
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

function providerNetworkDiagnostic(provider: string, error: unknown): ProviderDiagnostic {
  const detail = errorMessage(error).replace(/^\d+\s+/, "");
  return {
    action: "check-network",
    code: "provider_network_error",
    detail,
    message: translate("provider.networkFailed.message"),
    provider,
    recoverable: true,
    statusCode: error instanceof CodaroApiError ? error.status : 503,
  };
}

function snapshotProviderValidation(
  providerId: string,
  validation: ProviderValidationPayload,
  phase: ProviderValidationSnapshot["phase"],
): ProviderValidationSnapshot {
  return {
    ...validation,
    checkedAt: new Date().toISOString(),
    phase,
    provider: providerId,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
