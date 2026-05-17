<script lang="ts">
  import { CheckCircle2, PowerOff, Loader2 } from "lucide-svelte";

  interface Props {
    connectionState?: string;
    engineStatus?: string;
    rttMs?: number | null;
  }

  let {
    connectionState = "CLOSED",
    engineStatus = "idle",
    rttMs = null,
  }: Props = $props();

  const SAMPLE_COUNT = 24;
  let samples: number[] = $state(Array(SAMPLE_COUNT).fill(0));

  $effect(() => {
    if (rttMs !== null && Number.isFinite(rttMs)) {
      samples = [...samples.slice(1), Math.max(0, Math.min(400, rttMs))];
    }
  });

  const isOpen = $derived(connectionState === "OPEN");
  const isRunning = $derived(isOpen && engineStatus === "running");
  const tone = $derived(
    !isOpen ? "destructive" : isRunning ? "warning" : "success",
  );
  const toneClass = $derived(
    !isOpen
      ? "text-destructive-fg bg-destructive-soft ring-destructive-border"
      : isRunning
        ? "text-warning-fg bg-warning-soft ring-warning-border"
        : "text-success-fg bg-success-soft ring-success-border",
  );
  const dotClass = $derived(
    !isOpen
      ? "bg-destructive-base"
      : isRunning
        ? "bg-warning-base animate-pulse"
        : "bg-success-base",
  );
  const label = $derived(
    !isOpen ? "Disconnected" : isRunning ? "Running" : "Connected",
  );

  const max = $derived(Math.max(...samples, 50));
  const polyline = $derived(
    samples
      .map((v, i) => {
        const x = (i / (SAMPLE_COUNT - 1)) * 56;
        const y = 13 - (v / max) * 12;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" "),
  );
  const lastX = 56;
  const lastY = $derived(13 - (samples[samples.length - 1] / max) * 12);
  const showSparkline = $derived(isOpen && samples.some((v) => v > 0));
</script>

<div
  class="inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-[11px] font-mono leading-none ring-1 transition-colors duration-quick {toneClass}"
  data-testid="footer-backend-status"
  title="Kernel: {label}"
>
  <span class="relative flex h-1.5 w-1.5 shrink-0">
    <span class="absolute inset-0 rounded-full {dotClass}"></span>
  </span>
  {#if !isOpen}
    <PowerOff class="w-3 h-3" />
  {:else if isRunning}
    <Loader2 class="w-3 h-3 animate-spin" />
  {:else}
    <CheckCircle2 class="w-3 h-3" />
  {/if}
  <span>Kernel</span>
  {#if showSparkline}
    <svg
      width="56"
      height="14"
      viewBox="0 0 56 14"
      class="opacity-80 ml-0.5"
      aria-hidden="true"
    >
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <circle cx={lastX} cy={lastY} r="1.5" fill="currentColor" />
    </svg>
    {#if rttMs !== null}
      <span class="opacity-70 tabular-nums">{Math.round(rttMs)}ms</span>
    {/if}
  {/if}
</div>
