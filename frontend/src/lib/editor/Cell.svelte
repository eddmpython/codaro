<script>
  import { Play, Square, Trash2, ChevronUp, ChevronDown, Plus, FileText, Code, Copy, GripVertical, CheckCircle2 } from "lucide-svelte";
  import CodeCell from "./CodeCell.svelte";
  import MarkdownCell from "./MarkdownCell.svelte";
  import OutputPanel from "./OutputPanel.svelte";

  export let cell;
  export let cellIndex = 0;
  export let isActive = false;
  export let isRunning = false;
  export let isQueued = false;
  export let multiDefVars = [];
  export let onSelect = () => {};
  export let onRun = () => {};
  export let onRunAndMove = () => {};
  export let onUpdateContent = () => {};
  export let onRemove = () => {};
  export let onMove = () => {};
  export let onChangeType = () => {};
  export const onAddAbove = () => {};
  export const onAddBelow = () => {};
  export let onDuplicate = () => {};
  export let onToggleSelect = () => {};
  export let onDragStart = () => {};
  export let onDragEnd = () => {};
  export let onDragOver = () => {};
  export let onDrop = () => {};
  export let onSplit = null;
  export let onMerge = null;
  export let onCheck = null;
  export let hasSolution = false;
  export let feedback = null;
  export let isSelected = false;
  export let dragTargetPosition = "";
  export let isDragSource = false;

  let isEditingMarkdown = false;

  $: executionStatus = cell.execution?.status || "idle";

  function formatTime(ms) {
    if (ms < 1) return "<1ms";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
</script>

<div
  class="cellRow"
  class:active={isActive}
  class:running={isRunning}
  class:queued={isQueued}
  class:selected={isSelected}
  class:statusDone={executionStatus === "done"}
  class:statusError={executionStatus === "error"}
  class:dragTargetBefore={dragTargetPosition === "before"}
  class:dragTargetAfter={dragTargetPosition === "after"}
  class:dragSource={isDragSource}
  data-cell-id={cell.id}
  role="group"
  ondragover={(event) => {
    event.preventDefault();
    onDragOver(event);
  }}
  ondrop={(event) => {
    event.preventDefault();
    onDrop(event);
  }}
>
  <div class="cellGutter" onclick={(event) => onSelect(event)} role="button" tabindex="-1" onkeydown={(event) => event.key === "Enter" && onSelect(event)}>
    <span class="cellNum">{cellIndex}</span>
    {#if cell.type === "code"}
      <button
        class="gutterAction"
        class:gutterRunning={isRunning}
        onclick={(event) => { event.stopPropagation(); onRun(); }}
        aria-label={isRunning ? "Running..." : "Run"}
      >
        {#if isRunning}
          <Square size={11} />
        {:else}
          <Play size={11} />
        {/if}
      </button>
    {:else}
      <span class="gutterType">
        <FileText size={12} />
      </span>
    {/if}
    {#if executionStatus === "done" && !isRunning}
      <span class="gutterDone">
        <CheckCircle2 size={10} />
      </span>
    {/if}
  </div>

  <div class="cellMain">
    <div class="cellCardWrap">
      <div class="cellActions">
        <button
          class="actionButton dragHandle"
          draggable="true"
          ondragstart={(event) => onDragStart(event)}
          ondragend={onDragEnd}
          aria-label="Drag cell"
        >
          <GripVertical size={13} />
        </button>
        <button class="actionButton" onclick={(event) => { event.stopPropagation(); onMove("up"); }} aria-label="Move up">
          <ChevronUp size={13} />
        </button>
        <button class="actionButton" onclick={(event) => { event.stopPropagation(); onMove("down"); }} aria-label="Move down">
          <ChevronDown size={13} />
        </button>
        <div class="actionDivider"></div>
        <button class="actionButton" onclick={(event) => { event.stopPropagation(); onDuplicate(); }} aria-label="Duplicate">
          <Copy size={12} />
        </button>
        {#if cell.type === "markdown"}
          <button class="actionButton" onclick={(event) => { event.stopPropagation(); onChangeType("code"); }} aria-label="Convert to Code">
            <Code size={12} />
          </button>
        {:else}
          <button class="actionButton" onclick={(event) => { event.stopPropagation(); onChangeType("markdown"); }} aria-label="Convert to Markdown">
            <FileText size={12} />
          </button>
        {/if}
        <button class="actionButton selectAction" onclick={(event) => { event.stopPropagation(); onToggleSelect(event); }} aria-label="Toggle select">
          <span class="selectDot" class:selectedMark={isSelected}></span>
        </button>
        <div class="actionDivider"></div>
        <button class="actionButton deleteButton" onclick={(event) => { event.stopPropagation(); onRemove(); }} aria-label="Delete">
          <Trash2 size={12} />
        </button>
      </div>

      <div
        class="cellCard"
        class:markdownCard={cell.type === "markdown"}
        onclick={(event) => onSelect(event)}
        role="button"
        tabindex="0"
        onkeydown={(event) => event.key === "Enter" && onSelect(event)}
      >
        {#if cell.type === "code"}
          <CodeCell
            content={cell.content}
            onContentChange={onUpdateContent}
            {onRun}
            onRunAndMove={onRunAndMove}
            {onSplit}
          />
        {:else if cell.type === "markdown"}
          <MarkdownCell
            content={cell.content}
            {isActive}
            isEditing={isEditingMarkdown}
            onContentChange={onUpdateContent}
            onStartEdit={() => (isEditingMarkdown = true)}
            onStopEdit={() => (isEditingMarkdown = false)}
            onShiftEnter={() => {}}
          />
        {/if}

        {#if cell.type === "code"}
          <OutputPanel
            output={cell.execution?.lastOutput || ""}
            isError={cell.execution?.status === "error"}
            {multiDefVars}
          />
        {/if}

        {#if hasSolution && cell.type === "code"}
          <div class="missionBar" class:passed={feedback?.passed} class:failed={feedback && !feedback.passed}>
            <button class="checkButton" onclick={(event) => { event.stopPropagation(); if (onCheck) onCheck(); }}>
              {#if feedback?.passed}
                <CheckCircle2 size={13} />
                정답!
              {:else}
                체크
              {/if}
            </button>
            {#if feedback && !feedback.passed}
              <span class="feedbackText">{feedback.feedback}</span>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    {#if cell.type === "code" && cell.executionTime != null}
      <span class="execTime">{formatTime(cell.executionTime)}</span>
    {/if}
  </div>
</div>

<style>
  .cellRow {
    display: flex;
    gap: 0;
    align-items: stretch;
    position: relative;
  }

  .cellGutter {
    width: 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0 6px;
    gap: 4px;
    flex-shrink: 0;
    cursor: pointer;
    user-select: none;
  }

  .cellNum {
    font-size: 11px;
    font-family: var(--nb-font-code);
    color: var(--nb-text-muted);
    font-weight: 500;
    line-height: 1;
    opacity: 0.6;
    transition: opacity var(--nb-transition-fast);
  }

  .cellRow:hover .cellNum,
  .cellRow.active .cellNum {
    opacity: 1;
  }

  .gutterAction {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: var(--nb-radius-sm);
    background: transparent;
    color: var(--nb-text-muted);
    cursor: pointer;
    opacity: 0;
    transition: opacity var(--nb-transition-fast), background var(--nb-transition-fast), color var(--nb-transition-fast);
  }

  .cellRow:hover .gutterAction {
    opacity: 0.6;
  }

  .cellRow:hover .gutterAction:hover {
    opacity: 1;
    background: var(--nb-accent-hover);
    color: var(--nb-accent);
  }

  .cellRow.active .gutterAction {
    opacity: 0.8;
    color: var(--nb-accent);
  }

  .gutterRunning {
    opacity: 1 !important;
    color: var(--nb-accent) !important;
    animation: gutterPulse 1.5s ease-in-out infinite;
  }

  @keyframes gutterPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .gutterType {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: var(--nb-text-muted);
    opacity: 0.3;
    transition: opacity var(--nb-transition-fast);
  }

  .cellRow:hover .gutterType,
  .cellRow.active .gutterType {
    opacity: 0.6;
  }

  .gutterDone {
    display: flex;
    align-items: center;
    color: var(--nb-success);
    opacity: 0.6;
  }

  .cellMain {
    flex: 1;
    min-width: 0;
    position: relative;
  }

  .cellCardWrap {
    position: relative;
  }

  .cellActions {
    position: absolute;
    top: -11px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 0;
    padding: 2px 4px;
    background: var(--nb-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--nb-glass-border);
    border-radius: 8px;
    box-shadow: var(--nb-shadow-sm);
    opacity: 0;
    transform: translateY(2px);
    transition: opacity var(--nb-transition-fast), transform var(--nb-transition-fast);
    z-index: 10;
  }

  .cellRow:hover .cellActions {
    opacity: 1;
    transform: translateY(0);
  }

  .cellActions:hover {
    opacity: 1 !important;
  }

  .actionDivider {
    width: 1px;
    height: 14px;
    margin: 0 2px;
    background: var(--nb-border);
  }

  .cellCard {
    border: 1px solid var(--nb-border);
    border-left: 2.5px solid transparent;
    border-radius: var(--nb-radius-md);
    overflow: hidden;
    outline: none;
    transition: border-color var(--nb-transition), box-shadow var(--nb-transition), background var(--nb-transition);
    background: var(--nb-card);
  }

  .cellRow:hover .cellCard {
    border-color: var(--nb-border-strong);
    border-left-color: var(--nb-border);
  }

  .cellRow.active .cellCard {
    border-left-color: var(--nb-accent);
    box-shadow: var(--nb-shadow-sm);
  }

  .cellRow.active:hover .cellCard {
    border-left-color: var(--nb-accent);
  }

  .cellRow.running .cellCard {
    border-left-color: var(--nb-accent);
    animation: pulseBorder 1.5s ease-in-out infinite;
  }

  .cellRow:not(.active):not(.running).statusDone .cellCard {
    border-left-color: var(--nb-success);
  }

  .cellRow:not(.active):not(.running).statusError .cellCard {
    border-left-color: var(--nb-error);
  }

  .cellRow.selected .cellCard {
    box-shadow: 0 0 0 1px var(--nb-pink-subtle), var(--nb-shadow-sm);
  }

  .cellRow.queued .cellCard {
    border-left-color: var(--nb-warning);
    animation: pulseQueued 1.2s ease-in-out infinite;
  }

  @keyframes pulseBorder {
    0%, 100% { border-left-color: var(--nb-accent); }
    50% { border-left-color: var(--nb-pink-bright); }
  }

  @keyframes pulseQueued {
    0%, 100% { border-left-color: var(--nb-warning); }
    50% { border-left-color: rgba(250, 204, 21, 0.3); }
  }

  .cellRow::before,
  .cellRow::after {
    content: "";
    position: absolute;
    left: 36px;
    right: 8px;
    height: 2px;
    border-radius: var(--nb-radius-pill);
    background: transparent;
    pointer-events: none;
    transition: background var(--nb-transition-fast);
    z-index: 12;
  }

  .cellRow::before { top: -5px; }
  .cellRow::after { bottom: -5px; }

  .cellRow.dragTargetBefore::before,
  .cellRow.dragTargetAfter::after {
    background: var(--nb-pink);
  }

  .cellRow.dragSource {
    opacity: 0.5;
  }

  .dragHandle {
    cursor: grab;
  }

  .dragHandle:active {
    cursor: grabbing;
  }

  .actionButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: var(--nb-text-muted);
    cursor: pointer;
    transition: all var(--nb-transition-fast);
  }

  .actionButton:hover {
    background: var(--nb-surface);
    color: var(--nb-text);
  }

  .deleteButton:hover {
    background: var(--nb-error-soft);
    color: var(--nb-error);
  }

  .selectAction {
    padding: 0;
  }

  .selectDot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1.5px solid var(--nb-text-muted);
    background: transparent;
    transition: all var(--nb-transition-fast);
  }

  .selectDot.selectedMark {
    border-color: var(--nb-accent);
    background: var(--nb-accent);
    box-shadow: 0 0 0 2px var(--nb-accent-soft);
  }

  .markdownCard {
    border-color: transparent;
    border-left-color: transparent;
    background: transparent;
  }

  .cellRow:hover .markdownCard {
    border-color: var(--nb-border);
    border-left-color: var(--nb-border);
    background: var(--nb-card);
  }

  .cellRow.active .markdownCard {
    border-color: var(--nb-border);
    border-left-color: var(--nb-accent);
    background: var(--nb-card);
  }

  .missionBar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-top: 1px solid var(--nb-border);
    font-size: 12px;
  }

  .missionBar.passed {
    background: var(--nb-success-soft);
    border-top-color: rgba(22, 163, 74, 0.2);
  }

  .missionBar.failed {
    background: rgba(217, 119, 6, 0.06);
  }

  .checkButton {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border: 1px solid var(--nb-border);
    border-radius: var(--nb-radius-pill);
    background: var(--nb-card);
    color: var(--nb-text-secondary);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all var(--nb-transition-fast);
    flex-shrink: 0;
  }

  .checkButton:hover {
    border-color: var(--nb-accent);
    color: var(--nb-accent);
  }

  .passed .checkButton {
    border-color: var(--nb-success);
    color: var(--nb-success);
    background: var(--nb-success-soft);
  }

  .feedbackText {
    color: var(--nb-text-secondary);
    font-size: 12px;
    line-height: 1.4;
  }

  .execTime {
    position: absolute;
    right: -4px;
    top: 8px;
    transform: translateX(100%);
    font-family: var(--nb-font-code);
    font-size: 10px;
    color: var(--nb-text-muted);
    user-select: none;
    white-space: nowrap;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .cellGutter {
      width: 28px;
    }

    .cellActions {
      position: relative;
      top: auto;
      right: auto;
      justify-content: flex-end;
      border: none;
      box-shadow: none;
      background: transparent;
      backdrop-filter: none;
      opacity: 1;
      transform: none;
      padding: 2px 0;
    }

    .execTime {
      display: none;
    }
  }
</style>
