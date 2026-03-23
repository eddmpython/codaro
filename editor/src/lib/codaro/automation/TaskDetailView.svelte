<script lang="ts">
  import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    CirclePlay,
    Clock,
    XCircle,
  } from "lucide-svelte";
  import {
    getSelectedTask,
    getSelectedTaskRuns,
    setSelectedTaskId,
    runTaskNow,
  } from "../stores/automationStore.svelte";

  let task = $derived(getSelectedTask());
  let runs = $derived(getSelectedTaskRuns());

  function formatDuration(ms: number | null): string {
    if (ms === null) return "—";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  }

  function formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString();
    } catch {
      return iso;
    }
  }
</script>

{#if task}
  <div class="task-detail">
    <button class="back-btn" type="button" onclick={() => setSelectedTaskId(null)}>
      <ArrowLeft class="h-3.5 w-3.5" />
      <span>Back</span>
    </button>

    <div class="detail-header">
      <h3 class="detail-title">{task.name}</h3>
      {#if task.description}
        <p class="detail-desc">{task.description}</p>
      {/if}
      <div class="detail-meta">
        {#if task.schedule}
          <span class="meta-badge">
            <Calendar class="h-3 w-3" />
            {task.schedule}
          </span>
        {/if}
        <span class="meta-badge">
          <Clock class="h-3 w-3" />
          {task.runCount} runs
        </span>
      </div>
    </div>

    <button class="run-btn" type="button" onclick={() => void runTaskNow(task!.id)}>
      <CirclePlay class="h-4 w-4" />
      Run Now
    </button>

    <div class="section-title">Run History</div>
    {#if runs.length === 0}
      <div class="empty-runs">No runs yet</div>
    {:else}
      <div class="run-list">
        {#each runs as run (run.id)}
          <div class="run-item" class:failed={run.status === "failed" || run.status === "error"}>
            <div class="run-status">
              {#if run.status === "success"}
                <CheckCircle2 class="h-4 w-4" style="color: hsl(142 71% 45%)" />
              {:else}
                <XCircle class="h-4 w-4" style="color: hsl(0 84% 60%)" />
              {/if}
            </div>
            <div class="run-info">
              <span class="run-time">{formatTime(run.startedAt)}</span>
              <span class="run-duration">{formatDuration(run.durationMs)}</span>
            </div>
            {#if run.error}
              <div class="run-error">{run.error}</div>
            {/if}
            {#if run.stdout}
              <pre class="run-output">{run.stdout.slice(0, 300)}</pre>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .task-detail {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    border: none;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 12px;
    cursor: pointer;
  }

  .back-btn:hover {
    color: var(--foreground);
  }

  .detail-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .detail-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--foreground);
    margin: 0;
  }

  .detail-desc {
    font-size: 12px;
    color: var(--muted-foreground);
    margin: 0;
  }

  .detail-meta {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  .meta-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--muted-foreground);
    padding: 2px 8px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
  }

  .run-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--primary);
    border-radius: 6px;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .run-btn:hover {
    opacity: 0.9;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }

  .empty-runs {
    font-size: 12px;
    color: var(--muted-foreground);
    text-align: center;
    padding: 16px 0;
  }

  .run-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    max-height: 300px;
  }

  .run-item {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    padding: 8px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
  }

  .run-item.failed {
    background: hsl(0 84% 60% / 0.04);
  }

  .run-status {
    flex-shrink: 0;
    padding-top: 1px;
  }

  .run-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }

  .run-time {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
  }

  .run-duration {
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .run-error {
    width: 100%;
    font-size: 11px;
    color: hsl(0 65% 48%);
    padding: 4px 6px;
    border-radius: 4px;
    background: hsl(0 84% 60% / 0.06);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .run-output {
    width: 100%;
    font-size: 11px;
    color: var(--muted-foreground);
    font-family: var(--monospace-font, monospace);
    margin: 0;
    padding: 4px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 80px;
  }
</style>
