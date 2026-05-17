<script lang="ts">
  import type { Snippet } from "svelte";
  import { Alert, type AlertVariant } from "$lib/codaro/ui";

  type BannerKind = "danger" | "info" | "warn";

  interface Props {
    kind?: BannerKind;
    clickable?: boolean;
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
  }

  let { kind = "info", clickable = false, onclick, children }: Props = $props();

  const variantMap: Record<BannerKind, AlertVariant> = {
    danger: "destructive",
    info: "info",
    warn: "warning",
  };
</script>

{#if clickable}
  <button
    type="button"
    {onclick}
    class="block w-full text-left transition-colors duration-quick ease-standard cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base rounded-md"
  >
    <Alert variant={variantMap[kind]}>
      {@render children()}
    </Alert>
  </button>
{:else}
  <Alert variant={variantMap[kind]}>
    {@render children()}
  </Alert>
{/if}
