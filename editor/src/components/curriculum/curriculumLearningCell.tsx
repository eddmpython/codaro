import type { BlockConfig, ExecutionResult } from "@/types";
import type { CellAiHelpState } from "@/lib/assistantTypes";
import type { CellAiAction, LearningCellKind } from "@/lib/cellModel";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CellAiActions } from "@/components/app/cellAiActions";
import { CurriculumMarkdownBody } from "./curriculumMarkdownBody";
import { blockLabel, executionKindLabel, stripMarkdown } from "@/lib/cellModel";
import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/displayFormat";
import { CodePayload, ExecutionOutput, IconButton, LoadingInline } from "@/components/app/appPrimitives";
import { CheckCircle2, GraduationCap, Layers3, Lightbulb, ListChecks, Loader2, MessageSquare, Play, Sparkles, Target, TerminalSquare } from "lucide-react";
import type { ComponentType } from "react";
import { isRecord, readPayloadText } from "./curriculumSurfaceHelpers";
import type { RenderCodeCellEditor } from "./curriculumSurfaceModels";
import { cellDomId } from "./curriculumNavigation";

export function CurriculumLearningCell({
  block,
  canRun,
  cellHelp,
  draft,
  isRunning,
  isSelected,
  renderCodeCellEditor,
  result,
  variant = "standalone",
  onAsk,
  onDraftChange,
  onRun,
  onSelect,
}: {
  block: BlockConfig;
  canRun: boolean;
  cellHelp?: CellAiHelpState;
  draft: string;
  isRunning: boolean;
  isSelected: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  result?: ExecutionResult;
  variant?: "standalone" | "embedded";
  onAsk: (action: CellAiAction, question?: string) => void;
  onDraftChange: (value: string) => void;
  onRun: (sourceOverride?: string) => void;
  onSelect: () => void;
}) {
  const role = block.role ?? (block.type === "code" ? "snippet" : "explanation");
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";
  const isSnippetCode = block.type === "code" && role === "snippet";
  const embedded = variant === "embedded";
  const showStatus = isRunning || Boolean(result);
  const draftRef = useRef(draft);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const updateDraft = (value: string) => {
    draftRef.current = value;
    onDraftChange(value);
  };

  const runCurrentDraft = (sourceOverride?: string) => {
    onRun(sourceOverride ?? draftRef.current);
  };

  if (block.type === "markdown") {
    if (block.displayKind === "title") {
      if (embedded) return null;
      return (
        <CurriculumSectionTitle
          block={block}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      );
    }

    // 마크다운 셀 래퍼 — 아이콘칩+라벨 이중 헤더 폐지. 제목은 CurriculumMarkdownBody가
    // 유일하게 소유한다. 선택 상태는 좌측 accent rail 하나로만 표시한다.
    if (embedded || block.displayKind === "callout") {
      return (
        <section
          className={cn(
            "group relative -ml-4 min-w-0 scroll-mt-4 border-l-2 border-transparent pl-4",
            isSelected && "border-accent-brand",
          )}
          data-learning-cell="embedded"
          data-selected={isSelected ? "true" : "false"}
          id={cellDomId(block.id)}
          onClick={onSelect}
        >
          <div className="absolute right-0 top-0 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
          </div>
          <CurriculumMarkdownBody block={block} />
        </section>
      );
    }

    return (
      <section
        className="group relative min-w-0 rounded-lg border bg-card text-card-foreground"
        id={cellDomId(block.id)}
        onClick={onSelect}
      >
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
        </div>
        <div className="p-5">
          <CurriculumMarkdownBody block={block} />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        embedded
          ? "group relative -ml-4 min-w-0 scroll-mt-4 border-l-2 border-transparent pl-4"
          : "group min-w-0 rounded-lg border bg-card text-card-foreground",
        embedded && isSelected && "border-accent-brand",
      )}
      data-learning-cell={embedded ? "embedded" : "standalone"}
      data-selected={isSelected ? "true" : "false"}
      id={cellDomId(block.id)}
    >
      <div className={cn("min-w-0", !embedded && "p-5")}>
        <div className="flex items-center gap-2">
          <button className="min-w-0 flex-1 text-left" type="button" onClick={onSelect}>
            <span className="block truncate text-[15px] font-semibold leading-6 text-foreground">{blockLabel(block)}</span>
          </button>
          {showStatus ? (
            <Badge className="h-7 rounded-md px-2 text-xs" variant={resultStatus === "error" ? "destructive" : "outline"}>
              {statusLabel(resultStatus)}
            </Badge>
          ) : null}
          <IconButton
            className="size-7 rounded-md [&_svg]:size-3.5"
            disabled={!canRun}
            label="셀 실행"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              runCurrentDraft();
            }}
          >
            {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
          </IconButton>
          <CellAiActions helpState={cellHelp} onAsk={onAsk} selected={isSelected} />
        </div>
        <div className="mt-3 space-y-3">
          {isSnippetCode && block.description ? <SnippetPracticeIntro block={block} /> : null}
          {!isSnippetCode && block.guide?.description ? (
            <p className="max-w-3xl text-md text-foreground">{stripMarkdown(block.guide.description)}</p>
          ) : null}
          <div
            aria-label={`${blockLabel(block)} 코드 편집기`}
            className="rounded-lg border border-border bg-code transition-colors hover:border-ring/60 focus-within:border-ring"
            data-learning-code-input="editor"
            data-learning-code-input-role={isSnippetCode ? "student-practice" : "code-edit"}
            data-learning-code-input-state={isSelected ? "selected" : "ready"}
            onClick={onSelect}
          >
            {renderCodeCellEditor({
              autoFocus: isSelected,
              block,
              draft,
              onChange: updateDraft,
              onFocus: onSelect,
              onRun: runCurrentDraft,
            })}
          </div>
          {result ? <ExecutionOutput result={result} /> : null}
          {isRunning && !result ? <LoadingInline label="셀 실행 중" /> : null}
        </div>
      </div>
    </section>
  );
}

export function SnippetPracticeIntro({ block }: { block: BlockConfig }) {
  const description = block.description?.trim();

  return (
    <div className="min-w-0 space-y-2">
      <div className="text-xs font-medium text-muted-foreground">예제</div>
      {description ? <p className="max-w-3xl text-md text-foreground">{description}</p> : null}
      <CodePayload value={block.content} />
    </div>
  );
}

export function CurriculumSectionTitle({
  block,
  isSelected,
  onSelect,
}: {
  block: BlockConfig;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const payload = isRecord(block.payload) ? block.payload : {};
  const title = readPayloadText(payload.title) || block.title || blockLabel(block);
  const cleanTitle = stripMarkdown(title);
  const contentLines = block.content
    .split("\n")
    .map((line) => stripMarkdown(line))
    .filter(Boolean);
  const subtitle =
    readPayloadText(payload.subtitle) ||
    block.description ||
    contentLines.find((line) => line !== cleanTitle) ||
    "";

  return (
    <section className="py-2" id={cellDomId(block.id)}>
      <button
        aria-label={cleanTitle}
        className={cn(
          "w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/30",
          isSelected && "bg-muted/30",
        )}
        type="button"
        onClick={onSelect}
      >
        <h2 className="text-lg font-semibold text-foreground">{cleanTitle}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
      </button>
    </section>
  );
}

export function curriculumTypeMeta(block: BlockConfig, kind: LearningCellKind): { label: string; Icon: ComponentType<{ className?: string }> } {
  const sourceType = block.sourceType ?? "";
  const displayKind = block.displayKind ?? "";
  const role = block.role ?? "";

  if (sourceType === "intro") return { label: "소개", Icon: Sparkles };
  if (sourceType === "section") return { label: "섹션", Icon: Layers3 };
  if (sourceType === "localRunner") return { label: "실행", Icon: TerminalSquare };
  if (sourceType === "expansion" || role === "exercise") return { label: "실습", Icon: Play };
  if (sourceType === "list") return { label: "목록", Icon: ListChecks };
  if (sourceType === "table" || displayKind === "table") return { label: "표", Icon: Layers3 };
  if (sourceType === "compare" || sourceType === "fullWidthComparison" || displayKind === "comparison") return { label: "비교", Icon: Layers3 };
  if (sourceType === "tip" || sourceType === "tipCard" || sourceType === "note" || displayKind === "callout") return { label: "노트", Icon: Lightbulb };
  if (sourceType === "warning" || role === "check" || displayKind === "quiz") return { label: "검증", Icon: CheckCircle2 };
  if (displayKind === "cardGrid") return { label: "카드", Icon: Sparkles };
  if (displayKind === "resource") return { label: "자료", Icon: MessageSquare };
  if (displayKind === "media") return { label: "미디어", Icon: Play };
  if (displayKind === "hero" || displayKind === "title" || role === "title") return { label: "타이틀", Icon: Target };
  if (block.type === "code") {
    if (role === "snippet") return { label: "스니펫", Icon: TerminalSquare };
    return { label: executionKindLabel(block.executionKind), Icon: TerminalSquare };
  }
  if (kind === "visual") return { label: "시각화", Icon: Sparkles };
  return { label: "개념", Icon: GraduationCap };
}

export function curriculumInitialDraft(block: BlockConfig) {
  if (block.type !== "code") return block.content;
  if (block.role === "snippet") return "";
  return block.content;
}
