<script lang="ts">
  import { onMount } from "svelte";
  import {
    getSelectedTaskId,
    getTasks,
    initAutomationStore,
    getAutomationError,
    clearAutomationError,
    getAgentPanelTab,
    setAgentPanelTab,
  } from "../stores/automationStore.svelte";
  import EStopButton from "../automation/EStopButton.svelte";
  import TaskListPanel from "../automation/TaskListPanel.svelte";
  import TaskDetailView from "../automation/TaskDetailView.svelte";
  import TaskCreateDialog from "../automation/TaskCreateDialog.svelte";
  import RecordingControls from "../automation/RecordingControls.svelte";
  import SchedulerStatus from "../automation/SchedulerStatus.svelte";
  import WorkflowList from "../automation/WorkflowList.svelte";
  import WorkflowBuilder from "../automation/WorkflowBuilder.svelte";
  import ChannelConfig from "../automation/ChannelConfig.svelte";
  import AgentActivityPanel from "../automation/AgentActivityPanel.svelte";
  import SafetyDashboard from "../automation/SafetyDashboard.svelte";
  import PlanExecutionView from "../automation/PlanExecutionView.svelte";
  import IntegrationPanel from "../panels/IntegrationPanel.svelte";
  import type { WorkflowSerialized } from "../automationApi";
  import { createWorkflow } from "../automationApi";

  interface Props {
    documentPath?: string;
    onInsertRecipe?: (code: string) => void;
  }

  let { documentPath = "", onInsertRecipe }: Props = $props();

  let selectedTaskId = $derived(getSelectedTaskId());
  let tasks = $derived(getTasks());
  let error = $derived(getAutomationError());
  let activeTab = $derived(getAgentPanelTab());
  let activeWorkflow = $state<WorkflowSerialized | null>(null);
  let showWorkflowBuilder = $state(false);

  const tabs = [
    { id: "activity" as const, label: "Activity" },
    { id: "safety" as const, label: "Safety" },
    { id: "plan" as const, label: "Plan" },
    { id: "integrations" as const, label: "Integrations" },
  ];

  function handleSelectWorkflow(wf: WorkflowSerialized): void {
    activeWorkflow = wf;
    showWorkflowBuilder = true;
  }

  async function handleSaveWorkflow(steps: Array<Record<string, unknown>>): Promise<void> {
    if (!activeWorkflow) return;
    try {
      await createWorkflow({
        name: activeWorkflow.name,
        steps,
      });
    } catch (e) {
      console.warn("Failed to save workflow:", e);
    }
  }

  onMount(() => {
    void initAutomationStore();
  });
</script>

<div class="automation-dashboard">
  {#if error}
    <div class="error-banner">
      <span>{error}</span>
      <button type="button" onclick={clearAutomationError}>Dismiss</button>
    </div>
  {/if}

  {#if showWorkflowBuilder}
    <WorkflowBuilder
      {tasks}
      workflow={activeWorkflow}
      onSave={handleSaveWorkflow}
      onBack={() => { showWorkflowBuilder = false; activeWorkflow = null; }}
    />
  {:else}
    <div class="dashboard-grid">
      <div class="col-main">
        <div class="main-tabs">
          {#each tabs as tab (tab.id)}
            <button
              type="button"
              class="main-tab"
              class:active={activeTab === tab.id}
              onclick={() => setAgentPanelTab(tab.id)}
            >
              {tab.label}
            </button>
          {/each}
        </div>

        <div class="main-content">
          {#if activeTab === "activity"}
            <AgentActivityPanel />
          {:else if activeTab === "safety"}
            <SafetyDashboard />
          {:else if activeTab === "plan"}
            <PlanExecutionView />
          {:else if activeTab === "integrations"}
            <IntegrationPanel />
          {/if}
        </div>
      </div>

      <div class="col-side">
        <EStopButton />

        <div class="side-section">
          <span class="side-section-label">Tasks</span>
          {#if selectedTaskId}
            <TaskDetailView />
          {:else}
            <TaskListPanel />
          {/if}
        </div>

        <RecordingControls {onInsertRecipe} />
        <SchedulerStatus />
        <WorkflowList onSelect={handleSelectWorkflow} />
        <ChannelConfig />
      </div>
    </div>
  {/if}

  <TaskCreateDialog {documentPath} />
</div>

<style>
  .automation-dashboard {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    padding: 12px;
    overflow-y: auto;
  }

  .error-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 6px;
    background: hsl(0 84% 60% / 0.08);
    color: hsl(0 65% 48%);
    font-size: 12px;
  }

  .error-banner button {
    border: none;
    background: transparent;
    color: hsl(0 65% 48%);
    font-size: 11px;
    text-decoration: underline;
    cursor: pointer;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 16px;
    flex: 1;
    min-height: 0;
  }

  .col-main {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .main-tabs {
    display: flex;
    gap: 1px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    margin-bottom: 12px;
  }

  .main-tab {
    padding: 6px 16px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.1s, border-color 0.1s;
  }

  .main-tab:hover {
    color: var(--foreground);
  }

  .main-tab.active {
    color: var(--foreground);
    border-bottom-color: var(--codaro-accent, #a78bfa);
  }

  .main-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .col-side {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
    overflow-y: auto;
  }

  .side-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .side-section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .col-side {
      order: -1;
    }
  }
</style>
