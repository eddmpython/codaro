<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    label?: string;
    loop?: boolean;
    children: Snippet;
  };

  let { class: className, label, loop = true, children }: Props = $props();
</script>

<CommandPrimitive.Root
  {label}
  {loop}
  class={cn("flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface-3 text-fg", className)}
>
  {@render children()}
</CommandPrimitive.Root>
