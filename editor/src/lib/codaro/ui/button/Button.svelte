<script lang="ts" module>
  import { cva, type VariantProps } from "class-variance-authority";

  export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-[background,border-color,color,box-shadow] duration-quick ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:pointer-events-none disabled:opacity-50 select-none",
    {
      variants: {
        variant: {
          default: "bg-zinc-200 text-zinc-900 hover:bg-zinc-100 active:bg-zinc-300 shadow-elev-sm",
          secondary: "bg-surface-2 text-fg hover:bg-surface-3 border border-border",
          destructive: "bg-destructive-base text-zinc-50 hover:bg-rose-600 shadow-elev-sm",
          accent: "bg-accent-base text-zinc-50 hover:bg-sky-600 shadow-elev-sm",
          outline: "bg-transparent border border-border text-fg hover:bg-surface-2 hover:border-border-strong",
          ghost: "bg-transparent text-fg hover:bg-surface-2",
          link: "bg-transparent text-accent-base hover:underline underline-offset-2 px-0",
          subtle: "bg-surface-1 text-fg-secondary hover:bg-surface-2 hover:text-fg border border-border-subtle",
        },
        size: {
          xs: "h-6 px-2 text-[11px] rounded-md gap-1",
          sm: "h-8 px-2.5 text-[12px] rounded-md",
          md: "h-9 px-3 text-[13px] rounded-md",
          lg: "h-10 px-4 text-[14px] rounded-lg",
          icon: "h-8 w-8 rounded-md",
          "icon-sm": "h-7 w-7 rounded-md",
          "icon-xs": "h-6 w-6 rounded-md",
        },
      },
      defaultVariants: {
        variant: "secondary",
        size: "md",
      },
    },
  );

  export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
  export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from "svelte/elements";
  import { cn } from "../utils";

  type Props = (HTMLButtonAttributes | HTMLAnchorAttributes) & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    href?: string;
    class?: string;
    children: Snippet;
  };

  let {
    variant = "secondary",
    size = "md",
    href,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

{#if href}
  <a {href} class={cn(buttonVariants({ variant, size }), className)} {...rest as HTMLAnchorAttributes}>
    {@render children()}
  </a>
{:else}
  <button class={cn(buttonVariants({ variant, size }), className)} {...rest as HTMLButtonAttributes}>
    {@render children()}
  </button>
{/if}
