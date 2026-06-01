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
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
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
import { combineErrorSources } from "@/lib/tracebackParser";
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
import { CellAiActions } from "@/components/app/cellAiActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { fetchCodeCompletions, type CompletionContextProvider } from "@/lib/codeCompletion";
import { isExecutableBlock, type CellAiAction } from "@/lib/cellModel";
import type { CellAiHelpState } from "@/lib/assistantTypes";
import { statusLabel } from "@/lib/displayFormat";
import { cn } from "@/lib/utils";
import type { BlockConfig, CodaroDocument, ExecutionResult } from "@/types";

type ResultMap = Record<string, ExecutionResult>;

const codeCellEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--code)",
    color: "var(--code-foreground)",
    fontSize: "13px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: "1.55",
    overflow: "auto",
  },
  ".cm-content": {
    padding: "0.375rem 0",
  },
  ".cm-line": {
    padding: "0 0.625rem",
  },
  ".cm-gutters": {
    backgroundColor: "var(--muted)",
    borderRight: "1px solid var(--border)",
    color: "var(--muted-foreground)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5rem",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--accent) 55%, transparent)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-selectionBackground": {
    backgroundColor: "color-mix(in oklch, var(--ring) 35%, transparent) !important",
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
  canRun,
  cellHelpByBlockId,
  document,
  drafts,
  notebookRunning,
  pendingBlocks,
  results,
  runningBlockId,
  selectedBlockId,
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
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  document: CodaroDocument;
  drafts: Record<string, string>;
  notebookRunning: boolean;
  pendingBlocks: BlockConfig[];
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  onAddCell: (type: "code" | "markdown", referenceBlockId?: string, placement?: "before" | "after") => void;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onDeleteCell: (blockId: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRenameDocument: (title: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onRunNotebook: () => void;
  onSelectBlock: (blockId: string) => void;
}) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] p-2 sm:p-3">
      <div className="mb-2 flex min-h-8 items-center gap-2 pl-9">
        <Input
          aria-label="노트북 파일명"
          className="h-7 w-48 max-w-[18rem] border-0 bg-transparent px-1 font-mono text-sm shadow-none focus-visible:ring-1"
          value={document.title}
          onBlur={(event) => onRenameDocument(normalizeNotebookFilename(event.target.value))}
          onChange={(event) => onRenameDocument(event.target.value)}
        />
        <Button
          aria-label="모두 실행"
          className="ml-auto size-7 shrink-0 [&_svg]:size-3.5"
          disabled={!canRun || notebookRunning || runningBlockId !== null}
          size="icon"
          title="모두 실행"
          variant="default"
          onClick={onRunNotebook}
        >
          {notebookRunning || runningBlockId !== null ? <Loader2 className="animate-spin" /> : <Play />}
        </Button>
      </div>
      <div className="mb-1">
        <PendingNotebookBar
          pendingBlocks={pendingBlocks}
          onAccept={onAcceptPendingBlocks}
          onReject={onRejectPendingBlocks}
        />
      </div>

      <ScrollArea className="h-full min-h-0">
        <div className="space-y-0.5 pr-2">
          {document.blocks.length ? document.blocks.map((block) => (
            <DocumentBlock
              block={block}
              canRun={canRun && (!isExecutableBlock(block) || Boolean((drafts[block.id] ?? block.content).trim()))}
              draft={drafts[block.id] ?? block.content}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              result={results[block.id]}
              cellHelp={cellHelpByBlockId[block.id]}
              isRunning={runningBlockId === block.id}
              onCellAsk={(action, question) => onCellAsk(action, block, question)}
              onDelete={() => onDeleteCell(block.id)}
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onInsertCell={(type, placement) => onAddCell(type, block.id, placement)}
              onRun={() => onRunBlock(block)}
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
  onRun?: () => void;
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
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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
              onRunRef.current?.();
              return true;
            },
          },
          {
            key: "Ctrl-Enter",
            run: () => {
              onRunRef.current?.();
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
  block,
  canRun,
  draft,
  isSelected,
  isRunning,
  result,
  cellHelp,
  onDraftChange,
  onDelete,
  onInsertCell,
  onRun,
  onSelect,
  onCellAsk,
}: {
  block: BlockConfig;
  canRun: boolean;
  draft: string;
  isSelected: boolean;
  isRunning: boolean;
  result?: ExecutionResult;
  cellHelp?: CellAiHelpState;
  onCellAsk: (action: CellAiAction, question?: string) => void;
  onDelete: () => void;
  onDraftChange: (value: string) => void;
  onInsertCell: (type: "code" | "markdown", placement: "before" | "after") => void;
  onRun: () => void;
  onSelect: () => void;
}) {
  const cellTitle = block.type === "markdown" ? "Markdown" : block.type === "automation" ? "Automation" : "Python";
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";

  if (block.type === "markdown") {
    return (
      <section className="group relative py-0.5 pl-6" data-notebook-cell="markdown">
        <CellMetaBar
          status={resultStatus}
          title={cellTitle}
          type="markdown"
          selected={isSelected}
          cellHelp={cellHelp}
          onCellAsk={onCellAsk}
          onDelete={onDelete}
        />
        <div className="relative min-w-0">
          <InsertCellButton placement="before" onInsertCell={onInsertCell} className="absolute -left-6 top-0 z-10 opacity-60 transition-opacity group-hover:opacity-100" />
          <InsertCellButton placement="after" onInsertCell={onInsertCell} className="absolute -left-6 bottom-0 z-10 opacity-60 transition-opacity group-hover:opacity-100" />
          <Textarea
            className={cn(
              "min-h-24 resize-y rounded-md bg-background font-sans text-sm leading-6 shadow-sm transition-colors",
              isSelected ? "border-ring ring-2 ring-ring/20" : "border-border hover:border-ring/50",
            )}
            placeholder="Markdown을 입력하세요."
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onFocus={onSelect}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="group relative py-0.5 pl-6" data-notebook-cell="code">
      <CellMetaBar
        canRun={canRun}
        running={isRunning}
        status={resultStatus}
        title={cellTitle}
        type="code"
        selected={isSelected}
        cellHelp={cellHelp}
        onCellAsk={onCellAsk}
        onDelete={onDelete}
        onRun={onRun}
      />
      <div className="relative min-w-0">
        <InsertCellButton placement="before" onInsertCell={onInsertCell} className="absolute -left-6 top-0 z-10 opacity-60 transition-opacity group-hover:opacity-100" />
        <InsertCellButton placement="after" onInsertCell={onInsertCell} className="absolute -left-6 bottom-0 z-10 opacity-60 transition-opacity group-hover:opacity-100" />
        <div
          className={cn(
            "overflow-hidden rounded-md border bg-code shadow-sm transition-colors",
            isSelected ? "border-ring ring-2 ring-ring/20" : "border-border hover:border-ring/50",
          )}
          data-notebook-input="code"
        >
          <CodeCellEditor
            value={draft}
            onChange={onDraftChange}
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
        <div className="mt-1.5">
          <ExecutionOutput result={result} />
        </div>
      ) : null}
      {isRunning && !result ? (
        <div className="mt-1.5">
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
  onCellAsk: (action: CellAiAction, question?: string) => void;
  onDelete: () => void;
  onRun?: () => void;
}) {
  const Icon = type === "code" ? TerminalSquare : MessageSquare;

  return (
    <div className="mb-0.5 flex min-h-7 w-full min-w-0 items-center gap-2">
      <div
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 px-0.5 text-left text-[11px] text-muted-foreground",
          selected && "text-foreground",
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {status !== "idle" ? (
          <span
            className={cn(
              "h-6 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-5",
              status === "error" ? "bg-destructive text-destructive-foreground" : "border bg-background text-muted-foreground",
            )}
          >
            {statusLabel(status)}
          </span>
        ) : null}
        {type === "code" ? (
          <IconButton
            className={cn(
              "size-6 rounded-md [&_svg]:size-3",
              selected && "bg-accent text-accent-foreground",
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
          className="size-6 rounded-md text-muted-foreground hover:text-destructive [&_svg]:size-3"
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
    <div className={cn("group/insert", className)}>
      <button
        aria-label={`${placementLabel} Python 셀 추가`}
        className="flex size-5 items-center justify-center rounded-full border bg-background shadow-sm hover:border-ring hover:text-foreground"
        title={`${placementLabel} Python 셀 추가`}
        type="button"
        onClick={() => onInsertCell("code", placement)}
      >
        <Plus className="size-3" />
      </button>
      <div className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-1 rounded-md border bg-popover p-1 shadow-md group-focus-within/insert:flex group-hover/insert:flex">
        <button
          className="h-5 rounded px-1.5 font-mono text-[10px] text-popover-foreground hover:bg-accent hover:text-accent-foreground"
          type="button"
          onClick={() => onInsertCell("code", placement)}
        >
          Py
        </button>
        <button
          className="h-5 rounded px-1.5 text-[10px] text-popover-foreground hover:bg-accent hover:text-accent-foreground"
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
    <div className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20">
      <Button className="h-7 gap-1.5 px-2 text-xs" type="button" variant="outline" onClick={() => onAddCell("code")}>
        <TerminalSquare className="size-3.5" />
        Python 셀
      </Button>
      <Button className="h-7 gap-1.5 px-2 text-xs" type="button" variant="outline" onClick={() => onAddCell("markdown")}>
        <MessageSquare className="size-3.5" />
        Markdown 셀
      </Button>
    </div>
  );
}

function normalizeNotebookFilename(value: string) {
  const trimmed = value.trim() || "notebook.py";
  if (trimmed.toLowerCase().endsWith(".py")) return trimmed;
  return `${trimmed.replace(/\.[^/.]+$/, "")}.py`;
}
