<script lang="ts">
  import { DropdownMenu as DropdownPrimitive } from "bits-ui";
  import { cn } from "../utils";

  type Props = { class?: string };
  let { class: className }: Props = $props();
</script>

<DropdownPrimitive.Separator class={cn("h-px my-1 -mx-1 bg-border-subtle", className)} />
