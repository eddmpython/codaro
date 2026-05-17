<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<div class={cn("flex flex-col gap-1 mb-4", className)}>
  {@render children()}
</div>
