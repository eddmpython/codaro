<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    cellId: string;
    isMoving?: boolean;
    isDragOver?: boolean;
    isSelected?: boolean;
    onDragStart?: (cellId: string) => void;
    onDragEnd?: () => void;
    onDragOver?: (cellId: string) => void;
    onDrop?: (cellId: string) => void;
    children: Snippet;
  }

  let {
    cellId,
    isMoving = false,
    isDragOver = false,
    isSelected = false,
    onDragStart = () => {},
    onDragEnd = () => {},
    onDragOver = () => {},
    onDrop = () => {},
    children,
  }: Props = $props();

  function handleDragStart(e: DragEvent): void {
    e.dataTransfer?.setData("text/plain", cellId);
    onDragStart(cellId);
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    onDragOver(cellId);
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault();
    onDrop(cellId);
  }
</script>

<div
  class="sortableCell outline-hidden rounded-lg"
  class:is-moving={isMoving}
  class:is-drag-over={isDragOver}
  class:is-selected={isSelected}
  data-cell-id={cellId}
  draggable="true"
  ondragstart={handleDragStart}
  ondragend={onDragEnd}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  role="listitem"
>
  {@render children()}
</div>

<style>
  .sortableCell {
    position: relative;
    transition:
      transform var(--motion-base) var(--ease-standard),
      opacity var(--motion-base) var(--ease-standard),
      filter var(--motion-base) var(--ease-standard),
      box-shadow var(--motion-base) var(--ease-standard);
  }

  .sortableCell.is-moving {
    opacity: 0.85;
    transform: scale(1.01);
    box-shadow: var(--elevation-lg);
    z-index: 40;
  }

  .sortableCell.is-drag-over::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -10px;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--state-accent-base) 20%,
      var(--state-accent-base) 80%,
      transparent 100%
    );
    box-shadow: 0 0 8px color-mix(in oklab, var(--state-accent-base) 60%, transparent);
    pointer-events: none;
    animation: drop-indicator-in var(--motion-quick) var(--ease-decel);
  }

  @keyframes drop-indicator-in {
    from {
      opacity: 0;
      transform: scaleX(0.6);
    }
    to {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  .sortableCell.is-selected {
    outline: 2px solid var(--state-accent-ring);
    outline-offset: 2px;
  }

  /* While any sibling is being moved, dim non-active cells */
  :global([data-is-dragging="true"]) .sortableCell:not(.is-moving) {
    filter: brightness(0.85);
  }
</style>
