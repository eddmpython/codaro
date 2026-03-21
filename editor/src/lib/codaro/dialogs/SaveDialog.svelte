<script lang="ts">
  import { X } from "lucide-svelte";

  interface Props {
    open?: boolean;
    filename?: string;
    formatOnSave?: boolean;
    onSave?: (filename: string) => void;
    onClose?: () => void;
  }

  let {
    open = false,
    filename = "",
    formatOnSave = true,
    onSave = () => {},
    onClose = () => {}
  }: Props = $props();

  let editFilename = $state(filename);

  $effect(() => {
    if (open) {
      editFilename = filename;
    }
  });

  function handleSave(): void {
    onSave(editFilename);
    onClose();
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      handleSave();
    }
  }
</script>

{#if open}
  <div class="overlay" role="presentation" onclick={onClose}>
    <div
      class="dialog"
      role="dialog"
      aria-label="Save notebook"
      onclick={(e) => e.stopPropagation()}
      onkeydown={handleKeydown}
    >
      <div class="header">
        <h3>Save notebook</h3>
        <button class="closeBtn" onclick={onClose} aria-label="Close">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="body">
        <label class="fieldLabel">Filename</label>
        <input
          bind:value={editFilename}
          class="input"
          placeholder="notebook.py"
          data-testid="save-filename-input"
        />
        <p class="hint">
          {formatOnSave ? "Code will be formatted on save." : ""}
        </p>
      </div>

      <div class="footer">
        <button class="cancelBtn" onclick={onClose}>Cancel</button>
        <button class="saveBtn" onclick={handleSave}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog {
    width: 100%;
    max-width: 420px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--background);
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .closeBtn {
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

  .closeBtn:hover {
    background: var(--accent);
  }

  .body {
    padding: 20px;
  }

  .fieldLabel {
    display: block;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--foreground);
  }

  .input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    font-size: 14px;
    color: var(--foreground);
    outline: none;
  }

  .input:focus {
    border-color: var(--ring);
  }

  .hint {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--muted-foreground);
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid var(--border);
  }

  .cancelBtn,
  .saveBtn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }

  .cancelBtn {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
  }

  .cancelBtn:hover {
    background: var(--accent);
  }

  .saveBtn {
    border: none;
    background: var(--primary, hsl(240 5.9% 10%));
    color: var(--primary-foreground, white);
  }

  .saveBtn:hover {
    opacity: 0.9;
  }
</style>
