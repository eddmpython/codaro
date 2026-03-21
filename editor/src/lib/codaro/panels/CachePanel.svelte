<script lang="ts">
  import { Trash2, RefreshCw } from "lucide-svelte";

  interface CacheEntry {
    key: string;
    size: string;
    lastAccessed: number;
  }

  interface Props {
    entries?: CacheEntry[];
    totalSize?: string;
    onEvict?: (key: string) => void;
    onClearAll?: () => void;
    onRefresh?: () => void;
  }

  let {
    entries = [],
    totalSize = "0 B",
    onEvict = () => {},
    onClearAll = () => {},
    onRefresh = () => {}
  }: Props = $props();

  function formatTime(ts: number): string {
    if (!ts) {
      return "never";
    }
    const d = new Date(ts);
    return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
  }
</script>

<div class="cache-panel" data-testid="cache-panel">
  <div class="toolbar">
    <span class="text-xs text-muted-foreground">
      {entries.length} entries · {totalSize}
    </span>
    <div class="flex-1"></div>
    <button class="toolBtn" onclick={onRefresh} aria-label="Refresh">
      <RefreshCw class="h-3.5 w-3.5" />
    </button>
    <button class="toolBtn" onclick={onClearAll} aria-label="Clear all">
      <Trash2 class="h-3.5 w-3.5" />
    </button>
  </div>

  <div class="entryList">
    {#if entries.length === 0}
      <p class="empty text-muted-foreground text-sm p-4 text-center">
        No cached data.
      </p>
    {:else}
      {#each entries as entry}
        <div class="cacheRow">
          <div class="cacheInfo">
            <span class="cacheKey">{entry.key}</span>
            <span class="cacheMeta">{entry.size} · {formatTime(entry.lastAccessed)}</span>
          </div>
          <button class="iconBtn" onclick={() => onEvict(entry.key)} aria-label="Evict">
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .cache-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
  }

  .toolBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .toolBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .entryList {
    flex: 1;
    overflow-y: auto;
  }

  .cacheRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
  }

  .cacheRow:hover {
    background: var(--accent);
  }

  .cacheInfo {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cacheKey {
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    color: var(--foreground);
  }

  .cacheMeta {
    font-size: 10px;
    color: var(--muted-foreground);
  }

  .iconBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .iconBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }
</style>
