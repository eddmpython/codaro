<script lang="ts">
  import { browser } from "$app/environment";
  import AppShell from "../../lib/codaro/components/AppShell.svelte";

  const initialPath = browser ? new URLSearchParams(window.location.search).get("path") || "" : "";
</script>

<svelte:head>
  <title>Codaro App</title>
  <meta name="description" content="Codaro app runtime" />
</svelte:head>

<AppShell {initialPath} />
