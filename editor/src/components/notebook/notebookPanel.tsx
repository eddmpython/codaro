import { useEffect, useRef } from "react";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Prec, RangeSet, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  GutterMarker,
  gutter,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { combineErrorSources } from "@/lib/tracebackParser";
import "@/components/notebook/notebookPanel.css";
import {
  Loader2,
  MessageSquare,
  Play,
  Plus,
  TerminalSquare,
  Trash2,
} from "lucide-react";

import {
  ExecutionOutput,
  IconButton,
  LoadingInline,
  PendingNotebookBar,
} from "@/components/app/appPrimitives";
import { RuntimeCapabilityRail } from "@/components/app/runtimeCapabilityRail";
import { CellAiActions } from "@/components/app/cellAiActions";
import { NotebookCommandBar } from "@/components/notebook/notebookCommandBar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { fetchCodeCompletions, type CompletionContextProvider } from "@/lib/codeCompletion";
import {
  executionKindLabel,
  isExecutableBlock,
  isPersistentAutomationBlock,
  type CellAiAction,
} from "@/lib/cellModel";
import type { CellAiHelpState } from "@/lib/assistantTypes";
import { statusLabel } from "@/lib/displayFormat";
import {
  blockInCycle,
  cellDiagnosticChips,
  formatCyclePaths,
  type CellDiagnosticChip,
} from "@/lib/reactiveDiagnostics";
import { cn } from "@/lib/utils";
import type { BlockConfig, CodaroDocument, ExecutionResult, ReactiveDiagnostics } from "@/types";

type ResultMap = Record<string, ExecutionResult>;

const SCRATCH_STARTER_CODE = `prices = [12000, 18500, 7600]
total = sum(prices)
count = len(prices)
average = total / count

print("항목 수:", count)
print("합계:", total)
print("평균:", round(average))`;

const codaroSyntaxHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--color-syntax-keyword)" },
  { tag: tags.string, color: "var(--color-syntax-string)" },
  { tag: tags.comment, color: "var(--color-syntax-comment)", fontStyle: "italic" },
  { tag: tags.number, color: "var(--color-syntax-number)" },
  { tag: tags.function(tags.variableName), color: "var(--color-syntax-function)" },
  { tag: tags.typeName, color: "var(--color-syntax-type)" },
  { tag: tags.variableName, color: "var(--color-syntax-variable)" },
  { tag: tags.operator, color: "var(--color-syntax-operator)" },
  { tag: [tags.bool, tags.null], color: "var(--color-syntax-constant)" },
  { tag: tags.propertyName, color: "var(--color-syntax-property)" },
  { tag: tags.punctuation, color: "var(--color-syntax-punctuation)" },
]);

const codeCellEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--color-syntax-background, var(--code))",
    color: "var(--color-syntax-variable, var(--code-foreground))",
    fontSize: "14px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-family-code)",
    lineHeight: "1.65",
    overflow: "auto",
  },
  ".cm-content": {
    minHeight: "6.5rem",
    padding: "0.75rem 0",
  },
  ".cm-line": {
    padding: "0 0.875rem",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-background-muted, var(--muted))",
    borderRight: "1px solid var(--color-border, var(--border))",
    color: "var(--color-text-secondary, var(--muted-foreground))",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5rem",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklab, var(--color-accent-muted) 66%, transparent)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--color-accent-muted, var(--accent))",
    color: "var(--color-text-accent, var(--accent-foreground))",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--color-accent, var(--foreground))",
  },
  ".cm-selectionBackground": {
    backgroundColor: "color-mix(in oklab, var(--color-accent) 26%, transparent) !important",
  },
  ".cm-codaroErrorLine": {
    backgroundColor: "color-mix(in oklch, var(--destructive) 18%, transparent)",
  },
  ".cm-codaroErrorGutter": {
    width: "0.875rem",
    textAlign: "center",
  },
  ".cm-codaroAiCommentLine": {
    backgroundColor: "color-mix(in oklch, var(--primary, currentColor) 8%, transparent)",
    borderLeft: "2px solid color-mix(in oklch, var(--primary, currentColor) 45%, transparent)",
  },
  ".cm-codaroAiCommentGutter": {
    width: "1.125rem",
    textAlign: "center",
  },
});

export function NotebookPanel({
  apiOnline,
  canRun,
  cellHelpByBlockId,
  diagnostics,
  document,
  drafts,
  notebookRunning,
  pendingBlocks,
  results,
  runningBlockId,
  selectedBlockId,
  staleBlockIds,
  onAddCell,
  onAcceptPendingBlocks,
  onCellAsk,
  onDeleteCell,
  onDraftChange,
  onRenameDocument,
  onRejectPendingBlocks,
  onRunBlock,
  onRunNotebook,
  onSelectBlock,
}: {
  apiOnline: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  diagnostics: ReactiveDiagnostics;
  document: CodaroDocument;
  drafts: Record<string, string>;
  notebookRunning: boolean;
  pendingBlocks: BlockConfig[];
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  staleBlockIds: string[];
  onAddCell: (type: "code" | "markdown", referenceBlockId?: string, placement?: "before" | "after") => void;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onDeleteCell: (blockId: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRenameDocument: (title: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onRunNotebook: () => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const staleSet = new Set(staleBlockIds);
  const cyclePaths = formatCyclePaths(diagnostics.cycles);
  const scratchSeededRef = useRef(false);
  const selectedBlockIndex = document.blocks.findIndex((block) => block.id === selectedBlockId);
  const activeCellLabel = selectedBlockIndex >= 0
    ? `셀 ${selectedBlockIndex + 1} / ${document.blocks.length}`
    : `${document.blocks.length}개 셀`;

  useEffect(() => {
    if (scratchSeededRef.current) return;
    const starterBlock = document.blocks[0];
    const starterDraft = starterBlock ? drafts[starterBlock.id] ?? starterBlock.content : "";
    const untouchedScratch = (
      document.id === "new-notebook"
      && document.title === "새노트북.py"
      && document.blocks.length === 1
      && starterBlock?.type === "code"
      && !starterDraft.trim()
    );
    if (!untouchedScratch || !starterBlock) return;

    scratchSeededRef.current = true;
    onDraftChange(starterBlock.id, SCRATCH_STARTER_CODE);
    onRenameDocument("scratch.py");
    onSelectBlock(starterBlock.id);
  }, [document, drafts, onDraftChange, onRenameDocument, onSelectBlock]);

  return (
    <section
      className="notebookStudio"
      data-notebook-studio="true"
      data-notebook-storage="session"
    >
      <NotebookCommandBar
        activeCellLabel={activeCellLabel}
        apiOnline={apiOnline}
        canRun={canRun}
        notebookRunning={notebookRunning}
        runningBlockId={runningBlockId}
        title={document.title}
        onAddCodeCell={() => onAddCell("code", selectedBlockId || undefined, "after")}
        onAddMarkdownCell={() => onAddCell("markdown", selectedBlockId || undefined, "after")}
        onCommitTitle={onRenameDocument}
        onRunNotebook={onRunNotebook}
        onTitleChange={onRenameDocument}
      />
      <div className="notebookRuntimeRail">
        <RuntimeCapabilityRail apiOnline={apiOnline} surface="notebook" />
      </div>
      <div className="notebookPendingArea">
        <PendingNotebookBar
          pendingBlocks={pendingBlocks}
          onAccept={onAcceptPendingBlocks}
          onReject={onRejectPendingBlocks}
        />
        {cyclePaths.length ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-[11px] text-destructive">
            <span className="font-medium">순환 의존</span> — 실행 순서가 정해지지 않습니다: {cyclePaths.join(" · ")}
          </div>
        ) : null}
      </div>

      <ScrollArea className="notebookViewport">
        <div className="notebookDocument">
          {document.blocks.length ? document.blocks.map((block, blockIndex) => (
            <DocumentBlock
              autoFocus={blockIndex === 0 && block.id === selectedBlockId}
              block={block}
              canRun={canRun && (!isExecutableBlock(block) || Boolean((drafts[block.id] ?? block.content).trim()))}
              draft={drafts[block.id] ?? block.content}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              result={results[block.id]}
              cellHelp={cellHelpByBlockId[block.id]}
              isRunning={runningBlockId === block.id}
              isStale={staleSet.has(block.id)}
              inCycle={blockInCycle(diagnostics, block.id)}
              showInsertBefore={blockIndex === 0}
              diagnosticChips={cellDiagnosticChips(diagnostics, block.id)}
              onCellAsk={(action, question) => onCellAsk(action, block, question)}
              onDelete={() => onDeleteCell(block.id)}
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onInsertCell={(type, placement) => onAddCell(type, block.id, placement)}
              onRun={(sourceOverride) => onRunBlock(block, sourceOverride)}
              onSelect={() => onSelectBlock(block.id)}
            />
          )) : (
            <EmptyNotebookActions onAddCell={(type) => onAddCell(type)} />
          )}
        </div>
      </ScrollArea>
    </section>
  );
}

class ErrorGutterMarker extends GutterMarker {
  override toDOM() {
    const node = document.createElement("span");
    node.textContent = "●";
    node.title = "이 줄에서 에러가 발생했습니다";
    node.style.color = "var(--destructive)";
    node.style.fontSize = "10px";
    return node;
  }
}

const errorMarkerInstance = new ErrorGutterMarker();

const setErrorLinesEffect = StateEffect.define<number[]>();

const errorMarkerField = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(value, tr) {
    let next = value.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setErrorLinesEffect)) {
        const totalLines = tr.state.doc.lines;
        const markers = effect.value
          .filter((line) => Number.isInteger(line) && line > 0 && line <= totalLines)
          .map((line) => errorMarkerInstance.range(tr.state.doc.line(line).from));
        next = RangeSet.of(markers, true);
      }
    }
    return next;
  },
});

const errorLineHighlight = Decoration.line({
  attributes: { class: "cm-codaroErrorLine" },
});

const errorLineDecorationField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    let next = value.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setErrorLinesEffect)) {
        const totalLines = tr.state.doc.lines;
        const ranges = effect.value
          .filter((line) => Number.isInteger(line) && line > 0 && line <= totalLines)
          .map((line) => errorLineHighlight.range(tr.state.doc.line(line).from));
        next = Decoration.set(ranges, true);
      }
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const errorGutter = gutter({
  class: "cm-codaroErrorGutter",
  markers: (view) => view.state.field(errorMarkerField),
  initialSpacer: () => errorMarkerInstance,
});


export type AiLineComment = {
  line: number;
  comment: string;
};


class AiCommentGutterMarker extends GutterMarker {
  private readonly summary: string;
  private readonly onClick?: () => void;

  constructor(summary: string, onClick?: () => void) {
    super();
    this.summary = summary;
    this.onClick = onClick;
  }

  override toDOM(): HTMLElement {
    const node = document.createElement("span");
    node.textContent = "\u{1F4AC}";
    node.title = this.summary;
    node.dataset.aiCommentMarker = "true";
    node.style.cursor = this.onClick ? "pointer" : "default";
    node.style.fontSize = "11px";
    node.style.padding = "0 2px";
    node.style.color = "var(--primary, #6b7280)";
    if (this.onClick) {
      const clickHandler = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.onClick?.();
      };
      node.addEventListener("mousedown", clickHandler);
    }
    return node;
  }
}

const setAiCommentsEffect = StateEffect.define<AiLineComment[]>();

const aiCommentClickHandlerRef: { current: ((comment: AiLineComment) => void) | null } = {
  current: null,
};

const aiCommentMarkerField = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(value, tr) {
    let next = value.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setAiCommentsEffect)) {
        const totalLines = tr.state.doc.lines;
        const ranges = effect.value
          .filter((entry) => Number.isInteger(entry.line) && entry.line > 0 && entry.line <= totalLines)
          .map((entry) => {
            const handler = aiCommentClickHandlerRef.current;
            const marker = new AiCommentGutterMarker(
              entry.comment,
              handler ? () => handler(entry) : undefined,
            );
            return marker.range(tr.state.doc.line(entry.line).from);
          });
        next = RangeSet.of(ranges, true);
      }
    }
    return next;
  },
});

const aiCommentLineHighlight = Decoration.line({
  attributes: { class: "cm-codaroAiCommentLine" },
});

const aiCommentLineDecorationField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    let next = value.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setAiCommentsEffect)) {
        const totalLines = tr.state.doc.lines;
        const ranges = effect.value
          .filter((entry) => Number.isInteger(entry.line) && entry.line > 0 && entry.line <= totalLines)
          .map((entry) => aiCommentLineHighlight.range(tr.state.doc.line(entry.line).from));
        next = Decoration.set(ranges, true);
      }
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const aiCommentGutter = gutter({
  class: "cm-codaroAiCommentGutter",
  markers: (view) => view.state.field(aiCommentMarkerField),
  initialSpacer: () => new AiCommentGutterMarker(""),
});

export function CodeCellEditor({
  autoFocus = false,
  placeholderText = "",
  value,
  onChange,
  onFocus,
  onRun,
  completionContext,
  errorLines,
  aiComments,
  onAiCommentClick,
}: {
  autoFocus?: boolean;
  placeholderText?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onRun?: (source: string) => void;
  completionContext?: CompletionContextProvider;
  errorLines?: number[];
  aiComments?: AiLineComment[];
  onAiCommentClick?: (comment: AiLineComment) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onRunRef = useRef(onRun);
  const completionContextRef = useRef(completionContext);

  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onRunRef.current = onRun;
    completionContextRef.current = completionContext;
  }, [onChange, onFocus, onRun, completionContext]);

  const aiCompletionSource = async (context: CompletionContext): Promise<CompletionResult | null> => {
    const word = context.matchBefore(/[\w.]*/);
    if (!word) return null;
    if (word.from === word.to && !context.explicit) return null;
    const prefix = context.state.doc.sliceString(0, context.pos);
    const suffix = context.state.doc.sliceString(context.pos);
    if (prefix.trim().length < 2 && !context.explicit) return null;
    const extra = completionContextRef.current ? completionContextRef.current() : undefined;
    const completions = await fetchCodeCompletions({ prefix, suffix, context: extra });
    if (!completions.length) return null;
    return {
      from: word.from,
      to: context.pos,
      options: completions.map((text) => ({
        label: word.text + text,
        apply: word.text + text,
        type: "function",
        detail: "AI",
      })),
      validFor: /^[\w.]*$/,
    };
  };

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        closeBrackets(),
        python(),
        syntaxHighlighting(codaroSyntaxHighlightStyle, { fallback: true }),
        highlightActiveLine(),
        placeholder(placeholderText),
        EditorView.lineWrapping,
        autocompletion({
          override: [aiCompletionSource],
          activateOnTyping: true,
          maxRenderedOptions: 6,
          defaultKeymap: true,
        }),
        errorMarkerField,
        errorLineDecorationField,
        errorGutter,
        aiCommentMarkerField,
        aiCommentLineDecorationField,
        aiCommentGutter,
        Prec.high(keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              onRunRef.current?.(viewRef.current?.state.doc.toString() ?? "");
              return true;
            },
          },
          {
            key: "Ctrl-Enter",
            run: () => {
              onRunRef.current?.(viewRef.current?.state.doc.toString() ?? "");
              return true;
            },
          },
        ])),
        keymap.of([indentWithTab, ...closeBracketsKeymap, ...completionKeymap, ...defaultKeymap, ...historyKeymap]),
        codeCellEditorTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.focusChanged && update.view.hasFocus) {
            onFocusRef.current();
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: hostRef.current,
    });

    if (autoFocus) {
      window.requestAnimationFrame(() => viewRef.current?.focus());
    }

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (currentValue === value) return;

    view.dispatch({
      changes: {
        from: 0,
        to: currentValue.length,
        insert: value,
      },
    });
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setErrorLinesEffect.of(errorLines ?? []) });
  }, [errorLines]);

  useEffect(() => {
    aiCommentClickHandlerRef.current = onAiCommentClick ?? null;
    return () => {
      if (aiCommentClickHandlerRef.current === (onAiCommentClick ?? null)) {
        aiCommentClickHandlerRef.current = null;
      }
    };
  }, [onAiCommentClick]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setAiCommentsEffect.of(aiComments ?? []) });
  }, [aiComments]);

  return (
    <div
      className="bg-transparent text-code-foreground"
      ref={hostRef}
    />
  );
}

function DocumentBlock({
  autoFocus = false,
  block,
  canRun,
  draft,
  isSelected,
  isRunning,
  isStale = false,
  inCycle = false,
  showInsertBefore = false,
  diagnosticChips = [],
  result,
  cellHelp,
  onDraftChange,
  onDelete,
  onInsertCell,
  onRun,
  onSelect,
  onCellAsk,
}: {
  autoFocus?: boolean;
  block: BlockConfig;
  canRun: boolean;
  draft: string;
  isSelected: boolean;
  isRunning: boolean;
  isStale?: boolean;
  inCycle?: boolean;
  showInsertBefore?: boolean;
  diagnosticChips?: CellDiagnosticChip[];
  result?: ExecutionResult;
  cellHelp?: CellAiHelpState;
  onCellAsk: (action: CellAiAction, question?: string) => void;
  onDelete: () => void;
  onDraftChange: (value: string) => void;
  onInsertCell: (type: "code" | "markdown", placement: "before" | "after") => void;
  onRun: (sourceOverride?: string) => void;
  onSelect: () => void;
}) {
  const persistentAutomation = isPersistentAutomationBlock(block);
  const cellTitle = block.type === "markdown"
    ? "Markdown"
    : persistentAutomation
      ? `${executionKindLabel(block.executionKind)} · 세션 유지`
      : block.type === "automation"
        ? "Automation"
        : "Python";
  // 우선순위: 실행 중 → 순환(conflict, 빨강) → stale(오래됨) → 실행 결과 → 대기.
  const resultStatus = isRunning ? "running" : inCycle ? "conflict" : isStale ? "stale" : result?.status ?? "idle";
  const draftRef = useRef(draft);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const updateDraft = (value: string) => {
    draftRef.current = value;
    onDraftChange(value);
  };

  const runCurrentDraft = () => {
    onRun(draftRef.current);
  };

  if (block.type === "markdown") {
    const markdownData = result?.data as { html?: unknown } | null | undefined;
    const markdownHtml = markdownData && typeof markdownData.html === "string" ? markdownData.html : "";
    // 미선택 + 렌더 결과가 있으면 미리보기, 선택하면 편집(클릭으로 전환).
    const showPreview = !isSelected && Boolean(markdownHtml);
    return (
      <section
        className="notebookCell group"
        data-notebook-cell="markdown"
        data-notebook-cell-selected={isSelected ? "true" : "false"}
        data-notebook-cell-status={resultStatus}
      >
        <CellMetaBar
          status={resultStatus}
          title={cellTitle}
          type="markdown"
          selected={isSelected}
          cellHelp={cellHelp}
          diagnosticChips={diagnosticChips}
          onCellAsk={onCellAsk}
          onDelete={onDelete}
        />
        <div className="notebookCellBody">
          {showInsertBefore ? (
            <InsertCellButton placement="before" onInsertCell={onInsertCell} className="notebookInsertBefore" />
          ) : null}
          <InsertCellButton placement="after" onInsertCell={onInsertCell} className="notebookInsertAfter" />
          {showPreview ? (
            <div
              className="notebookMarkdownPreview prose prose-sm"
              data-notebook-markdown-preview="true"
              onClick={onSelect}
              dangerouslySetInnerHTML={{ __html: markdownHtml }}
            />
          ) : (
            <Textarea
              className={cn(
                "notebookMarkdownEditor",
                isSelected && "notebookMarkdownEditorSelected",
              )}
              placeholder="Markdown을 입력하세요. {변수}로 값 보간."
              value={draft}
              onChange={(event) => updateDraft(event.target.value)}
              onFocus={onSelect}
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="notebookCell group"
      data-automation-session-cell={persistentAutomation ? "true" : undefined}
      data-notebook-cell="code"
      data-notebook-cell-selected={isSelected ? "true" : "false"}
      data-notebook-cell-status={resultStatus}
    >
      <CellMetaBar
        canRun={canRun}
        running={isRunning}
        status={resultStatus}
        title={cellTitle}
        type="code"
        selected={isSelected}
        cellHelp={cellHelp}
        diagnosticChips={diagnosticChips}
        onCellAsk={onCellAsk}
        onDelete={onDelete}
        onRun={runCurrentDraft}
      />
      <div className="notebookCellBody">
        {showInsertBefore ? (
          <InsertCellButton placement="before" onInsertCell={onInsertCell} className="notebookInsertBefore" />
        ) : null}
        <InsertCellButton placement="after" onInsertCell={onInsertCell} className="notebookInsertAfter" />
        <div
          className={cn(
            "notebookCodeFrame",
            isSelected && "notebookCodeFrameSelected",
          )}
          data-notebook-input="code"
        >
          <CodeCellEditor
            autoFocus={autoFocus}
            placeholderText="Python 코드를 입력하세요"
            value={draft}
            onChange={updateDraft}
            onFocus={onSelect}
            onRun={onRun}
            errorLines={combineErrorSources(
              typeof result?.data === "string" ? result?.data : null,
              result?.stderr,
            )}
            aiComments={cellHelp?.inlineComments}
            onAiCommentClick={onSelect}
          />
        </div>
      </div>
      {result ? (
        <div className="notebookCellOutput">
          <ExecutionOutput result={result} />
        </div>
      ) : null}
      {isRunning && !result ? (
        <div className="notebookCellOutput">
          <LoadingInline label="셀 실행 중" />
        </div>
      ) : null}
    </section>
  );
}

function CellMetaBar({
  canRun = false,
  running = false,
  status,
  title,
  type,
  selected,
  cellHelp,
  diagnosticChips = [],
  onCellAsk,
  onDelete,
  onRun,
}: {
  canRun?: boolean;
  running?: boolean;
  status: string;
  title: string;
  type: "code" | "markdown";
  selected: boolean;
  cellHelp?: CellAiHelpState;
  diagnosticChips?: CellDiagnosticChip[];
  onCellAsk: (action: CellAiAction, question?: string) => void;
  onDelete: () => void;
  onRun?: () => void;
}) {
  const Icon = type === "code" ? TerminalSquare : MessageSquare;

  return (
    <div className="notebookCellMeta">
      <div
        className={cn(
          "notebookCellKind",
          selected && "notebookCellKindSelected",
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <div className="notebookCellActions">
        {diagnosticChips.map((chip) => (
          <span
            key={chip.kind}
            className="notebookCellDiagnostic"
            title="정합성 경고 — 실행은 진행되며, 마지막 정의가 적용됩니다."
          >
            {chip.label}
          </span>
        ))}
        {status !== "idle" ? (
          <span
            className={cn(
              "notebookCellStatus",
              status === "error" || status === "conflict"
                ? "notebookCellStatusError"
                : status === "stale"
                  ? "notebookCellStatusStale"
                  : "notebookCellStatusDefault",
            )}
          >
            {statusLabel(status)}
          </span>
        ) : null}
        {type === "code" ? (
          <IconButton
            className={cn(
              "notebookCellRunButton size-11 sm:size-8 [&_svg]:size-4",
              selected && "notebookCellRunButtonSelected",
            )}
            disabled={!canRun}
            label="셀 실행"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onRun?.();
            }}
          >
            {running ? <Loader2 className="animate-spin" /> : <Play />}
          </IconButton>
        ) : null}
        <CellAiActions compact helpState={cellHelp} selected={selected} onAsk={onCellAsk} />
        <IconButton
          className="notebookCellDeleteButton size-9 sm:size-8 [&_svg]:size-4"
          label="셀 삭제"
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 />
        </IconButton>
      </div>
    </div>
  );
}

function InsertCellButton({
  placement,
  onInsertCell,
  className,
}: {
  placement: "before" | "after";
  onInsertCell: (type: "code" | "markdown", placement: "before" | "after") => void;
  className?: string;
}) {
  const placementLabel = placement === "before" ? "위에" : "아래에";

  return (
    <div className={cn("notebookInsertControl group/insert", className)}>
      <button
        aria-label={`${placementLabel} Python 셀 추가`}
        className="notebookInsertPrimary"
        title={`${placementLabel} Python 셀 추가`}
        type="button"
        onClick={() => onInsertCell("code", placement)}
      >
        <Plus className="size-3.5" />
      </button>
      <div className="notebookInsertMenu">
        <button
          className="notebookInsertOption notebookInsertOptionCode"
          type="button"
          onClick={() => onInsertCell("code", placement)}
        >
          Py
        </button>
        <button
          className="notebookInsertOption"
          type="button"
          onClick={() => onInsertCell("markdown", placement)}
        >
          Md
        </button>
      </div>
    </div>
  );
}

function EmptyNotebookActions({
  onAddCell,
}: {
  onAddCell: (type: "code" | "markdown") => void;
}) {
  return (
    <div className="notebookEmptyActions">
      <Button className="notebookEmptyAction" type="button" variant="outline" onClick={() => onAddCell("code")}>
        <TerminalSquare className="size-3.5" />
        Python 셀
      </Button>
      <Button className="notebookEmptyAction" type="button" variant="outline" onClick={() => onAddCell("markdown")}>
        <MessageSquare className="size-3.5" />
        Markdown 셀
      </Button>
    </div>
  );
}
