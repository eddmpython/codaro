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
            Codaro가 채팅, 학습 셀, 자동화 요청에 사용할 provider를 연결합니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4">
          <div className="space-y-2 pb-4">
            {!apiOnline ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
                서버 세션이 열리면 provider를 연결할 수 있습니다.
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
                provider 목록을 불러오지 못했습니다. 서버 상태를 확인하세요.
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
  const providerId = provider.id ?? "";
  const copy = providerCopy(provider);
  const authKind = provider.authKind ?? "runtime";
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(runtime.baseUrl ?? "");
  const Icon = providerIcon(authKind, providerId);
  const canUseStoredSecret = Boolean(runtime.secretConfigured);
  const activeStatus = ready ? "연결됨" : authKind === "oauth" ? "로그인 필요" : authKind === "api_key" ? "키 필요" : "선택됨";

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
              {!active && canUseStoredSecret ? <Badge variant="outline">설정됨</Badge> : null}
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
              브라우저 로그인
            </Button>
            {canUseStoredSecret && !active ? (
              <Button disabled={!apiOnline || aiConnecting} size="sm" type="button" variant="outline" onClick={() => onSelectProvider(providerId)}>
                사용
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
                로그아웃
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
              응답 검증
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
                placeholder={provider.envKey ? `${provider.envKey} 또는 API 키` : "API 키"}
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
                저장
              </Button>
            </div>
            {canUseStoredSecret && !active ? (
              <Button disabled={!apiOnline || aiConnecting} size="sm" type="button" variant="outline" onClick={() => onSelectProvider(providerId)}>
                저장된 키 사용
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
              응답 검증
            </Button>
          </div>
        ) : null}

        {authKind === "none" ? (
          <div className="flex flex-wrap gap-2">
            <Button disabled={!apiOnline || aiConnecting || active} size="sm" type="button" variant={active ? "secondary" : "outline"} onClick={() => onSelectProvider(providerId)}>
              {active ? (
                <>
                  <Check className="size-3.5" />
                  사용 중
                </>
              ) : (
                "사용"
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
              응답 검증
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
  const status = providerStatusCopy({
    active,
    authKind,
    canUseStoredSecret,
    providerId,
    ready,
    validation,
  });
  const StatusIcon = status.icon;

  return (
    <div
      className={cn("mt-3 rounded-md border px-3 py-2 text-xs leading-5", status.className)}
      data-provider-fallback-state={status.mode}
      data-provider-validation-status={validation ? validation.valid ? "valid" : "invalid" : "unchecked"}
    >
      <div className="flex items-start gap-2">
        <StatusIcon className="mt-0.5 size-3.5 shrink-0" />
        <div className="min-w-0">
          <div className="font-medium tracking-normal">{status.title}</div>
          <div className="text-muted-foreground">{status.detail}</div>
          {status.action ? (
            <div className="mt-1 font-medium text-foreground">권장 조치: {status.action}</div>
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
}): {
  action?: string;
  className: string;
  detail: string;
  icon: LucideIcon;
  meta?: string;
  mode: string;
  title: string;
} {
  if (validation?.valid) {
    const liveActive = active && ready;
    return {
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
      detail: liveActive
        ? `${validation.model ?? providerId} 응답 검증을 통과했습니다.`
        : `${validation.model ?? providerId} 응답 검증을 통과했습니다. 사용으로 전환하면 이 provider를 쓸 수 있습니다.`,
      icon: CircleCheck,
      meta: validationMeta(validation),
      mode: liveActive ? "live" : "validated",
      title: liveActive ? "실제 응답 사용 중" : "응답 검증 완료",
    };
  }

  if (validation && !validation.valid) {
    return {
      action: providerActionLabel(validation.diagnostic?.action),
      className: "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
      detail: validation.diagnostic?.message ?? validation.error ?? "Provider 응답을 확인하지 못했습니다.",
      icon: AlertTriangle,
      meta: validationMeta(validation),
      mode: "needs-action",
      title: "연결 확인 필요",
    };
  }

  if (active && ready) {
    return {
      className: "border-sky-500/25 bg-sky-500/10 text-sky-950 dark:text-sky-100",
      detail: "프로필은 연결됨 상태입니다. 응답 검증으로 현재 모델의 실제 응답까지 확인하세요.",
      icon: Info,
      mode: "live-unverified",
      title: "실제 응답 확인 전",
    };
  }

  if (active) {
    return {
      action: authKind === "oauth" ? "다시 로그인 필요" : authKind === "api_key" ? "키 또는 Base URL 확인" : undefined,
      className: "bg-muted/40 text-muted-foreground",
      detail: "연결 전에는 기본 안내만 사용합니다. 로그인이나 키 저장 후 응답 검증을 통과해야 실제 응답을 사용합니다.",
      icon: Info,
      mode: "fallback",
      title: "기본 안내 모드",
    };
  }

  if (canUseStoredSecret) {
    return {
      className: "bg-muted/40 text-muted-foreground",
      detail: "저장된 인증이 있습니다. 사용으로 전환한 뒤 응답 검증을 실행하세요.",
      icon: Info,
      mode: "candidate",
      title: "저장된 인증 있음",
    };
  }

  return {
    action: authKind === "oauth" ? "브라우저 로그인" : authKind === "api_key" ? "키 저장" : undefined,
    className: "bg-muted/40 text-muted-foreground",
    detail: "아직 연결되지 않았습니다. 연결 전에는 이 provider의 실제 응답을 사용하지 않습니다.",
    icon: Info,
    mode: "not-configured",
    title: authKind === "oauth" ? "로그인 필요" : authKind === "api_key" ? "키 필요" : "미선택",
  };
}

function providerActionLabel(action?: string | null) {
  if (!action) return undefined;
  const labels: Record<string, string> = {
    "check-network": "네트워크 문제",
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

function validationMeta(validation: ProviderValidationSnapshot) {
  const checkedAt = formatCheckedAt(validation.checkedAt);
  const parts = [
    validation.phase ? `phase=${validation.phase}` : null,
    validation.probe ? `probe=${validation.probe}` : null,
    validation.diagnostic?.code ? `code=${validation.diagnostic.code}` : null,
    checkedAt ? `checked=${checkedAt}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

function formatCheckedAt(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new Intl.DateTimeFormat("ko-KR", {
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

function providerCopy(provider: AiProvider) {
  return providerKoreanCopy[provider.id ?? ""] ?? {
    label: provider.label ?? provider.name ?? provider.id ?? "provider",
    description: provider.description ?? "Codaro provider로 사용합니다.",
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
