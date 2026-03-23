<script lang="ts">
  interface WorkflowLike {
    name?: string;
  }

  interface Props {
    label: string;
    documentPath?: string;
    workflow?: WorkflowLike | null;
    tasks?: unknown[];
    onSelect?: (workflow: Record<string, unknown>) => void;
    onSave?: (steps: Array<Record<string, unknown>>) => void;
    onBack?: () => void;
    onInsertRecipe?: (code: string) => void;
  }

  let {
    label,
    documentPath = "",
    workflow = null,
    tasks = [],
    onSelect,
    onSave,
    onBack,
    onInsertRecipe,
  }: Props = $props();
</script>

<div data-testid={label}>{label}</div>

{#if documentPath}
  <div data-testid={`${label}-path`}>{documentPath}</div>
{/if}

{#if workflow?.name}
  <div data-testid={`${label}-workflow`}>{workflow.name}</div>
{/if}

<div data-testid={`${label}-tasks`}>{tasks.length}</div>

{#if onSelect}
  <button
    type="button"
    data-testid={`${label}-select`}
    onclick={() => onSelect({ id: "wf-1", name: "Workflow Alpha", steps: [] })}
  >
    select
  </button>
{/if}

{#if onSave}
  <button
    type="button"
    data-testid={`${label}-save`}
    onclick={() => onSave([{ id: "step-1", name: "First step" }])}
  >
    save
  </button>
{/if}

{#if onBack}
  <button type="button" data-testid={`${label}-back`} onclick={onBack}>
    back
  </button>
{/if}

{#if onInsertRecipe}
  <button
    type="button"
    data-testid={`${label}-insert`}
    onclick={() => onInsertRecipe('# %% [code]\nprint("hello")')}
  >
    insert
  </button>
{/if}
