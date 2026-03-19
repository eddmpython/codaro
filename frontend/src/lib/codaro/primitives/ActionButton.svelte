<script lang="ts">
  import { cva, type VariantProps } from "class-variance-authority";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  const buttonVariants = cva(
    "flex items-center justify-center m-0 leading-none font-medium border border-foreground/10 shadow-xs-solid active:shadow-none dark:border-border text-sm",
    {
      variants: {
        color: {
          gray: "mo-button gray",
          white: "mo-button white",
          green: "mo-button green",
          red: "mo-button red",
          yellow: "mo-button yellow",
          "hint-green": "mo-button hint-green",
          disabled: "mo-button disabled active:shadow-xs-solid"
        },
        shape: {
          rectangle: "rounded",
          circle: "rounded-full"
        },
        size: {
          small: "",
          medium: ""
        }
      },
      compoundVariants: [
        { size: "small", shape: "circle", class: "h-[24px] w-[24px] px-[5.5px] py-[5.5px]" },
        { size: "medium", shape: "circle", class: "px-2 py-2" },
        { size: "small", shape: "rectangle", class: "px-1 py-1 h-[24px] w-[24px]" },
        { size: "medium", shape: "rectangle", class: "px-3 py-2" }
      ],
      defaultVariants: {
        color: "gray",
        shape: "rectangle",
        size: "medium"
      }
    }
  );

  type ButtonColor = NonNullable<VariantProps<typeof buttonVariants>["color"]>;
  type ButtonShape = NonNullable<VariantProps<typeof buttonVariants>["shape"]>;
  type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

  interface Props extends HTMLButtonAttributes {
    color?: ButtonColor;
    shape?: ButtonShape;
    size?: ButtonSize;
    children: Snippet;
  }

  let {
    color = "gray",
    shape = "rectangle",
    size = "medium",
    class: className = "",
    children,
    ...restProps
  }: Props = $props();
</script>

<button
  class="{buttonVariants({ color, shape, size })} {className}"
  {...restProps}
>
  {@render children()}
</button>
