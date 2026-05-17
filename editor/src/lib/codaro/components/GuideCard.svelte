<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/codaro/ui";

  type Tone = "violet" | "sky" | "emerald" | "amber" | "neutral";

  interface Props {
    title?: string;
    eyebrow?: string;
    tone?: Tone;
    icon?: Snippet;
    actions?: Snippet;
    children: Snippet;
    class?: string;
    hoverable?: boolean;
  }

  let {
    title,
    eyebrow,
    tone = "violet",
    icon,
    actions,
    children,
    class: className,
    hoverable = true,
  }: Props = $props();

  const stripeClass: Record<Tone, string> = {
    violet: "bg-violet-500/70",
    sky: "bg-sky-500/70",
    emerald: "bg-emerald-500/70",
    amber: "bg-amber-500/70",
    neutral: "bg-zinc-600",
  };

  const iconChipClass: Record<Tone, string> = {
    violet: "bg-violet-500/15 ring-violet-500/30 text-violet-300",
    sky: "bg-sky-500/15 ring-sky-500/30 text-sky-300",
    emerald: "bg-emerald-500/15 ring-emerald-500/30 text-emerald-300",
    amber: "bg-amber-500/15 ring-amber-500/30 text-amber-300",
    neutral: "bg-surface-3 ring-border text-fg-secondary",
  };
</script>

<article
  class={cn(
    "guide-card relative rounded-lg p-5 pl-6 bg-surface-2 border border-border-subtle transition-[transform,box-shadow,border-color] duration-base ease-standard",
    hoverable && "hover:-translate-y-px hover:shadow-elev-md hover:border-border",
    className,
  )}
>
  <span
    aria-hidden="true"
    class={cn("absolute left-0 inset-y-3 w-1 rounded-full", stripeClass[tone])}
  ></span>

  <header class="flex items-start justify-between gap-3 mb-3">
    <div class="flex items-start gap-3 min-w-0">
      {#if icon}
        <span class={cn("inline-flex items-center justify-center h-7 w-7 rounded-md ring-1 shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5", iconChipClass[tone])}>
          {@render icon()}
        </span>
      {/if}
      <div class="min-w-0">
        {#if eyebrow}
          <div class="text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-1">{eyebrow}</div>
        {/if}
        {#if title}
          <h3 class="text-[15px] font-medium leading-tight text-fg font-heading">{title}</h3>
        {/if}
      </div>
    </div>
    {#if actions}
      <div class="shrink-0">{@render actions()}</div>
    {/if}
  </header>

  <div class="text-[13px] leading-relaxed text-fg-secondary">
    {@render children()}
  </div>
</article>
