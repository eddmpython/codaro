<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    selected?: boolean;
    tooltip?: string;
    children: Snippet;
  }

  let {
    selected = false,
    tooltip,
    class: className = "",
    children,
    ...restProps
  }: Props = $props();

  const baseClass = "h-full flex items-center p-2 text-sm shadow-inset font-mono cursor-pointer rounded";
  const stateClass = selected ? "bg-(--sage-4)" : "hover:bg-(--sage-3)";
</script>

{#if tooltip}
  <div
    class="{baseClass} {stateClass} {className}"
    title={tooltip}
    {...restProps}
  >
    {@render children()}
  </div>
{:else}
  <div
    class="{baseClass} {stateClass} {className}"
    {...restProps}
  >
    {@render children()}
  </div>
{/if}
