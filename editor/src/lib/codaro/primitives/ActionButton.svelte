<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button, type ButtonVariant, type ButtonSize } from "$lib/codaro/ui";

  type LegacyColor = "gray" | "white" | "green" | "red" | "yellow" | "hint-green" | "disabled";
  type LegacyShape = "rectangle" | "circle";
  type LegacySize = "small" | "medium";

  interface Props extends HTMLButtonAttributes {
    color?: LegacyColor;
    shape?: LegacyShape;
    size?: LegacySize;
    children: Snippet;
  }

  let {
    color = "gray",
    shape = "rectangle",
    size = "medium",
    class: className = "",
    disabled,
    children,
    ...rest
  }: Props = $props();

  const variantMap: Record<LegacyColor, ButtonVariant> = {
    gray: "secondary",
    white: "outline",
    green: "secondary",
    red: "destructive",
    yellow: "secondary",
    "hint-green": "secondary",
    disabled: "secondary",
  };

  const colorClassMap: Record<LegacyColor, string> = {
    gray: "",
    white: "",
    green: "bg-success-soft text-success-fg border-success-border hover:bg-success-soft hover:border-success-base",
    red: "",
    yellow: "bg-warning-soft text-warning-fg border-warning-border hover:bg-warning-soft hover:border-warning-base",
    "hint-green": "bg-success-soft text-success-fg border-success-border",
    disabled: "opacity-50 cursor-not-allowed",
  };

  const sizeMap: Record<LegacySize, Record<LegacyShape, ButtonSize>> = {
    small: { rectangle: "icon-xs", circle: "icon-xs" },
    medium: { rectangle: "sm", circle: "icon-sm" },
  };

  const variant = $derived(variantMap[color]);
  const buttonSize = $derived(sizeMap[size][shape]);
  const shapeClass = $derived(shape === "circle" ? "rounded-full" : "");
  const isDisabled = $derived(disabled || color === "disabled");
</script>

<Button
  variant={variant}
  size={buttonSize}
  disabled={isDisabled}
  class={`${shapeClass} ${colorClassMap[color]} ${className}`}
  {...rest}
>
  {@render children()}
</Button>
