<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";
  import { getActiveMode, type AppMode } from "./modeStore.svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  const mode = $derived(getActiveMode());

  const dataMode: Record<AppMode, string> = {
    learning: "learning",
    notebook: "notebook",
    report: "app",
    automation: "notebook",
  };

  $effect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.mode = dataMode[mode];
  });
</script>

{#key mode}
  <div in:fade={{ duration: 220 }} out:fade={{ duration: 140 }} class="mode-transition-container">
    {@render children()}
  </div>
{/key}

<style>
  .mode-transition-container {
    height: 100%;
    width: 100%;
  }
</style>
