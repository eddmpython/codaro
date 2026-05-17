<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/codaro/ui";

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
    ...rest
  }: Props = $props();

  const baseClass =
    "inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-[11px] font-mono leading-none cursor-pointer outline-none transition-[background,color] duration-quick ease-standard focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base";
  const stateClass = $derived(
    selected
      ? "bg-surface-3 text-fg"
      : "bg-surface-2/60 text-fg-secondary hover:bg-surface-2 hover:text-fg",
  );
</script>

<div
  class={cn(baseClass, stateClass, className)}
  title={tooltip}
  {...rest}
>
  {@render children()}
</div>
