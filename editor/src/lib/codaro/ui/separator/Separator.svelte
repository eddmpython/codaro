<script lang="ts">
  import { cn } from "../utils";

  type Props = {
    class?: string;
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
  };

  let { class: className, orientation = "horizontal", decorative = true }: Props = $props();
</script>

<div
  role={decorative ? "none" : "separator"}
  aria-orientation={decorative ? undefined : orientation}
  class={cn(
    "bg-border-subtle shrink-0",
    orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
    className,
  )}
></div>
