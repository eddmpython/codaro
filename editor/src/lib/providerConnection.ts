import { codaroApi } from "@/lib/api";
import type { AiProfile, AppNotice } from "@/types";

export type ProviderActionResult = {
  closeSettings?: boolean;
  notice: AppNotice;
  openSettings?: boolean;
  profile?: AiProfile;
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
    if (status.error) throw new Error(status.error);
    const profile = await codaroApi.aiProfile();
    return {
      closeSettings: true,
      notice: { tone: "success", title: "Provider 연결됨", detail: providerName(profile) },
      profile,
    };
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
  return {
    notice: { tone: "success", title: "Provider 선택됨", detail: providerName(latestProfile) },
    profile: latestProfile,
  };
}

export async function saveApiProvider(providerId: string, apiKey: string, baseUrl?: string): Promise<ProviderActionResult> {
  if (baseUrl) {
    await codaroApi.updateAiProfile({ provider: providerId, baseUrl });
  }
  const profile = await codaroApi.saveAiSecret(providerId, apiKey);
  const latestProfile = await codaroApi.aiProfile().catch(() => profile);
  return {
    notice: { tone: "success", title: "Provider 연결됨", detail: providerName(latestProfile) },
    profile: latestProfile,
  };
}

export function providerAuthFailureNotice(detail: string): AppNotice {
  return {
    tone: "error",
    title: "Provider 로그인 실패",
    detail: isProviderAuthError(detail) ? "provider 로그인을 다시 시작하세요." : detail,
  };
}

export function isProviderAuthError(detail: string) {
  const normalized = detail.toLowerCase();
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

function providerName(profile: AiProfile | null) {
  return String(profile?.activeProvider ?? profile?.provider ?? profile?.defaultProvider ?? "provider 없음");
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
