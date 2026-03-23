<script lang="ts">
  import { X } from "lucide-svelte";
  import {
    getTaskCreateOpen,
    setTaskCreateOpen,
    createTask,
  } from "../stores/automationStore.svelte";

  interface Props {
    documentPath?: string;
  }

  let { documentPath = "" }: Props = $props();

  let open = $derived(getTaskCreateOpen());
  let name = $state("");
  let description = $state("");
  let schedule = $state("");
  let submitting = $state(false);

  async function handleSubmit() {
    if (!name.trim() || !documentPath) return;
    submitting = true;
    const task = await createTask({
      name: name.trim(),
      documentPath,
      description: description.trim() || undefined,
      schedule: schedule.trim() || undefined,
    });
    submitting = false;
    if (task) {
      name = "";
      description = "";
      schedule = "";
      setTaskCreateOpen(false);
    }
  }

  function handleClose() {
    setTaskCreateOpen(false);
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleDialogKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
    }
  }
</script>

{#if open}
  <div class="dialog-overlay" role="presentation" onclick={handleOverlayClick}>
    <div
      class="dialog"
      role="dialog"
      aria-label="Create Task"
      aria-modal="true"
      tabindex="-1"
      onkeydown={handleDialogKeydown}
    >
      <div class="dialog-header">
        <h3 class="dialog-title">Register as Task</h3>
        <button class="close-btn" type="button" onclick={handleClose}>
          <X class="h-4 w-4" />
        </button>
      </div>

      <form class="dialog-body" onsubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
        <label class="field">
          <span class="field-label">Name</span>
          <input
            class="field-input"
            type="text"
            bind:value={name}
            placeholder="My automation task"
            required
          />
        </label>

        <label class="field">
          <span class="field-label">Document</span>
          <input class="field-input" type="text" value={documentPath} disabled />
        </label>

        <label class="field">
          <span class="field-label">Description</span>
          <textarea
            class="field-input"
            bind:value={description}
            placeholder="Optional description..."
            rows="2"
          ></textarea>
        </label>

        <label class="field">
          <span class="field-label">Schedule (optional)</span>
          <input
            class="field-input"
            type="text"
            bind:value={schedule}
            placeholder="@every_5m, @hourly, @daily..."
          />
          <span class="field-hint">Leave empty for manual-only</span>
        </label>

        <div class="dialog-actions">
          <button class="cancel-btn" type="button" onclick={handleClose}>Cancel</button>
          <button class="submit-btn" type="submit" disabled={!name.trim() || submitting}>
            {submitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .dialog {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 420px;
    max-width: 90vw;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .dialog-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--foreground);
    margin: 0;
  }

  .close-btn {
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

  .close-btn:hover {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .dialog-body {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
  }

  .field-input {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
    color: var(--foreground);
    font-size: 13px;
    font-family: var(--monospace-font, monospace);
    outline: none;
    resize: vertical;
  }

  .field-input:focus {
    border-color: var(--primary);
  }

  .field-input:disabled {
    opacity: 0.5;
  }

  .field-hint {
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .dialog-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }

  .cancel-btn {
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    font-size: 13px;
    cursor: pointer;
  }

  .cancel-btn:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .submit-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
