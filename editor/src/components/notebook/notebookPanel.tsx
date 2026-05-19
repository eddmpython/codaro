import { useEffect, useRef } from "react";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers, placeholder } from "@codemirror/view";
import {
  Loader2,
  MessageSquare,
  Play,
  TerminalSquare,
} from "lucide-react";

import {
  ExecutionOutput,
  IconButton,
  LoadingInline,
  PendingNotebookBar,
} from "@/components/app/appPrimitives";
import { CellAiActions } from "@/components/app/cellAiActions";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { CellAiAction } from "@/lib/cellModel";
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
});

export function NotebookPanel({
  canRun,
  document,
  drafts,
  pendingBlocks,
  results,
  runningBlockId,
  selectedBlockId,
  onAddCell,
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
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  onAddCell: (type: "code" | "markdown") => void;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_1fr] p-3">
      <div className="mb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-normal">{document.title}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton className="size-8" label="Python 셀 추가" onClick={() => onAddCell("code")}>
              <TerminalSquare />
            </IconButton>
            <IconButton className="size-8" label="Markdown 셀 추가" onClick={() => onAddCell("markdown")}>
              <MessageSquare />
            </IconButton>
          </div>
        </div>
        <PendingNotebookBar
          pendingBlocks={pendingBlocks}
          onAccept={onAcceptPendingBlocks}
          onReject={onRejectPendingBlocks}
        />
      </div>

      <ScrollArea className="min-h-0">
        <div className="space-y-2 pr-2">
          {document.blocks.map((block, index) => (
            <DocumentBlock
              block={block}
              canRun={canRun && (block.type !== "code" || Boolean((drafts[block.id] ?? block.content).trim()))}
              draft={drafts[block.id] ?? block.content}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              ordinal={index + 1}
              result={results[block.id]}
              isRunning={runningBlockId === block.id}
              onCellAsk={(action) => onCellAsk(action, block)}
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onRun={() => onRunBlock(block)}
              onSelect={() => onSelectBlock(block.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

export function CodeCellEditor({
  autoFocus = false,
  placeholderText = "Python 코드를 입력하세요.",
  value,
  onChange,
  onFocus,
  onRun,
}: {
  autoFocus?: boolean;
  placeholderText?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onRun?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onRunRef.current = onRun;
  }, [onChange, onFocus, onRun]);

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        bracketMatching(),
        python(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        highlightActiveLine(),
        placeholder(placeholderText),
        EditorView.lineWrapping,
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
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
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

  return (
    <div
      className="overflow-hidden rounded-md bg-code text-code-foreground"
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
  ordinal,
  result,
  onDraftChange,
  onRun,
  onSelect,
  onCellAsk,
}: {
  block: BlockConfig;
  canRun: boolean;
  draft: string;
  isSelected: boolean;
  isRunning: boolean;
  ordinal: number;
  result?: ExecutionResult;
  onCellAsk: (action: CellAiAction) => void;
  onDraftChange: (value: string) => void;
  onRun: () => void;
  onSelect: () => void;
}) {
  const cellTitle = block.type === "markdown" ? "Markdown" : "Python";
  const lineCount = countMeaningfulLines(block.type === "code" ? draft : block.content);
  const resultStatus = isRunning ? "running" : result?.status ?? "idle";

  if (block.type === "markdown") {
    return (
      <section className={cn("group overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm", isSelected && "bg-muted/20 ring-1 ring-ring/30")}>
        <div className="grid grid-cols-[40px_minmax(0,1fr)]">
          <CellGutter ordinal={ordinal} selected={isSelected} onSelect={onSelect} />
          <div className="min-w-0">
            <CellHeader
              lineCount={lineCount}
              status={resultStatus}
              title={cellTitle}
              type="markdown"
              selected={isSelected}
              onCellAsk={onCellAsk}
              onSelect={onSelect}
            />
            <div className="px-3 pb-3">
              <Textarea
                className="min-h-24 resize-y bg-muted/20 font-sans text-sm leading-6"
                placeholder="Markdown을 입력하세요."
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                onFocus={onSelect}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("group overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm", isSelected && "bg-muted/20 ring-1 ring-ring/30")}>
      <div className="grid grid-cols-[40px_minmax(0,1fr)]">
        <CellGutter
          canRun={canRun}
          ordinal={ordinal}
          selected={isSelected}
          onSelect={onSelect}
          onRun={onRun}
          running={isRunning}
        />
        <div className="min-w-0">
          <CellHeader
            lineCount={lineCount}
            status={resultStatus}
            title={cellTitle}
            type="code"
            selected={isSelected}
            onCellAsk={onCellAsk}
            onSelect={onSelect}
          />
          <div className="space-y-2 px-3 pb-3">
            <CodeCellEditor
              value={draft}
              onChange={onDraftChange}
              onFocus={onSelect}
              onRun={onRun}
            />
            {result ? <div className="mt-3"><ExecutionOutput result={result} /></div> : null}
            {isRunning && !result ? (
              <div className="mt-2">
                <LoadingInline label="셀 실행 중" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function CellGutter({
  canRun = false,
  ordinal,
  running = false,
  selected,
  onSelect,
  onRun,
}: {
  canRun?: boolean;
  ordinal: number;
  running?: boolean;
  selected: boolean;
  onSelect?: () => void;
  onRun?: () => void;
}) {
  return (
    <div className={cn("flex min-h-full flex-col items-center gap-1.5 bg-muted/20 py-2 text-muted-foreground", selected && "bg-accent")}>
      <button
        className="flex size-6 items-center justify-center rounded-md text-[11px] font-medium tabular-nums hover:bg-accent hover:text-accent-foreground"
        type="button"
        onClick={onSelect}
      >
        {String(ordinal).padStart(2, "0")}
      </button>
      {onRun ? (
        <IconButton className="size-6" disabled={!canRun} label="셀 실행" size="icon" variant="ghost" onClick={onRun}>
          {running ? <Loader2 className="animate-spin" /> : <Play />}
        </IconButton>
      ) : null}
    </div>
  );
}

function CellHeader({
  lineCount,
  status,
  title,
  type,
  selected,
  onCellAsk,
  onSelect,
}: {
  lineCount: number;
  status: string;
  title: string;
  type: "code" | "markdown";
  selected: boolean;
  onCellAsk: (action: CellAiAction) => void;
  onSelect: () => void;
}) {
  const Icon = type === "code" ? TerminalSquare : MessageSquare;

  return (
    <div className="flex min-h-10 w-full min-w-0 items-center gap-2 px-3 py-1.5">
      <button
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        type="button"
        onClick={onSelect}
      >
        <Badge className="gap-1" variant="secondary">
          <Icon className="size-3" />
          {title}
        </Badge>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{type === "code" ? "파이썬 셀" : "마크다운 셀"}</span>
        {lineCount ? <span className="hidden text-xs text-muted-foreground sm:inline">{lineCount}줄</span> : null}
        {status !== "idle" ? <Badge variant={status === "error" ? "destructive" : "outline"}>{statusLabel(status)}</Badge> : null}
      </button>
      <CellAiActions selected={selected} onAsk={onCellAsk} />
    </div>
  );
}

function countMeaningfulLines(value: string) {
  return value.split("\n").filter((line) => line.trim()).length;
}
