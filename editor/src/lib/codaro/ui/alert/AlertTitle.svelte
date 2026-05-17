<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<div class={cn("font-medium text-[13px] leading-tight mb-0.5", className)}>
  {@render children()}
</div>
