import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CellAiAction } from "@/lib/cellModel";
import type { CellAiHelpState } from "@/lib/assistantTypes";
import { cn } from "@/lib/utils";

export function CellAiActions({
  helpState,
  onAsk,
  selected,
}: {
  helpState?: CellAiHelpState;
  onAsk: (action: CellAiAction, question?: string) => void;
  selected: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: MouseEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function submit(action: CellAiAction) {
    onAsk(action, question);
    setQuestion("");
    setOpen(true);
  }

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      <Button
        aria-expanded={open}
        aria-label="이 셀에서 AI 도움 요청"
        className={cn(
          "h-7 gap-1.5 px-2 text-xs opacity-90 lg:opacity-0 lg:transition group-hover:opacity-100 focus-visible:opacity-100",
          open && "opacity-100",
        )}
        tabIndex={selected ? 0 : -1}
        title="이 셀에서 AI 도움 요청"
        type="button"
        variant="outline"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <Sparkles className="size-3.5" />
        <span className="hidden sm:inline">도움 요청</span>
      </Button>

      {open ? (
        <div
          className="absolute right-0 top-8 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-md border bg-popover p-3 text-popover-foreground shadow-lg"
          data-cell-ai-popover="true"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-semibold">이 셀에서 바로 질문</div>
              <div className="mt-0.5 text-[11px] leading-4 text-muted-foreground">답변은 선택한 셀 맥락으로 처리됩니다.</div>
            </div>
            <Button
              aria-label="닫기"
              className="size-6 shrink-0 [&_svg]:size-3.5"
              size="icon"
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              <X />
            </Button>
          </div>
          <Textarea
            autoFocus
            className="min-h-20 resize-none text-sm"
            data-cell-ai-question="true"
            placeholder="막힌 부분이나 확인하고 싶은 점을 적으세요."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              const nativeEvent = event.nativeEvent as KeyboardEvent & { isComposing?: boolean };
              if (nativeEvent.isComposing) return;
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                submit("explain");
              }
            }}
          />
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <Button className="h-8 gap-1.5 px-2 text-xs" type="button" variant="secondary" onClick={() => submit("explain")}>
              <MessageSquareText className="size-3.5" />
              질문
            </Button>
            <Button className="h-8 gap-1.5 px-2 text-xs" type="button" variant="outline" onClick={() => submit("hint")}>
              <Lightbulb className="size-3.5" />
              힌트
            </Button>
            <Button className="h-8 gap-1.5 px-2 text-xs" type="button" variant="outline" onClick={() => submit("check")}>
              <CheckCircle2 className="size-3.5" />
              검증
            </Button>
          </div>
          {helpState ? (
            <div
              className={cn(
                "mt-3 rounded-md border bg-background/70 p-2 text-xs leading-5",
                helpState.tone === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
              )}
              data-cell-ai-answer="true"
            >
              <div className="mb-1 flex items-center gap-1.5 font-medium">
                {helpState.loading ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3 text-emerald-500" />}
                <span>{helpState.loading ? "AI가 이 셀을 보고 답변 중" : "이 셀 답변"}</span>
              </div>
              <div className="mb-1 text-[11px] text-muted-foreground">{helpState.question}</div>
              {helpState.answer ? (
                <div className="max-h-52 overflow-auto whitespace-pre-wrap break-words">{helpState.answer}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
