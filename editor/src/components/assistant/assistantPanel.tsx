import {
  AlertCircle,
  ArrowUp,
  Bot,
  CheckCircle2,
  ListTree,
  LogIn,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useRef } from "react";

import {
  EmptyState,
  IconButton,
  PendingNotebookBar,
} from "@/components/app/appPrimitives";
import { AssistantMarkdown } from "@/components/assistant/assistantMarkdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type {
  AssistantMessage,
  AssistantWorkStep,
} from "@/lib/assistantTypes";
import type { TeacherScope } from "@/lib/teacherScope";
import { cn } from "@/lib/utils";
import type { AiProfile, AiTraceSummary, AiTraceWorkloopEvent, BlockConfig } from "@/types";

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

      <AssistantMessages
        aiConnecting={aiConnecting}
        aiProfile={aiProfile}
        apiOnline={apiOnline}
        appLoading={false}
        loading={loading}
        messages={messages}
        onConnectAi={onConnectAi}
      />

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
  aiConnecting = false,
  aiProfile = null,
  apiOnline = false,
  appLoading,
  loading,
  messages,
  onConnectAi,
}: {
  aiConnecting?: boolean;
  aiProfile?: AiProfile | null;
  apiOnline?: boolean;
  appLoading: boolean;
  loading: boolean;
  messages: AssistantMessage[];
  onConnectAi?: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const latestMessageLength = messages.at(-1)?.content.length ?? 0;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    if (distanceFromBottom < 220) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [loading, messages.length, latestMessageLength]);

  return (
    <ScrollArea className="h-full min-h-0" viewportRef={viewportRef}>
      <div className="mx-auto w-full max-w-3xl space-y-1 pr-3">
        {appLoading ? (
          <LoadingState title="Codaro 여는 중" detail="노트북, 커리큘럼, 자동화 상태를 불러오고 있습니다." />
        ) : messages.length ? (
          messages.map((message) => {
            const needsProvider = message.action === "connect-provider" || isProviderAuthMessage(message.content);
            const isWriting = message.role === "assistant" && message.loading;
            const hasWorkSteps = Boolean(message.steps?.length);
            return (
              <div
                className={cn(
                  "group flex px-1 py-2",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
                key={message.id}
              >
                {message.role === "user" ? (
                  <div className="max-w-[75%] rounded-2xl bg-muted/60 px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap break-words text-foreground">
                    {message.content}
                  </div>
                ) : (
                  <div className="w-full max-w-3xl space-y-2 text-sm leading-6 text-foreground">
                    {message.tone === "error" ? (
                      <div className="flex items-start gap-2 text-destructive">
                        <AlertCircle className="mt-1 size-4 shrink-0" />
                        <div className="min-w-0">
                          <AssistantMarkdown content={cleanAssistantMessage(message.content)} />
                          {needsProvider ? (
                            <ProviderConnectAction
                              aiConnecting={aiConnecting}
                              apiOnline={apiOnline}
                              onConnectAi={onConnectAi}
                            />
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.content.trim() ? (
                          <AssistantMarkdown content={cleanAssistantMessage(message.content)} />
                        ) : null}
                        <AssistantWorkLoop steps={message.steps} trace={message.trace} />
                        {isWriting ? (
                          <div className={cn("flex items-center gap-2 py-1 text-sm text-muted-foreground", hasWorkSteps && "sr-only")}>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>{message.content.trim() ? "답변 작성 중" : "응답 준비 중"}</span>
                          </div>
                        ) : null}
                        {needsProvider && !aiProfileReady(aiProfile) ? (
                          <ProviderConnectAction
                            aiConnecting={aiConnecting}
                            apiOnline={apiOnline}
                            onConnectAi={onConnectAi}
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyState
            detail="Codaro에게 다음 설명, 실습 셀, 검증, 자동화를 만들어 달라고 요청하세요."
            title="채팅에서 시작"
          />
        )}
        {loading && !messages.some((message) => message.loading) ? (
          <div className="flex items-center gap-2 px-1 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            응답 작성 중
          </div>
        ) : null}
      </div>
    </ScrollArea>
  );
}

function AssistantWorkLoop({ steps, trace }: { steps?: AssistantWorkStep[]; trace?: AiTraceSummary }) {
  const visibleSteps = steps ?? [];
  const traceWorkloop = traceWorkloopEvents(trace);
  if (!visibleSteps.length && !trace) return null;
  const runningStep = visibleSteps.find((step) => step.status === "running");
  const hasError = visibleSteps.some((step) => step.status === "error") || Boolean((trace?.errorCount ?? 0) > 0);
  const toolSteps = visibleSteps.filter((step) => step.toolName);
  const groups = groupAssistantSteps(visibleSteps);
  const label = runningStep
      ? `처리 중 · ${[runningStep.label, runningStep.detail].filter(Boolean).join(" · ")}`
    : hasError
      ? `처리 확인 필요 · ${toolSteps.length || traceWorkloop.length || visibleSteps.length}건`
      : `처리 완료 · ${toolSteps.length || traceWorkloop.length || visibleSteps.length}건`;

  return (
    <details className="my-2 rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground" open={Boolean(runningStep)}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-foreground">
        {runningStep ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : hasError ? (
          <AlertCircle className="size-3.5 text-destructive" />
        ) : (
          <CheckCircle2 className="size-3.5 text-emerald-500" />
        )}
        <span>{label}</span>
      </summary>
      <div className="mt-2 space-y-3 border-l pl-3">
        {groups.map((group) => (
          <div className="space-y-1.5" key={group.key}>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <ListTree className="size-3" />
              <span className="font-medium text-foreground">{group.label}</span>
              <span>{group.steps.length}단계</span>
              {group.errorCount ? <span className="text-destructive">오류 {group.errorCount}</span> : null}
            </div>
            <div className="space-y-1">
              {group.steps.map((step) => (
                <AssistantWorkStepRow key={step.id} step={step} />
              ))}
            </div>
          </div>
        ))}
        <AssistantTraceDetails trace={trace} workloop={traceWorkloop} />
      </div>
    </details>
  );
}

function AssistantWorkStepRow({ step }: { step: AssistantWorkStep }) {
  const duration = step.startedAt && step.finishedAt ? formatDuration(step.finishedAt - step.startedAt) : null;
  const traceElapsed = typeof step.turnElapsedMs === "number" ? `+${formatDuration(step.turnElapsedMs)}` : null;
  const icon = step.status === "running" ? (
    <Loader2 className="mt-1 size-3 animate-spin" />
  ) : step.status === "error" ? (
    <AlertCircle className="mt-1 size-3 text-destructive" />
  ) : (
    <CheckCircle2 className="mt-1 size-3 text-emerald-500" />
  );

  if (!step.toolName) {
    return (
      <div className="flex items-start gap-2 leading-5">
        {icon}
        <div className="min-w-0">
          <div className="text-foreground">{step.label}</div>
          {step.detail ? <div>{step.detail}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <details className="rounded-md border border-border/70 bg-background/60 px-2.5 py-1.5">
      <summary className="flex cursor-pointer list-none items-center gap-2">
        {icon}
        <span className="text-foreground">{step.label}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{step.toolName}</span>
        {step.policyCode ? (
          <span className="rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">{step.policyCode}</span>
        ) : null}
        {duration || traceElapsed ? (
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">{duration ?? traceElapsed}</span>
        ) : null}
      </summary>
      <div className="mt-2 space-y-2">
        <AssistantWorkStepMeta step={step} />
        {step.detail ? <div className="text-muted-foreground">{step.detail}</div> : null}
        <ToolPayloadBlock label="In" value={step.arguments} />
        {step.status === "running" ? (
          <div className="flex items-center gap-2 rounded-md bg-muted/20 px-2 py-1.5 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            실행 중
          </div>
        ) : step.error ? (
          <ToolPayloadBlock label="Error" tone="error" value={step.error} />
        ) : (
          <ToolPayloadBlock label="Out" value={step.result} />
        )}
      </div>
    </details>
  );
}

function AssistantWorkStepMeta({ step }: { step: AssistantWorkStep }) {
  const items = [
    step.lane && `lane:${step.lane}`,
    step.category && `category:${step.category}`,
    step.target && `target:${step.target}`,
    step.risk && step.risk !== "normal" && `risk:${step.risk}`,
    typeof step.traceEventIndex === "number" && `event:${step.traceEventIndex}`,
  ].filter((item): item is string => typeof item === "string" && item.length > 0);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span className="rounded-sm bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" key={item}>
          {item}
        </span>
      ))}
    </div>
  );
}

function AssistantTraceDetails({ trace, workloop }: { trace?: AiTraceSummary; workloop: AiTraceWorkloopEvent[] }) {
  if (!trace) return null;
  const eventCount = trace.eventCount ?? trace.events?.length ?? 0;
  const toolCount = trace.toolCount ?? trace.toolSequence?.length ?? 0;
  const errorCount = trace.errorCount ?? workloop.filter((event) => event.status === "error" || event.error).length;
  const hasPolicyViolation = Boolean((trace.policyViolationCount ?? 0) > 0 || trace.policyViolations?.length);

  return (
    <details className="rounded-md border border-border/70 bg-background/50 px-2.5 py-2">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 text-foreground">
        {hasPolicyViolation || errorCount ? (
          <ShieldAlert className="size-3.5 text-destructive" />
        ) : (
          <ListTree className="size-3.5 text-muted-foreground" />
        )}
        <span>trace detail</span>
        {trace.traceId ? <span className="font-mono text-[10px] text-muted-foreground">{trace.traceId}</span> : null}
        <span className="ml-auto text-[10px] text-muted-foreground">
          event {eventCount} · tool {toolCount} · error {errorCount}
        </span>
      </summary>
      <div className="mt-2 space-y-2">
        {workloop.length ? (
          <div className="space-y-1">
            {workloop.map((event, index) => (
              <TraceWorkloopRow event={event} key={`${event.eventIndex ?? index}-${event.eventType ?? "event"}`} />
            ))}
          </div>
        ) : null}
        {trace.policyViolations?.length ? (
          <ToolPayloadBlock label="Policy" tone="error" value={trace.policyViolations} />
        ) : null}
        <details>
          <summary className="cursor-pointer list-none font-mono text-[10px] uppercase text-muted-foreground">
            raw trace
          </summary>
          <div className="mt-1">
            <ToolPayloadBlock label="Trace" value={trace} />
          </div>
        </details>
      </div>
    </details>
  );
}

function TraceWorkloopRow({ event }: { event: AiTraceWorkloopEvent }) {
  const isError = event.status === "error" || Boolean(event.error);
  const elapsed = typeof event.elapsedMs === "number" ? `+${formatDuration(event.elapsedMs)}` : null;
  return (
    <div className={cn("rounded-sm px-2 py-1.5", isError ? "bg-destructive/10 text-destructive" : "bg-muted/20")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{event.workLabel || event.toolName || event.eventType || "작업"}</span>
        {event.toolName ? <span className="font-mono text-[10px] text-muted-foreground">{event.toolName}</span> : null}
        {event.status ? <span className="font-mono text-[10px] text-muted-foreground">{event.status}</span> : null}
        {elapsed ? <span className="ml-auto font-mono text-[10px] text-muted-foreground">{elapsed}</span> : null}
      </div>
      {event.workDetail || event.error ? (
        <div className="mt-1 text-[11px] leading-5">{event.error || event.workDetail}</div>
      ) : null}
    </div>
  );
}

function ToolPayloadBlock({ label, tone = "default", value }: { label: string; tone?: "default" | "error"; value: unknown }) {
  return (
    <div className={cn("rounded-md bg-muted/20 px-2 py-1.5", tone === "error" && "bg-destructive/10 text-destructive")}>
      <div className="mb-1 font-mono text-[10px] font-medium uppercase tracking-normal text-muted-foreground">{label}</div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5">{formatPayload(value)}</pre>
    </div>
  );
}

function formatPayload(value: unknown) {
  if (value === undefined || value === null || value === "") return "없음";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2).slice(0, 2000);
  } catch {
    return String(value);
  }
}

function groupAssistantSteps(steps: AssistantWorkStep[]) {
  const groups: Array<{ key: string; label: string; steps: AssistantWorkStep[]; errorCount: number }> = [];
  for (const step of steps) {
    const key = stepGroupKey(step);
    const existing = groups.find((group) => group.key === key);
    if (existing) {
      existing.steps.push(step);
      if (step.status === "error") existing.errorCount += 1;
      continue;
    }
    groups.push({
      key,
      label: stepGroupLabel(step, key),
      steps: [step],
      errorCount: step.status === "error" ? 1 : 0,
    });
  }
  return groups;
}

function stepGroupKey(step: AssistantWorkStep) {
  return step.lane || step.category || (step.toolName ? "tool" : "compose");
}

function stepGroupLabel(step: AssistantWorkStep, key: string) {
  if (step.lane) return laneLabel(step.lane);
  if (step.category) return categoryLabel(step.category);
  if (key === "compose") return "요청 준비";
  return "도구 실행";
}

function laneLabel(lane: string) {
  switch (lane) {
    case "curriculum":
      return "커리큘럼 설계";
    case "read":
      return "상태 확인";
    case "write":
      return "노트북 반영";
    case "cell-call":
      return "셀 실행/검증";
    case "progress":
      return "진도 기록";
    case "automation":
      return "자동화";
    case "safety":
      return "안전 확인";
    default:
      return lane;
  }
}

function categoryLabel(category: string) {
  switch (category) {
    case "runtime":
      return "런타임";
    case "learning":
      return "학습 구성";
    case "workbench":
      return "워크벤치";
    case "files":
      return "파일/패키지";
    case "automation":
      return "자동화";
    case "safety":
      return "안전";
    default:
      return category;
  }
}

function traceWorkloopEvents(trace?: AiTraceSummary): AiTraceWorkloopEvent[] {
  return Array.isArray(trace?.workloop) ? trace.workloop : [];
}

function formatDuration(milliseconds: number) {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

export function AssistantComposer({
  autoFocus = false,
  className,
  loading,
  placeholder = "Codaro에게 커리큘럼 생성, 실습 셀 구성, 코드 실행, 변수 확인, 워크플로 자동화를 요청하세요.",
  prompt,
  variant = "dock",
  onAsk,
  onPromptChange,
}: {
  autoFocus?: boolean;
  className?: string;
  loading: boolean;
  placeholder?: string;
  prompt: string;
  variant?: "dock" | "hero" | "panel";
  onAsk: () => void;
  onPromptChange: (value: string) => void;
}) {
  const canAsk = Boolean(prompt.trim()) && !loading;
  const submit = () => {
    if (!canAsk) return;
    onAsk();
  };
  return (
    <form
      className={cn(
        "flex w-full items-end gap-2",
        variant === "dock" && "mt-3",
        variant === "hero" && "rounded-md",
        variant === "panel" && "rounded-md border bg-background p-2",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        autoFocus={autoFocus}
        className={cn(
          "min-h-10 max-h-48 flex-1 resize-none overflow-y-auto py-2.5",
          variant === "panel" && "max-h-40 border-0 bg-transparent shadow-none focus-visible:ring-0",
        )}
        placeholder={placeholder}
        rows={1}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={(event) => {
          const nativeEvent = event.nativeEvent as KeyboardEvent & { isComposing?: boolean };
          if (nativeEvent.isComposing) return;
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <Button
        aria-label="전송"
        className="size-9 shrink-0 rounded-full [&_svg]:size-4"
        disabled={!canAsk}
        size="icon"
        title="전송"
        type="submit"
      >
        {loading ? <Loader2 className="animate-spin" /> : <ArrowUp />}
      </Button>
    </form>
  );
}

export function aiProviderName(profile: AiProfile | null) {
  return String(profile?.activeProvider ?? profile?.provider ?? profile?.defaultProvider ?? "provider 없음");
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
              {apiOnline && aiProfileReady(aiProfile) ? "provider 연결됨" : "기본 안내 모드"}
            </Badge>
            <Badge variant={aiProfileReady(aiProfile) ? "secondary" : "outline"}>{aiProviderName(aiProfile)}</Badge>
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {compact ? (
          apiOnline && !aiProfileReady(aiProfile) ? (
            <Button className="h-8 gap-1.5 px-2 text-xs" disabled={aiConnecting} size="sm" variant="outline" onClick={onConnectAi}>
              {aiConnecting ? <Loader2 className="size-3.5 animate-spin" /> : <LogIn className="size-3.5" />}
              Provider
            </Button>
          ) : null
        ) : (
          <>
            <IconButton disabled={aiConnecting} label="Provider 연결" onClick={onConnectAi}>
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

function assistantStatusText(apiOnline: boolean, profile: AiProfile | null) {
  if (!apiOnline) return "기본 안내 모드입니다.";
  if (!aiProfileReady(profile)) return "provider를 연결하면 실제 응답을 사용할 수 있습니다.";
  return "대화로 셀, 레슨, 커리큘럼을 다룹니다.";
}

function LoadingState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        {title}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

function isProviderAuthMessage(content: string) {
  const normalized = content.toLowerCase();
  return (
    normalized.includes("oauth authentication required") ||
    normalized.includes("please login") ||
    normalized.includes("authentication expired") ||
    normalized.includes("re-login") ||
    normalized.includes("provider 로그인이 필요") ||
    normalized.includes("대화 제공자 로그인이 필요")
  );
}

function cleanAssistantMessage(content: string) {
  return isProviderAuthMessage(content)
    ? "provider 로그인이 필요합니다. Provider 설정에서 브라우저 로그인을 완료한 뒤 다시 요청하세요."
    : content.replace(/^503\s+/, "");
}

function ProviderConnectAction({
  aiConnecting,
  apiOnline,
  onConnectAi,
}: {
  aiConnecting: boolean;
  apiOnline: boolean;
  onConnectAi?: () => void;
}) {
  if (!apiOnline) {
    return <div className="mt-2 text-xs text-muted-foreground">서버 세션이 열리면 provider를 연결할 수 있습니다.</div>;
  }
  return (
    <Button className="mt-2 h-8 gap-1.5 px-3 text-xs" disabled={aiConnecting || !onConnectAi} size="sm" onClick={onConnectAi}>
      {aiConnecting ? <Loader2 className="size-3.5 animate-spin" /> : <LogIn className="size-3.5" />}
      Provider 연결
    </Button>
  );
}
