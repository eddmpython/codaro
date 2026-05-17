<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<DialogPrimitive.Close class={cn("outline-none", className)}>
  {@render children()}
</DialogPrimitive.Close>
