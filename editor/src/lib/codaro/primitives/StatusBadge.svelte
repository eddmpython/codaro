<script lang="ts">
  import { Loader2, Check, AlertTriangle, Clock, Circle, CircleDashed } from "lucide-svelte";

  interface Props {
    status: string;
    needsRun?: boolean;
    elapsedTimeMs?: number | null;
  }

  let { status, needsRun = false, elapsedTimeMs = null }: Props = $props();

  type Tone = "idle" | "stale" | "queued" | "running" | "success" | "error";

  const tone: Tone = $derived(
    status === "running" ? "running"
      : status === "queued" ? "queued"
      : status === "error" || status === "stopped" ? "error"
      : status === "success" ? "success"
      : needsRun ? "stale"
      : "idle",
  );

  const toneClass: Record<Tone, string> = {
    idle: "text-fg-muted",
    stale: "bg-warning-soft text-warning-fg ring-1 ring-warning-border",
    queued: "bg-zinc-700/30 text-fg-secondary ring-1 ring-border-subtle",
    running: "bg-accent-soft text-accent-base ring-1 ring-accent-border",
    success: "bg-success-soft text-success-fg ring-1 ring-success-border",
    error: "bg-destructive-soft text-destructive-fg ring-1 ring-destructive-border",
  };

  function formatTime(ms: number | null): string {
    if (ms === null) return "";
    const seconds = ms / 1000;
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remaining = Math.floor(seconds % 60);
      return `${minutes}m${remaining}s`;
    }
    if (seconds >= 1) return `${seconds.toFixed(2)}s`;
    return `${ms.toFixed(0)}ms`;
  }

  const timeLabel = $derived(
    (tone === "success" || tone === "error" || tone === "running" || tone === "stale")
      ? formatTime(elapsedTimeMs)
      : "",
  );
</script>

<span
  class="status-badge inline-flex items-center gap-1 h-5 px-1.5 rounded-md font-mono text-[10.5px] leading-none tabular-nums select-none transition-[background-color,color,box-shadow] duration-quick ease-standard {toneClass[tone]}"
  data-tone={tone}
  aria-label="Cell status: {status}"
>
  {#if tone === "running"}
    <Loader2 class="h-3 w-3 animate-spin" />
  {:else if tone === "success"}
    <Check class="h-3 w-3" />
  {:else if tone === "error"}
    <AlertTriangle class="h-3 w-3 status-shake" />
  {:else if tone === "queued"}
    <Clock class="h-3 w-3 animate-pulse" />
  {:else if tone === "stale"}
    <Circle class="h-3 w-3" />
  {:else}
    <CircleDashed class="h-3 w-3 opacity-40" />
  {/if}
  {#if timeLabel}
    <span>{timeLabel}</span>
  {:else if tone === "queued"}
    <span class="opacity-80">queued</span>
  {/if}
</span>

<style>
  @keyframes status-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-1.5px); }
    75% { transform: translateX(1.5px); }
  }

  .status-shake {
    animation: status-shake 240ms var(--ease-standard);
    animation-iteration-count: 3;
  }
</style>
