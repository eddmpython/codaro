<script lang="ts">
  interface TraceEntry {
    id: string;
    cellId: string;
    cellName?: string;
    startTime: number;
    duration: number;
    status: "ok" | "error";
  }

  interface Props {
    traces?: TraceEntry[];
    onNavigateToCell?: (cellId: string) => void;
  }

  let {
    traces = [],
    onNavigateToCell = () => {}
  }: Props = $props();

  function formatDuration(ms: number): string {
    if (ms < 1) {
      return "<1ms";
    }
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }
</script>

<div class="tracing-panel" data-testid="tracing-panel">
  {#if traces.length === 0}
    <div class="empty text-muted-foreground text-sm p-4 text-center">
      No execution traces yet. Run cells to see timing data.
    </div>
  {:else}
    <div class="traceList">
      {#each traces as trace}
        <div class="traceRow" class:error={trace.status === "error"}>
          <button class="cellBtn" onclick={() => onNavigateToCell(trace.cellId)}>
            {trace.cellName || trace.cellId.slice(0, 8)}
          </button>
          <span class="duration">{formatDuration(trace.duration)}</span>
          <div class="bar" style="width: {Math.min(100, (trace.duration / Math.max(...traces.map(t => t.duration))) * 100)}%"></div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tracing-panel {
    height: 100%;
    overflow-y: auto;
  }

  .traceList {
    padding: 4px 0;
  }

  .traceRow {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    position: relative;
  }

  .traceRow:hover {
    background: var(--accent);
  }

  .cellBtn {
    border: none;
    background: transparent;
    font-family: var(--monospace-font, monospace);
    font-size: 11px;
    color: var(--foreground);
    cursor: pointer;
    z-index: 1;
    min-width: 80px;
    text-align: left;
  }

  .cellBtn:hover {
    text-decoration: underline;
  }

  .duration {
    font-family: var(--monospace-font, monospace);
    font-size: 11px;
    color: var(--muted-foreground);
    min-width: 50px;
    text-align: right;
    z-index: 1;
  }

  .bar {
    height: 4px;
    border-radius: 2px;
    background: var(--primary, hsl(240 5.9% 10%));
    opacity: 0.2;
    min-width: 2px;
  }

  .traceRow.error .bar {
    background: var(--destructive, #b91c1c);
    opacity: 0.3;
  }
</style>
