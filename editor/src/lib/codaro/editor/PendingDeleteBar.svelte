<script lang="ts">
  import { Undo2, Trash2 } from "lucide-svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  interface Props {
    cellCount?: number;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let {
    cellCount = 0,
    onConfirm = () => {},
    onCancel = () => {},
  }: Props = $props();
</script>

{#if cellCount > 0}
  <div
    class="pendingDeleteBar"
    data-testid="pending-delete-bar"
    in:fly={{ y: 16, duration: 280, easing: cubicOut }}
    out:fly={{ y: 16, duration: 140 }}
  >
    <Trash2 class="h-3.5 w-3.5 shrink-0" />
    <span class="message tabular-nums">
      {cellCount} cell{cellCount !== 1 ? "s" : ""} will be deleted
    </span>
    <span class="divider" aria-hidden="true"></span>
    <div class="actions">
      <button type="button" class="undoBtn" onclick={onCancel}>
        <Undo2 class="h-3.5 w-3.5" />
        <span>Undo</span>
      </button>
      <button type="button" class="confirmBtn" onclick={onConfirm}>
        <Trash2 class="h-3.5 w-3.5" />
        <span>Delete</span>
      </button>
    </div>
  </div>
{/if}

<style>
  .pendingDeleteBar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border-radius: 14px;
    border: 1px solid var(--state-destructive-border);
    background: var(--surface-overlay);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    color: var(--state-destructive-fg);
    box-shadow:
      0 1px 0 0 color-mix(in oklab, var(--state-destructive-base) 20%, transparent) inset,
      var(--elevation-overlay);
  }

  .message {
    font-size: 12px;
    font-family: var(--font-sans);
    color: var(--state-destructive-fg);
    white-space: nowrap;
  }

  .divider {
    width: 1px;
    height: 16px;
    background: color-mix(in oklab, var(--state-destructive-base) 25%, transparent);
  }

  .actions {
    display: flex;
    gap: 4px;
  }

  .undoBtn,
  .confirmBtn {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition:
      background var(--motion-quick) var(--ease-standard),
      color var(--motion-quick) var(--ease-standard),
      border-color var(--motion-quick) var(--ease-standard);
  }

  .undoBtn {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
  }

  .undoBtn:hover {
    background: var(--surface-2);
    color: var(--text-primary);
  }

  .undoBtn:focus-visible {
    outline: 2px solid var(--state-accent-ring);
    outline-offset: 1px;
  }

  .confirmBtn {
    border: 1px solid var(--state-destructive-base);
    background: var(--state-destructive-base);
    color: var(--zinc-50);
  }

  .confirmBtn:hover {
    background: var(--rose-600);
    border-color: var(--rose-600);
  }

  .confirmBtn:focus-visible {
    outline: 2px solid var(--state-destructive-ring);
    outline-offset: 1px;
  }

  :global(:root) .confirmBtn {
    --zinc-50: #FAFAFA;
  }
</style>
