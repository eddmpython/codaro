<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = {
    class?: string;
    children: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<h3 class={cn("text-[14px] font-medium text-fg leading-tight", className)}>
  {@render children()}
</h3>
