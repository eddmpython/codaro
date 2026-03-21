<script lang="ts">
  import { browser } from "$app/environment";
  import { getActiveSurface, setActiveSurface, getSplitRatio } from "../lib/codaro/stores/surface.svelte";
  import NotebookShell from "../lib/codaro/components/NotebookShell.svelte";
  import ChatSurface from "../lib/codaro/surfaces/ChatSurface.svelte";

  const initialPath = browser ? new URLSearchParams(window.location.search).get("path") || "" : "";

  if (initialPath) setActiveSurface("editor");

  let surface = $derived(getActiveSurface());
  let ratio = $derived(getSplitRatio());
</script>

{#if surface === "chat"}
  <ChatSurface />
{:else if surface === "split"}
  <div class="split-layout">
    <div class="split-left" style="width: {ratio}%">
      <ChatSurface />
    </div>
    <div class="split-divider"></div>
    <div class="split-right" style="width: {100 - ratio}%">
      <NotebookShell {initialPath} />
    </div>
  </div>
{:else}
  <NotebookShell {initialPath} />
{/if}

<style>
  .split-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .split-left,
  .split-right {
    height: 100%;
    overflow: hidden;
  }

  .split-divider {
    width: 4px;
    background: var(--border);
    cursor: col-resize;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .split-divider:hover {
    background: var(--accent);
  }
</style>
