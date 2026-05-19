import {
  AssistantComposer,
  AssistantMessages,
  type AssistantMessage,
} from "@/components/assistant/assistantPanel";
import { PendingNotebookBar } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import type { TeacherScope } from "@/lib/teacherScope";
import type {
  BlockConfig,
  LoadState,
} from "@/types";

export function ChatSurface({
  loading,
  loadState,
  messages,
  pendingBlocks,
  prompt,
  onAsk,
  onAcceptPendingBlocks,
  onPromptChange,
  onRejectPendingBlocks,
}: {
  loading: boolean;
  loadState: LoadState;
  messages: AssistantMessage[];
  pendingBlocks: BlockConfig[];
  prompt: string;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onAcceptPendingBlocks: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
}) {
  const isEmptyChat = !messages.length && !pendingBlocks.length && loadState !== "loading";
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
            loading={loading}
            placeholder="레슨, 실습 노트북, 브라우저 루틴, 자동화, 태스크를 요청하세요."
            prompt={prompt}
            variant="hero"
            onAsk={onAsk}
            onPromptChange={onPromptChange}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" type="button" variant="outline" onClick={() => onAsk("실습 검증이 포함된 3단계 pandas 레슨을 만들어줘.", "curriculum")}>
              Pandas 레슨
            </Button>
            <Button size="sm" type="button" variant="outline" onClick={() => onAsk("브라우저 자동화 학습 루틴을 처음부터 만들어줘.", "curriculum")}>
              브라우저 루틴
            </Button>
            <Button size="sm" type="button" variant="outline" onClick={() => onAsk("반복 업무를 공유 가능한 자동화 노트북으로 바꿔줘.", "curriculum")}>
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
        <AssistantMessages appLoading={loadState === "loading"} loading={loading} messages={messages} />
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
