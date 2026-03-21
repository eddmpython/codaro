<script lang="ts">
  import { Eye, EyeOff, Plus, Trash2 } from "lucide-svelte";

  interface SecretEntry {
    key: string;
    masked: boolean;
  }

  interface Props {
    secrets?: SecretEntry[];
    onAdd?: (key: string, value: string) => void;
    onRemove?: (key: string) => void;
  }

  let {
    secrets = [],
    onAdd = () => {},
    onRemove = () => {}
  }: Props = $props();

  let newKey = $state("");
  let newValue = $state("");
  let showValues = $state(new Set<string>());

  function toggleShow(key: string): void {
    const next = new Set(showValues);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    showValues = next;
  }

  function handleAdd(): void {
    if (newKey.trim() && newValue.trim()) {
      onAdd(newKey.trim(), newValue.trim());
      newKey = "";
      newValue = "";
    }
  }
</script>

<div class="secrets-panel" data-testid="secrets-panel">
  <div class="addForm">
    <input bind:value={newKey} class="formInput" placeholder="Key" />
    <input bind:value={newValue} class="formInput" placeholder="Value" type="password" />
    <button
      class="addBtn"
      onclick={handleAdd}
      disabled={!newKey.trim() || !newValue.trim()}
      aria-label="Add secret"
    >
      <Plus class="h-3.5 w-3.5" />
    </button>
  </div>

  <div class="secretList">
    {#if secrets.length === 0}
      <p class="empty text-muted-foreground text-sm p-4 text-center">
        No secrets configured.
      </p>
    {:else}
      {#each secrets as secret}
        <div class="secretRow">
          <span class="secretKey">{secret.key}</span>
          <div class="secretActions">
            <button class="iconBtn" onclick={() => toggleShow(secret.key)} aria-label="Toggle visibility">
              {#if showValues.has(secret.key)}
                <EyeOff class="h-3.5 w-3.5" />
              {:else}
                <Eye class="h-3.5 w-3.5" />
              {/if}
            </button>
            <button class="iconBtn" onclick={() => onRemove(secret.key)} aria-label="Remove">
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .secrets-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .addForm {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--border);
  }

  .formInput {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    font-size: 12px;
    outline: none;
    color: var(--foreground);
  }

  .formInput:focus {
    border-color: var(--ring);
  }

  .addBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
  }

  .addBtn:hover {
    background: var(--accent);
  }

  .addBtn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .secretList {
    flex: 1;
    overflow-y: auto;
  }

  .secretRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
  }

  .secretRow:hover {
    background: var(--accent);
  }

  .secretKey {
    font-family: var(--monospace-font, monospace);
    font-size: 12px;
    color: var(--foreground);
  }

  .secretActions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .iconBtn {
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

  .iconBtn:hover {
    background: var(--accent);
    color: var(--foreground);
  }
</style>
