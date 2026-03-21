<script lang="ts">
  import { Zap, ChevronDown } from "lucide-svelte";

  interface Props {
    onToggle?: () => void;
    isAutorun?: boolean;
    onCellChangeMode?: string;
    autoReload?: string;
  }

  let {
    onToggle = () => {},
    isAutorun = true,
    onCellChangeMode = "autorun",
    autoReload = "off"
  }: Props = $props();

  let menuOpen = $state(false);
</script>

<div class="relative">
  <button
    class="flex items-center gap-1 p-2 text-sm font-mono rounded hover:bg-(--sage-3)"
    data-testid="footer-runtime-settings"
    data-state={menuOpen ? "open" : "closed"}
    onclick={() => { menuOpen = !menuOpen; }}
    title={isAutorun ? "Autorun enabled" : "Autorun disabled"}
  >
    <Zap size={16} class={isAutorun ? "text-amber-500" : "text-muted-foreground"} />
    <ChevronDown size={14} />
  </button>

  {#if menuOpen}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="fixed inset-0 z-40" onclick={() => { menuOpen = false; }}></div>
    <div class="absolute bottom-full left-0 mb-1 w-56 z-50 bg-(--popover) border border-(--border) rounded-md shadow-md overflow-hidden">
      <div class="p-1">
        <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Runtime
        </div>
        <button
          class="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-(--accent) hover:text-(--accent-foreground)"
          onclick={() => { onToggle?.(); }}
        >
          <span>On startup</span>
          <span class="text-xs text-muted-foreground">{isAutorun ? "autorun" : "lazy"}</span>
        </button>
        <button
          class="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-(--accent) hover:text-(--accent-foreground)"
          onclick={() => {}}
        >
          <span>On cell change</span>
          <span class="text-xs text-muted-foreground">{onCellChangeMode}</span>
        </button>
        <button
          class="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-(--accent) hover:text-(--accent-foreground)"
          onclick={() => {}}
        >
          <span>Module autoreload</span>
          <span class="text-xs text-muted-foreground">{autoReload}</span>
        </button>
      </div>
    </div>
  {/if}
</div>
