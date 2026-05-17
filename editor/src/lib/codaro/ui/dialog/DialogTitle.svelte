<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import { cn } from "../utils";

  type Props = { class?: string; children: Snippet };
  let { class: className, children }: Props = $props();
</script>

<DialogPrimitive.Title
  class={cn("text-[15px] font-semibold leading-tight text-fg font-heading", className)}
>
  {@render children()}
</DialogPrimitive.Title>
