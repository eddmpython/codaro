<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { X } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    overlayClass?: string;
    showClose?: boolean;
    children: Snippet;
  };

  let {
    class: className,
    overlayClass,
    showClose = true,
    children,
  }: Props = $props();
</script>

<DialogPrimitive.Portal>
  <DialogPrimitive.Overlay
    class={cn(
      "fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm",
      "transition-opacity duration-base ease-standard",
      "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
      overlayClass,
    )}
  />
  <DialogPrimitive.Content
    class={cn(
      "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
      "w-full max-w-lg max-h-[85vh] overflow-auto",
      "rounded-xl border border-border-subtle bg-surface-overlay backdrop-blur-xl backdrop-saturate-150",
      "shadow-elev-overlay ring-1 ring-white/5",
      "p-6 text-fg",
      "transition-[opacity,transform] duration-base ease-standard",
      "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
      "data-[state=open]:scale-100 data-[state=closed]:scale-95",
      "data-[state=open]:translate-y-[-50%] data-[state=closed]:translate-y-[calc(-50%+8px)]",
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
