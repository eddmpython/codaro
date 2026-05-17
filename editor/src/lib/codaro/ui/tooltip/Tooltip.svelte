<script lang="ts">
  import { Tooltip as TooltipPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    label: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    delay?: number;
    contentClass?: string;
    children: Snippet;
  };

  let {
    label,
    side = "top",
    align = "center",
    delay = 220,
    contentClass,
    children,
  }: Props = $props();
</script>

<TooltipPrimitive.Provider delayDuration={delay}>
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger>
      {@render children()}
    </TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        {side}
        {align}
        sideOffset={6}
        class={cn(
          "z-50 rounded-md bg-surface-3 px-2 py-1 text-[11px] text-fg shadow-elev-md ring-1 ring-border-subtle",
          "transition-[opacity,transform] duration-quick ease-standard",
          "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          "data-[state=closed]:scale-95 data-[state=open]:scale-100",
          contentClass,
        )}
      >
        {label}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
</TooltipPrimitive.Provider>
