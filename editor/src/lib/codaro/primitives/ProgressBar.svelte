<script lang="ts">
  import { cn } from "$lib/codaro/ui";

  interface Props {
    value: number;
    max?: number;
    gradient?: boolean;
    class?: string;
    label?: string;
  }

  let {
    value,
    max = 100,
    gradient = true,
    class: className,
    label,
  }: Props = $props();

  const pct = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
</script>

<div class={cn("w-full", className)}>
  {#if label}
    <div class="flex items-center justify-between mb-1.5">
      <span class="text-[11px] font-medium text-fg-secondary">{label}</span>
      <span class="text-[11px] font-mono text-fg-muted tabular-nums">{Math.round(pct)}%</span>
    </div>
  {/if}
  <div
    class="h-1.5 w-full rounded-full bg-surface-3 overflow-hidden"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin="0"
    aria-valuemax={max}
  >
    <div
      class={cn(
        "h-full rounded-full transition-[width] duration-slow ease-standard",
        gradient
          ? "bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500"
          : "bg-accent-base",
      )}
      style:width={`${pct}%`}
    ></div>
  </div>
</div>
