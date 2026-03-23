<script lang="ts">
  import { onMount } from "svelte";
  import {
    Calendar,
    ChevronRight,
    CirclePlay,
    Loader2,
    Plus,
    Trash2,
  } from "lucide-svelte";
  import {
    getTasks,
    getAutomationLoading,
    getAutomationError,
    setSelectedTaskId,
    getSelectedTaskId,
    loadTasks,
    runTaskNow,
    removeTask,
    setTaskCreateOpen,
  } from "../stores/automationStore.svelte";

  let tasks = $derived(getTasks());
  let loading = $derived(getAutomationLoading());
  let error = $derived(getAutomationError());
  let selectedId = $derived(getSelectedTaskId());

  onMount(() => {
    void loadTasks();
  });

  async function handleRun(e: MouseEvent, taskId: string) {
    e.stopPropagation();
    await runTaskNow(taskId);
  }

  async function handleDelete(e: MouseEvent, taskId: string) {
    e.stopPropagation();
    await removeTask(taskId);
  }

  function statusColor(task: { lastRun?: { status: string } }): string {
    if (!task.lastRun) return "var(--sage-8, #7c8a80)";
    switch (task.lastRun.status) {
      case "success": return "hsl(142 71% 45%)";
      case "failed": case "error": return "hsl(0 84% 60%)";
      case "running": return "hsl(200 98% 48%)";
      default: return "var(--sage-8, #7c8a80)";
    }
  }
</script>

<div class="task-list-panel">
  <div class="panel-header">
    <span class="panel-title">Tasks</span>
    <button class="add-btn" type="button" onclick={() => setTaskCreateOpen(true)} title="Register new task">
      <Plus class="h-4 w-4" />
    </button>
  </div>

  {#if loading && tasks.length === 0}
    <div class="center-state">
      <Loader2 class="h-5 w-5 animate-spin" />
      <span>Loading tasks...</span>
    </div>
  {:else if error && tasks.length === 0}
    <div class="error-state">{error}</div>
  {:else if tasks.length === 0}
    <div class="center-state">
      <span>No tasks registered yet.</span>
      <button class="create-hint" type="button" onclick={() => setTaskCreateOpen(true)}>
        Create your first task
      </button>
    </div>
  {:else}
    <div class="task-items">
      {#each tasks as task (task.id)}
        <div
          class="task-item"
          class:selected={selectedId === task.id}
          role="button"
          tabindex="0"
          onclick={() => setSelectedTaskId(task.id)}
          onkeydown={(e) => { if (e.key === "Enter") setSelectedTaskId(task.id); }}
        >
          <div class="task-dot" style="background: {statusColor(task)}"></div>
          <div class="task-info">
            <span class="task-name">{task.name}</span>
            <div class="task-meta">
              {#if task.schedule}
                <span class="schedule-badge">
                  <Calendar class="h-3 w-3" />
                  {task.schedule}
                </span>
              {/if}
              {#if task.runCount > 0}
                <span class="run-count">{task.runCount} runs</span>
              {/if}
            </div>
          </div>
          <div class="task-actions">
            <button class="icon-btn" type="button" title="Run now" onclick={(e) => void handleRun(e, task.id)}>
              <CirclePlay class="h-3.5 w-3.5" />
            </button>
            <button class="icon-btn danger" type="button" title="Delete" onclick={(e) => void handleDelete(e, task.id)}>
              <Trash2 class="h-3.5 w-3.5" />
            </button>
            <ChevronRight class="h-3.5 w-3.5 opacity-40 shrink-0" />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .task-list-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .panel-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--foreground);
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .add-btn:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    color: var(--foreground);
  }

  .center-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 0;
    color: var(--muted-foreground);
    font-size: 13px;
  }

  .error-state {
    padding: 12px;
    border-radius: 6px;
    background: hsl(0 84% 60% / 0.08);
    color: hsl(0 65% 48%);
    font-size: 12px;
  }

  .create-hint {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    font-size: 12px;
    cursor: pointer;
  }

  .create-hint:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .task-items {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    flex: 1;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: var(--foreground);
    transition: all 0.1s;
  }

  .task-item:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
    border-color: var(--border);
  }

  .task-item.selected {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    border-color: var(--border);
  }

  .task-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .task-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .task-name {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .schedule-badge {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 1px 6px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .run-count {
    opacity: 0.7;
  }

  .task-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .task-item:hover .task-actions {
    opacity: 1;
  }

  .icon-btn {
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

  .icon-btn:hover {
    background: color-mix(in srgb, var(--foreground) 10%, transparent);
    color: var(--foreground);
  }

  .icon-btn.danger:hover {
    color: hsl(0 84% 60%);
  }
</style>
