import { useCallback, useState } from "react";
import {
  loginOauthProvider,
  logoutOauthProvider as logoutOauthProviderAction,
  openProviderSettings,
  providerAuthFailureNotice,
  saveApiProvider as saveApiProviderAction,
  selectProvider,
  validateProviderAction,
  type ProviderActionResult,
} from "@/lib/providerConnection";
import type { AiProfile, AppNotice } from "@/types";

export function useProviderConnection({
  apiOnline,
  onNotice,
}: {
  apiOnline: boolean;
  onNotice: (notice: AppNotice) => void;
}) {
  const [aiProfile, setAiProfile] = useState<AiProfile | null>(null);
  const [aiConnecting, setAiConnecting] = useState(false);
  const [providerSettingsOpen, setProviderSettingsOpen] = useState(false);

  const applyProviderActionResult = useCallback((result: ProviderActionResult) => {
    if (result.profile) setAiProfile(result.profile);
    if (result.openSettings) setProviderSettingsOpen(true);
    if (result.closeSettings) setProviderSettingsOpen(false);
    onNotice(result.notice);
  }, [onNotice]);

  const connectProvider = useCallback(async () => {
    applyProviderActionResult(openProviderSettings(apiOnline));
  }, [apiOnline, applyProviderActionResult]);

  const startOauthProviderLogin = useCallback(async (providerId = "oauth-chatgpt") => {
    if (aiConnecting) return;
    const availability = openProviderSettings(apiOnline);
    if (!availability.openSettings) {
      applyProviderActionResult(availability);
      return;
    }

    setAiConnecting(true);
    try {
      onNotice({ tone: "default", title: "Provider 로그인 열림", detail: "새 탭에서 provider 로그인을 완료하세요." });
      applyProviderActionResult(await loginOauthProvider(providerId));
    } catch (error) {
      onNotice(providerAuthFailureNotice(error));
    } finally {
      setAiConnecting(false);
    }
  }, [aiConnecting, apiOnline, applyProviderActionResult, onNotice]);

  const logoutOauthProvider = useCallback(async (providerId = "oauth-chatgpt") => {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      applyProviderActionResult(await logoutOauthProviderAction(providerId));
    } catch (error) {
      onNotice({
        tone: "error",
        title: "Provider 로그아웃 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAiConnecting(false);
    }
  }, [aiConnecting, apiOnline, applyProviderActionResult, onNotice]);

  const selectAiProvider = useCallback(async (providerId: string) => {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      applyProviderActionResult(await selectProvider(providerId));
    } catch (error) {
      onNotice({
        tone: "error",
        title: "Provider 선택 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAiConnecting(false);
    }
  }, [aiConnecting, apiOnline, applyProviderActionResult, onNotice]);

  const saveApiProvider = useCallback(async (providerId: string, apiKey: string, baseUrl?: string) => {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      applyProviderActionResult(await saveApiProviderAction(providerId, apiKey, baseUrl));
    } catch (error) {
      onNotice({
        tone: "error",
        title: "Provider 저장 실패",
        detail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setAiConnecting(false);
    }
  }, [aiConnecting, apiOnline, applyProviderActionResult, onNotice]);

  const validateAiProvider = useCallback(async (providerId: string) => {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      applyProviderActionResult(await validateProviderAction(providerId, providerModel(aiProfile, providerId)));
    } catch (error) {
      onNotice(providerAuthFailureNotice(error));
    } finally {
      setAiConnecting(false);
    }
  }, [aiConnecting, aiProfile, apiOnline, applyProviderActionResult, onNotice]);

  return {
    aiConnecting,
    aiProfile,
    connectProvider,
    logoutOauthProvider,
    providerSettingsOpen,
    saveApiProvider,
    selectAiProvider,
    setAiProfile,
    setProviderSettingsOpen,
    startOauthProviderLogin,
    validateAiProvider,
  };
}

function providerModel(profile: AiProfile | null, providerId: string): string | null {
  const providers = profile?.providers;
  if (!providers || typeof providers !== "object" || Array.isArray(providers)) return null;
  const runtime = (providers as Record<string, { model?: unknown }>)[providerId];
  return typeof runtime?.model === "string" ? runtime.model : null;
}
