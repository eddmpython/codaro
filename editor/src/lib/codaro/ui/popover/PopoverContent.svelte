<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    children: Snippet;
  };

  let {
    class: className,
    side = "bottom",
    align = "center",
    sideOffset = 6,
    children,
  }: Props = $props();
</script>

<PopoverPrimitive.Portal>
  <PopoverPrimitive.Content
    {side}
    {align}
    {sideOffset}
    class={cn(
      "z-50 min-w-[8rem] rounded-md border border-border-subtle bg-surface-3 ring-1 ring-white/5 p-1 shadow-elev-md",
      "transition-[opacity,transform] duration-quick ease-standard",
      "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
      "data-[state=open]:scale-100 data-[state=closed]:scale-95",
      "outline-none",
      className,
    )}
  >
    {@render children()}
  </PopoverPrimitive.Content>
</PopoverPrimitive.Portal>
