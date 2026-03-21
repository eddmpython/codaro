<script lang="ts">
  import DataFrameTable from "./DataFrameTable.svelte";
  import LayoutRenderer from "./LayoutRenderer.svelte";
  import { normalizeOutput } from "../outputAdapter";
  import { sanitizeHtml } from "../utils/sanitize";
  import {
    ChevronDown,
    ChevronUp,
    Maximize2,
    Minimize2,
    Eraser,
    WrapText,
    X
  } from "lucide-svelte";

  interface Props {
    result?: unknown;
    stdinRequest?: { prompt: string } | null;
    onStdinSubmit?: (value: string) => void;
    onClearConsole?: () => void;
  }

  let {
    result = null,
    stdinRequest = null,
    onStdinSubmit,
    onClearConsole
  }: Props = $props();

  let expanded = $state(false);
  let isFullscreen = $state(false);
  let consoleWrap = $state(true);
  let consoleCollapsed = $state(false);
  let stdinValue = $state("");
  let outputAreaEl = $state<HTMLDivElement | null>(null);
  let needsExpand = $state(false);

  function isStructuredDescriptor(value: unknown): boolean {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;
    const type = record.type || record.kind;
    return typeof type === "string" && [
      "accordion",
      "callout",
      "column",
      "hstack",
      "html",
      "markdown",
      "plain",
      "sidebar",
      "stack",
      "stat",
      "tabs",
      "text",
      "ui",
      "vstack",
      "row"
    ].includes(type);
  }

  function imageSource(value: string): string {
    if (!value) {
      return "";
    }
    if (value.startsWith("data:")) {
      return value;
    }
    return `data:image/png;base64,${value}`;
  }

  function checkNeedsExpand() {
    if (!outputAreaEl) {
      needsExpand = false;
      return;
    }
    const lineCount = (output.text || "").split("\n").length
      + (output.stdout || "").split("\n").length
      + (output.stderr || "").split("\n").length;
    needsExpand = lineCount > 20 || outputAreaEl.scrollHeight > 500;
  }

  function handleStdinKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      onStdinSubmit?.(stdinValue);
      stdinValue = "";
    }
  }

  function handleClearConsole() {
    onClearConsole?.();
  }

  function openFullscreen() {
    isFullscreen = true;
  }

  function closeFullscreen() {
    isFullscreen = false;
  }

  let output = $derived(normalizeOutput(result));
  let payload = $derived(
    result && typeof result === "object" && "data" in (result as Record<string, unknown>)
      ? (result as Record<string, unknown>).data
      : null
  );
  let hasConsole = $derived(Boolean(output.stdout || (output.stderr && output.type !== "error")));

  $effect(() => {
    if (outputAreaEl) {
      checkNeedsExpand();
    }
  });
</script>

{#snippet outputContent()}
  {#if output.type === "error"}
    <pre class="codaro-error">{output.stderr || output.text}</pre>
  {:else if output.type === "html"}
    <div class="output htmlOutput">{@html sanitizeHtml(output.html)}</div>
  {:else if output.type === "image"}
    <div class="output media">
      <img class="imageOutput" src={imageSource(output.image)} alt="Cell output" />
    </div>
  {:else if output.type === "dataframe" && output.dataframe}
    <div class="output">
      <DataFrameTable dataframe={output.dataframe} />
    </div>
  {:else if isStructuredDescriptor(payload)}
    <div class="output">
      <LayoutRenderer value={payload} />
    </div>
  {:else if output.text}
    <pre class="return">{output.text}</pre>
  {/if}
{/snippet}

{#snippet consoleSection()}
  {#if hasConsole}
    <div class="console-output" class:collapsed={consoleCollapsed}>
      <div class="console-toolbar">
        <div class="console-labels">
          {#if output.stdout}
            <span class="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">stdout</span>
          {/if}
          {#if output.stderr && output.type !== "error"}
            <span class="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">stderr</span>
          {/if}
        </div>
        <div class="console-actions">
          <button
            class="console-btn"
            onclick={() => { consoleWrap = !consoleWrap; }}
            aria-label="Toggle wrap"
            title="Toggle line wrap"
          >
            <WrapText size={12} />
          </button>
          <button
            class="console-btn"
            onclick={handleClearConsole}
            aria-label="Clear console"
            title="Clear console"
          >
            <Eraser size={12} />
          </button>
          <button
            class="console-btn"
            onclick={() => { consoleCollapsed = !consoleCollapsed; }}
            aria-label="Toggle console"
            title={consoleCollapsed ? "Expand console" : "Collapse console"}
          >
            {#if consoleCollapsed}
              <ChevronDown size={12} />
            {:else}
              <ChevronUp size={12} />
            {/if}
          </button>
        </div>
      </div>

      {#if !consoleCollapsed}
        {#if output.stdout}
          <div
            class="stdout text-xs font-mono bg-muted/30 rounded px-3 py-2 mb-2"
            class:whitespace-pre-wrap={consoleWrap}
            class:whitespace-pre={!consoleWrap}
          >{output.stdout}</div>
        {/if}

        {#if output.stderr && output.type !== "error"}
          <div
            class="stderr text-xs font-mono bg-destructive/5 text-destructive/80 rounded px-3 py-2 mb-2"
            class:whitespace-pre-wrap={consoleWrap}
            class:whitespace-pre={!consoleWrap}
          >{output.stderr}</div>
        {/if}
      {/if}
    </div>
  {/if}
{/snippet}

{#if output.type !== "empty" || output.stdout || output.stderr || stdinRequest}
  <div class="output-area" bind:this={outputAreaEl}>
    {@render consoleSection()}

    <div
      class="return-area"
      class:capped={needsExpand && !expanded}
    >
      {#if needsExpand}
        <button
          class="fullscreen-btn"
          onclick={openFullscreen}
          aria-label="Fullscreen output"
          title="View fullscreen"
        >
          <Maximize2 size={14} />
        </button>
      {/if}

      {@render outputContent()}
    </div>

    {#if needsExpand && !expanded}
      <button
        class="expand-toggle"
        onclick={() => { expanded = true; }}
        aria-label="Show more output"
      >
        <ChevronDown size={14} />
        Show more
      </button>
    {/if}

    {#if expanded}
      <button
        class="expand-toggle"
        onclick={() => { expanded = false; }}
        aria-label="Show less output"
      >
        <ChevronUp size={14} />
        Show less
      </button>
    {/if}

    {#if stdinRequest}
      <div class="flex items-center gap-2 border-t border-border pt-2 mt-2">
        <span class="text-xs font-mono text-muted-foreground">stdin:</span>
        <input
          type="text"
          class="flex-1 h-7 text-sm font-mono border rounded px-2"
          placeholder={stdinRequest.prompt || ""}
          bind:value={stdinValue}
          onkeydown={handleStdinKeydown}
        />
      </div>
    {/if}
  </div>
{/if}

{#if isFullscreen}
  <div class="fullscreen-overlay" role="dialog" aria-modal="true">
    <div class="fullscreen-backdrop" role="presentation" onclick={closeFullscreen}></div>
    <div class="fullscreen-content">
      <button
        class="fullscreen-close"
        onclick={closeFullscreen}
        aria-label="Exit fullscreen"
      >
        <X size={16} />
      </button>
      {@render consoleSection()}
      {@render outputContent()}
    </div>
  </div>
{/if}

<style>
  .output-area {
    display: block;
    position: relative;
  }

  .return,
  .stderr,
  .stdout,
  .codaro-error {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .output {
    display: block;
  }

  .htmlOutput {
    overflow-x: auto;
  }

  .media {
    width: 100%;
  }

  .imageOutput {
    max-width: 100%;
  }

  .return-area {
    position: relative;
  }

  .return-area.capped {
    max-height: 500px;
    overflow: hidden;
  }

  .expand-toggle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    line-height: 1rem;
    color: var(--muted-foreground);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0;
    transition: color 150ms;
  }

  .expand-toggle:hover {
    color: var(--foreground);
  }

  .console-output {
    margin-bottom: 0.25rem;
  }

  .console-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 0.25rem 0;
    opacity: 0;
    transition: opacity 150ms;
  }

  .console-output:hover .console-toolbar {
    opacity: 1;
  }

  .console-output:focus-within .console-toolbar {
    opacity: 1;
  }

  .console-labels {
    display: flex;
    gap: 0.5rem;
  }

  .console-actions {
    display: flex;
    gap: 0.25rem;
  }

  .console-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.25rem;
    color: var(--muted-foreground);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 150ms, background-color 150ms;
  }

  .console-btn:hover {
    color: var(--foreground);
    background-color: var(--muted);
  }

  .fullscreen-btn {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.25rem;
    color: var(--muted-foreground);
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 150ms, color 150ms, background-color 150ms;
  }

  .return-area:hover .fullscreen-btn {
    opacity: 1;
  }

  .fullscreen-btn:hover {
    color: var(--foreground);
    background-color: var(--muted);
  }

  .fullscreen-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fullscreen-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  }

  .fullscreen-content {
    position: relative;
    z-index: 1;
    background: var(--background);
    border-radius: 0.5rem;
    padding: 1.5rem;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .fullscreen-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.25rem;
    color: var(--muted-foreground);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 150ms;
  }

  .fullscreen-close:hover {
    color: var(--foreground);
  }

  .collapsed .stdout,
  .collapsed .stderr {
    display: none;
  }
</style>
