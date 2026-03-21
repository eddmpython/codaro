<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    id: string;
    groupId: string;
    size: number;
    collapsible?: boolean;
    class?: string;
    testId?: string;
    children: Snippet;
  }

  let {
    id,
    groupId,
    size,
    collapsible = false,
    class: className = "",
    testId,
    children
  }: Props = $props();
</script>

<div
  {id}
  class={className}
  data-testid={testId}
  data-panel-group-id={groupId}
  data-panel=""
  data-panel-collapsible={collapsible ? "true" : undefined}
  data-panel-id={id}
  data-panel-size={size.toFixed(1)}
  style="flex: {size} 1 0px; overflow: hidden;"
>
  {@render children()}
</div>
