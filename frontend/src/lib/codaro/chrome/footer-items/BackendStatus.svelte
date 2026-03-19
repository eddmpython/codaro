<script lang="ts">
  import { Wifi, WifiOff, Loader } from "lucide-svelte";

  interface Props {
    connectionState?: string;
    engineStatus?: string;
  }

  let {
    connectionState = "CLOSED",
    engineStatus = "idle"
  }: Props = $props();

  let statusColor = $derived(
    connectionState === "OPEN"
      ? engineStatus === "running" ? "text-amber-500" : "text-green-500"
      : "text-destructive"
  );

  let statusText = $derived(
    connectionState === "OPEN"
      ? engineStatus === "running" ? "Running" : "Connected"
      : "Disconnected"
  );
</script>

<div
  class="flex items-center gap-1 p-2 text-sm font-mono rounded hover:bg-(--sage-3)"
  data-testid="footer-backend-status"
  title={statusText}
>
  {#if connectionState !== "OPEN"}
    <WifiOff class="h-3.5 w-3.5 {statusColor}" />
  {:else if engineStatus === "running"}
    <Loader class="h-3.5 w-3.5 {statusColor} animate-spin" />
  {:else}
    <Wifi class="h-3.5 w-3.5 {statusColor}" />
  {/if}
  <span class="text-xs {statusColor}">{statusText}</span>
</div>
