<script lang="ts">
  import { Trash2, ArrowDown } from "lucide-svelte";

  interface LogEntry {
    id: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    timestamp: number;
    source?: string;
  }

  interface Props {
    logs?: LogEntry[];
    onClear?: () => void;
  }

  let {
    logs = [],
    onClear = () => {}
  }: Props = $props();

  let autoScroll = $state(true);
  let container: HTMLDivElement | undefined = $state();
  let levelFilter = $state<string>("all");

  let filtered = $derived(
    logs.filter((log) => levelFilter === "all" || log.level === levelFilter)
  );

  $effect(() => {
    if (autoScroll && container && filtered.length > 0) {
      requestAnimationFrame(() => {
        container?.scrollTo({ top: container.scrollHeight });
      });
    }
  });

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour12: false, fractionalSecondDigits: 3 });
  }

  function levelColor(level: string): string {
    switch (level) {
      case "error": return "var(--destructive, #b91c1c)";
      case "warn": return "var(--yellow-11, #b45309)";
      case "info": return "var(--primary, hsl(240 5.9% 10%))";
      default: return "var(--muted-foreground)";
    }
  }
</script>

<div class="logs-panel" data-testid="logs-panel">
  <div class="toolbar">
    <select class="levelSelect" bind:value={levelFilter}>
      <option value="all">All</option>
      <option value="debug">Debug</option>
      <option value="info">Info</option>
      <option value="warn">Warn</option>
      <option value="error">Error</option>
    </select>
    <div class="flex-1"></div>
    <button
      class="toolBtn"
      class:active={autoScroll}
      onclick={() => { autoScroll = !autoScroll; }}
      aria-label="Auto scroll"
    >
      <ArrowDown class="h-3.5 w-3.5" />
    </button>
    <button class="toolBtn" onclick={onClear} aria-label="Clear logs">
      <Trash2 class="h-3.5 w-3.5" />
    </button>
  </div>

  <div class="logContainer" bind:this={container}>
    {#if filtered.length === 0}
      <p class="empty text-muted-foreground text-sm p-4 text-center">No logs.</p>
    {:else}
      {#each filtered as log}
        <div class="logRow">
          <span class="logTime">{formatTime(log.timestamp)}</span>
          <span class="logLevel" style="color: {levelColor(log.level)}">{log.level.toUpperCase()}</span>
          <span class="logMsg">{log.message}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .logs-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-bottom: 1px solid var(--border);
  }

  .levelSelect {
    padding: 2px 6px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    font-size: 11px;
    color: var(--foreground);
    outline: none;
  }

  .toolBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .toolBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .toolBtn.active {
    color: var(--foreground);
  }

  .logContainer {
    flex: 1;
    overflow-y: auto;
    font-family: var(--monospace-font, monospace);
    font-size: 11px;
  }

  .logRow {
    display: flex;
    gap: 8px;
    padding: 2px 8px;
    line-height: 1.6;
  }

  .logRow:hover {
    background: var(--accent);
  }

  .logTime {
    color: var(--muted-foreground);
    white-space: nowrap;
  }

  .logLevel {
    min-width: 40px;
    font-weight: 500;
  }

  .logMsg {
    color: var(--foreground);
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
