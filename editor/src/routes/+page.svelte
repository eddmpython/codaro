<script lang="ts">
  import { browser } from "$app/environment";
  import { getActiveSurface, setActiveSurface } from "../lib/codaro/stores/surface.svelte";
  import NotebookShell from "../lib/codaro/components/NotebookShell.svelte";
  import ChatSurface from "../lib/codaro/surfaces/ChatSurface.svelte";

  const initialPath = browser ? new URLSearchParams(window.location.search).get("path") || "" : "";

  if (initialPath) setActiveSurface("editor");

  let surface = $derived(getActiveSurface());
</script>

{#if surface === "chat"}
  <ChatSurface />
{:else}
  <NotebookShell {initialPath} />
{/if}
