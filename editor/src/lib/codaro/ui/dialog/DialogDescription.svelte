<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<DialogPrimitive.Description
  class={cn("text-[13px] leading-relaxed text-fg-secondary", className)}
>
  {@render children()}
</DialogPrimitive.Description>
