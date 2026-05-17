<script lang="ts">
  interface OutlineEntry {
    id: string;
    label: string;
    level: number;
    cellId: string;
  }

  interface Props {
    entries?: OutlineEntry[];
    onNavigate?: (cellId: string) => void;
  }

  let {
    entries = [],
    onNavigate = () => {}
  }: Props = $props();
</script>

<div class="outline-panel" data-testid="outline-panel">
  {#if entries.length === 0}
    <div class="empty">
      <p class="text-muted-foreground text-sm">
        No outline available.
      </p>
      <p class="text-muted-foreground text-xs mt-1">
        Add markdown headers (#, ##, ###) to build an outline.
      </p>
    </div>
  {:else}
    <div class="outlineList">
      {#each entries as entry}
        <button
          class="outlineItem"
          style="padding-left: {8 + (entry.level - 1) * 16}px;"
          onclick={() => onNavigate(entry.cellId)}
        >
          {entry.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .outline-panel {
    height: 100%;
    overflow-y: auto;
  }

  .outlineList {
    padding: 4px 0;
  }

  .outlineItem {
    display: block;
    width: 100%;
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    border-radius: 0;
    transition: background-color var(--motion-quick) var(--ease-standard);
  }

  .outlineItem:hover {
    background: var(--surface-2);
  }

  .outlineItem:focus-visible {
    outline: none;
    background: var(--surface-3);
    box-shadow: inset 2px 0 0 0 var(--state-accent-base);
  }

  .empty {
    padding: 24px 16px;
    text-align: center;
  }
</style>
