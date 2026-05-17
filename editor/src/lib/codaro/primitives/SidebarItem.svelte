<script lang="ts">
  import type { Snippet } from "svelte";
  import { Tooltip } from "$lib/codaro/ui";

  interface Props {
    selected?: boolean;
    tooltip?: string;
    onclick?: () => void;
    children: Snippet;
  }

  let {
    selected = false,
    tooltip,
    onclick,
    children,
  }: Props = $props();

  const baseClass =
    "relative flex items-center justify-center w-10 h-10 rounded-md cursor-pointer outline-none transition-[background,color] duration-quick ease-standard focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base";
  const stateClass = $derived(
    selected
      ? "bg-surface-3 text-fg"
      : "text-fg-secondary hover:bg-surface-2 hover:text-fg",
  );
  const stripeClass = $derived(
    selected
      ? "after:absolute after:left-0 after:top-1.5 after:bottom-1.5 after:w-[2px] after:rounded-full after:bg-accent-base after:content-['']"
      : "",
  );
</script>

{#if tooltip}
  <Tooltip label={tooltip} side="right">
    <button
      class={`${baseClass} ${stateClass} ${stripeClass}`}
      aria-pressed={selected}
      {onclick}
    >
      {@render children()}
    </button>
  </Tooltip>
{:else}
  <button
    class={`${baseClass} ${stateClass} ${stripeClass}`}
    aria-pressed={selected}
    {onclick}
  >
    {@render children()}
  </button>
{/if}
