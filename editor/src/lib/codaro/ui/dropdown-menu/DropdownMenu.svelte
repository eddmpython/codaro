<script lang="ts">
  import { DropdownMenu as DropdownPrimitive } from "bits-ui";
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

<DropdownPrimitive.Root bind:open {onOpenChange}>
  {@render children()}
</DropdownPrimitive.Root>
