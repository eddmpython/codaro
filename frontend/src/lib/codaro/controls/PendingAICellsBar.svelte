<script lang="ts">
  import { Sparkles, ChevronUp, ChevronDown, Check, X } from "lucide-svelte";

  interface Props {
    pendingCount?: number;
    currentIndex?: number | null;
    onNavigate?: (direction: "up" | "down") => void;
    onAcceptAll?: () => void;
    onRejectAll?: () => void;
  }

  let {
    pendingCount = 0,
    currentIndex = null,
    onNavigate,
    onAcceptAll,
    onRejectAll
  }: Props = $props();

  let displayText = $derived(
    currentIndex === null
      ? `${pendingCount} pending`
      : `${currentIndex + 1} / ${pendingCount}`
  );
</script>

{#if pendingCount > 0}
  <div
    class="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2.5 w-100 shadow-[0_0_6px_0_#00A2C733]"
  >
    <Sparkles class="h-4 w-4 text-primary" />

    <div class="flex items-center">
      <button
        class="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent text-muted-foreground"
        onclick={() => onNavigate?.("up")}
        aria-label="Previous pending cell"
      >
        <ChevronUp class="h-3.5 w-3.5" />
      </button>
      <span class="text-xs font-mono min-w-[3.5rem] text-center">{displayText}</span>
      <button
        class="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent text-muted-foreground"
        onclick={() => onNavigate?.("down")}
        aria-label="Next pending cell"
      >
        <ChevronDown class="h-3.5 w-3.5" />
      </button>
    </div>

    <div class="h-5 w-px bg-border"></div>

    <div class="flex items-center gap-1.5">
      <button
        class="h-6.5 px-2 py-1 rounded text-xs bg-accent text-accent-foreground hover:bg-accent/80 flex items-center gap-1"
        onclick={() => onAcceptAll?.()}
      >
        <Check class="h-3 w-3" />
        Accept all
      </button>
      <button
        class="h-6.5 px-2 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-1"
        onclick={() => onRejectAll?.()}
      >
        <X class="h-3 w-3" />
        Reject all
      </button>
    </div>
  </div>
{/if}
