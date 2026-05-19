import {
  AssistantComposer,
  AssistantMessages,
  aiProfileReady,
  type AssistantMessage,
} from "@/components/assistant/assistantPanel";
import { PendingNotebookBar } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import type { TeacherScope } from "@/lib/teacherScope";
import type {
  AiProfile,
  BlockConfig,
  LoadState,
} from "@/types";

export function ChatSurface({
  aiConnecting,
  aiProfile,
  apiOnline,
  loading,
  loadState,
  messages,
  pendingBlocks,
  prompt,
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
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onAcceptPendingBlocks: () => void;
  onConnectAi: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
}) {
  const isEmptyChat = !messages.length && !pendingBlocks.length && loadState !== "loading";
  const providerReady = apiOnline && aiProfileReady(aiProfile);
  if (isEmptyChat) {
    return (
      <div className="grid h-[calc(100vh-40px)] min-h-0 place-items-center px-4">
        <section className="w-full max-w-3xl">
          <img alt="" className="mx-auto mb-5 size-52 object-contain sm:size-56" src="/brand/avatar-small.png" />
          <div className="mb-5 text-center">
            <div className="text-xl font-semibold tracking-normal">Codaro로 무엇을 만들까요?</div>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              목표부터 말하세요. Codaro는 커리큘럼을 설계하고, 셀을 전개하고, 답을 확인하고, 루틴을 자동화로 바꿀 수 있습니다.
            </p>
          </div>
          <AssistantComposer
            autoFocus
            loading={loading}
            placeholder="레슨, 실습 노트북, 브라우저 루틴, 자동화, 태스크를 요청하세요."
            prompt={prompt}
            variant="hero"
            onAsk={onAsk}
            onPromptChange={onPromptChange}
          />
          {!providerReady ? (
            <div className="mt-3 flex justify-center">
              <Button className="h-8 px-3 text-xs" disabled={aiConnecting || !apiOnline} size="sm" type="button" variant="secondary" onClick={onConnectAi}>
                {aiConnecting ? "연결 대기 중" : "대화 제공자 연결"}
              </Button>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" type="button" variant="outline" onClick={() => onPromptChange("실습 검증이 포함된 3단계 pandas 레슨을 만들어줘.")}>
              Pandas 레슨
            </Button>
            <Button size="sm" type="button" variant="outline" onClick={() => onPromptChange("브라우저 자동화 학습 루틴을 처음부터 만들어줘.")}>
              브라우저 루틴
            </Button>
            <Button size="sm" type="button" variant="outline" onClick={() => onPromptChange("반복 업무를 공유 가능한 자동화 노트북으로 바꿔줘.")}>
              자동화 노트북
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-40px)] min-h-0">
      <section className="mx-auto grid h-full min-h-0 w-full max-w-4xl grid-rows-[1fr_auto] p-3 pt-5">
        <AssistantMessages
          aiConnecting={aiConnecting}
          aiProfile={aiProfile}
          apiOnline={apiOnline}
          appLoading={loadState === "loading"}
          loading={loading}
          messages={messages}
          onConnectAi={onConnectAi}
        />
        <div>
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
