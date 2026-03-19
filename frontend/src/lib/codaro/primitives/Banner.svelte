<script lang="ts">
  import type { Snippet } from "svelte";

  type BannerKind = "danger" | "info" | "warn";

  interface Props {
    kind?: BannerKind;
    clickable?: boolean;
    children: Snippet;
  }

  let { kind = "info", clickable = false, children }: Props = $props();

  const kindClasses: Record<BannerKind, string> = {
    danger: "text-error border-(--red-6) shadow-md-solid shadow-error bg-(--red-1)",
    info: "text-primary border-(--blue-6) shadow-md-solid shadow-accent bg-(--blue-1)",
    warn: "border-(--yellow-6) bg-(--yellow-2) dark:bg-(--yellow-4) text-(--yellow-11) dark:text-(--yellow-12)"
  };

  const hoverClasses: Record<BannerKind, string> = {
    danger: "hover:bg-(--red-2)",
    info: "hover:bg-(--blue-2)",
    warn: "hover:bg-(--yellow-3)"
  };
</script>

<div
  class="text-sm p-2 border whitespace-pre-wrap overflow-hidden {kindClasses[kind]} {clickable ? `cursor-pointer ${hoverClasses[kind]}` : ''}"
  role={clickable ? "button" : undefined}
  tabindex={clickable ? 0 : undefined}
>
  {@render children()}
</div>
