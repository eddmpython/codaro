import {
  Bot,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { useRef } from "react";

import {
  EmptyState,
  IconButton,
  PendingNotebookBar,
} from "@/components/app/appPrimitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { TeacherScope } from "@/lib/teacherScope";
import { cn } from "@/lib/utils";
import type { AiProfile, AiToolCall, BlockConfig } from "@/types";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  model?: string | null;
  toolCalls?: AiToolCall[];
  tone?: "default" | "warning" | "error";
};

export function TeacherPanel({
  aiConnecting,
  aiProfile,
  apiOnline,
  loading,
  messages,
  pendingBlocks,
  placement = "right",
  prompt,
  onAcceptPendingBlocks,
  onAsk,
  onConnectAi,
  onNewChat,
  onPromptChange,
  onRejectPendingBlocks,
}: {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  loading: boolean;
  messages: AssistantMessage[];
  pendingBlocks: BlockConfig[];
  placement?: "left" | "right";
  prompt: string;
  onAcceptPendingBlocks: () => void;
  onAsk: (messageOverride?: string, scopeOverride?: TeacherScope) => void;
  onConnectAi: () => void;
  onNewChat: () => void;
  onPromptChange: (value: string) => void;
  onRejectPendingBlocks: () => void;
}) {
  return (
    <aside
      className={cn(
        "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] border-t bg-background p-3",
        placement === "right" ? "xl:border-l xl:border-t-0" : "xl:border-r xl:border-t-0",
      )}
    >
      <div className="min-w-0">
        <AssistantHeader
          aiConnecting={aiConnecting}
          aiProfile={aiProfile}
          apiOnline={apiOnline}
          compact
          onConnectAi={onConnectAi}
          onNewChat={onNewChat}
        />

        <PendingNotebookBar
          pendingBlocks={pendingBlocks}
          onAccept={onAcceptPendingBlocks}
          onReject={onRejectPendingBlocks}
        />
      </div>

      <AssistantMessages appLoading={false} loading={loading} messages={messages} />

      <AssistantComposer
        className="mt-3"
        loading={loading}
        placeholder="설명, 답 확인, 셀 수정, 레슨 재구성, 자동화를 자연어로 요청하세요."
        prompt={prompt}
        variant="panel"
        onAsk={() => onAsk()}
        onPromptChange={onPromptChange}
      />
    </aside>
  );
}

export function AssistantMessages({
  appLoading,
  loading,
  messages,
}: {
  appLoading: boolean;
  loading: boolean;
  messages: AssistantMessage[];
}) {
  return (
    <ScrollArea className="min-h-0">
      <div className="space-y-3 pr-3">
        {appLoading ? (
          <LoadingState title="Codaro 여는 중" detail="노트북, 커리큘럼, 자동화 상태를 불러오고 있습니다." />
        ) : messages.length ? (
          messages.map((message) => (
            <Card
              className={cn(
                message.role === "user" && "bg-muted/30",
                message.tone === "error" && "bg-destructive/10",
                message.tone === "warning" && "bg-muted/40",
              )}
              key={message.id}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={message.role === "assistant" ? "secondary" : "outline"}>
                    {roleLabel(message.role)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{message.content}</div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            detail="Codaro에게 다음 설명, 실습 셀, 검증, 자동화를 만들어 달라고 요청하세요."
            title="채팅에서 시작"
          />
        )}
        {loading ? (
          <Card className="bg-muted/30">
            <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              다음 노트북 단계를 만드는 중입니다.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </ScrollArea>
  );
}

export function AssistantComposer({
  className,
  loading,
  placeholder = "Codaro에게 커리큘럼 생성, 실습 셀 구성, 코드 실행, 변수 확인, 워크플로 자동화를 요청하세요.",
  prompt,
  variant = "dock",
  onAsk,
  onPromptChange,
}: {
  className?: string;
  loading: boolean;
  placeholder?: string;
  prompt: string;
  variant?: "dock" | "hero" | "panel";
  onAsk: () => void;
  onPromptChange: (value: string) => void;
}) {
  const canAsk = Boolean(prompt.trim()) && !loading;
  const submittedOnKeyDownRef = useRef(false);
  const submit = () => {
    if (!canAsk) return;
    onAsk();
  };
  return (
    <form
      className={cn(
        "grid grid-cols-[1fr_auto] gap-2",
        variant === "dock" && "mt-3",
        variant === "hero" && "rounded-md border bg-card p-2 shadow-sm",
        variant === "panel" && "rounded-md border bg-background p-2",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        className={cn(
          "resize-none border-0 bg-transparent shadow-none focus-visible:ring-0",
          variant === "panel" ? "min-h-20" : "min-h-24",
        )}
        placeholder={placeholder}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={(event) => {
          submittedOnKeyDownRef.current = false;
          const nativeEvent = event.nativeEvent as KeyboardEvent & { isComposing?: boolean };
          if (nativeEvent.isComposing) return;
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submittedOnKeyDownRef.current = true;
            submit();
          }
        }}
        onKeyUp={(event) => {
          const nativeEvent = event.nativeEvent as KeyboardEvent & { isComposing?: boolean };
          if (event.key !== "Enter" || event.shiftKey || nativeEvent.isComposing) return;
          if (submittedOnKeyDownRef.current) {
            submittedOnKeyDownRef.current = false;
            return;
          }
          event.preventDefault();
          submit();
        }}
      />
      <IconButton className="self-end" disabled={!canAsk} label="보내기" type="submit" variant="default">
        {loading ? <Loader2 className="animate-spin" /> : <Send />}
      </IconButton>
    </form>
  );
}

export function aiProviderName(profile: AiProfile | null) {
  return String(profile?.activeProvider ?? profile?.provider ?? profile?.defaultProvider ?? "대화 제공자 없음");
}

export function aiProfileReady(profile: AiProfile | null) {
  return Boolean(profile?.ready ?? profile?.enabled);
}

function AssistantHeader({
  aiConnecting,
  aiProfile,
  apiOnline,
  compact = false,
  onConnectAi,
  onNewChat,
}: {
  aiConnecting: boolean;
  aiProfile: AiProfile | null;
  apiOnline: boolean;
  compact?: boolean;
  onConnectAi: () => void;
  onNewChat: () => void;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="size-4" />
          Codaro 어시스턴트
        </div>
        {compact ? (
          <div className="mt-1 text-xs leading-5 text-muted-foreground">{assistantStatusText(apiOnline, aiProfile)}</div>
        ) : (
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant={apiOnline && aiProfileReady(aiProfile) ? "secondary" : "outline"}>
              {apiOnline && aiProfileReady(aiProfile) ? "대화 연결됨" : "기본 안내 모드"}
            </Badge>
            <Badge variant={aiProfileReady(aiProfile) ? "secondary" : "outline"}>{aiProviderName(aiProfile)}</Badge>
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {compact ? null : (
          <>
            <IconButton disabled={aiConnecting} label="제공자 연결" onClick={onConnectAi}>
              {aiConnecting ? <Loader2 className="animate-spin" /> : <Bot />}
            </IconButton>
            <IconButton label="새 채팅" onClick={onNewChat}>
              <RotateCcw />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}

function roleLabel(role: AssistantMessage["role"]) {
  if (role === "assistant") return "어시스턴트";
  if (role === "user") return "나";
  return "시스템";
}

function assistantStatusText(apiOnline: boolean, profile: AiProfile | null) {
  if (!apiOnline) return "기본 안내 모드입니다.";
  if (!aiProfileReady(profile)) return "대화 제공자를 연결하면 실제 응답을 사용할 수 있습니다.";
  return "대화로 셀, 레슨, 커리큘럼을 다룹니다.";
}

function LoadingState({ title, detail }: { title: string; detail: string }) {
  return (
    <Card className="bg-muted/20">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          {title}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </CardContent>
    </Card>
  );
}
