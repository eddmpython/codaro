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
    onConfigure = () => {}
  }: Props = $props();
</script>

<button
  class="flex items-center gap-1 p-2 text-sm font-mono rounded hover:bg-(--sage-3)"
  data-testid={enabled ? "footer-ai-enabled" : "footer-ai-disabled"}
  data-state="closed"
  onclick={onConfigure}
  title={enabled ? `AI: ${provider}` : "AI not configured"}
>
  <Sparkles class="h-4 w-4 {enabled ? 'text-foreground' : 'opacity-60'}" />
  {#if enabled && provider}
    <span class="text-xs">{provider}</span>
  {/if}
</button>
