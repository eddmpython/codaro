<script lang="ts">
  import { Unlink } from "lucide-svelte";
  import { Button } from "$lib/codaro/ui";
  import EmptyState from "$lib/codaro/primitives/EmptyState.svelte";

  interface Props {
    reason?: string;
    canTakeover?: boolean;
    onTakeover?: () => void;
  }

  let {
    reason = "Connection lost",
    canTakeover = false,
    onTakeover,
  }: Props = $props();
</script>

<div
  class="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md pointer-events-auto"
  role="dialog"
  aria-modal="true"
  aria-label="Disconnected"
>
  <div class="rounded-2xl bg-surface-overlay backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/5 border border-border-subtle shadow-elev-overlay p-8 max-w-md mx-4">
    <EmptyState
      title="Disconnected"
      body={reason}
      compact
    >
      {#snippet icon()}
        <Unlink />
      {/snippet}
      {#snippet actions()}
        {#if canTakeover}
          <Button variant="accent" onclick={onTakeover}>Take over session</Button>
        {/if}
      {/snippet}
    </EmptyState>
  </div>
</div>
