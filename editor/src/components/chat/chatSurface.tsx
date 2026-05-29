import {
  AssistantComposer,
  AssistantMessages,
  aiProfileReady,
} from "@/components/assistant/assistantPanel";
import { PendingNotebookBar } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/localeContext";
import type { AssistantMessage } from "@/lib/assistantTypes";
import type { TeacherScope } from "@/lib/teacherScope";
import type {
  AiProfile,
  BlockConfig,
  LoadState,
} from "@/types";

export type ChatSurfaceExample = { label: string; prompt: string };

export function ChatSurface({
  aiConnecting,
  aiProfile,
  apiOnline,
  loading,
  loadState,
  messages,
  pendingBlocks,
  prompt,
  heroTitle,
  heroDetail,
  placeholder,
  examples,
  onAsk,
  onAcceptPendingBlocks,
  onConnectAi,
  onPromptChange,
  onRejectPendingBlocks,
}: {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  loading: boolean;
  loadState: LoadState;
  messages: AssistantMessage[];
  pendingBlocks: BlockConfig[];
  prompt: string;
  heroTitle?: string;
  heroDetail?: string;
  placeholder?: string;
  examples?: ChatSurfaceExample[];
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onAcceptPendingBlocks: () => void;
  onConnectAi: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
}) {
  const { t } = useLocale();
  const isEmptyChat = !messages.length && !pendingBlocks.length && loadState !== "loading";
  const providerReady = apiOnline && aiProfileReady(aiProfile);
  const heroExamples: ChatSurfaceExample[] = examples ?? [
    { label: t("chat.example.pandas"), prompt: t("chat.example.pandas.prompt") },
    { label: t("chat.example.browser"), prompt: t("chat.example.browser.prompt") },
    { label: t("chat.example.automation"), prompt: t("chat.example.automation.prompt") },
  ];
  if (isEmptyChat) {
    return (
      <div className="grid h-full min-h-0 place-items-center px-4">
        <section className="w-full max-w-3xl">
          <img alt="" className="mx-auto mb-5 size-52 object-contain sm:size-56" src="/brand/avatar-small.png" />
          <div className="mb-5 text-center">
            <div className="text-xl font-semibold tracking-normal">{heroTitle ?? t("chat.empty.title")}</div>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {heroDetail ?? t("chat.empty.detail")}
            </p>
          </div>
          <AssistantComposer
            autoFocus
            loading={loading}
            placeholder={placeholder ?? t("chat.placeholder")}
            prompt={prompt}
            variant="hero"
            onAsk={onAsk}
            onPromptChange={onPromptChange}
          />
          {!providerReady ? (
            <div className="mt-3 flex justify-center">
              <Button className="h-8 px-3 text-xs" disabled={aiConnecting || !apiOnline} size="sm" type="button" variant="secondary" onClick={onConnectAi}>
                {aiConnecting ? t("chat.connecting") : t("chat.connectProvider")}
              </Button>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {heroExamples.map((example) => (
              <Button key={example.label} size="sm" type="button" variant="outline" onClick={() => onPromptChange(example.prompt)}>
                {example.label}
              </Button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0">
      <section className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_auto] pt-5">
        <AssistantMessages
          aiConnecting={aiConnecting}
          aiProfile={aiProfile}
          apiOnline={apiOnline}
          appLoading={loadState === "loading"}
          loading={loading}
          messages={messages}
          onConnectAi={onConnectAi}
        />
        <div className="mx-auto w-full max-w-4xl p-3 pt-0">
          <PendingNotebookBar
            pendingBlocks={pendingBlocks}
            onAccept={onAcceptPendingBlocks}
            onReject={onRejectPendingBlocks}
          />
          <AssistantComposer
            loading={loading}
            prompt={prompt}
            variant="dock"
            onAsk={onAsk}
            onPromptChange={onPromptChange}
          />
        </div>
      </section>
    </div>
  );
}
