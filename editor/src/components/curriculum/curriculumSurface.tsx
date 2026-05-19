import {
  CheckCircle2,
  GraduationCap,
  Layers3,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageSquare,
  Play,
  Sparkles,
  Target,
  TerminalSquare,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { CellAiActions } from "@/components/app/cellAiActions";
import {
  CodePayload,
  ExecutionOutput,
  IconButton,
  LoadingInline,
  PendingNotebookBar,
} from "@/components/app/appPrimitives";
import { learningCellCatalog } from "@/components/app/learningCellCatalog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  blockLabel,
  classifyLearningCell,
  executionKindLabel,
  stripBullet,
  stripMarkdown,
  type CellAiAction,
  type LearningCellKind,
} from "@/lib/cellModel";
import { difficultyLabel, statusLabel } from "@/lib/displayFormat";
import { cn } from "@/lib/utils";
import type { BlockConfig, CodaroDocument, ExecutionResult } from "@/types";
import {
  CurriculumMarkdownBody,
  curriculumCellTone,
} from "./curriculumMarkdownBody";

type ResultMap = Record<string, ExecutionResult>;

type RenderCodeCellEditor = (args: {
  block: BlockConfig;
  draft: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onRun: () => void;
}) => ReactNode;

export function CurriculumView({
  canRun,
  document,
  drafts,
  pendingBlocks,
  referenceLoading,
  renderCodeCellEditor,
  results,
  runningBlockId,
  selectedBlockId,
  selectedCategoryLabel,
  selectedCategory,
  selectedContentLabel,
  selectedContentId,
  onAcceptPendingBlocks,
  onCellAsk,
  onDraftChange,
  onRejectPendingBlocks,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  document: CodaroDocument;
  drafts: Record<string, string>;
  pendingBlocks: BlockConfig[];
  referenceLoading: boolean;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  selectedCategoryLabel: string;
  selectedCategory: string;
  selectedContentLabel: string;
  selectedContentId: string;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  return (
    <ScrollArea className="h-full min-h-0 min-w-0">
      <div className="min-w-0 p-4">
        <div className="mx-auto min-w-0 max-w-4xl space-y-3">
          <header className="rounded-md border bg-card px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">커리큘럼</Badge>
                  <Badge variant="outline">{selectedCategoryLabel || selectedCategory}</Badge>
                  {selectedContentLabel || selectedContentId ? <Badge variant="outline">{selectedContentLabel || selectedContentId}</Badge> : null}
                </div>
                <h1 className="mt-2 truncate text-2xl font-semibold tracking-normal">{document.title}</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  YAML 커리큘럼을 학습 셀로 펼친 공간입니다. 셀마다 실행하거나 Codaro에게 설명, 힌트, 검증을 요청할 수 있습니다.
                </p>
              </div>
              {referenceLoading ? <LoadingInline label="레슨 불러오는 중" /> : null}
            </div>
            <PendingNotebookBar
              pendingBlocks={pendingBlocks}
              onAccept={onAcceptPendingBlocks}
              onReject={onRejectPendingBlocks}
            />
          </header>

          <div className="space-y-3">
            {document.blocks.map((block) => (
              <CurriculumLearningCell
                block={block}
                canRun={canRun}
                draft={drafts[block.id] ?? curriculumInitialDraft(block)}
                isRunning={runningBlockId === block.id}
                isSelected={block.id === selectedBlockId}
                key={block.id}
                renderCodeCellEditor={renderCodeCellEditor}
                result={results[block.id]}
                onAsk={(action) => onCellAsk(action, block)}
                onDraftChange={(value) => onDraftChange(block.id, value)}
                onRun={() => onRunBlock(block)}
                onSelect={() => onSelectBlock(block.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export function CurriculumCellToc({
  document: curriculum,
  selectedBlockId,
  onSelectBlock,
}: {
  document: CodaroDocument;
  selectedBlockId: string;
  onSelectBlock: (blockId: string) => void;
}) {
  const rawItems = curriculum.blocks.map((block) => {
    const kind = classifyLearningCell(block, block.content);
    const meta = curriculumTypeMeta(block, kind);
    const label = blockLabel(block);
    return {
      block,
      label,
      meta,
    };
  });
  const meaningfulItems = rawItems.filter(({ block, label }) => shouldShowTocItem(block, label));
  const items = meaningfulItems.length ? meaningfulItems : rawItems;

  return (
    <aside className="group/toc relative hidden h-full min-h-0 border-l bg-background/95 2xl:block" aria-label="셀 목차">
      <div className="flex h-full min-h-0 w-11 flex-col items-center gap-2 py-3">
        <div className="flex size-7 items-center justify-center rounded-md border bg-card text-muted-foreground">
          <ListChecks className="size-3.5" />
        </div>
        <ScrollArea className="min-h-0 w-full flex-1">
          <div className="flex flex-col items-center gap-1 py-1">
            {items.map(({ block, label, meta }) => {
              const Icon = meta.Icon;
              const active = block.id === selectedBlockId;
              return (
                <button
                  aria-label={label}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-muted text-foreground ring-1 ring-border",
                  )}
                  key={block.id}
                  title={label}
                  type="button"
                  onClick={() => selectTocBlock(block.id, onSelectBlock)}
                >
                  <Icon className="size-3.5" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="pointer-events-none absolute right-0 top-0 z-40 h-full w-72 translate-x-2 border-l bg-background/98 opacity-0 shadow-xl shadow-background/40 transition duration-150 group-hover/toc:pointer-events-auto group-hover/toc:translate-x-0 group-hover/toc:opacity-100">
        <div className="border-b px-3 py-3">
          <div className="text-sm font-semibold tracking-normal">셀 목차</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">마우스를 올려 현재 레슨의 셀로 이동합니다.</div>
        </div>
        <ScrollArea className="h-[calc(100%-57px)] min-h-0">
          <div className="space-y-0.5 p-1.5">
            {items.map(({ block, label, meta }) => {
              const Icon = meta.Icon;
              const active = block.id === selectedBlockId;
              return (
                <button
                  className={cn(
                    "flex h-7 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-xs transition-colors hover:bg-muted/60",
                    active && "bg-muted text-foreground ring-1 ring-border",
                  )}
                  key={block.id}
                  title={label}
                  type="button"
                  onClick={() => selectTocBlock(block.id, onSelectBlock)}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-background text-muted-foreground">
                    <Icon className="size-3" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

function selectTocBlock(blockId: string, onSelectBlock: (blockId: string) => void) {
  onSelectBlock(blockId);
  window.requestAnimationFrame(() => {
    const target = window.document.getElementById(cellDomId(blockId));
    if (!target) return;
    const viewport = target.closest("[data-slot='scroll-area-viewport']") as HTMLElement | null;
    if (!viewport) {
      target.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    const targetTop = target.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
    viewport.scrollTo({ top: Math.max(0, targetTop - 12), behavior: "smooth" });
  });
}

function shouldShowTocItem(block: BlockConfig, label: string) {
  const normalized = label.trim().replace(/[.!?。]+$/g, "").toLowerCase();
  const genericLabels = new Set([
    "팁",
    "힌트",
    "tip",
    "tips",
    "hint",
    "note",
    "주의",
    "참고",
  ]);
  if (genericLabels.has(normalized)) return false;
  if (block.role === "explanation" && block.displayKind === "callout" && normalized.length <= 8) return false;
  return true;
}

function CurriculumLearningCell({
  block,
  canRun,
  draft,
  isRunning,
  isSelected,
  renderCodeCellEditor,
  result,
  onAsk,
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
  onAsk: (action: CellAiAction) => void;
  onDraftChange: (value: string) => void;
  onRun: () => void;
  onSelect: () => void;
}) {
  const kind = classifyLearningCell(block, draft);
  const meta = learningCellCatalog[kind];
  const Icon = meta.Icon;
  const role = block.role ?? (block.type === "code" ? "snippet" : "explanation");
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";
  const lineCount = block.type === "code" ? draft.split("\n").filter((line) => line.trim()).length : 0;
  const tone = curriculumCellTone(kind, role, block.displayKind);
  const typeMeta = curriculumTypeMeta(block, kind);
  const TypeIcon = typeMeta.Icon;
  const bodyFirst = block.displayKind === "hero";
  const isSnippetCode = block.type === "code" && role === "snippet";

  if (block.type === "markdown") {
    if (block.displayKind === "title") {
      return (
        <CurriculumSectionTitle
          block={block}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      );
    }

    if (block.displayKind === "callout") {
      return (
        <section
          id={cellDomId(block.id)}
          className={cn("group min-w-0", isSelected && "rounded-md ring-1 ring-ring/30")}
          onClick={onSelect}
        >
          <CurriculumMarkdownBody block={block} />
        </section>
      );
    }

    return (
      <section
        id={cellDomId(block.id)}
        className={cn(
          "group min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm",
          isSelected && "bg-muted/20 ring-1 ring-ring/30",
          tone.frame,
        )}
      >
        <div className="min-w-0">
          {bodyFirst ? (
            <div className="flex items-center justify-end gap-2 px-3 pt-3">
          <Badge className="gap-1 bg-background/80" variant="outline">
            <TypeIcon className="size-3" />
            {typeMeta.label}
              </Badge>
              <CellAiActions onAsk={onAsk} selected={isSelected} />
            </div>
          ) : (
            <div className="flex items-center gap-3 border-b bg-muted/20 px-3 py-2">
              <button className="flex min-w-0 flex-1 items-center gap-2 text-left" type="button" onClick={onSelect}>
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground", tone.icon)}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold tracking-normal">{blockLabel(block)}</span>
                </span>
              </button>
              <Badge className="gap-1 bg-background/80" variant="outline">
                <TypeIcon className="size-3" />
                {typeMeta.label}
              </Badge>
              <CellAiActions onAsk={onAsk} selected={isSelected} />
            </div>
          )}
          <div className={cn("space-y-3 px-3 pb-3", bodyFirst ? "pt-2" : "pt-3")}>
            <CurriculumMarkdownBody block={block} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={cellDomId(block.id)}
      className={cn(
        "group min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm",
        isSelected && "bg-muted/20 ring-1 ring-ring/30",
        tone.frame,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3 border-b bg-muted/20 px-3 py-2">
          <button className="flex min-w-0 flex-1 items-center gap-2 text-left" type="button" onClick={onSelect}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground", tone.icon)}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold tracking-normal">{blockLabel(block)}</span>
            </span>
          </button>
          <Badge className="gap-1" variant="outline">
            <TypeIcon className="size-3" />
            {typeMeta.label}
          </Badge>
          <Badge variant={resultStatus === "error" ? "destructive" : "outline"}>{statusLabel(resultStatus)}</Badge>
          <IconButton
            className="size-7"
            disabled={!canRun}
            label="셀 실행"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onRun();
            }}
          >
            {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
          </IconButton>
          <CellAiActions onAsk={onAsk} selected={isSelected} />
        </div>
        <div className="space-y-2 px-3 py-3">
          {isSnippetCode ? <SnippetPracticeIntro block={block} /> : null}
          {!isSnippetCode && block.guide ? <ExerciseBrief block={block} lineCount={lineCount} /> : null}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{isSnippetCode ? "연습 입력" : "코드 입력"}</span>
              <span className="flex items-center gap-1.5">
                <Badge className="hidden sm:inline-flex" variant="outline">Ctrl+Enter 실행</Badge>
                {isSnippetCode && !draft.trim() ? <Badge variant="outline">직접 입력</Badge> : null}
              </span>
            </div>
            {isSelected ? renderCodeCellEditor({
              block,
              draft,
              onChange: onDraftChange,
              onFocus: onSelect,
              onRun,
            }) : (
              <LightweightCodePreview
                draft={draft}
                placeholder={isSnippetCode ? "클릭해서 직접 입력하세요." : "클릭해서 코드를 편집하세요."}
                onSelect={onSelect}
              />
            )}
          </div>
          {result ? <ExecutionOutput result={result} /> : null}
          {isRunning && !result ? <LoadingInline label="셀 실행 중" /> : null}
        </div>
      </div>
    </section>
  );
}

function SnippetPracticeIntro({ block }: { block: BlockConfig }) {
  return (
    <div className="rounded-md border bg-muted/15 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <TerminalSquare className="size-3.5" />
        예제 스니펫
      </div>
      <CodePayload value={block.content} />
    </div>
  );
}

function LightweightCodePreview({
  draft,
  placeholder,
  onSelect,
}: {
  draft: string;
  placeholder: string;
  onSelect: () => void;
}) {
  const preview = draft.trim() || placeholder;
  return (
    <button
      className="block w-full rounded-md bg-code px-3 py-2 text-left font-mono text-xs leading-5 text-code-foreground transition-colors hover:ring-1 hover:ring-ring/35"
      type="button"
      onClick={onSelect}
    >
      <pre className={cn("max-h-24 overflow-hidden whitespace-pre-wrap", !draft.trim() && "text-muted-foreground")}>{preview}</pre>
    </button>
  );
}

function CurriculumSectionTitle({
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
    <section className="px-1 py-2" id={cellDomId(block.id)}>
      <button
        aria-label={cleanTitle}
        className={cn(
          "w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/20",
          isSelected && "bg-muted/20 ring-1 ring-ring/25",
        )}
        type="button"
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border/70" />
          <Badge className="bg-background/80 text-[11px]" variant="outline">섹션</Badge>
          <span className="h-px flex-1 bg-border/70" />
        </div>
        <div className="mt-2 min-w-0">
          <h2 className="text-xl font-semibold tracking-normal">{cleanTitle}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(subtitle)}</p> : null}
        </div>
      </button>
    </section>
  );
}

function curriculumTypeMeta(block: BlockConfig, kind: LearningCellKind): { label: string; Icon: ComponentType<{ className?: string }> } {
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

function curriculumInitialDraft(block: BlockConfig) {
  if (block.type !== "code") return block.content;
  if (block.role === "snippet") return "";
  return block.content;
}

function ExerciseBrief({ block, lineCount }: { block: BlockConfig; lineCount: number }) {
  if (!block.guide) return null;
  const hints = block.guide.hints ?? [];
  return (
    <div className="rounded-md border bg-emerald-400/5 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-normal">실습</div>
          {block.guide.description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{stripMarkdown(block.guide.description)}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="outline">{difficultyLabel(block.guide.difficulty)}</Badge>
          <Badge variant="outline">{lineCount}줄</Badge>
        </div>
      </div>
      {hints.length ? (
        <div className="mt-3 grid gap-1.5">
          {hints.slice(0, 3).map((hint, index) => (
            <div className="flex gap-2 text-xs leading-5 text-muted-foreground" key={`${hint}-${index}`}>
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
              <span>{stripBullet(hint)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function readPayloadText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cellDomId(blockId: string) {
  return `curriculum-cell-${blockId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
