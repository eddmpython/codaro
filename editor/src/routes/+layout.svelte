<script lang="ts">
  import "../styles.css";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}
