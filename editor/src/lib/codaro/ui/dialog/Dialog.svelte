<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: Snippet;
  };

  let {
    open = $bindable(false),
    onOpenChange,
    children,
  }: Props = $props();
</script>

<DialogPrimitive.Root bind:open {onOpenChange}>
  {@render children()}
</DialogPrimitive.Root>
