<script lang="ts">
  import { browser } from "$app/environment";
  import NotebookShell from "../lib/codaro/components/NotebookShell.svelte";

  const initialPath = browser ? new URLSearchParams(window.location.search).get("path") || "" : "";
</script>

<NotebookShell {initialPath} />
