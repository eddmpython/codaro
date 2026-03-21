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
    children
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
    transition: transform 0.2s, opacity 0.2s;
  }

  .sortableCell.is-moving {
    opacity: 0.5;
    transform: scale(0.98);
  }

  .sortableCell.is-drag-over {
    border-top: 2px solid var(--primary, hsl(240 5.9% 10%));
  }

  .sortableCell.is-selected {
    outline: 2px solid var(--ring, hsl(240 5.9% 65%));
    outline-offset: 2px;
  }
</style>
