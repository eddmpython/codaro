<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/codaro/ui";

  interface Props {
    title?: string;
    eyebrow?: string;
    accent?: "emerald" | "sky" | "violet" | "amber" | "neutral";
    actions?: Snippet;
    children: Snippet;
    class?: string;
  }

  let {
    title,
    eyebrow,
    accent = "emerald",
    actions,
    children,
    class: className,
  }: Props = $props();

  const stripeClass: Record<NonNullable<Props["accent"]>, string> = {
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    neutral: "bg-zinc-600",
  };
</script>

<section
  class={cn(
    "relative rounded-xl bg-surface-2 ring-1 ring-border-subtle p-6 shadow-elev-sm",
    className,
  )}
>
  {#if accent !== "neutral"}
    <span
      aria-hidden="true"
      class={cn("absolute left-0 top-6 bottom-6 w-[2px] rounded-full", stripeClass[accent])}
    ></span>
  {/if}

  {#if title || eyebrow || actions}
    <header class="flex items-start justify-between gap-3 mb-4">
      <div class="min-w-0">
        {#if eyebrow}
          <div class="text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-1.5">
            {eyebrow}
          </div>
        {/if}
        {#if title}
          <h2 class="text-[18px] font-medium leading-tight text-fg font-heading">{title}</h2>
        {/if}
      </div>
      {#if actions}
        <div class="shrink-0">{@render actions()}</div>
      {/if}
    </header>
  {/if}

  <div class="text-fg">
    {@render children()}
  </div>
</section>
