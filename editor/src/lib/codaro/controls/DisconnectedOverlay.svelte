<script lang="ts">
  import { Unlink } from "lucide-svelte";

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

<div class="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
  <div class="absolute inset-0 opacity-50" style="background-image: url('/assets/noise.png'), url('/assets/gradient.png'); background-size: cover;"></div>

  <div class="relative bg-background/95 backdrop-blur-sm border rounded-lg p-8 text-center shadow-lg pointer-events-auto max-w-md">
    <Unlink class="h-12 w-12 mx-auto mb-4 text-destructive" />
    <h2 class="text-xl font-semibold">Disconnected</h2>
    <p class="text-sm text-muted-foreground mt-2">{reason}</p>

    {#if canTakeover}
      <button
        class="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        onclick={onTakeover}
      >
        Take over session
      </button>
    {/if}
  </div>
</div>
