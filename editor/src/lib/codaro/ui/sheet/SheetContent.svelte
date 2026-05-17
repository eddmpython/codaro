<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { X } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Side = "top" | "right" | "bottom" | "left";

  type Props = {
    class?: string;
    side?: Side;
    showClose?: boolean;
    children: Snippet;
  };

  let {
    class: className,
    side = "right",
    showClose = true,
    children,
  }: Props = $props();

  const sideClasses: Record<Side, string> = {
    top: "inset-x-0 top-0 border-b max-h-[85vh] data-[state=closed]:-translate-y-full data-[state=open]:translate-y-0",
    bottom: "inset-x-0 bottom-0 border-t max-h-[85vh] data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
    left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
    right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
  };
</script>

<DialogPrimitive.Portal>
  <DialogPrimitive.Overlay
    class={cn(
      "fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm",
      "transition-opacity duration-base ease-standard",
      "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
    )}
  />
  <DialogPrimitive.Content
    class={cn(
      "fixed z-50 bg-surface-overlay backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/5 border-border-subtle shadow-elev-overlay text-fg p-6 overflow-auto",
      "transition-transform duration-base ease-standard",
      sideClasses[side],
      "outline-none focus:outline-none",
      className,
    )}
  >
    {@render children()}
    {#if showClose}
      <DialogPrimitive.Close
        class="absolute right-3 top-3 rounded-md p-1.5 text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors duration-quick outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
        aria-label="Close"
      >
        <X class="h-4 w-4" />
      </DialogPrimitive.Close>
    {/if}
  </DialogPrimitive.Content>
</DialogPrimitive.Portal>
