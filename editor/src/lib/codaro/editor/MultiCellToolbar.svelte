<script lang="ts">
  import { Copy, Trash2, EyeOff, Play, X } from "lucide-svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  interface Props {
    selectedCount?: number;
    onRun?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onHideCode?: () => void;
    onClearSelection?: () => void;
  }

  let {
    selectedCount = 0,
    onRun = () => {},
    onDelete = () => {},
    onDuplicate = () => {},
    onHideCode = () => {},
    onClearSelection = () => {},
  }: Props = $props();
</script>

{#if selectedCount > 1}
  <div
    class="multiCellToolbar"
    data-testid="multi-cell-toolbar"
    in:fly={{ y: 16, duration: 280, easing: cubicOut }}
    out:fly={{ y: 16, duration: 140 }}
  >
    <span class="selectCount tabular-nums">{selectedCount} selected</span>

    <span class="divider" aria-hidden="true"></span>

    <div class="actions">
      <button class="toolBtn" type="button" onclick={onRun} aria-label="Run selected">
        <Play class="h-3.5 w-3.5" />
        <span>Run</span>
      </button>
      <button class="toolBtn" type="button" onclick={onDuplicate} aria-label="Duplicate selected">
        <Copy class="h-3.5 w-3.5" />
        <span>Duplicate</span>
      </button>
      <button class="toolBtn" type="button" onclick={onHideCode} aria-label="Hide code">
        <EyeOff class="h-3.5 w-3.5" />
        <span>Hide</span>
      </button>
      <button class="toolBtn danger" type="button" onclick={onDelete} aria-label="Delete selected">
        <Trash2 class="h-3.5 w-3.5" />
        <span>Delete</span>
      </button>
    </div>

    <span class="divider" aria-hidden="true"></span>

    <button
      class="clearBtn"
      type="button"
      onclick={onClearSelection}
      aria-label="Clear selection"
    >
      <X class="h-3.5 w-3.5" />
    </button>
  </div>
{/if}

<style>
  .multiCellToolbar {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 14px;
    border: 1px solid var(--border-subtle);
    background: var(--surface-overlay);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    box-shadow:
      0 1px 0 0 rgba(255, 255, 255, 0.05) inset,
      var(--elevation-overlay);
  }

  .selectCount {
    font-size: 12px;
    font-family: var(--font-sans);
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .divider {
    width: 1px;
    height: 16px;
    background: var(--border);
  }

  .actions {
    display: flex;
    gap: 2px;
  }

  .toolBtn {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background var(--motion-quick) var(--ease-standard), color var(--motion-quick) var(--ease-standard), border-color var(--motion-quick) var(--ease-standard);
  }

  .toolBtn:hover {
    background: var(--surface-2);
    color: var(--text-primary);
  }

  .toolBtn:focus-visible {
    outline: 2px solid var(--state-accent-ring);
    outline-offset: 1px;
  }

  .toolBtn.danger:hover {
    background: var(--state-destructive-soft);
    border-color: var(--state-destructive-border);
    color: var(--state-destructive-fg);
  }

  .clearBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: background var(--motion-quick) var(--ease-standard), color var(--motion-quick) var(--ease-standard);
  }

  .clearBtn:hover {
    background: var(--surface-2);
    color: var(--text-primary);
  }
</style>
