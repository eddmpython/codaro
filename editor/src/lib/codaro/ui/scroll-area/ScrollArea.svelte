<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "../utils";

  type Props = HTMLAttributes<HTMLDivElement> & {
    class?: string;
    orientation?: "vertical" | "horizontal" | "both";
    children: Snippet;
  };

  let { class: className, orientation = "vertical", children, ...rest }: Props = $props();

  const overflowClass = $derived(
    orientation === "vertical" ? "overflow-y-auto overflow-x-hidden"
    : orientation === "horizontal" ? "overflow-x-auto overflow-y-hidden"
    : "overflow-auto",
  );
</script>

<div
  class={cn(
    "relative",
    overflowClass,
    "[scrollbar-width:thin]",
    "[scrollbar-color:var(--zinc-700)_transparent]",
    "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2",
    "[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full",
    "[&::-webkit-scrollbar-thumb:hover]:bg-zinc-600",
    "[&::-webkit-scrollbar-track]:bg-transparent",
    className,
  )}
  {...rest}
>
  {@render children()}
</div>
