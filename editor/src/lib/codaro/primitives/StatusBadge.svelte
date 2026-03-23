<script lang="ts">
  interface Props {
    status: string;
    needsRun?: boolean;
    elapsedTimeMs?: number | null;
  }

  let { status, needsRun = false, elapsedTimeMs = null }: Props = $props();

  let badgeColor = $derived(
    status === "running" ? "badge-running"
    : status === "queued" ? "badge-queued"
    : status === "error" ? "badge-error"
    : status === "stopped" ? "badge-error"
    : status === "success" ? "badge-success"
    : needsRun ? "badge-stale"
    : "badge-idle"
  );

  function formatTime(ms: number | null): string {
    if (ms === null) return "";
    const seconds = ms / 1000;
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remaining = Math.floor(seconds % 60);
      return `${minutes}m${remaining}s`;
    }
    if (seconds >= 1) return `${seconds.toFixed(1)}s`;
    return `${ms.toFixed(0)}ms`;
  }

  let timeLabel = $derived(
    (status === "success" || status === "error") ? formatTime(elapsedTimeMs) : ""
  );
</script>

<span class="status-badge {badgeColor}" aria-label="Cell status: {status}">
  <span class="status-dot"></span>
  {#if timeLabel}
    <span class="status-time">{timeLabel}</span>
  {/if}
</span>

<style>
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    font-family: var(--monospace-font);
    line-height: 1;
    user-select: none;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .badge-idle .status-dot {
    background: var(--sage-6);
  }

  .badge-stale .status-dot {
    background: #e5a000;
    box-shadow: 0 0 4px rgba(229, 160, 0, 0.4);
  }

  .badge-queued .status-dot {
    background: #f59e0b;
    animation: pulse-badge 1.5s ease-in-out infinite;
  }

  .badge-running .status-dot {
    background: var(--accent);
    animation: pulse-badge 1.2s ease-in-out infinite;
  }

  .badge-success .status-dot {
    background: #22c55e;
  }

  .badge-error .status-dot {
    background: var(--destructive);
  }

  .status-time {
    color: var(--sage-8);
  }

  .badge-error .status-time {
    color: var(--destructive);
  }

  .badge-success .status-time {
    color: #22c55e;
  }

  @keyframes pulse-badge {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }
</style>
