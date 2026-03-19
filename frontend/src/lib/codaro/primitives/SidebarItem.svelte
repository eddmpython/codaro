<script lang="ts">
  import type { Snippet } from "svelte";

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
    children
  }: Props = $props();
</script>

<button
  class="flex items-center justify-center w-10 h-10 rounded-md cursor-pointer transition-colors
    {selected ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'}"
  title={tooltip}
  aria-pressed={selected}
  onclick={onclick}
>
  {@render children()}
</button>
