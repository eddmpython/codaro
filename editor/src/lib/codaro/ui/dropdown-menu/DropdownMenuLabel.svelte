<script lang="ts">
  import { DropdownMenu as DropdownPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<DropdownPrimitive.GroupHeading
  class={cn("px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-fg-muted", className)}
>
  {@render children()}
</DropdownPrimitive.GroupHeading>
