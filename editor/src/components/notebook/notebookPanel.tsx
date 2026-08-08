import { useEffect, useRef, useState } from "react";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionStatus,
  completionKeymap,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { bracketMatching, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import {
  Compartment,
  EditorState,
  Prec,
  RangeSet,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  drawSelection,
  EditorView,
  GutterMarker,
  gutter,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightWhitespace,
  keymap,
  lineNumbers,
  placeholder,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { combineErrorSources } from "@/lib/tracebackParser";
import "@/components/notebook/notebookPanel.css";
import "@/components/app/workCell.css";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  MessageSquare,
  MoreHorizontal,
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
import {
  NotebookCommandBar,
  type NotebookWidth,
} from "@/components/notebook/notebookCommandBar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchCodeCompletions, type CompletionContextProvider } from "@/lib/codeCompletion";
import {
  executionKindLabel,
  isExecutableBlock,
  isPersistentAutomationBlock,
  type CellAiAction,
} from "@/lib/cellModel";
import type { NotebookPersistenceState } from "@/lib/notebookPersistence";
import {
  shouldSuppressNotebookCellBoundaryDuringComposition,
  resolveNotebookCellBoundaryNavigation,
  type NotebookCellNavigationDirection,
} from "@/lib/notebookCellNavigation";
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
    fontSize: "13px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-family-code)",
    lineHeight: "1.55",
    minHeight: "32px",
    overflow: "auto",
  },
  ".cm-content": {
    minHeight: "0",
    padding: "0.375rem 0",
  },
  ".cm-line": {
    padding: "0 0.5rem",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "0",
    color: "var(--color-text-secondary, var(--muted-foreground))",
    minWidth: "24px",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.375rem",
  },
  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
  "&.cm-focused .cm-activeLine, &.cm-focused .cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklab, var(--color-background-muted) 76%, transparent)",
  },
  "&.cm-focused .cm-activeLineGutter": {
    color: "var(--color-text-primary)",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--color-accent, var(--foreground))",
    borderLeftWidth: "2px",
  },
  ".cm-selectionBackground": {
    backgroundColor: "color-mix(in oklab, var(--color-accent) 34%, transparent) !important",
  },
  ".cm-highlightSpace, .cm-highlightTab": {
    backgroundImage: "none",
  },
  "&.cm-focused .cm-highlightSpace": {
    backgroundImage: "radial-gradient(circle at 50% 56%, color-mix(in oklab, var(--color-text-secondary) 72%, transparent) 1px, transparent 1.2px)",
    backgroundPosition: "center",
  },
  "&.cm-focused .cm-highlightTab": {
    backgroundColor: "color-mix(in oklab, var(--color-accent) 10%, transparent)",
    boxShadow: "inset 0 -1px 0 color-mix(in oklab, var(--color-text-secondary) 56%, transparent)",
  },
  ".cm-codaroErrorLine": {
    backgroundColor: "color-mix(in oklch, var(--destructive) 18%, transparent)",
  },
  // 표시가 있을 때만 자리를 차지한다. 고정 width를 주면 빈 셀에서도 줄번호와 코드가 벌어진다.
  ".cm-codaroErrorGutter": {
    textAlign: "center",
  },
  ".cm-codaroErrorGutter .cm-gutterElement": {
    padding: "0 2px",
  },
  ".cm-codaroAiCommentLine": {
    backgroundColor: "color-mix(in oklch, var(--primary, currentColor) 8%, transparent)",
    borderLeft: "2px solid color-mix(in oklch, var(--primary, currentColor) 45%, transparent)",
  },
  ".cm-codaroAiCommentGutter": {
    textAlign: "center",
  },
});

const contentFitCodeCellEditorTheme = EditorView.theme({
  "&": {
    maxHeight: "22rem",
  },
  ".cm-scroller": {
    maxHeight: "22rem",
    overflow: "auto",
  },
  ".cm-content": {
    minHeight: "0",
    padding: "0.375rem 0",
  },
});

function keepNotebookCellClearOfFloatingTools(cell: Element | null): void {
  if (!(cell instanceof HTMLElement)) return;
  const viewport = document.querySelector(
    '.notebookViewport [data-slot="scroll-area-viewport"]',
  );
  if (!(viewport instanceof HTMLElement)) return;

  const cellRect = cell.getBoundingClientRect();
  const visibleControlRects = [
    ...document.querySelectorAll<HTMLElement>(
      ".notebookFloatingTools, .notebookWidthTools",
    ),
  ]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0
        && rect.height > 0
        && style.visibility !== "hidden"
        && style.display !== "none";
    })
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => (
      Math.min(cellRect.right, rect.right) - Math.max(cellRect.left, rect.left) > 1
      && Math.min(cellRect.bottom, rect.bottom) - Math.max(cellRect.top, rect.top) > 1
    ));
  if (!visibleControlRects.length) return;

  const firstControlTop = Math.min(...visibleControlRects.map((rect) => rect.top));
  const clearance = 16;
  viewport.scrollTop += Math.max(0, cellRect.bottom - firstControlTop + clearance);
}

export function NotebookPanel({
  apiOnline,
  canRun,
  cellHelpByBlockId,
  diagnostics,
  document,
  drafts,
  notebookRunning,
  persistence,
  pendingBlocks,
  reactiveEnabled,
  results,
  runningBlockId,
  selectedBlockId,
  staleBlockIds,
  onAddCell,
  onAcceptPendingBlocks,
  onCellAsk,
  onDeleteCell,
  onDraftChange,
  onDuplicateCell,
  onMoveCell,
  onRejectPendingBlocks,
  onRunBlock,
  onRunNotebook,
  onSelectBlock,
  onToggleReactive,
}: {
  apiOnline: boolean;
  canRun: boolean;
  cellHelpByBlockId: Record<string, CellAiHelpState>;
  diagnostics: ReactiveDiagnostics;
  document: CodaroDocument;
  drafts: Record<string, string>;
  notebookRunning: boolean;
  persistence: NotebookPersistenceState;
  pendingBlocks: BlockConfig[];
  reactiveEnabled: boolean;
  results: ResultMap;
  runningBlockId: string | null;
  selectedBlockId: string;
  staleBlockIds: string[];
  onAddCell: (type: "code" | "markdown", referenceBlockId?: string, placement?: "before" | "after") => void;
  onAcceptPendingBlocks: () => void;
  onCellAsk: (action: CellAiAction, block: BlockConfig, question?: string) => void;
  onDeleteCell: (blockId: string) => void;
  onDraftChange: (blockId: string, value: string) => void;
  onDuplicateCell: (blockId: string) => void;
  onMoveCell: (blockId: string, direction: "up" | "down") => void;
  onRejectPendingBlocks: () => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onRunNotebook: () => void;
  onSelectBlock: (blockId: string) => void;
  onToggleReactive: () => void;
}) {
  const [width, setWidth] = useState<NotebookWidth>("medium");
  const staleSet = new Set(staleBlockIds);
  const cyclePaths = formatCyclePaths(diagnostics.cycles);
  const selectedBlockIndex = document.blocks.findIndex((block) => block.id === selectedBlockId);
  const activeCellLabel = selectedBlockIndex >= 0
    ? `셀 ${selectedBlockIndex + 1} / ${document.blocks.length}`
    : `${document.blocks.length}개 셀`;

  return (
    <section
      className="notebookStudio"
      data-notebook-studio="true"
      data-notebook-storage={persistence.mode === "local" ? "local-file" : "browser"}
      data-notebook-storage-status={persistence.phase}
    >
      <span
        aria-atomic="true"
        aria-live="polite"
        className="notebookActiveCell"
        data-notebook-active-cell="true"
        data-notebook-active-index={selectedBlockIndex >= 0 ? selectedBlockIndex + 1 : 0}
        data-notebook-cell-count={document.blocks.length}
      >
        {activeCellLabel}
      </span>
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
        <div
          aria-label="노트북 셀"
          className="notebookDocument"
          data-notebook-width={width}
          role="list"
        >
          {document.blocks.length ? (
            <>
              {document.blocks.map((block, blockIndex) => (
                <DocumentBlock
                  autoFocus={block.id === selectedBlockId}
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
                  position={blockIndex + 1}
                  showInsertBefore={blockIndex === 0}
                  total={document.blocks.length}
                  diagnosticChips={cellDiagnosticChips(diagnostics, block.id)}
                  onCellAsk={(action, question) => onCellAsk(action, block, question)}
                  onDelete={() => onDeleteCell(block.id)}
                  onDraftChange={(value) => onDraftChange(block.id, value)}
                  onDuplicate={() => onDuplicateCell(block.id)}
                  onInsertCell={(type, placement) => onAddCell(type, block.id, placement)}
                  onReorderCell={(direction) => onMoveCell(block.id, direction)}
                  onMoveCell={(direction) => {
                    const targetIndex = direction === "previous"
                      ? blockIndex - 1
                      : blockIndex + 1;
                    const targetBlock = document.blocks[targetIndex];
                    if (!targetBlock) return false;
                    onSelectBlock(targetBlock.id);
                    return true;
                  }}
                  onRun={(sourceOverride) => onRunBlock(block, sourceOverride)}
                  onRunAndAdvance={(sourceOverride) => {
                    onRunBlock(block, sourceOverride);
                    const nextBlock = document.blocks[blockIndex + 1];
                    if (nextBlock) {
                      onSelectBlock(nextBlock.id);
                      return;
                    }
                    onAddCell("code", block.id, "after");
                  }}
                  onSelect={() => onSelectBlock(block.id)}
                />
              ))}
              <NotebookAppendActions
                onAddCell={(type) => onAddCell(type, document.blocks.at(-1)?.id, "after")}
              />
            </>
          ) : (
            <EmptyNotebookActions onAddCell={(type) => onAddCell(type)} />
          )}
        </div>
      </ScrollArea>
      <NotebookCommandBar
        apiOnline={apiOnline}
        canRun={canRun}
        notebookRunning={notebookRunning}
        persistence={persistence}
        reactiveEnabled={reactiveEnabled}
        runningBlockId={runningBlockId}
        width={width}
        onRunNotebook={onRunNotebook}
        onToggleReactive={onToggleReactive}
        onWidthChange={setWidth}
      />
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

// initialSpacer를 두면 표시가 없어도 폭이 예약되어 줄번호와 코드가 멀어진다.
const errorGutter = gutter({
  class: "cm-codaroErrorGutter",
  markers: (view) => view.state.field(errorMarkerField),
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
    node.style.color = "var(--primary)";
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
});

export function CodeCellEditor({
  ariaLabel = "코드 편집기",
  autoFocus = false,
  density = "comfortable",
  placeholderText = "",
  value,
  onChange,
  onFocus,
  onBoundaryNavigate,
  onRun,
  onRunAndAdvance,
  completionContext,
  errorLines,
  aiComments,
  onAiCommentClick,
}: {
  ariaLabel?: string;
  autoFocus?: boolean;
  density?: "comfortable" | "content-fit";
  placeholderText?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBoundaryNavigate?: (direction: NotebookCellNavigationDirection) => boolean;
  onRun?: (source: string) => void;
  onRunAndAdvance?: (source: string) => void;
  completionContext?: CompletionContextProvider;
  errorLines?: number[];
  aiComments?: AiLineComment[];
  onAiCommentClick?: (comment: AiLineComment) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const accessibilityAttributesRef = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onBoundaryNavigateRef = useRef(onBoundaryNavigate);
  const onRunRef = useRef(onRun);
  const onRunAndAdvanceRef = useRef(onRunAndAdvance);
  const completionContextRef = useRef(completionContext);
  const compositionBoundaryRef = useRef({
    active: false,
    endedAt: Number.NEGATIVE_INFINITY,
  });

  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onBoundaryNavigateRef.current = onBoundaryNavigate;
    onRunRef.current = onRun;
    onRunAndAdvanceRef.current = onRunAndAdvance;
    completionContextRef.current = completionContext;
  }, [onChange, onFocus, onBoundaryNavigate, onRun, onRunAndAdvance, completionContext]);

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
        drawSelection({ cursorBlinkRate: 1000, drawRangeCursor: true }),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        highlightWhitespace(),
        placeholder(placeholderText),
        accessibilityAttributesRef.current.of(
          EditorView.contentAttributes.of({
            "aria-label": ariaLabel,
            "aria-multiline": "true",
          }),
        ),
        EditorView.lineWrapping,
        autocompletion({
          override: [aiCompletionSource],
          activateOnTyping: true,
          maxRenderedOptions: 6,
          defaultKeymap: true,
        }),
        Prec.highest(EditorView.domEventHandlers({
          compositionstart: () => {
            compositionBoundaryRef.current.active = true;
            compositionBoundaryRef.current.endedAt = Number.NEGATIVE_INFINITY;
            return false;
          },
          compositionend: () => {
            compositionBoundaryRef.current.active = false;
            compositionBoundaryRef.current.endedAt = performance.now();
            return false;
          },
          keydown: (event) => {
            if (!shouldSuppressNotebookCellBoundaryDuringComposition({
              key: event.key,
              isComposing: event.isComposing,
              keyCode: event.keyCode,
              compositionActive: compositionBoundaryRef.current.active,
              compositionEndedAt: compositionBoundaryRef.current.endedAt,
              now: performance.now(),
            })) {
              return false;
            }
            event.preventDefault();
            return true;
          },
        })),
        errorMarkerField,
        errorLineDecorationField,
        errorGutter,
        aiCommentMarkerField,
        aiCommentLineDecorationField,
        aiCommentGutter,
        Prec.high(keymap.of([
          {
            key: "ArrowUp",
            run: (view) => {
              if (view.compositionStarted || completionStatus(view.state) !== null) return false;
              const selection = view.state.selection.main;
              const direction = resolveNotebookCellBoundaryNavigation({
                key: "ArrowUp",
                selectionAnchor: selection.anchor,
                selectionHead: selection.head,
                textLength: view.state.doc.length,
              });
              return direction
                ? onBoundaryNavigateRef.current?.(direction) ?? false
                : false;
            },
          },
          {
            key: "ArrowDown",
            run: (view) => {
              if (view.compositionStarted || completionStatus(view.state) !== null) return false;
              const selection = view.state.selection.main;
              const direction = resolveNotebookCellBoundaryNavigation({
                key: "ArrowDown",
                selectionAnchor: selection.anchor,
                selectionHead: selection.head,
                textLength: view.state.doc.length,
              });
              return direction
                ? onBoundaryNavigateRef.current?.(direction) ?? false
                : false;
            },
          },
          {
            key: "Shift-Enter",
            run: (view) => {
              if (view.compositionStarted) return false;
              const source = view.state.doc.toString();
              if (onRunAndAdvanceRef.current) {
                onRunAndAdvanceRef.current(source);
              } else {
                onRunRef.current?.(source);
              }
              return true;
            },
          },
          {
            key: "Mod-Enter",
            run: (view) => {
              if (view.compositionStarted) return false;
              onRunRef.current?.(view.state.doc.toString());
              return true;
            },
          },
          {
            key: "Ctrl-Enter",
            run: (view) => {
              if (view.compositionStarted) return false;
              onRunRef.current?.(view.state.doc.toString());
              return true;
            },
          },
        ])),
        keymap.of([indentWithTab, ...closeBracketsKeymap, ...completionKeymap, ...defaultKeymap, ...historyKeymap]),
        codeCellEditorTheme,
        density === "content-fit" ? Prec.highest(contentFitCodeCellEditorTheme) : [],
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

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: accessibilityAttributesRef.current.reconfigure(
        EditorView.contentAttributes.of({
          "aria-label": ariaLabel,
          "aria-multiline": "true",
        }),
      ),
    });
  }, [ariaLabel]);

  useEffect(() => {
    if (!autoFocus) return;
    let revealFrame = 0;
    const focusFrame = window.requestAnimationFrame(() => {
      viewRef.current?.focus();
      const cell = hostRef.current?.closest("[data-notebook-cell]") ?? null;
      cell?.scrollIntoView({ block: "nearest" });
      revealFrame = window.requestAnimationFrame(() => {
        keepNotebookCellClearOfFloatingTools(cell);
      });
    });
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.cancelAnimationFrame(revealFrame);
    };
  }, [autoFocus]);

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
      data-code-editor-density={density}
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
  position,
  showInsertBefore = false,
  total,
  diagnosticChips = [],
  result,
  cellHelp,
  onDraftChange,
  onDelete,
  onDuplicate,
  onInsertCell,
  onMoveCell,
  onReorderCell,
  onRun,
  onRunAndAdvance,
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
  position: number;
  showInsertBefore?: boolean;
  total: number;
  diagnosticChips?: CellDiagnosticChip[];
  result?: ExecutionResult;
  cellHelp?: CellAiHelpState;
  onCellAsk: (action: CellAiAction, question?: string) => void;
  onDelete: () => void;
  onDraftChange: (value: string) => void;
  onDuplicate: () => void;
  onInsertCell: (type: "code" | "markdown", placement: "before" | "after") => void;
  onMoveCell: (direction: NotebookCellNavigationDirection) => boolean;
  onReorderCell: (direction: "up" | "down") => void;
  onRun: (sourceOverride?: string) => void;
  onRunAndAdvance: (sourceOverride?: string) => void;
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
  const cellAriaLabel = `${cellTitle} 셀 ${position} / ${total}`;
  // 우선순위: 실행 중 → 순환(conflict, 빨강) → stale(오래됨) → 실행 결과 → 대기.
  const resultStatus = isRunning ? "running" : inCycle ? "conflict" : isStale ? "stale" : result?.status ?? "idle";
  const draftRef = useRef(draft);
  const markdownEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const markdownCompositionRef = useRef(false);
  const markdownCompositionEndedAtRef = useRef(Number.NEGATIVE_INFINITY);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (!autoFocus || block.type !== "markdown") return;
    let revealFrame = 0;
    const focusFrame = window.requestAnimationFrame(() => {
      markdownEditorRef.current?.focus();
      const cell = markdownEditorRef.current?.closest("[data-notebook-cell]") ?? null;
      cell?.scrollIntoView({ block: "nearest" });
      revealFrame = window.requestAnimationFrame(() => {
        keepNotebookCellClearOfFloatingTools(cell);
      });
    });
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.cancelAnimationFrame(revealFrame);
    };
  }, [autoFocus, block.type]);

  const updateDraft = (value: string) => {
    draftRef.current = value;
    onDraftChange(value);
  };

  const runCurrentDraft = () => {
    onRun(draftRef.current);
  };

  const runAndAdvanceCurrentDraft = () => {
    onRunAndAdvance(draftRef.current);
  };

  if (block.type === "markdown") {
    const markdownData = result?.data as { html?: unknown } | null | undefined;
    const markdownHtml = markdownData && typeof markdownData.html === "string" ? markdownData.html : "";
    // 미선택 + 렌더 결과가 있으면 미리보기, 선택하면 편집(클릭으로 전환).
    const showPreview = !isSelected && Boolean(markdownHtml);
    return (
      <section
        aria-label={cellAriaLabel}
        aria-posinset={position}
        aria-setsize={total}
        className="astryxWorkCell notebookCell group"
        data-notebook-cell="markdown"
        data-notebook-cell-selected={isSelected ? "true" : "false"}
        data-notebook-cell-status={resultStatus}
        data-work-cell-selected={isSelected ? "true" : "false"}
        role="listitem"
      >
        <div className="notebookCellBody">
          {showInsertBefore ? (
            <InsertCellButton placement="before" onInsertCell={onInsertCell} className="notebookInsertBefore" />
          ) : null}
          <InsertCellButton placement="after" onInsertCell={onInsertCell} className="notebookInsertAfter" />
          {showPreview ? (
            <div
              className="astryxWorkCellFrame notebookMarkdownPreview prose prose-sm"
              data-notebook-markdown-preview="true"
              onClick={onSelect}
              dangerouslySetInnerHTML={{ __html: markdownHtml }}
            />
          ) : (
            <Textarea
              aria-label={`${cellAriaLabel} 편집기`}
              className={cn(
                "astryxWorkCellFrame notebookMarkdownEditor",
                isSelected && "notebookMarkdownEditorSelected",
              )}
              placeholder="Markdown을 입력하세요. {변수}로 값 보간."
              ref={markdownEditorRef}
              value={draft}
              onBlur={() => {
                markdownCompositionRef.current = false;
                markdownCompositionEndedAtRef.current = Number.NEGATIVE_INFINITY;
              }}
              onChange={(event) => updateDraft(event.target.value)}
              onCompositionEnd={() => {
                markdownCompositionRef.current = false;
                markdownCompositionEndedAtRef.current = performance.now();
              }}
              onCompositionStart={() => {
                markdownCompositionRef.current = true;
                markdownCompositionEndedAtRef.current = Number.NEGATIVE_INFINITY;
              }}
              onFocus={onSelect}
              onKeyDown={(event) => {
                if (
                  shouldSuppressNotebookCellBoundaryDuringComposition({
                    key: event.key,
                    isComposing: event.nativeEvent.isComposing,
                    keyCode: event.nativeEvent.keyCode,
                    compositionActive: markdownCompositionRef.current,
                    compositionEndedAt: markdownCompositionEndedAtRef.current,
                    now: performance.now(),
                  })
                  || event.altKey
                  || event.ctrlKey
                  || event.metaKey
                  || event.shiftKey
                  || (event.key !== "ArrowUp" && event.key !== "ArrowDown")
                ) {
                  return;
                }
                const direction = resolveNotebookCellBoundaryNavigation({
                  key: event.key,
                  selectionAnchor: event.currentTarget.selectionStart,
                  selectionHead: event.currentTarget.selectionEnd,
                  textLength: event.currentTarget.value.length,
                });
                if (direction && onMoveCell(direction)) {
                  event.preventDefault();
                }
              }}
            />
          )}
        </div>
        <CellMetaBar
          cellLabel={cellAriaLabel}
          canMoveUp={position > 1}
          canMoveDown={position < total}
          status={resultStatus}
          type="markdown"
          selected={isSelected}
          cellHelp={cellHelp}
          diagnosticChips={diagnosticChips}
          onCellAsk={onCellAsk}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onReorder={onReorderCell}
        />
      </section>
    );
  }

  return (
    <section
      aria-label={cellAriaLabel}
      aria-posinset={position}
      aria-setsize={total}
      className="astryxWorkCell notebookCell group"
      data-automation-session-cell={persistentAutomation ? "true" : undefined}
      data-notebook-cell="code"
      data-notebook-cell-selected={isSelected ? "true" : "false"}
      data-notebook-cell-status={resultStatus}
      data-work-cell-running={isRunning ? "true" : "false"}
      data-work-cell-selected={isSelected ? "true" : "false"}
      role="listitem"
    >
      <div className="notebookCellBody">
        {showInsertBefore ? (
          <InsertCellButton placement="before" onInsertCell={onInsertCell} className="notebookInsertBefore" />
        ) : null}
        <InsertCellButton placement="after" onInsertCell={onInsertCell} className="notebookInsertAfter" />
        <div
          className={cn(
            "astryxWorkCellFrame notebookCodeFrame",
            isSelected && "notebookCodeFrameSelected",
          )}
          data-notebook-input="code"
        >
          <CodeCellEditor
            ariaLabel={`${cellAriaLabel} 코드 편집기`}
            autoFocus={autoFocus}
            placeholderText="Python 코드를 입력하세요"
            value={draft}
            onChange={updateDraft}
            onFocus={onSelect}
            onBoundaryNavigate={onMoveCell}
            onRun={onRun}
            onRunAndAdvance={runAndAdvanceCurrentDraft}
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
        <div className="astryxWorkCellOutput notebookCellOutput">
          <ExecutionOutput ariaLabel={`${cellAriaLabel} 실행 결과`} result={result} />
        </div>
      ) : null}
      {isRunning && !result ? (
        <div className="astryxWorkCellOutput notebookCellOutput">
          <LoadingInline label="셀 실행 중" />
        </div>
      ) : null}
      <CellMetaBar
        cellLabel={cellAriaLabel}
        canMoveUp={position > 1}
        canMoveDown={position < total}
        canRun={canRun}
        running={isRunning}
        status={resultStatus}
        type="code"
        selected={isSelected}
        cellHelp={cellHelp}
        diagnosticChips={diagnosticChips}
        onCellAsk={onCellAsk}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onReorder={onReorderCell}
        onRun={runCurrentDraft}
      />
    </section>
  );
}

function CellMetaBar({
  cellLabel,
  canMoveUp = false,
  canMoveDown = false,
  canRun = false,
  running = false,
  status,
  type,
  selected,
  cellHelp,
  diagnosticChips = [],
  onCellAsk,
  onDelete,
  onDuplicate,
  onReorder,
  onRun,
}: {
  cellLabel: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canRun?: boolean;
  running?: boolean;
  status: string;
  type: "code" | "markdown";
  selected: boolean;
  cellHelp?: CellAiHelpState;
  diagnosticChips?: CellDiagnosticChip[];
  onCellAsk: (action: CellAiAction, question?: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (direction: "up" | "down") => void;
  onRun?: () => void;
}) {
  // 삭제 버튼은 항상 DOM에 1개만 둔다. 모바일은 더보기 메뉴 안(기본 접힘 계약),
  // 데스크톱은 dartlab처럼 툴바에 직접 노출한다.
  const isMobile = useIsMobile();
  const deleteButton = (
    <IconButton
      className={cn(
        "notebookCellToolButton notebookCellDeleteButton",
        isMobile ? "notebookCellDeleteMenuItem size-11" : "notebookCellDeleteInline",
      )}
      label={`${cellLabel} 삭제`}
      variant="ghost"
      onClick={(event) => {
        event.stopPropagation();
        onDelete();
      }}
    >
      <Trash2 />
    </IconButton>
  );
  return (
    <div className="notebookCellMeta">
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
              "notebookCellToolButton notebookCellRunButton size-11 min-[761px]:size-6",
              selected && "notebookCellRunButtonSelected",
            )}
            disabled={!canRun}
            label={`${cellLabel} 실행`}
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onRun?.();
            }}
          >
            {running ? <Loader2 className="animate-spin" /> : <Play />}
          </IconButton>
        ) : null}
        <IconButton
          className="notebookCellToolButton notebookCellMoveButton max-[760px]:hidden"
          disabled={!canMoveUp}
          label={`${cellLabel} 위로 이동`}
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onReorder("up");
          }}
        >
          <ChevronUp />
        </IconButton>
        <IconButton
          className="notebookCellToolButton notebookCellMoveButton max-[760px]:hidden"
          disabled={!canMoveDown}
          label={`${cellLabel} 아래로 이동`}
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onReorder("down");
          }}
        >
          <ChevronDown />
        </IconButton>
        <IconButton
          className="notebookCellToolButton notebookCellDuplicateButton max-[760px]:hidden"
          label={`${cellLabel} 복제`}
          variant="ghost"
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy />
        </IconButton>
        <details
          className="notebookCellMore"
          data-notebook-cell-menu="true"
          onClick={(event) => event.stopPropagation()}
        >
          <summary
            aria-label={`${cellLabel} 작업 더보기`}
            className="notebookCellMoreTrigger"
            role="button"
            title="셀 작업 더보기"
          >
            <MoreHorizontal aria-hidden="true" />
          </summary>
          <div className="notebookCellMoreMenu">
            <CellAiActions compact helpState={cellHelp} selected={selected} onAsk={onCellAsk} />
            {isMobile ? deleteButton : null}
          </div>
        </details>
        {isMobile ? null : deleteButton}
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

function NotebookAppendActions({
  onAddCell,
}: {
  onAddCell: (type: "code" | "markdown") => void;
}) {
  return (
    <div className="notebookAppendActions" role="toolbar" aria-label="노트북 셀 추가">
      <button className="notebookAppendButton" type="button" onClick={() => onAddCell("code")}>
        + Code
      </button>
      <button className="notebookAppendButton" type="button" onClick={() => onAddCell("markdown")}>
        + Markdown
      </button>
    </div>
  );
}
