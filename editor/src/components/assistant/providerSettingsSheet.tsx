import {
  Check,
  KeyRound,
  Laptop,
  Loader2,
  LogIn,
  Server,
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
import type { AiProfile, AiProvider } from "@/types";

type ProviderSettingsSheetProps = {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOauthLogin: (providerId: string) => void;
  onSaveApiProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;
  onSelectProvider: (providerId: string) => void;
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
    description: "API 키를 저장해 Codaro 대화 제공자로 사용합니다.",
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
  onOpenChange,
  onOauthLogin,
  onSaveApiProvider,
  onSelectProvider,
}: ProviderSettingsSheetProps) {
  const providers = useMemo(() => providerCatalog(aiProfile), [aiProfile]);
  const runtime = useMemo(() => providerRuntime(aiProfile), [aiProfile]);
  const activeProvider = String(aiProfile?.activeProvider ?? aiProfile?.defaultProvider ?? "");
  const ready = Boolean(aiProfile?.ready ?? aiProfile?.enabled);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>대화 제공자</SheetTitle>
          <SheetDescription>
            Codaro가 채팅, 학습 셀, 자동화 요청에 사용할 제공자를 연결합니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4">
          <div className="space-y-2 pb-4">
            {!apiOnline ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
                서버 세션이 열리면 제공자를 연결할 수 있습니다.
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
                  onOauthLogin={onOauthLogin}
                  onSaveApiProvider={onSaveApiProvider}
                  onSelectProvider={onSelectProvider}
                />
              ))
            ) : (
              <div className="rounded-md border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
                제공자 목록을 불러오지 못했습니다. 서버 상태를 확인하세요.
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
  onOauthLogin,
  onSaveApiProvider,
  onSelectProvider,
}: {
  active: boolean;
  aiConnecting: boolean;
  apiOnline: boolean;
  provider: AiProvider;
  ready: boolean;
  runtime: ProviderRuntime;
  onOauthLogin: (providerId: string) => void;
  onSaveApiProvider: (providerId: string, apiKey: string, baseUrl?: string) => void;
  onSelectProvider: (providerId: string) => void;
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
          </div>
        ) : null}

        {authKind === "none" ? (
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
        ) : null}
      </div>
    </section>
  );
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
    label: provider.label ?? provider.name ?? provider.id ?? "제공자",
    description: provider.description ?? "Codaro 대화 제공자로 사용합니다.",
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
