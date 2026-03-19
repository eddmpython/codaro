<script lang="ts">
  import { X, AlertTriangle } from "lucide-svelte";

  interface RecoveryEntry {
    id: string;
    filename: string;
    timestamp: number;
    cellCount: number;
  }

  interface Props {
    open?: boolean;
    recoveries?: RecoveryEntry[];
    onRecover?: (id: string) => void;
    onDiscard?: (id: string) => void;
    onClose?: () => void;
  }

  let {
    open = false,
    recoveries = [],
    onRecover = () => {},
    onDiscard = () => {},
    onClose = () => {}
  }: Props = $props();

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }
</script>

{#if open}
  <div class="overlay" role="presentation" onclick={onClose}>
    <div
      class="dialog"
      role="dialog"
      aria-label="Recovery"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="header">
        <div class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-amber-500" />
          <h3>Recover unsaved work</h3>
        </div>
        <button class="closeBtn" onclick={onClose} aria-label="Close">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="body">
        {#if recoveries.length === 0}
          <p class="text-muted-foreground text-sm">No recovery data found.</p>
        {:else}
          {#each recoveries as entry}
            <div class="recoveryItem">
              <div class="info">
                <span class="filename">{entry.filename}</span>
                <span class="meta">{entry.cellCount} cells · {formatTime(entry.timestamp)}</span>
              </div>
              <div class="actions">
                <button class="recoverBtn" onclick={() => onRecover(entry.id)}>Recover</button>
                <button class="discardBtn" onclick={() => onDiscard(entry.id)}>Discard</button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog {
    width: 100%;
    max-width: 480px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--background);
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .closeBtn {
    display: flex;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .body {
    padding: 16px 20px;
    max-height: 400px;
    overflow-y: auto;
  }

  .recoveryItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .filename {
    font-size: 13px;
    font-weight: 500;
  }

  .meta {
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .actions {
    display: flex;
    gap: 6px;
  }

  .recoverBtn,
  .discardBtn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }

  .recoverBtn {
    border: none;
    background: var(--primary, hsl(240 5.9% 10%));
    color: var(--primary-foreground, white);
  }

  .discardBtn {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted-foreground);
  }

  .discardBtn:hover {
    background: var(--accent);
  }
</style>
