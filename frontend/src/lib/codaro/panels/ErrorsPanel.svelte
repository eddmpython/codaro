<script lang="ts">
  import { AlertCircle, X } from "lucide-svelte";

  interface ErrorEntry {
    id: string;
    cellId: string;
    cellName?: string;
    message: string;
    traceback?: string;
    timestamp: number;
  }

  interface Props {
    errors?: ErrorEntry[];
    onNavigateToCell?: (cellId: string) => void;
    onDismiss?: (id: string) => void;
    onClearAll?: () => void;
  }

  let {
    errors = [],
    onNavigateToCell = () => {},
    onDismiss = () => {},
    onClearAll = () => {}
  }: Props = $props();

  let expandedIds = $state(new Set<string>());

  function toggleExpanded(id: string): void {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    expandedIds = next;
  }
</script>

<div class="errors-panel" data-testid="errors-panel">
  {#if errors.length > 0}
    <div class="toolbar">
      <span class="text-xs text-muted-foreground">{errors.length} error{errors.length !== 1 ? "s" : ""}</span>
      <button class="clearBtn" onclick={onClearAll}>Clear all</button>
    </div>
  {/if}

  <div class="errorList">
    {#if errors.length === 0}
      <div class="empty">
        <AlertCircle class="h-5 w-5 text-muted-foreground mb-2" />
        <p class="text-muted-foreground text-sm">No errors.</p>
      </div>
    {:else}
      {#each errors as error}
        <div class="errorItem">
          <div class="errorHeader">
            <button class="errorTitle" onclick={() => toggleExpanded(error.id)}>
              <AlertCircle class="h-3.5 w-3.5 text-destructive" />
              <span class="errorMsg">{error.message}</span>
            </button>
            <div class="errorActions">
              {#if error.cellName}
                <button class="cellLink" onclick={() => onNavigateToCell(error.cellId)}>
                  {error.cellName}
                </button>
              {/if}
              <button class="dismissBtn" onclick={() => onDismiss(error.id)} aria-label="Dismiss">
                <X class="h-3 w-3" />
              </button>
            </div>
          </div>
          {#if expandedIds.has(error.id) && error.traceback}
            <pre class="traceback">{error.traceback}</pre>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .errors-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
  }

  .clearBtn {
    padding: 2px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    font-size: 11px;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .clearBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .errorList {
    flex: 1;
    overflow-y: auto;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
  }

  .errorItem {
    border-bottom: 1px solid var(--border);
  }

  .errorHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
  }

  .errorTitle {
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    color: var(--foreground);
    font-size: 12px;
    cursor: pointer;
    text-align: left;
  }

  .errorMsg {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .errorActions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cellLink {
    padding: 2px 6px;
    border: none;
    border-radius: 4px;
    background: var(--accent);
    font-size: 10px;
    font-family: var(--monospace-font, monospace);
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .cellLink:hover {
    color: var(--foreground);
  }

  .dismissBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .dismissBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .traceback {
    margin: 0;
    padding: 8px 10px;
    background: var(--accent);
    font-family: var(--monospace-font, monospace);
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--destructive, #b91c1c);
    overflow-x: auto;
  }
</style>
