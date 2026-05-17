<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<CommandPrimitive.Empty class={cn("py-8 text-center text-[13px] text-fg-muted", className)}>
  {@render children()}
</CommandPrimitive.Empty>
