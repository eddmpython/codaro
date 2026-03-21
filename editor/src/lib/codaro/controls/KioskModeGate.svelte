<script lang="ts">
  import type { Snippet } from "svelte";
  import { getKioskMode } from "../stores/config.svelte";

  interface Props {
    mode: "hide" | "show";
    children: Snippet;
  }
  let { mode, children }: Props = $props();

  let kioskMode = $derived(getKioskMode());
  let visible = $derived(mode === "hide" ? !kioskMode : kioskMode);
</script>

{#if visible}
  {@render children()}
{/if}
