<script lang="ts">
  import { Copy, Trash2, EyeOff, Play, X } from "lucide-svelte";

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
    onClearSelection = () => {}
  }: Props = $props();
</script>

{#if selectedCount > 1}
  <div class="multiCellToolbar" data-testid="multi-cell-toolbar">
    <span class="selectCount">{selectedCount} cells selected</span>

    <div class="actions">
      <button class="toolBtn" onclick={onRun} aria-label="Run selected">
        <Play class="h-4 w-4" />
        <span>Run</span>
      </button>
      <button class="toolBtn" onclick={onDuplicate} aria-label="Duplicate selected">
        <Copy class="h-4 w-4" />
        <span>Duplicate</span>
      </button>
      <button class="toolBtn" onclick={onHideCode} aria-label="Hide code">
        <EyeOff class="h-4 w-4" />
        <span>Hide</span>
      </button>
      <button class="toolBtn danger" onclick={onDelete} aria-label="Delete selected">
        <Trash2 class="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>

    <button class="clearBtn" onclick={onClearSelection} aria-label="Clear selection">
      <X class="h-4 w-4" />
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
    gap: 12px;
    padding: 8px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--background);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .selectCount {
    font-size: 13px;
    font-weight: 500;
    color: var(--foreground);
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 4px;
  }

  .toolBtn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    font-size: 12px;
    color: var(--foreground);
    cursor: pointer;
  }

  .toolBtn:hover {
    background: var(--accent);
  }

  .toolBtn.danger:hover {
    background: hsl(0 84.2% 60.2% / 0.1);
    border-color: var(--destructive);
    color: var(--destructive);
  }

  .clearBtn {
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

  .clearBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }
</style>
