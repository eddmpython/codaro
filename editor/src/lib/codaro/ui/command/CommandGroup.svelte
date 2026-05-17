<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    heading?: string;
    children: Snippet;
  };

  let { class: className, heading, children }: Props = $props();
</script>

<CommandPrimitive.Group class={cn("text-fg", className)}>
  {#if heading}
    <CommandPrimitive.GroupHeading
      class="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-fg-muted"
    >
      {heading}
    </CommandPrimitive.GroupHeading>
  {/if}
  <CommandPrimitive.GroupItems>
    {@render children()}
  </CommandPrimitive.GroupItems>
</CommandPrimitive.Group>
