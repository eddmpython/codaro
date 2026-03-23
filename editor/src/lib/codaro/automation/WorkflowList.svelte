<script lang="ts">
  import { GitBranch, Play, Trash2, Plus, RefreshCw } from "lucide-svelte";
  import type { WorkflowSerialized } from "../automationApi";
  import { listWorkflows, deleteWorkflow, runWorkflow, createWorkflow } from "../automationApi";

  interface Props {
    onSelect?: (workflow: WorkflowSerialized) => void;
  }

  let { onSelect }: Props = $props();

  let workflows = $state<WorkflowSerialized[]>([]);
  let loading = $state(false);
  let error = $state("");

  async function loadWorkflows(): Promise<void> {
    loading = true;
    error = "";
    try {
      const result = await listWorkflows();
      workflows = result.workflows;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load workflows";
    } finally {
      loading = false;
    }
  }

  async function handleCreate(): Promise<void> {
    const name = window.prompt("Workflow name:");
    if (!name?.trim()) return;
    try {
      const wf = await createWorkflow({ name: name.trim(), steps: [] });
      workflows = [...workflows, wf];
      if (onSelect) onSelect(wf);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to create workflow";
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await deleteWorkflow(id);
      workflows = workflows.filter(w => w.id !== id);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to delete workflow";
    }
  }

  async function handleRun(id: string): Promise<void> {
    try {
      await runWorkflow(id);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to run workflow";
    }
  }

  $effect(() => {
    void loadWorkflows();
  });
</script>

<div class="workflow-list">
  <div class="wf-header">
    <span class="section-label">Workflows</span>
    <div class="wf-header-actions">
      <button type="button" class="wf-icon-btn" onclick={() => void loadWorkflows()} title="Refresh">
        <RefreshCw class="h-3.5 w-3.5" />
      </button>
      <button type="button" class="wf-icon-btn create" onclick={() => void handleCreate()} title="Create workflow">
        <Plus class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>

  {#if error}
    <div class="wf-error">{error}</div>
  {/if}

  {#if loading}
    <div class="wf-empty">Loading...</div>
  {:else if workflows.length === 0}
    <div class="wf-empty">No workflows yet</div>
  {:else}
    <div class="wf-items">
      {#each workflows as wf}
        <div
          class="wf-item"
          role="button"
          tabindex="0"
          onclick={() => onSelect?.(wf)}
          onkeydown={(e) => { if (e.key === "Enter") onSelect?.(wf); }}
        >
          <div class="wf-item-main">
            <GitBranch class="h-3.5 w-3.5 shrink-0" />
            <div class="wf-item-info">
              <span class="wf-name">{wf.name}</span>
              <span class="wf-meta">{wf.steps.length} step(s)</span>
            </div>
          </div>
          <div class="wf-item-actions">
            <button type="button" class="wf-action" onclick={(e) => { e.stopPropagation(); void handleRun(wf.id); }} title="Run">
              <Play class="h-3 w-3" />
            </button>
            <button type="button" class="wf-action danger" onclick={(e) => { e.stopPropagation(); void handleDelete(wf.id); }} title="Delete">
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .workflow-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .wf-header {
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

  .wf-header-actions {
    display: flex;
    gap: 4px;
  }

  .wf-icon-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .wf-icon-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .wf-icon-btn.create {
    color: #4ade80;
  }

  .wf-error {
    padding: 6px 10px;
    border-radius: 4px;
    background: hsl(0 70% 50% / 0.08);
    color: hsl(0 70% 50%);
    font-size: 11px;
  }

  .wf-empty {
    padding: 16px;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 12px;
  }

  .wf-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .wf-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.1s;
  }

  .wf-item:hover {
    background: var(--accent);
  }

  .wf-item-main {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wf-item-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .wf-name {
    font-size: 12px;
    font-weight: 500;
  }

  .wf-meta {
    font-size: 10px;
    color: var(--muted-foreground);
  }

  .wf-item-actions {
    display: flex;
    gap: 4px;
  }

  .wf-action {
    display: flex;
    align-items: center;
    padding: 3px;
    border: none;
    border-radius: 3px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .wf-action:hover {
    background: color-mix(in srgb, var(--foreground) 10%, transparent);
    color: var(--foreground);
  }

  .wf-action.danger:hover {
    color: hsl(0 70% 50%);
  }
</style>
