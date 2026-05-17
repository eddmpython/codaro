<script lang="ts" module>
  import { cva, type VariantProps } from "class-variance-authority";

  export const alertVariants = cva(
    "relative w-full rounded-md border px-3 py-2.5 text-[13px] flex gap-2.5 items-start",
    {
      variants: {
        variant: {
          default: "bg-surface-2 border-border text-fg",
          info: "bg-info-soft border-info-border text-info-fg",
          success: "bg-success-soft border-success-border text-success-fg",
          warning: "bg-warning-soft border-warning-border text-warning-fg",
          destructive: "bg-destructive-soft border-destructive-border text-destructive-fg",
        },
      },
      defaultVariants: { variant: "default" },
    },
  );

  export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "../utils";

  type Props = HTMLAttributes<HTMLDivElement> & {
    class?: string;
    variant?: AlertVariant;
    icon?: Snippet;
    children: Snippet;
  };

  let { class: className, variant = "default", icon, children, ...rest }: Props = $props();
</script>

<div role="alert" class={cn(alertVariants({ variant }), className)} {...rest}>
  {#if icon}
    <span class="shrink-0 mt-px [&>svg]:h-4 [&>svg]:w-4">{@render icon()}</span>
  {/if}
  <div class="min-w-0 flex-1">
    {@render children()}
  </div>
</div>
