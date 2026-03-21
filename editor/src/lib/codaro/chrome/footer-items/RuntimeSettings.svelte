<script lang="ts">
  import { Zap, ChevronDown } from "lucide-svelte";
  import { getRuntimeConfig, setRuntimeConfig } from "../../stores/config.svelte";

  interface Props {
    onToggle?: () => void;
  }

  let {
    onToggle = () => {}
  }: Props = $props();

  let rt = $derived(getRuntimeConfig());
  let isAutorun = $derived(rt.autoInstantiate);
  let onCellChangeMode = $derived(rt.onCellChange);
  let autoReloadMode = $derived(rt.autoReload);

  function cycleOnCellChange() {
    const next = onCellChangeMode === "autorun" ? "lazy" : "autorun";
    setRuntimeConfig({ onCellChange: next });
  }

  function cycleAutoReload() {
    const order: Array<"off" | "lazy" | "autorun"> = ["off", "lazy", "autorun"];
    const idx = order.indexOf(autoReloadMode);
    setRuntimeConfig({ autoReload: order[(idx + 1) % order.length] });
  }

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
          onclick={cycleOnCellChange}
        >
          <span>On cell change</span>
          <span class="text-xs text-muted-foreground">{onCellChangeMode}</span>
        </button>
        <button
          class="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded hover:bg-(--accent) hover:text-(--accent-foreground)"
          onclick={cycleAutoReload}
        >
          <span>Module autoreload</span>
          <span class="text-xs text-muted-foreground">{autoReloadMode}</span>
        </button>
      </div>
    </div>
  {/if}
</div>
