<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    children: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<div class={cn("flex items-center gap-2 px-4 pt-2 pb-4 border-t border-border-subtle", className)}>
  {@render children()}
</div>
