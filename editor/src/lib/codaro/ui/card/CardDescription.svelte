<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    children: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<p class={cn("text-[12px] text-fg-secondary leading-relaxed", className)}>
  {@render children()}
</p>
