<script lang="ts">
  import { Undo2, Trash2 } from "lucide-svelte";

  interface Props {
    cellCount?: number;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let {
    cellCount = 0,
    onConfirm = () => {},
    onCancel = () => {}
  }: Props = $props();
</script>

{#if cellCount > 0}
  <div class="pendingDeleteBar" data-testid="pending-delete-bar">
    <span class="message">
      {cellCount} cell{cellCount !== 1 ? "s" : ""} will be deleted
    </span>
    <div class="actions">
      <button class="undoBtn" onclick={onCancel}>
        <Undo2 class="h-3.5 w-3.5" />
        <span>Undo</span>
      </button>
      <button class="confirmBtn" onclick={onConfirm}>
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
    gap: 16px;
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid var(--destructive);
    background: var(--background);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .message {
    font-size: 13px;
    color: var(--destructive);
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 6px;
  }

  .undoBtn,
  .confirmBtn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }

  .undoBtn {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
  }

  .undoBtn:hover {
    background: var(--accent);
  }

  .confirmBtn {
    border: 1px solid var(--destructive);
    background: var(--destructive);
    color: white;
  }

  .confirmBtn:hover {
    opacity: 0.9;
  }
</style>
