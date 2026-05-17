<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/codaro/ui";

  interface Props {
    title?: string;
    icon?: Snippet;
    actions?: Snippet;
    footer?: Snippet;
    children: Snippet;
    class?: string;
    bodyClass?: string;
    elevated?: boolean;
  }

  let {
    title,
    icon,
    actions,
    footer,
    children,
    class: className,
    bodyClass,
    elevated = false,
  }: Props = $props();
</script>

<div
  class={cn(
    "flex flex-col h-full min-h-0 bg-surface-1 border border-border rounded-lg overflow-hidden",
    elevated ? "shadow-elev-md" : "shadow-elev-sm",
    className,
  )}
>
  {#if title || icon || actions}
    <header
      class="flex items-center justify-between gap-2 h-9 px-3 sticky top-0 z-10 bg-surface-1/85 backdrop-blur-sm border-b border-border-subtle"
    >
      <div class="flex items-center gap-2 min-w-0">
        {#if icon}
          <span class="shrink-0 text-fg-muted [&>svg]:h-3.5 [&>svg]:w-3.5">{@render icon()}</span>
        {/if}
        {#if title}
          <span class="text-[12px] font-medium text-fg truncate">{title}</span>
        {/if}
      </div>
      {#if actions}
        <div class="flex items-center gap-0.5 shrink-0">
          {@render actions()}
        </div>
      {/if}
    </header>
  {/if}

  <div class={cn("flex-1 min-h-0 overflow-auto", bodyClass)}>
    {@render children()}
  </div>

  {#if footer}
    <footer class="border-t border-border-subtle px-3 py-2 bg-surface-1/60">
      {@render footer()}
    </footer>
  {/if}
</div>
