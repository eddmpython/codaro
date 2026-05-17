<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<div class={cn("mt-6 flex justify-end gap-2", className)}>
  {@render children()}
</div>
