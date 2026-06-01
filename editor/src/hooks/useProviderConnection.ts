import { useCallback, useState } from "react";
import {
  loginOauthProvider,
  logoutOauthProvider as logoutOauthProviderAction,
  openProviderSettings,
  providerActionFailureNotice,
  providerAuthFailureNotice,
  providerOauthLoginPending,
  providerValidationFailure,
  saveApiProvider as saveApiProviderAction,
  selectProvider,
  validateProviderAction,
  type ProviderActionResult,
} from "@/lib/providerConnection";
import { translate } from "@/lib/localeCopy";
import type { AiProfile, AppNotice, ProviderValidationSnapshot } from "@/types";

type ProviderActionPhase = NonNullable<ProviderValidationSnapshot["phase"]>;

type ProviderActionTask = {
  beforeRun?: () => void;
  failureNotice: (error: unknown) => AppNotice;
  phase: ProviderActionPhase;
  providerId: string;
  run: () => Promise<ProviderActionResult>;
};

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
  const [providerValidation, setProviderValidation] = useState<Record<string, ProviderValidationSnapshot>>({});

  const applyProviderActionResult = useCallback((result: ProviderActionResult) => {
    if (result.profile) setAiProfile(result.profile);
    const validation = result.validation;
    if (validation) {
      setProviderValidation((current) => ({
        ...current,
        [validation.provider]: validation,
      }));
    }
    if (result.openSettings) setProviderSettingsOpen(true);
    if (result.closeSettings) setProviderSettingsOpen(false);
    onNotice(result.notice);
  }, [onNotice]);

  const recordProviderFailure = useCallback((
    providerId: string,
    error: unknown,
    phase: ProviderValidationSnapshot["phase"] = "failure",
  ) => {
    const validation = providerValidationFailure(providerId, error, phase);
    setProviderValidation((current) => ({
      ...current,
      [validation.provider]: validation,
    }));
  }, []);

  const runProviderAction = useCallback(async ({
    beforeRun,
    failureNotice,
    phase,
    providerId,
    run,
  }: ProviderActionTask) => {
    if (!apiOnline || aiConnecting) return;
    setAiConnecting(true);
    try {
      beforeRun?.();
      applyProviderActionResult(await run());
    } catch (error) {
      recordProviderFailure(providerId, error, phase);
      onNotice(failureNotice(error));
    } finally {
      setAiConnecting(false);
    }
  }, [aiConnecting, apiOnline, applyProviderActionResult, onNotice, recordProviderFailure]);

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

    await runProviderAction({
      beforeRun: () => {
        setProviderValidation((current) => ({
          ...current,
          [providerId]: providerOauthLoginPending(providerId),
        }));
        onNotice({
          tone: "default",
          title: translate("provider.loginOpened.title"),
          detail: translate("provider.loginOpened.detail"),
        });
      },
      failureNotice: providerAuthFailureNotice,
      phase: "login",
      providerId,
      run: () => loginOauthProvider(providerId),
    });
  }, [aiConnecting, apiOnline, applyProviderActionResult, onNotice, runProviderAction]);

  const logoutOauthProvider = useCallback(async (providerId = "oauth-chatgpt") => {
    await runProviderAction({
      failureNotice: (error) => providerActionFailureNotice(translate("provider.logoutFailed.title"), error),
      phase: "logout",
      providerId,
      run: () => logoutOauthProviderAction(providerId),
    });
  }, [runProviderAction]);

  const selectAiProvider = useCallback(async (providerId: string) => {
    await runProviderAction({
      failureNotice: (error) => providerActionFailureNotice(translate("provider.selectFailed.title"), error),
      phase: "select",
      providerId,
      run: () => selectProvider(providerId),
    });
  }, [runProviderAction]);

  const saveApiProvider = useCallback(async (providerId: string, apiKey: string, baseUrl?: string) => {
    await runProviderAction({
      failureNotice: (error) => providerActionFailureNotice(translate("provider.saveFailed.title"), error),
      phase: "save",
      providerId,
      run: () => saveApiProviderAction(providerId, apiKey, baseUrl),
    });
  }, [runProviderAction]);

  const validateAiProvider = useCallback(async (providerId: string) => {
    await runProviderAction({
      failureNotice: providerAuthFailureNotice,
      phase: "manual",
      providerId,
      run: () => validateProviderAction(providerId, providerModel(aiProfile, providerId)),
    });
  }, [aiProfile, runProviderAction]);

  return {
    aiConnecting,
    aiProfile,
    connectProvider,
    logoutOauthProvider,
    providerValidation,
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
