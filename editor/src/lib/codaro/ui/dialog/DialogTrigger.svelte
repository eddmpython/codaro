<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    children: Snippet;
    asChild?: boolean;
  };

  let { class: className, children, asChild = false }: Props = $props();
</script>

{#if asChild}
  <DialogPrimitive.Trigger class={cn(className)}>
    {#snippet child({ props })}
      <span {...props}>{@render children()}</span>
    {/snippet}
  </DialogPrimitive.Trigger>
{:else}
  <DialogPrimitive.Trigger class={cn("outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base rounded-md", className)}>
    {@render children()}
  </DialogPrimitive.Trigger>
{/if}
