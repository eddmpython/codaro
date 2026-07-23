import type { BlockConfig, ExecutionResult } from "@/types";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CurriculumMarkdownBody } from "./curriculumMarkdownBody";
import { blockLabel, stripMarkdown } from "@/lib/cellModel";
import { CodePayload, ExecutionOutput, IconButton, LoadingInline } from "@/components/app/appPrimitives";
import { Loader2, Play } from "lucide-react";
import { isRecord, readPayloadText } from "./curriculumSurfaceHelpers";
import type { RenderCodeCellEditor } from "./curriculumSurfaceModels";
import { cellDomId } from "./curriculumNavigation";

export function CurriculumLearningCell({
  block,
  canRun,
  draft,
  isRunning,
  isSelected,
  renderCodeCellEditor,
  result,
  variant = "standalone",
  onDraftChange,
  onRun,
  onSelect,
}: {
  block: BlockConfig;
  canRun: boolean;
  draft: string;
  isRunning: boolean;
  isSelected: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  result?: ExecutionResult;
  variant?: "standalone" | "embedded";
  onDraftChange: (value: string) => void;
  onRun: (sourceOverride?: string) => void;
  onSelect: () => void;
}) {
  const role = block.role ?? (block.type === "code" ? "snippet" : "explanation");
  const isSnippetCode = block.type === "code" && role === "snippet";
  const embedded = variant === "embedded";
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
            "relative -ml-4 min-w-0 scroll-mt-4 border-l-2 border-transparent pl-4",
            isSelected && "border-accent-brand",
          )}
          data-learning-cell="embedded"
          data-selected={isSelected ? "true" : "false"}
          id={cellDomId(block.id)}
          onClick={onSelect}
        >
          <CurriculumMarkdownBody block={block} />
        </section>
      );
    }

    return (
      <section
        className="relative min-w-0 rounded-lg border bg-card text-card-foreground"
        id={cellDomId(block.id)}
        onClick={onSelect}
      >
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
          ? "relative -ml-4 min-w-0 scroll-mt-4 border-l-2 border-transparent pl-4"
          : "min-w-0 rounded-lg border bg-card text-card-foreground",
        embedded && isSelected && "border-accent-brand",
      )}
      data-learning-cell={embedded ? "embedded" : "standalone"}
      data-selected={isSelected ? "true" : "false"}
      id={cellDomId(block.id)}
    >
      <div className={cn("min-w-0", !embedded && "p-5")}>
        <div className="flex items-center gap-2">
          <button className="min-w-0 flex-1 text-left" type="button" onClick={onSelect}>
            <span className="block whitespace-normal break-words text-[15px] font-bold leading-6 text-foreground">{blockLabel(block)}</span>
          </button>
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
        </div>
        <div className="mt-3 space-y-3">
          {isSnippetCode && block.description ? <SnippetPracticeIntro block={block} /> : null}
          {!isSnippetCode && block.guide?.description ? (
            <p className="max-w-3xl text-md font-normal text-foreground">{stripMarkdown(block.guide.description)}</p>
          ) : null}
          <div
            className="rounded-lg border border-border bg-code transition-colors hover:border-ring/60 focus-within:border-ring"
            data-learning-code-input="editor"
            data-learning-code-input-role={isSnippetCode ? "student-practice" : "code-edit"}
            data-learning-code-input-state={isSelected ? "selected" : "ready"}
            onClick={onSelect}
          >
            {renderCodeCellEditor({
              ariaLabel: `${blockLabel(block)} 코드 편집기`,
              autoFocus: false,
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
      {description ? <p className="max-w-3xl text-md font-normal text-foreground">{description}</p> : null}
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
        <h2 className="text-lg font-bold text-foreground">{cleanTitle}</h2>
        {subtitle ? <p className="mt-1 text-sm font-normal leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
      </button>
    </section>
  );
}

export function curriculumInitialDraft(block: BlockConfig) {
  if (block.type !== "code") return block.content;
  if (block.role === "snippet") return "";
  return block.content;
}
