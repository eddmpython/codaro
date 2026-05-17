<script lang="ts">
  interface Props {
    id: string;
    groupId: string;
    direction: "horizontal" | "vertical";
    controls: string;
    enabled?: boolean;
    collapsed?: boolean;
    valueNow?: number;
    valueMin?: number;
    valueMax?: number;
    class?: string;
  }

  let {
    id,
    groupId,
    direction,
    controls,
    enabled = false,
    collapsed = false,
    valueNow = 0,
    valueMin = 0,
    valueMax = 100,
    class: extraClass = "",
  }: Props = $props();

  const orientationClass = direction === "horizontal" ? "vertical" : "horizontal";
  let handleClass = $derived(
    `panel-resize-handle ${collapsed ? "resize-handle-collapsed" : "resize-handle"} ${orientationClass} ${extraClass} print:hidden z-10`,
  );
  let handleState = $derived(collapsed ? "collapsed" : "inactive");
</script>

<div
  class={handleClass}
  role="separator"
  data-panel-group-direction={direction}
  data-panel-group-id={groupId}
  data-resize-handle=""
  data-panel-resize-handle-enabled={enabled ? "true" : "false"}
  data-panel-resize-handle-id={id}
  data-resize-handle-state={handleState}
  aria-controls={controls}
  aria-valuemax={valueMax}
  aria-valuemin={valueMin}
  aria-valuenow={valueNow}
></div>

<style>
  .panel-resize-handle {
    background-color: transparent;
    transition:
      background-color var(--motion-quick) var(--ease-standard),
      width var(--motion-quick) var(--ease-standard),
      height var(--motion-quick) var(--ease-standard);
    touch-action: none;
    user-select: none;
    position: relative;
  }

  .panel-resize-handle.horizontal {
    height: 4px;
    cursor: row-resize;
  }
  .panel-resize-handle.vertical {
    width: 4px;
    cursor: col-resize;
  }

  .panel-resize-handle::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--border-subtle);
    transition: background-color var(--motion-quick) var(--ease-standard);
    pointer-events: none;
  }

  .panel-resize-handle:hover,
  .panel-resize-handle[data-resize-handle-active] {
    background-color: var(--state-accent-soft);
  }
  .panel-resize-handle:hover.horizontal,
  .panel-resize-handle[data-resize-handle-active].horizontal {
    height: 6px;
  }
  .panel-resize-handle:hover.vertical,
  .panel-resize-handle[data-resize-handle-active].vertical {
    width: 6px;
  }

  .panel-resize-handle:hover::before,
  .panel-resize-handle[data-resize-handle-active]::before {
    background-color: var(--state-accent-base);
  }
</style>
