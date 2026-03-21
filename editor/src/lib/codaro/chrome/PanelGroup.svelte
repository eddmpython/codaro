<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    id: string;
    direction: "horizontal" | "vertical";
    autoSaveId?: string;
    children: Snippet;
  }

  let { id, direction, autoSaveId, children }: Props = $props();

  let style = $derived(
    direction === "horizontal"
      ? "display: flex; flex-direction: row; height: 100%; overflow: hidden; width: 100%;"
      : "display: flex; flex-direction: column; height: 100%; overflow: hidden; width: 100%;"
  );
</script>

<div
  data-panel-group=""
  data-panel-group-direction={direction}
  data-panel-group-id={id}
  {style}
>
  {@render children()}
</div>
