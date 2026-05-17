<script lang="ts">
  import { Sparkles } from "lucide-svelte";

  interface Props {
    enabled?: boolean;
    provider?: string;
    onConfigure?: () => void;
  }

  let {
    enabled = false,
    provider = "",
    onConfigure = () => {},
  }: Props = $props();

  const toneClass = $derived(
    enabled
      ? "text-accent-base bg-accent-soft ring-accent-border"
      : "text-fg-muted bg-surface-2/60 ring-border-subtle",
  );
</script>

<button
  type="button"
  class="inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-[11px] font-mono leading-none ring-1 transition-colors duration-quick ease-standard hover:brightness-110 outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface-base {toneClass}"
  data-testid={enabled ? "footer-ai-enabled" : "footer-ai-disabled"}
  data-state="closed"
  onclick={onConfigure}
  title={enabled ? `AI: ${provider}` : "AI not configured"}
>
  <span class="relative flex h-1.5 w-1.5 shrink-0">
    {#if enabled}
      <span class="absolute inset-0 rounded-full bg-accent-base animate-ping opacity-60"></span>
      <span class="absolute inset-0 rounded-full bg-accent-base"></span>
    {:else}
      <span class="absolute inset-0 rounded-full bg-fg-muted"></span>
    {/if}
  </span>
  <Sparkles class="w-3 h-3" />
  {#if enabled && provider}
    <span>{provider}</span>
  {:else if !enabled}
    <span class="opacity-70">AI off</span>
  {/if}
</button>
