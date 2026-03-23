<script lang="ts">
  import { onMount } from "svelte";
  import { Loader2, RefreshCw } from "lucide-svelte";
  import {
    getAuditEntries,
    getAutomationLoading,
    loadAuditLog,
  } from "../stores/automationStore.svelte";

  let entries = $derived(getAuditEntries());
  let loading = $derived(getAutomationLoading());

  onMount(() => {
    void loadAuditLog();
  });

  function formatTime(iso: string): string {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return iso;
    }
  }

  function resultColor(result: string): string {
    if (result === "success") return "hsl(142 71% 45%)";
    if (result === "error" || result === "failed") return "hsl(0 84% 60%)";
    return "var(--muted-foreground)";
  }
</script>

<div class="audit-panel">
  <div class="audit-header">
    <span class="section-label">Audit Log</span>
    <button class="refresh-btn" type="button" onclick={() => void loadAuditLog()} title="Refresh">
      <RefreshCw class="h-3.5 w-3.5" />
    </button>
  </div>

  {#if loading && entries.length === 0}
    <div class="center-state">
      <Loader2 class="h-5 w-5 animate-spin" />
    </div>
  {:else if entries.length === 0}
    <div class="center-state">No audit entries yet</div>
  {:else}
    <div class="audit-table">
      <div class="table-header">
        <span class="col-time">Time</span>
        <span class="col-action">Action</span>
        <span class="col-source">Source</span>
        <span class="col-result">Result</span>
      </div>
      {#each entries as entry (entry.id)}
        <div class="table-row">
          <span class="col-time">{formatTime(entry.timestamp)}</span>
          <span class="col-action">{entry.actionType}</span>
          <span class="col-source">{entry.source}</span>
          <span class="col-result" style="color: {resultColor(entry.result)}">{entry.result}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .audit-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .audit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .refresh-btn:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    color: var(--foreground);
  }

  .center-state {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    color: var(--muted-foreground);
    font-size: 12px;
  }

  .audit-table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    max-height: 300px;
    overflow-y: auto;
  }

  .table-header {
    display: grid;
    grid-template-columns: 1fr 1fr 0.7fr 0.6fr;
    gap: 4px;
    padding: 6px 10px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
    position: sticky;
    top: 0;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1fr 1fr 0.7fr 0.6fr;
    gap: 4px;
    padding: 5px 10px;
    font-size: 11px;
    color: var(--foreground);
    border-top: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  }

  .table-row:first-child {
    border-top: none;
  }

  .col-time, .col-action, .col-source, .col-result {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
