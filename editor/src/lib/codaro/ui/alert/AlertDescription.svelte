<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<div class={cn("text-[12.5px] opacity-90 leading-relaxed", className)}>
  {@render children()}
</div>
