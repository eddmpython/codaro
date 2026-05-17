<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLabelAttributes } from "svelte/elements";
  import { cn } from "../utils";

  type Props = HTMLLabelAttributes & {
    class?: string;
    children: Snippet;
  };

  let { class: className, children, ...rest }: Props = $props();
</script>

<label
  class={cn(
    "text-[12px] font-medium text-fg-secondary leading-none peer-disabled:opacity-50 select-none",
    className,
  )}
  {...rest}
>
  {@render children()}
</label>
