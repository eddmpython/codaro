<script>
  import { browser } from "$app/environment";
  import EditorShell from "$lib/editor/EditorShell.svelte";

  const initialPath = browser ? new URLSearchParams(window.location.search).get("path") || "" : "";
</script>

<svelte:head>
  <title>Codaro Editor</title>
  <meta name="description" content="Codaro interactive notebook editor" />
</svelte:head>

<EditorShell {initialPath} />
