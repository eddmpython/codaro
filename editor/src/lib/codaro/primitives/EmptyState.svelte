<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/codaro/ui";

  interface Props {
    title: string;
    body?: string;
    mascot?: Snippet;
    icon?: Snippet;
    actions?: Snippet;
    class?: string;
    compact?: boolean;
  }

  let {
    title,
    body,
    mascot,
    icon,
    actions,
    class: className,
    compact = false,
  }: Props = $props();
</script>

<div
  class={cn(
    "flex flex-col items-center justify-center text-center mx-auto",
    compact ? "gap-3 py-8 max-w-xs" : "gap-4 py-16 max-w-md",
    className,
  )}
>
  {#if mascot}
    <div class="empty-mascot mb-1">
      {@render mascot()}
    </div>
  {:else if icon}
    <div class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-surface-2 ring-1 ring-border-subtle text-fg-muted [&>svg]:h-6 [&>svg]:w-6">
      {@render icon()}
    </div>
  {/if}

  <div class="space-y-1.5">
    <h3 class={cn("font-heading text-fg leading-tight", compact ? "text-[16px]" : "text-[20px]")}>
      {title}
    </h3>
    {#if body}
      <p class="text-[13px] leading-relaxed text-fg-muted max-w-prose">{body}</p>
    {/if}
  </div>

  {#if actions}
    <div class="flex items-center gap-2 mt-1">
      {@render actions()}
    </div>
  {/if}
</div>

<style>
  @keyframes empty-mascot-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .empty-mascot {
    animation: empty-mascot-float 4s ease-in-out infinite;
    width: 160px;
    max-width: 60vw;
  }

  .empty-mascot :global(img),
  .empty-mascot :global(svg) {
    width: 100%;
    height: auto;
  }
</style>
