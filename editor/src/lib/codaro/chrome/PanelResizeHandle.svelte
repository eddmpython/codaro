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
    class: extraClass = ""
  }: Props = $props();

  const orientationClass = direction === "horizontal" ? "vertical" : "horizontal";
  let handleClass = $derived(
    `border-border print:hidden z-10 ${collapsed ? "resize-handle-collapsed" : "resize-handle"} ${orientationClass} ${extraClass}`
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
  style="touch-action: none; user-select: none;"
></div>
