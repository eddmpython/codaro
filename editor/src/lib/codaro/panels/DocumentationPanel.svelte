<script lang="ts">
  import { marked } from "marked";

  interface Props {
    content?: string;
    title?: string;
  }

  let {
    content = "",
    title = "Documentation"
  }: Props = $props();

  let rendered = $derived(content ? String(marked.parse(content)) : "");
</script>

<div class="docs-panel" data-testid="documentation-panel">
  {#if content}
    <div class="docsContent mo-markdown-renderer">
      {@html rendered}
    </div>
  {:else}
    <div class="empty">
      <p class="text-muted-foreground text-sm">
        Select a variable or function to see its documentation.
      </p>
      <p class="text-muted-foreground text-xs mt-2">
        Hover over or click on a name in the editor to display context help here.
      </p>
    </div>
  {/if}
</div>

<style>
  .docs-panel {
    height: 100%;
    overflow-y: auto;
  }

  .docsContent {
    padding: 12px 16px;
    font-size: 13px;
    line-height: 1.6;
  }

  .docsContent :global(h1),
  .docsContent :global(h2),
  .docsContent :global(h3) {
    margin: 16px 0 8px;
    font-weight: 600;
  }

  .docsContent :global(h1) {
    font-size: 18px;
  }

  .docsContent :global(h2) {
    font-size: 15px;
  }

  .docsContent :global(pre) {
    padding: 8px 12px;
    border-radius: 6px;
    background: var(--accent);
    font-size: 12px;
    overflow-x: auto;
  }

  .docsContent :global(code) {
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
  }

  .docsContent :global(p) {
    margin: 0 0 8px;
  }

  .empty {
    padding: 24px 16px;
    text-align: center;
  }
</style>
