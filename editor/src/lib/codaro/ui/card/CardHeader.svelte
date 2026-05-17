<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    children: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<div class={cn("flex items-start justify-between gap-3 px-4 pt-4 pb-2", className)}>
  {@render children()}
</div>
