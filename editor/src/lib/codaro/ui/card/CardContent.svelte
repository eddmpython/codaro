<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    children: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<div class={cn("px-4 py-3 text-[13px] text-fg", className)}>
  {@render children()}
</div>
