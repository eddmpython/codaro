<script lang="ts">
  import { LayoutGrid, Rows3, Presentation } from "lucide-svelte";
  import { getIsWasm } from "../stores/connection.svelte";

  interface Props {
    currentLayout?: string;
    onLayoutChange?: (layout: string) => void;
  }
  let { currentLayout = "vertical", onLayoutChange }: Props = $props();

  let isWasm = $derived(getIsWasm());
  let open = $state(false);

  const layouts = [
    { value: "vertical", label: "Vertical", icon: Rows3 },
    { value: "grid", label: "Grid", icon: LayoutGrid },
    { value: "slides", label: "Slides", icon: Presentation }
  ];

  let currentEntry = $derived(layouts.find((l) => l.value === currentLayout) || layouts[0]);

  function handleSelect(value: string) {
    open = false;
    onLayoutChange?.(value);
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest("[data-testid='layout-select']")) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

{#if !isWasm}
  <div class="relative" data-testid="layout-select">
    <button
      type="button"
      class="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-input hover:bg-accent cursor-pointer"
      onclick={() => { open = !open; }}
    >
      <span>View as</span>
      {@const Icon = currentEntry.icon}
      <Icon class="h-3.5 w-3.5" />
    </button>

    {#if open}
      <div class="absolute top-full mt-1 right-0 bg-background border rounded-md shadow-lg py-1 z-50 min-w-[140px]">
        {#each layouts as layout (layout.value)}
          {@const LayoutIcon = layout.icon}
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer w-full {layout.value === currentLayout ? 'bg-accent/50' : ''}"
            onclick={() => handleSelect(layout.value)}
          >
            <LayoutIcon class="h-4 w-4" />
            <span>{layout.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
