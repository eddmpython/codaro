<script lang="ts">
  import { CheckCircle2, PowerOff, Loader } from "lucide-svelte";

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
  class="flex items-center gap-1.5 p-2 text-xs font-mono rounded hover:bg-(--sage-3)"
  data-testid="footer-backend-status"
  title={statusText}
>
  {#if connectionState !== "OPEN"}
    <PowerOff class="w-4 h-4 {statusColor}" />
  {:else if engineStatus === "running"}
    <Loader class="w-4 h-4 {statusColor} animate-spin" />
  {:else}
    <CheckCircle2 class="w-4 h-4 {statusColor}" />
  {/if}
  <span class="text-xs {statusColor}">Kernel</span>
</div>
