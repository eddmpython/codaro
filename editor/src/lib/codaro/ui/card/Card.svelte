<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "../utils";

  type Props = HTMLAttributes<HTMLDivElement> & {
    class?: string;
    elevated?: boolean;
    children: Snippet;
  };

  let { class: className, elevated = false, children, ...rest }: Props = $props();
</script>

<div
  class={cn(
    "rounded-lg border border-border bg-surface-1 text-fg",
    elevated ? "shadow-elev-md" : "shadow-elev-sm",
    className,
  )}
  {...rest}
>
  {@render children()}
</div>
