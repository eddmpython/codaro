<script lang="ts">
  import { FileText, RefreshCw, Square } from "lucide-svelte";
  import CodeEditor from "./CodeEditor.svelte";
  import MarkdownBlock from "./MarkdownBlock.svelte";
  import OutputRenderer from "./OutputRenderer.svelte";

  export let block: {
    id: string;
    type: string;
    content: string;
    execution: {
      executionCount: number;
      status: string;
      lastOutput: unknown;
    };
  };
  export let active = false;
  export let onSelect = (): void => {};
  export let onRun = (): void => {};
  export let onChange = (content: string): void => {
    void content;
  };
  export let onToggleType = (): void => {};

  $: status = block.execution?.status || "idle";

  const cellActionButtonClass =
    "inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:opacity-50 disabled:pointer-events-none opacity-80 hover:opacity-100 active:opacity-100 h-7 px-2 rounded-md text-xs px-1";
  const cellSurfaceClass =
    "relative w-full overflow-hidden rounded-[10px] border border-border bg-background data-[selected=true]:ring-1 data-[selected=true]:ring-(--blue-8) data-[selected=true]:ring-offset-1";
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<marimo-cell
  id={`cell-${block.id}`}
  class="marimo-cell published group block"
  data-selected={active ? "true" : "false"}
  data-status={status}
  role="group"
  on:mousedown={onSelect}
  on:focusin={onSelect}
>
  {#if block.type === "code"}
    <div class={cellSurfaceClass} data-selected={active ? "true" : "false"} data-status={status}>
      <CodeEditor value={block.content} onChange={onChange} onRun={onRun} />

      <div class="absolute top-1 right-5">
        <div class="absolute right-3 top-2 z-20 flex hover-action gap-1">
          <button type="button" class={cellActionButtonClass} on:click|stopPropagation={onRun} aria-label="Run cell">
            {#if status === "running"}
              <Square class="h-4 w-4" />
            {:else}
              <RefreshCw class="h-4 w-4" />
            {/if}
          </button>
          <button
            type="button"
            class={cellActionButtonClass}
            data-testid="language-toggle-button"
            on:click|stopPropagation={onToggleType}
            aria-label="View as Markdown"
          >
            <FileText class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="output-area">
      <OutputRenderer result={block.execution?.lastOutput} />
    </div>
  {:else}
    <div class={cellSurfaceClass} data-selected={active ? "true" : "false"} data-status={status}>
      <CodeEditor value={block.content} onChange={onChange} />

      <div class="markdown-divider"></div>
      <div class="markdown-preview-shell">
        <MarkdownBlock value={block.content} active={active} onChange={onChange} />
      </div>

      <div class="absolute top-1 right-5">
        <div class="absolute right-3 top-2 z-20 flex hover-action gap-1">
          <button
            type="button"
            class={cellActionButtonClass}
            data-testid="language-toggle-button"
            on:click|stopPropagation={onToggleType}
            aria-label="View as Python"
          >
            <FileText class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  {/if}
</marimo-cell>

<style>
  marimo-cell {
    display: block;
  }

  [data-status="error"] {
    border-color: var(--red-8);
  }

  .markdown-divider {
    margin: 0 16px;
    border-top: 1px solid var(--slate-4);
  }

  .markdown-preview-shell {
    padding-top: 16px;
  }

  .hover-action {
    opacity: 0;
    transition: opacity 120ms ease;
  }

  marimo-cell:hover .hover-action,
  marimo-cell:focus-within .hover-action {
    opacity: 1;
  }
</style>
