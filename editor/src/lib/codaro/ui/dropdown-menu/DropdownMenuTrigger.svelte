<script lang="ts">
  import { DropdownMenu as DropdownPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<DropdownPrimitive.Trigger class={cn("outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base rounded-md", className)}>
  {@render children()}
</DropdownPrimitive.Trigger>
