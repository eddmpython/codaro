import {
  AlertTriangle,
  Check,
  CircleCheck,
  Info,
  KeyRound,
  Laptop,
  Loader2,
  LogIn,
  LogOut,
  Server,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLocale } from "@/lib/localeContext";
import { localeDateFormat } from "@/lib/localeCopy";
import { cn } from "@/lib/utils";
import type { AiProfile, AiProvider, ProviderValidationSnapshot } from "@/types";

type ProviderSettingsSheetProps = {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  open: boolean;
  providerValidation: Record<string, ProviderValidationSnapshot>;
  onOpenChange: (open: boolean) => void;
  onOauthLogin: (providerId: string) => void;
  onOauthLogout: (providerId: string) => void;
  onSaveApiProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;
  onSelectProvider: (providerId: string) => void;
  onValidateProvider: (providerId: string) => void;
};

type ProviderRuntime = {
  model?: string | null;
  baseUrl?: string | null;
  secretConfigured?: boolean;
};

const providerKoreanCopy: Record<string, { label: string; description: string }> = {
  "oauth-chatgpt": {
    label: "ChatGPT 구독",
    description: "브라우저 로그인으로 Codaro 대화와 셀 도움을 연결합니다.",
  },
  openai: {
    label: "OpenAI API 키",
    description: "API 키를 저장해 Codaro provider로 사용합니다.",
  },
  ollama: {
    label: "Ollama 로컬",
    description: "로컬 모델을 사용합니다. Ollama가 실행 중이어야 합니다.",
  },
  custom: {
    label: "호환 API",
    description: "OpenAI 호환 서버 주소와 키를 사용합니다.",
  },
};

const providerEnglishCopy: Record<string, { label: string; description: string }> = {
  "oauth-chatgpt": {
    label: "ChatGPT subscription",
    description: "Connect Codaro chat and cell help through browser login.",
  },
  openai: {
    label: "OpenAI API key",
    description: "Save an API key and use it as the Codaro provider.",
  },
  ollama: {
    label: "Local Ollama",
    description: "Use a local model. Ollama must already be running.",
  },
  custom: {
    label: "Compatible API",
    description: "Use an OpenAI-compatible server URL and key.",
  },
};

export function ProviderSettingsSheet({
  aiConnecting,
  aiProfile,
  apiOnline,
  open,
  providerValidation,
  onOpenChange,
  onOauthLogin,
  onOauthLogout,
  onSaveApiProvider,
  onSelectProvider,
  onValidateProvider,
}: ProviderSettingsSheetProps) {
  const { t } = useLocale();
  const providers = useMemo(() => providerCatalog(aiProfile), [aiProfile]);
  const runtime = useMemo(() => providerRuntime(aiProfile), [aiProfile]);
  const activeProvider = String(aiProfile?.activeProvider ?? aiProfile?.defaultProvider ?? "");
  const ready = Boolean(aiProfile?.ready ?? aiProfile?.enabled);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>AI Provider</SheetTitle>
          <SheetDescription>
            {t("provider.sheet.description")}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4">
          <div className="space-y-2 pb-4">
            {!apiOnline ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
                {t("assistant.serverRequiredForProvider")}
              </div>
            ) : null}

            {providers.length ? (
              providers.map((provider) => (
                <ProviderCard
                  active={provider.id === activeProvider}
                  aiConnecting={aiConnecting}
                  apiOnline={apiOnline}
                  key={provider.id}
                  provider={provider}
                  ready={provider.id === activeProvider && ready}
                  runtime={runtime[provider.id ?? ""] ?? {}}
                  validation={providerValidation[provider.id ?? ""]}
                  onOauthLogin={onOauthLogin}
                  onOauthLogout={onOauthLogout}
                  onSaveApiProvider={onSaveApiProvider}
                  onSelectProvider={onSelectProvider}
                  onValidateProvider={onValidateProvider}
                />
              ))
            ) : (
              <div className="rounded-md border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
                {t("provider.sheet.loadFailed")}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ProviderCard({
  active,
  aiConnecting,
  apiOnline,
  provider,
  ready,
  runtime,
  validation,
  onOauthLogin,
  onOauthLogout,
  onSaveApiProvider,
  onSelectProvider,
  onValidateProvider,
}: {
  active: boolean;
  aiConnecting: boolean;
  apiOnline: boolean;
  provider: AiProvider;
  ready: boolean;
  runtime: ProviderRuntime;
  validation?: ProviderValidationSnapshot;
  onOauthLogin: (providerId: string) => void;
  onOauthLogout: (providerId: string) => void;
  onSaveApiProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;
  onSelectProvider: (providerId: string) => void;
  onValidateProvider: (providerId: string) => void;
}) {
  const { t } = useLocale();
  const providerId = provider.id ?? "";
  const copy = providerCopy(provider, t);
  const authKind = provider.authKind ?? "runtime";
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(runtime.baseUrl ?? "");
  const Icon = providerIcon(authKind, providerId);
  const canUseStoredSecret = Boolean(runtime.secretConfigured);
  const activeStatus = ready
    ? t("assistant.providerConnected")
    : authKind === "oauth"
      ? t("provider.loginRequired")
      : authKind === "api_key"
        ? t("provider.apiKeyRequired")
        : t("provider.selected");

  return (
    <section
      className={cn(
        "rounded-md border bg-card p-3 transition-colors",
        active && "border-primary/40 bg-primary/5",
      )}
      data-provider-card={providerId}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <div className="truncate text-sm font-semibold tracking-normal">{copy.label}</div>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              {active ? <Badge variant={ready ? "secondary" : "outline"}>{activeStatus}</Badge> : null}
              {!active && canUseStoredSecret ? <Badge variant="outline">{t("provider.saved")}</Badge> : null}
            </div>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy.description}</p>
          {runtime.model ? <div className="mt-1 font-mono text-[11px] text-muted-foreground">{runtime.model}</div> : null}
        </div>
      </div>

      <ProviderConnectionStatus
        active={active}
        authKind={authKind}
        canUseStoredSecret={canUseStoredSecret}
        providerId={providerId}
        ready={ready}
        validation={validation}
      />

      <div className="mt-3 space-y-2">
        {authKind === "oauth" ? (
          <div className="flex flex-wrap gap-2">
            <Button
              className="gap-1.5"
              disabled={!apiOnline || aiConnecting}
              size="sm"
              type="button"
              onClick={() => onOauthLogin(providerId)}
            >
              {aiConnecting ? <Loader2 className="size-3.5 animate-spin" /> : <LogIn className="size-3.5" />}
              {t("provider.browserLogin")}
            </Button>
            {canUseStoredSecret && !active ? (
              <Button disabled={!apiOnline || aiConnecting} size="sm" type="button" variant="outline" onClick={() => onSelectProvider(providerId)}>
                {t("provider.select")}
              </Button>
            ) : null}
            {canUseStoredSecret ? (
              <Button
                className="gap-1.5"
                disabled={!apiOnline || aiConnecting}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => onOauthLogout(providerId)}
              >
                {aiConnecting ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
                {t("provider.logout")}
              </Button>
            ) : null}
            <Button
              className="gap-1.5"
              disabled={!apiOnline || aiConnecting}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => onValidateProvider(providerId)}
            >
              {aiConnecting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {t("provider.verifyResponse")}
            </Button>
          </div>
        ) : null}

        {authKind === "api_key" ? (
          <div className="space-y-2">
            {providerId === "custom" ? (
              <Input
                placeholder="https://api.example.com/v1"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
              />
            ) : null}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                placeholder={provider.envKey ? `${provider.envKey} ${t("provider.orApiKey")}` : t("provider.apiKey")}
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
              <Button
                disabled={!apiOnline || aiConnecting || !apiKey.trim()}
                size="sm"
                type="button"
                onClick={() => {
                  onSaveApiProvider(providerId, apiKey.trim(), baseUrl.trim() || undefined);
                  setApiKey("");
                }}
              >
                {t("provider.save")}
              </Button>
            </div>
            {canUseStoredSecret && !active ? (
              <Button disabled={!apiOnline || aiConnecting} size="sm" type="button" variant="outline" onClick={() => onSelectProvider(providerId)}>
                {t("provider.useSavedKey")}
              </Button>
            ) : null}
            <Button
              className="gap-1.5"
              disabled={!apiOnline || aiConnecting}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => onValidateProvider(providerId)}
            >
              {aiConnecting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {t("provider.verifyResponse")}
            </Button>
          </div>
        ) : null}

        {authKind === "none" ? (
          <div className="flex flex-wrap gap-2">
            <Button disabled={!apiOnline || aiConnecting || active} size="sm" type="button" variant={active ? "secondary" : "outline"} onClick={() => onSelectProvider(providerId)}>
              {active ? (
                <>
                  <Check className="size-3.5" />
                  {t("automation.task.enabled")}
                </>
              ) : (
                t("provider.select")
              )}
            </Button>
            <Button
              className="gap-1.5"
              disabled={!apiOnline || aiConnecting}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => onValidateProvider(providerId)}
            >
              {aiConnecting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {t("provider.verifyResponse")}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProviderConnectionStatus({
  active,
  authKind,
  canUseStoredSecret,
  providerId,
  ready,
  validation,
}: {
  active: boolean;
  authKind: string;
  canUseStoredSecret: boolean;
  providerId: string;
  ready: boolean;
  validation?: ProviderValidationSnapshot;
}) {
  const { locale } = useLocale();
  const status = providerStatusCopy({
    active,
    authKind,
    canUseStoredSecret,
    locale,
    providerId,
    ready,
    validation,
  });
  const StatusIcon = status.icon;

  return (
    <div
      className={cn("mt-3 rounded-md border px-3 py-2 text-xs leading-5", status.className)}
      data-provider-fallback-state={status.mode}
      data-provider-validation-pending={validation?.pending ? "true" : "false"}
      data-provider-validation-status={validation ? validation.valid ? "valid" : "invalid" : "unchecked"}
    >
      <div className="flex items-start gap-2">
        <StatusIcon className={cn("mt-0.5 size-3.5 shrink-0", status.spin && "animate-spin")} />
        <div className="min-w-0">
          <div className="font-medium tracking-normal">{status.title}</div>
          <div className="text-muted-foreground">{status.detail}</div>
          {status.action ? (
            <div className="mt-1 font-medium text-foreground">{locale === "en" ? "Recommended action" : "권장 조치"}: {status.action}</div>
          ) : null}
          {status.meta ? <div className="mt-1 font-mono text-[11px] text-muted-foreground">{status.meta}</div> : null}
        </div>
      </div>
    </div>
  );
}

function providerStatusCopy({
  active,
  authKind,
  canUseStoredSecret,
  locale,
  providerId,
  ready,
  validation,
}: {
  active: boolean;
  authKind: string;
  canUseStoredSecret: boolean;
  locale: "ko" | "en";
  providerId: string;
  ready: boolean;
  validation?: ProviderValidationSnapshot;
}): {
  action?: string;
  className: string;
  detail: string;
  icon: LucideIcon;
  meta?: string;
  mode: string;
  spin?: boolean;
  title: string;
} {
  if (validation?.valid) {
    const liveActive = active && ready;
    return {
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
      detail: liveActive
        ? locale === "en"
          ? `${validation.model ?? providerId} passed response verification.`
          : `${validation.model ?? providerId} 응답 검증을 통과했습니다.`
        : locale === "en"
          ? `${validation.model ?? providerId} passed response verification. Switch to it to use this provider.`
          : `${validation.model ?? providerId} 응답 검증을 통과했습니다. 사용으로 전환하면 이 provider를 쓸 수 있습니다.`,
      icon: CircleCheck,
      meta: validationMeta(validation, locale),
      mode: liveActive ? "live" : "validated",
      title: liveActive
        ? locale === "en" ? "Live responses enabled" : "실제 응답 사용 중"
        : locale === "en" ? "Response verified" : "응답 검증 완료",
    };
  }

  if (validation?.pending) {
    return {
      action: providerActionLabel(validation.diagnostic?.action, locale) ?? (locale === "en" ? "Finish the login tab" : "로그인 탭 완료"),
      className: "border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100",
      detail: validation.diagnostic?.message ?? (locale === "en" ? "Checking the browser login state." : "브라우저 로그인 상태를 확인하는 중입니다."),
      icon: Loader2,
      meta: validationMeta(validation, locale),
      mode: "oauth-polling",
      spin: true,
      title: locale === "en" ? "Waiting for browser login" : "브라우저 로그인 대기",
    };
  }

  if (validation && !validation.valid) {
    return {
      action: providerActionLabel(validation.diagnostic?.action, locale),
      className: "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
      detail: validation.diagnostic?.message ?? validation.error ?? (locale === "en" ? "Could not verify the provider response." : "Provider 응답을 확인하지 못했습니다."),
      icon: AlertTriangle,
      meta: validationMeta(validation, locale),
      mode: "needs-action",
      title: locale === "en" ? "Connection needs attention" : "연결 확인 필요",
    };
  }

  if (active && ready) {
    return {
      className: "border-sky-500/25 bg-sky-500/10 text-sky-950 dark:text-sky-100",
      detail: locale === "en"
        ? "The profile is connected. Run response verification to confirm the current model replies."
        : "프로필은 연결됨 상태입니다. 응답 검증으로 현재 모델의 실제 응답까지 확인하세요.",
      icon: Info,
      mode: "live-unverified",
      title: locale === "en" ? "Live response not verified" : "실제 응답 확인 전",
    };
  }

  if (active) {
    return {
      action: authKind === "oauth"
        ? locale === "en" ? "Login again" : "다시 로그인 필요"
        : authKind === "api_key" ? locale === "en" ? "Check key or Base URL" : "키 또는 Base URL 확인" : undefined,
      className: "bg-muted/40 text-muted-foreground",
      detail: locale === "en"
        ? "Codaro uses local guide mode until this provider is connected and response verification passes."
        : "연결 전에는 기본 안내만 사용합니다. 로그인이나 키 저장 후 응답 검증을 통과해야 실제 응답을 사용합니다.",
      icon: Info,
      mode: "fallback",
      title: locale === "en" ? "Local guide mode" : "기본 안내 모드",
    };
  }

  if (canUseStoredSecret) {
    return {
      className: "bg-muted/40 text-muted-foreground",
      detail: locale === "en"
        ? "Saved authentication is available. Switch to it, then run response verification."
        : "저장된 인증이 있습니다. 사용으로 전환한 뒤 응답 검증을 실행하세요.",
      icon: Info,
      mode: "candidate",
      title: locale === "en" ? "Saved authentication available" : "저장된 인증 있음",
    };
  }

  return {
    action: authKind === "oauth"
      ? locale === "en" ? "Browser login" : "브라우저 로그인"
      : authKind === "api_key" ? locale === "en" ? "Save a key" : "키 저장" : undefined,
    className: "bg-muted/40 text-muted-foreground",
    detail: locale === "en"
      ? "This provider is not connected yet. Codaro will not use live responses from it until setup is complete."
      : "아직 연결되지 않았습니다. 연결 전에는 이 provider의 실제 응답을 사용하지 않습니다.",
    icon: Info,
    mode: "not-configured",
    title: authKind === "oauth"
      ? locale === "en" ? "Login required" : "로그인 필요"
      : authKind === "api_key" ? locale === "en" ? "Key required" : "키 필요" : locale === "en" ? "Not selected" : "미선택",
  };
}

function providerActionLabel(action?: string | null, locale: "ko" | "en" = "ko") {
  if (!action) return undefined;
  const labels: Record<string, string> = locale === "en" ? {
    "check-network": "Network issue",
    "check-permission": "Permission issue",
    "check-provider": "Check provider state",
    "check-provider-compatibility": "Check OAuth compatibility",
    "configure-api-key": "Enter API key",
    "configure-base-url": "Enter Base URL",
    "connect-provider": "Login again",
    "relogin-provider": "Login again",
    "retry-later": "Try again later",
    "restart-login": "Restart login",
  } : {
    "check-network": "네트워크 문제",
    "check-permission": "권한 문제",
    "check-provider": "Provider 상태 확인",
    "check-provider-compatibility": "OAuth 호환성 점검",
    "configure-api-key": "API 키 입력 필요",
    "configure-base-url": "Base URL 입력 필요",
    "connect-provider": "다시 로그인 필요",
    "relogin-provider": "다시 로그인 필요",
    "retry-later": "잠시 후 재시도",
    "restart-login": "로그인 다시 시작",
  };
  return labels[action] ?? action;
}

function validationMeta(validation: ProviderValidationSnapshot, locale: "ko" | "en") {
  const checkedAt = formatCheckedAt(validation.checkedAt, locale);
  const parts = [
    validation.phase ? `phase=${validation.phase}` : null,
    validation.probe ? `probe=${validation.probe}` : null,
    validation.diagnostic?.code ? `code=${validation.diagnostic.code}` : null,
    checkedAt ? `checked=${checkedAt}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

function formatCheckedAt(value: string | undefined, locale: "ko" | "en") {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new Intl.DateTimeFormat(localeDateFormat(locale), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function providerCatalog(profile: AiProfile | null): AiProvider[] {
  const catalog = profile?.catalog;
  if (Array.isArray(catalog)) {
    return catalog.filter((item): item is AiProvider => isRecord(item) && typeof item.id === "string");
  }
  return [];
}

function providerRuntime(profile: AiProfile | null): Record<string, ProviderRuntime> {
  const providers = profile?.providers;
  if (!isRecord(providers)) return {};
  return Object.fromEntries(
    Object.entries(providers).map(([key, value]) => [key, isRecord(value) ? value as ProviderRuntime : {}]),
  );
}

function providerCopy(provider: AiProvider, t: (key: string) => string) {
  const localized = t("nav.chat") === "Chat" ? providerEnglishCopy : providerKoreanCopy;
  return localized[provider.id ?? ""] ?? {
    label: provider.label ?? provider.name ?? provider.id ?? "provider",
    description: provider.description ?? (t("nav.chat") === "Chat" ? "Use as a Codaro provider." : "Codaro provider로 사용합니다."),
  };
}

function providerIcon(authKind: string, providerId: string) {
  if (providerId === "ollama") return Laptop;
  if (authKind === "api_key") return KeyRound;
  if (authKind === "oauth") return LogIn;
  return Server;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
