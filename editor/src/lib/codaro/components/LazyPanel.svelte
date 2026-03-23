<script lang="ts">
  import type { Component } from "svelte";
  import Skeleton from "../primitives/Skeleton.svelte";

  interface Props {
    loader: () => Promise<{ default: Component<Record<string, unknown>> }>;
    props?: Record<string, unknown>;
  }

  let { loader, props = {} }: Props = $props();

  let LoadedComponent: Component<Record<string, unknown>> | null = $state(null);
  let loadError: string | null = $state(null);
  let loading = $state(true);

  $effect(() => {
    let cancelled = false;
    loading = true;
    loadError = null;
    LoadedComponent = null;

    loader().then((mod) => {
      if (!cancelled) {
        LoadedComponent = mod.default;
        loading = false;
      }
    }).catch((err: Error) => {
      if (!cancelled) {
        loadError = err.message;
        loading = false;
      }
    });

    return () => { cancelled = true; };
  });
</script>

{#if loading}
  <div class="p-4 flex flex-col gap-2">
    <Skeleton class="h-4 w-3/4" />
    <Skeleton class="h-4 w-1/2" />
    <Skeleton class="h-4 w-2/3" />
  </div>
{:else if loadError}
  <div class="p-4 text-sm text-destructive">
    Failed to load panel: {loadError}
  </div>
{:else if LoadedComponent}
  <LoadedComponent {...props} />
{/if}
