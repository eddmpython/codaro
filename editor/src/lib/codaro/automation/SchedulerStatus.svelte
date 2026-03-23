<script lang="ts">
  import { onMount } from "svelte";
  import { Calendar, RefreshCw } from "lucide-svelte";
  import {
    getSchedulerJobs,
    loadSchedulerStatus,
  } from "../stores/automationStore.svelte";

  let jobs = $derived(getSchedulerJobs());

  onMount(() => {
    void loadSchedulerStatus();
  });

  function formatNext(iso: string | null): string {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      const now = Date.now();
      const diff = d.getTime() - now;
      if (diff < 0) return "overdue";
      if (diff < 60_000) return `${Math.round(diff / 1000)}s`;
      if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m`;
      return `${Math.round(diff / 3_600_000)}h`;
    } catch {
      return iso;
    }
  }
</script>

<div class="scheduler-status">
  <div class="scheduler-header">
    <span class="section-label">Active Schedules</span>
    <button class="refresh-btn" type="button" onclick={() => void loadSchedulerStatus()} title="Refresh">
      <RefreshCw class="h-3.5 w-3.5" />
    </button>
  </div>

  {#if jobs.length === 0}
    <div class="empty">No active schedules</div>
  {:else}
    <div class="job-list">
      {#each jobs as job (job.taskId)}
        <div class="job-item">
          <Calendar class="h-3.5 w-3.5 shrink-0" style="color: var(--muted-foreground)" />
          <div class="job-info">
            <span class="job-task">{job.taskId}</span>
            <span class="job-schedule">{job.schedule}</span>
          </div>
          <span class="job-next">in {formatNext(job.nextRunAt)}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .scheduler-status {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .scheduler-header {
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

  .empty {
    font-size: 12px;
    color: var(--muted-foreground);
    text-align: center;
    padding: 12px 0;
  }

  .job-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .job-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
  }

  .job-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .job-task {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .job-schedule {
    font-size: 10px;
    color: var(--muted-foreground);
    font-family: var(--monospace-font, monospace);
  }

  .job-next {
    font-size: 11px;
    color: var(--muted-foreground);
    flex-shrink: 0;
  }
</style>
