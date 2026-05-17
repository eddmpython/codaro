<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<CommandPrimitive.List
  class={cn("max-h-[400px] overflow-y-auto overflow-x-hidden p-1.5", className)}
>
  <CommandPrimitive.Viewport>
    {@render children()}
  </CommandPrimitive.Viewport>
</CommandPrimitive.List>
