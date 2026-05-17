<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { cn } from "../utils";

  type Props = HTMLInputAttributes & {
    class?: string;
    value?: string | number;
  };

  let { class: className, value = $bindable(""), ...rest }: Props = $props();
</script>

<input
  bind:value
  class={cn(
    "flex h-9 w-full rounded-md border border-border bg-surface-sunken px-3 py-1.5 text-[13px] text-fg shadow-sm transition-[border-color,box-shadow] duration-quick ease-standard",
    "placeholder:text-fg-muted",
    "focus-visible:outline-none focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base",
    "disabled:cursor-not-allowed disabled:opacity-50",
    className,
  )}
  {...rest}
/>
