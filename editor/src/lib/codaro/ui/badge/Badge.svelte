<script lang="ts" module>
  import { cva, type VariantProps } from "class-variance-authority";

  export const badgeVariants = cva(
    "inline-flex items-center gap-1 font-mono tabular-nums rounded-md select-none transition-colors duration-quick ease-standard whitespace-nowrap",
    {
      variants: {
        tone: {
          neutral: "bg-surface-3 text-fg-secondary ring-1 ring-border-subtle",
          accent: "bg-accent-soft text-accent-base ring-1 ring-accent-border",
          success: "bg-success-soft text-success-fg ring-1 ring-success-border",
          warning: "bg-warning-soft text-warning-fg ring-1 ring-warning-border",
          destructive: "bg-destructive-soft text-destructive-fg ring-1 ring-destructive-border",
          info: "bg-info-soft text-info-fg ring-1 ring-info-border",
          outline: "bg-transparent text-fg-secondary ring-1 ring-border",
        },
        size: {
          sm: "h-5 px-1.5 text-[10.5px]",
          md: "h-6 px-2 text-[11px]",
          lg: "h-7 px-2.5 text-[12px]",
        },
      },
      defaultVariants: { tone: "neutral", size: "sm" },
    },
  );

  export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;
  export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "../utils";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    class?: string;
    tone?: BadgeTone;
    size?: BadgeSize;
    children: Snippet;
  };

  let { class: className, tone = "neutral", size = "sm", children, ...rest }: Props = $props();
</script>

<span class={cn(badgeVariants({ tone, size }), className)} {...rest}>
  {@render children()}
</span>
