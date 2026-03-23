<script lang="ts">
  import { SvelteFlow, Controls, Background, type Node, type Edge } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import { Plus, Play, Trash2 } from "lucide-svelte";
  import type { TaskSerialized, WorkflowSerialized } from "../automationApi";

  interface Props {
    tasks: TaskSerialized[];
    workflow: WorkflowSerialized | null;
    onSave?: (steps: Array<Record<string, unknown>>) => void;
    onRun?: () => void;
    onBack?: () => void;
  }

  let { tasks, workflow, onSave, onRun, onBack }: Props = $props();

  let nodes = $state<Node[]>([]);
  let edges = $state<Edge[]>([]);
  let showAddTask = $state(false);

  function initFromWorkflow(): void {
    if (!workflow) {
      nodes = [];
      edges = [];
      return;
    }

    const stepNodes: Node[] = [];
    const stepEdges: Edge[] = [];

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const taskId = step.taskId as string;
      const task = tasks.find(t => t.id === taskId);
      const status = (step.status as string) ?? "pending";

      stepNodes.push({
        id: `step-${i}`,
        type: "default",
        position: { x: 60 + (i % 3) * 220, y: 60 + Math.floor(i / 3) * 120 },
        data: {
          label: task?.name ?? taskId,
          taskId,
          status,
        },
        style: `border-radius: 8px; border: 2px solid ${statusColor(status)}; background: ${statusBg(status)}; color: #e4e4e7; font-size: 12px; padding: 8px 16px;`,
      });

      const deps = (step.dependsOn as string[]) ?? [];
      for (const depTaskId of deps) {
        const depIndex = workflow.steps.findIndex(s => (s.taskId as string) === depTaskId);
        if (depIndex >= 0) {
          stepEdges.push({
            id: `e-${depIndex}-${i}`,
            source: `step-${depIndex}`,
            target: `step-${i}`,
            animated: status === "running",
          });
        }
      }
    }

    nodes = stepNodes;
    edges = stepEdges;
  }

  function statusColor(status: string): string {
    switch (status) {
      case "completed": return "#4ade80";
      case "running": return "#60a5fa";
      case "failed": return "#f87171";
      default: return "#52525b";
    }
  }

  function statusBg(status: string): string {
    switch (status) {
      case "completed": return "#052e16";
      case "running": return "#172554";
      case "failed": return "#450a0a";
      default: return "#18181b";
    }
  }

  function addTaskToWorkflow(taskId: string): void {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newIndex = nodes.length;
    nodes = [...nodes, {
      id: `step-${newIndex}`,
      type: "default",
      position: { x: 60 + (newIndex % 3) * 220, y: 60 + Math.floor(newIndex / 3) * 120 },
      data: { label: task.name, taskId, status: "pending" },
      style: `border-radius: 8px; border: 2px solid #52525b; background: #18181b; color: #e4e4e7; font-size: 12px; padding: 8px 16px;`,
    }];
    showAddTask = false;
  }

  function handleSave(): void {
    if (!onSave) return;
    const steps = nodes.map(node => {
      const deps = edges
        .filter(e => e.target === node.id)
        .map(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          return sourceNode?.data?.taskId;
        })
        .filter(Boolean);

      return {
        taskId: node.data?.taskId ?? "",
        dependsOn: deps,
        status: "pending",
      };
    });
    onSave(steps);
  }

  $effect(() => {
    initFromWorkflow();
  });
</script>

<div class="workflow-builder">
  <div class="workflow-toolbar">
    {#if onBack}
      <button type="button" class="wf-btn" onclick={onBack}>Back</button>
    {/if}
    <button type="button" class="wf-btn" onclick={() => { showAddTask = !showAddTask; }}>
      <Plus class="h-3.5 w-3.5" />
      Add Task
    </button>
    <button type="button" class="wf-btn primary" onclick={handleSave}>Save</button>
    {#if onRun}
      <button type="button" class="wf-btn run" onclick={onRun}>
        <Play class="h-3.5 w-3.5" />
        Run
      </button>
    {/if}
  </div>

  {#if showAddTask}
    <div class="add-task-dropdown">
      {#each tasks as task}
        <button
          type="button"
          class="add-task-item"
          onclick={() => addTaskToWorkflow(task.id)}
        >
          {task.name}
        </button>
      {/each}
      {#if tasks.length === 0}
        <div class="add-task-empty">No tasks available</div>
      {/if}
    </div>
  {/if}

  <div class="flow-container">
    <SvelteFlow bind:nodes bind:edges fitView>
      <Controls />
      <Background />
    </SvelteFlow>
  </div>
</div>

<style>
  .workflow-builder {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
    position: relative;
  }

  .workflow-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .wf-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .wf-btn:hover {
    background: var(--accent);
  }

  .wf-btn.primary {
    background: var(--codaro-accent, #a78bfa);
    color: #fff;
    border-color: transparent;
  }

  .wf-btn.primary:hover {
    opacity: 0.9;
  }

  .wf-btn.run {
    color: #4ade80;
    border-color: #166534;
  }

  .wf-btn.run:hover {
    background: #052e16;
  }

  .add-task-dropdown {
    position: absolute;
    top: 44px;
    left: 12px;
    z-index: 20;
    width: 200px;
    max-height: 200px;
    overflow-y: auto;
    background: var(--popover, var(--background));
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,.1));
  }

  .add-task-item {
    display: block;
    width: 100%;
    padding: 6px 12px;
    border: none;
    background: none;
    color: var(--foreground);
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
  }

  .add-task-item:hover {
    background: var(--accent);
  }

  .add-task-empty {
    padding: 12px;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 12px;
  }

  .flow-container {
    flex: 1;
    min-height: 350px;
  }

  .flow-container :global(.svelte-flow) {
    background: var(--background, #09090b);
  }

  .flow-container :global(.svelte-flow__background) {
    background: var(--background, #09090b);
  }
</style>
