<script lang="ts">
  import {
    ChevronDown,
    ChevronUp,
    ChevronsDown,
    ChevronsUp,
    Code2,
    Eye,
    EyeOff,
    GripVertical,
    MoreHorizontal,
    Play,
    Plus,
    PlusCircle,
    RefreshCw,
    Scissors,
    Square,
    Trash2,
    Type,
    XCircle
  } from "lucide-svelte";
  import CodeEditor from "./CodeEditor.svelte";
  import MarkdownBlock from "./MarkdownBlock.svelte";
  import OutputRenderer from "./OutputRenderer.svelte";

  interface BlockData {
    id: string;
    type: string;
    content: string;
    execution: {
      executionCount: number;
      status: string;
      lastOutput: unknown;
      elapsedTimeMs: number | null;
    };
  }

  interface Props {
    block: BlockData;
    active?: boolean;
    needsRun?: boolean;
    onSelect?: () => void;
    onRun?: () => void;
    onChange?: (content: string) => void;
    onToggleType?: () => void;
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDuplicate?: () => void;
    onAddBelow?: () => void;
    onAddAbove?: () => void;
    onRunAndNewBelow?: () => void;
    onRunAll?: () => void;
    onFocusUp?: () => void;
    onFocusDown?: () => void;
    onHideCode?: () => void;
    onClearOutput?: () => void;
    onSendToTop?: () => void;
    onSendToBottom?: () => void;
  }

  let {
    block,
    active = false,
    needsRun = false,
    onSelect = () => {},
    onRun = () => {},
    onChange = () => {},
    onToggleType = () => {},
    onDelete = () => {},
    onMoveUp = () => {},
    onMoveDown = () => {},
    onDuplicate = () => {},
    onAddBelow = () => {},
    onAddAbove = () => {},
    onRunAndNewBelow = () => {},
    onRunAll = () => {},
    onFocusUp = () => {},
    onFocusDown = () => {},
    onHideCode = () => {},
    onClearOutput = () => {},
    onSendToTop = () => {},
    onSendToBottom = () => {}
  }: Props = $props();

  let status = $derived(block.execution?.status || "idle");
  let hasOutput = $derived(!!(block.execution?.lastOutput));
  let elapsedTimeMs = $derived(block.execution?.elapsedTimeMs ?? null);
  let cellClasses = $derived(
    [
      "group",
      "marimo-cell",
      "hover-actions-parent",
      "interactive",
      "z-10",
      needsRun ? "needs-run" : "",
      status === "error" ? "has-error" : "",
      status === "stopped" ? "stopped" : "",
      block.type === "markdown" && !block.content.trim() ? "borderless" : "",
      active && status !== "error" ? "ring-2 ring-primary/50" : "",
      status === "error" ? "ring-2 ring-destructive/50" : ""
    ].filter(Boolean).join(" ")
  );

  let actionsOpen = $state(false);
  let actionsSearch = $state("");
  let codeHidden = $state(false);

  interface CellAction {
    label: string;
    icon: typeof Play;
    group: string;
    handle: () => void;
  }

  let cellActions = $derived([
    { label: "Run cell", icon: Play, group: "Code & Execution", handle: onRun },
    { label: "Format cell", icon: Code2, group: "Code & Execution", handle: () => {} },
    { label: "Hide code", icon: EyeOff, group: "Code & Execution", handle: onHideCode },
    { label: "View as Markdown", icon: Type, group: "View As", handle: onToggleType },
    { label: "Create cell above", icon: PlusCircle, group: "Movement", handle: onAddAbove },
    { label: "Create cell below", icon: PlusCircle, group: "Movement", handle: onAddBelow },
    { label: "Move up", icon: ChevronUp, group: "Movement", handle: onMoveUp },
    { label: "Move down", icon: ChevronDown, group: "Movement", handle: onMoveDown },
    { label: "Send to top", icon: ChevronsUp, group: "Movement", handle: onSendToTop },
    { label: "Send to bottom", icon: ChevronsDown, group: "Movement", handle: onSendToBottom },
    { label: "Duplicate", icon: Scissors, group: "Movement", handle: onDuplicate },
    { label: "Clear output", icon: XCircle, group: "Output", handle: onClearOutput },
    { label: "Delete", icon: Trash2, group: "Danger", handle: onDelete }
  ] as CellAction[]);

  let filteredActions = $derived(
    actionsSearch
      ? cellActions.filter((a) => a.label.toLowerCase().includes(actionsSearch.toLowerCase()))
      : cellActions
  );

  let actionGroups = $derived([...new Set(filteredActions.map((a) => a.group))]);

  function handleActionSelect(action: CellAction): void {
    actionsOpen = false;
    actionsSearch = "";
    action.handle();
  }

  function formatElapsedTime(ms: number | null): string {
    if (ms === null) return "";
    const seconds = ms / 1000;
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remaining = Math.floor(seconds % 60);
      return `${minutes}m${remaining}s`;
    }
    if (seconds >= 1) return `${seconds.toFixed(2)}s`;
    return `${ms.toFixed(0)}ms`;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="outline-hidden rounded-lg"
  style="position: relative;"
  tabindex="-1"
>
<marimo-cell
  class="block"
  data-cell-id={block.id}
  data-cell-name=""
  id="cell-{block.id}"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    tabindex="-1"
    class={cellClasses}
    data-selected={active ? "true" : "false"}
    data-status={status}
    role="group"
    onmousedown={onSelect}
    onfocusin={onSelect}
  >
    <!-- CellLeftSideActions: two CreateCellButtons -->
    <div class="absolute flex flex-col justify-center h-full left-[-26px] z-20 border-b-0!">
      <div class="-mt-1 min-h-7">
        <button
          type="button"
          class="border-none hover-action shadow-none! bg-transparent! focus-visible:outline-none"
          data-testid="create-cell-button"
          onclick={onAddAbove}
          aria-label="Create cell above"
        >
          <Plus strokeWidth={1.8} size={14} class="opacity-60 hover:opacity-90" />
        </button>
      </div>
      <div class="flex-1 pointer-events-none w-3"></div>
      <div class="-mb-2 min-h-7">
        <button
          type="button"
          class="border-none hover-action shadow-none! bg-transparent! focus-visible:outline-none"
          data-testid="create-cell-button"
          onclick={onAddBelow}
          aria-label="Create cell below"
        >
          <Plus strokeWidth={1.8} size={14} class="opacity-60 hover:opacity-90" />
        </button>
      </div>
    </div>

    <!-- TRAY -->
    <div class="tray" data-has-output-above="false" data-hidden="false">
      <!-- CellToolbar: absolute right-2 -top-4 inside tray -->
      <div class="absolute right-2 -top-4 z-10">
        <div
          class="toolbar-pill {needsRun ? '' : 'hover-action'}"
          role="toolbar"
          tabindex="0"
          onmousedown={(e) => e.preventDefault()}
        >
          {#if status === "running"}
            <button
              type="button"
              class="toolbar-item variant-danger"
              onclick={(e) => { e.stopPropagation(); onRun(); }}
              aria-label="Stop"
            >
              <Square class="size-3" />
            </button>
          {:else}
            <button
              type="button"
              class="toolbar-item {needsRun ? 'variant-stale' : 'variant-default'}"
              onclick={(e) => { e.stopPropagation(); onRun(); }}
              aria-label="Run cell"
              data-testid="run-button"
            >
              <Play class="size-3" />
            </button>
          {/if}

          <div class="cell-actions-popover-anchor" style="position: relative;">
            <button
              type="button"
              class="toolbar-item variant-green"
              aria-label="Cell actions"
              data-testid="cell-actions-button"
              data-state={actionsOpen ? "open" : "closed"}
              onclick={(e) => { e.stopPropagation(); actionsOpen = !actionsOpen; actionsSearch = ""; }}
            >
              <MoreHorizontal class="size-3" strokeWidth={1.5} />
            </button>

            {#if actionsOpen}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div class="cell-actions-backdrop" onclick={(e) => { e.stopPropagation(); actionsOpen = false; }}></div>
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div class="cell-actions-popover" onclick={(e) => e.stopPropagation()}>
                <input
                  class="cell-actions-search"
                  type="text"
                  placeholder="Search actions..."
                  bind:value={actionsSearch}
                />
                <div class="cell-actions-list">
                  {#each actionGroups as group}
                    <div class="cell-actions-group-label">{group}</div>
                    {#each filteredActions.filter((a) => a.group === group) as action}
                      {@const Icon = action.icon}
                      <button
                        type="button"
                        class="cell-actions-item"
                        onclick={(e) => { e.stopPropagation(); handleActionSelect(action); }}
                      >
                        <Icon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>{action.label}</span>
                      </button>
                    {/each}
                  {/each}
                  {#if filteredActions.length === 0}
                    <div class="cell-actions-empty">No results found.</div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Editor overlay buttons (language toggle + hide code) -->
      <div class="relative">
        <!-- Language Toggle Button -->
        <button
          type="button"
          data-testid="language-toggle-button"
          class="absolute top-1 left-1 z-10 px-1.5 py-0.5 text-[10px] font-mono rounded opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity bg-background border border-border cursor-pointer"
          onclick={(e) => { e.stopPropagation(); onToggleType(); }}
          aria-label="Toggle cell type"
        >
          {block.type === "code" ? "Py" : "Md"}
        </button>

        <!-- Hide Code Button -->
        <button
          type="button"
          data-testid="cell-hide-code-button"
          class="absolute top-1 right-8 z-10 opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity p-0.5 rounded bg-background border border-border cursor-pointer"
          onclick={(e) => { e.stopPropagation(); codeHidden = !codeHidden; }}
          aria-label={codeHidden ? "Show code" : "Hide code"}
        >
          {#if codeHidden}
            <Eye class="size-3" />
          {:else}
            <EyeOff class="size-3" />
          {/if}
        </button>

        <!-- Code Editor -->
        {#if block.type === "code"}
          {#if codeHidden}
            <div class="code-hidden-bar">
              <span class="text-[10px] font-mono text-muted-foreground px-2 py-1">{block.type === "code" ? "Py" : "Md"}</span>
            </div>
          {:else}
            <CodeEditor
              value={block.content}
              {onChange}
              {onRun}
              {onRunAndNewBelow}
              {onRunAll}
              onCreateAbove={onAddAbove}
              onCreateBelow={onAddBelow}
              onDeleteCell={onDelete}
              {onMoveUp}
              {onMoveDown}
              {onToggleType}
              {onFocusUp}
              {onFocusDown}
              {onHideCode}
            />
          {/if}
        {:else}
          {#if codeHidden}
            <div class="code-hidden-bar">
              <span class="text-[10px] font-mono text-muted-foreground px-2 py-1">Md</span>
            </div>
          {:else}
            <CodeEditor value={block.content} {onChange} />
          {/if}
          <div class="markdown-divider"></div>
          <div class="markdown-preview-shell">
            <MarkdownBlock value={block.content} active={active} onChange={onChange} />
          </div>
        {/if}
      </div>

      <!-- shoulder-right: status + drag handle -->
      <div class="shoulder-right z-20">
        {#if status === "running"}
          <div class="cell-status-icon elapsed-time running" data-testid="cell-status" data-status="running">
            <span>...</span>
          </div>
        {:else if status === "queued"}
          <div class="cell-status-icon cell-status-queued" data-testid="cell-status" data-status="queued">
            <MoreHorizontal class="h-5 w-5" strokeWidth={1.5} />
          </div>
        {:else if needsRun}
          <div class="cell-status-icon cell-status-stale" data-testid="cell-status" data-status="outdated">
            <RefreshCw class="h-5 w-5" strokeWidth={1.5} />
          </div>
        {:else if elapsedTimeMs !== null}
          <div class="cell-status-icon elapsed-time hover-action" data-testid="cell-status" data-status="idle">
            <span>{formatElapsedTime(elapsedTimeMs)}</span>
          </div>
        {/if}

        <div
          class="py-px cursor-grab opacity-50 hover:opacity-100 hover-action hover:bg-muted rounded border border-transparent hover:border-border active:bg-accent"
          data-testid="drag-button"
        >
          <GripVertical size={20} strokeWidth={1} />
        </div>
      </div>

      <!-- shoulder-bottom: delete button -->
      <div class="shoulder-bottom hover-action">
        <button
          type="button"
          class="toolbar-item variant-danger"
          aria-label="Delete cell"
          onclick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 class="size-3" />
        </button>
      </div>
    </div>

    <!-- Output below -->
    {#if block.type === "code" && hasOutput}
      <div class="output-area">
        <OutputRenderer result={block.execution?.lastOutput} />
      </div>
    {/if}
  </div>
</marimo-cell>
</div>

<style>
  marimo-cell {
    display: block;
    position: relative;
  }

  .marimo-cell {
    position: relative;
    border-radius: 10px;
    max-width: inherit;
    width: 100%;
    border: 1px solid var(--gray-4, var(--border));
    background: var(--background);
  }

  .marimo-cell:hover {
    border-color: var(--gray-6, var(--border));
    z-index: 30;
  }

  .marimo-cell:focus-within {
    z-index: 20;
  }

  .marimo-cell:focus-visible {
    outline: none;
  }

  .marimo-cell.interactive > :first-child {
    border-top-left-radius: 9px;
    border-top-right-radius: 9px;
  }

  .marimo-cell.interactive > :last-child {
    border-bottom-left-radius: 9px;
    border-bottom-right-radius: 9px;
  }

  .marimo-cell.interactive:focus-within {
    box-shadow: var(--shadow-md-solid, 0 4px 6px -1px rgba(0,0,0,.1));
  }

  .marimo-cell.interactive :global(.cm) {
    border-radius: 8px;
  }

  .marimo-cell.interactive .output-area {
    max-height: 610px;
    overflow: auto;
  }

  .marimo-cell.needs-run {
    border-color: var(--stale, var(--yellow-8, #e5a417));
    outline: 1px solid var(--stale, var(--yellow-8, #e5a417));
  }

  .marimo-cell.needs-run:hover {
    border-color: color-mix(in srgb, var(--action-foreground, var(--yellow-11, #946800)), transparent 70%);
    outline-color: color-mix(in srgb, var(--action-foreground, var(--yellow-11, #946800)), transparent 70%);
  }

  .marimo-cell.needs-run:focus-within {
    outline: none;
    box-shadow: var(--shadow-md-solid, 0 4px 6px -1px rgba(0,0,0,.1));
  }

  .marimo-cell.has-error:not(.needs-run) {
    border-color: color-mix(in srgb, var(--error, var(--red-8, #e5484d)), transparent 80%);
    outline: 1px solid color-mix(in srgb, var(--error, var(--red-8, #e5484d)), transparent 80%);
  }

  .marimo-cell.has-error:not(.needs-run):hover {
    border-color: color-mix(in srgb, var(--error, var(--red-8, #e5484d)), transparent 70%);
    outline-color: color-mix(in srgb, var(--error, var(--red-8, #e5484d)), transparent 70%);
  }

  .marimo-cell.has-error:not(.needs-run):focus-within {
    outline: none;
    box-shadow: var(--shadow-md-solid, 0 4px 6px -1px rgba(0,0,0,.1));
  }

  .marimo-cell.stale .output-area,
  .marimo-cell.stale :global(.cm-gutters),
  .marimo-cell.stale :global(.cm) {
    background-color: var(--gray-2, #f9f9f9);
    opacity: 0.5;
  }

  .marimo-cell.borderless {
    border-color: transparent;
  }

  .marimo-cell.borderless > :global(*) {
    border-bottom: none;
  }

  .marimo-cell.borderless:focus {
    border: 1px solid var(--gray-4, var(--border));
  }

  :global(.dark) .marimo-cell {
    border-color: var(--border);
  }

  :global(.dark) .marimo-cell:hover {
    border: 1px solid var(--gray-9);
  }

  .tray {
    display: flex;
    position: relative;
    z-index: 1;
    flex-direction: column;
  }

  .tray[data-has-output-above="false"] :global(.cm-editor) {
    border-top-left-radius: 9px;
    border-top-right-radius: 9px;
  }

  .tray:last-child :global(.cm-editor) {
    border-bottom-left-radius: 9px;
    border-bottom-right-radius: 9px;
  }

  .tray::before,
  .tray::after {
    content: "";
    position: absolute;
    width: var(--gutter-width, 100px);
    max-width: var(--gutter-width, 100px);
    height: 100%;
  }

  .tray::before {
    left: calc(var(--gutter-width, 100px) * -1);
  }

  .tray::after {
    right: calc(var(--gutter-width, 100px) * -1);
  }

  .markdown-divider {
    margin: 0 16px;
    border-top: 1px solid var(--slate-4, var(--gray-5));
  }

  .markdown-preview-shell {
    padding-top: 16px;
  }

  .shoulder-right {
    display: inline-flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    position: absolute;
    left: calc(100% + 12px);
    width: fit-content;
    gap: 4px;
  }

  .shoulder-bottom {
    position: absolute;
    bottom: -2px;
    right: 2px;
  }

  .output-area {
    max-width: inherit;
    width: 100%;
    padding: 1rem;
    clear: both;
    display: flow-root;
    overflow: auto;
  }

  @media (hover: hover) and (pointer: fine) {
    .hover-action {
      display: none !important;
    }

    :global([data-is-dragging="true"]) .hover-actions-parent .hover-action:not(:hover) {
      display: none !important;
    }
  }

  .hover-action:hover,
  .hover-action:focus {
    display: inline-flex !important;
  }

  .hover-actions-parent:hover .hover-action,
  .hover-actions-parent:focus .hover-action {
    display: inline-flex !important;
  }

  .hover-actions-parent:has(:global([data-state="open"])) .hover-action {
    display: inline-flex !important;
  }

  marimo-cell:hover .hover-action,
  marimo-cell:focus-within .hover-action {
    display: inline-flex !important;
  }

  .toolbar-pill {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--background);
    margin: 2px;
    border-radius: 9999px;
  }

  .toolbar-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    box-shadow: var(--shadow-xs-solid, 0 1px 2px 0 rgba(0,0,0,.05));
    border: 1px solid var(--border);
    padding: 5px;
    transition: color 150ms, background-color 150ms, border-color 150ms;
    background: var(--background);
  }

  .toolbar-item:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--ring), 0 0 0 4px var(--ring-offset, var(--background));
  }

  .toolbar-item:active {
    box-shadow: none;
  }

  .toolbar-item.variant-default:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .toolbar-item.variant-stale {
    background: var(--yellow-3, #fff3cd);
    color: var(--yellow-11, #946800);
  }

  .toolbar-item.variant-stale:hover {
    background: var(--yellow-4, #ffe69c);
  }

  .toolbar-item.variant-green:hover {
    background: var(--grass-2, #e9f9ee);
    color: var(--grass-11, #2b7c3e);
    border-color: var(--grass-7, #65ba74);
  }

  .toolbar-item.variant-danger:hover {
    background: var(--red-3, #ffe0e0);
    color: var(--red-11, #cd2b31);
  }

  .cell-status-icon {
    margin-top: 4px;
    margin-left: 3px;
    margin-bottom: auto;
  }

  :global(.elapsed-time) {
    font-family: var(--monospace-font, ui-monospace, monospace);
    font-size: 0.75rem;
    color: var(--gray-11, #6f6f6f);
  }

  .cell-status-queued,
  .cell-status-stale {
    color: var(--gray-10, #888);
  }

  .running {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .cell-actions-popover-anchor {
    display: inline-flex;
  }

  .cell-actions-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
  }

  .cell-actions-popover {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    width: 300px;
    z-index: 50;
    background: var(--popover, var(--background));
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,.1));
    overflow: hidden;
    padding-top: 0.25rem;
  }

  .cell-actions-search {
    display: flex;
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--border);
    background: transparent;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    outline: none;
    color: var(--foreground);
    height: 1.5rem;
    margin: 0.25rem;
    margin-bottom: 0;
  }

  .cell-actions-search::placeholder {
    color: var(--muted-foreground);
  }

  .cell-actions-list {
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.25rem 0;
  }

  .cell-actions-group-label {
    padding: 0.375rem 0.75rem 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cell-actions-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    cursor: pointer;
    border: none;
    background: none;
    color: var(--foreground);
    text-align: left;
  }

  .cell-actions-item:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .cell-actions-empty {
    padding: 1rem;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
  }

  .code-hidden-bar {
    display: flex;
    align-items: center;
    height: 24px;
    background: var(--muted, var(--gray-2, #f5f5f5));
    border-radius: 8px;
    margin: 2px;
  }

  :global(#App.disconnected) .marimo-cell,
  :global(#App.disconnected) :global(.cm .cm-gutters),
  :global(#App.disconnected) :global(.cm-editor.cm-focused .cm-activeLineGutter),
  :global(#App.disconnected) :global(.cm-editor.cm-focused .cm-activeLine),
  :global(#App.disconnected) .shoulder-button {
    background-color: transparent;
  }

  :global(#App.disconnected) .cell-running-icon,
  :global(#App.disconnected) .cell-queued-icon,
  :global(#App.disconnected) .elapsed-time {
    visibility: hidden;
    animation: none;
  }
</style>
