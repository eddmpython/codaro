<script lang="ts">
  import { Bell, Plus, Trash2, RefreshCw } from "lucide-svelte";
  import { listChannels, addChannel, removeChannel, type MessageChannel } from "../automationApi";

  let channels = $state<MessageChannel[]>([]);
  let loading = $state(false);
  let error = $state("");
  let showAdd = $state(false);
  let newName = $state("");
  let newType = $state("webhook");
  let newUrl = $state("");

  async function loadChannels(): Promise<void> {
    loading = true;
    error = "";
    try {
      const result = await listChannels();
      channels = result.channels;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load channels";
    } finally {
      loading = false;
    }
  }

  async function handleAdd(): Promise<void> {
    if (!newName.trim() || !newUrl.trim()) return;
    try {
      const ch = await addChannel({
        name: newName.trim(),
        channelType: newType,
        webhookUrl: newUrl.trim(),
        enabled: true,
      });
      channels = [...channels, ch];
      newName = "";
      newUrl = "";
      showAdd = false;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to add channel";
    }
  }

  async function handleRemove(name: string): Promise<void> {
    try {
      await removeChannel(name);
      channels = channels.filter(c => c.name !== name);
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to remove channel";
    }
  }

  $effect(() => {
    void loadChannels();
  });
</script>

<div class="channel-config">
  <div class="ch-header">
    <span class="section-label">Notification Channels</span>
    <div class="ch-header-actions">
      <button type="button" class="ch-icon-btn" onclick={() => void loadChannels()} title="Refresh">
        <RefreshCw class="h-3.5 w-3.5" />
      </button>
      <button type="button" class="ch-icon-btn" onclick={() => { showAdd = !showAdd; }} title="Add channel">
        <Plus class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>

  {#if error}
    <div class="ch-error">{error}</div>
  {/if}

  {#if showAdd}
    <div class="ch-add-form">
      <input type="text" class="ch-input" placeholder="Channel name" bind:value={newName} />
      <select class="ch-input" bind:value={newType}>
        <option value="webhook">Webhook</option>
        <option value="slack">Slack</option>
        <option value="discord">Discord</option>
      </select>
      <input type="text" class="ch-input" placeholder="Webhook URL" bind:value={newUrl} />
      <button type="button" class="ch-add-btn" onclick={() => void handleAdd()}>Add</button>
    </div>
  {/if}

  {#if channels.length === 0 && !loading}
    <div class="ch-empty">No channels configured</div>
  {:else}
    <div class="ch-list">
      {#each channels as ch}
        <div class="ch-item">
          <Bell class="h-3.5 w-3.5 shrink-0" />
          <div class="ch-info">
            <span class="ch-name">{ch.name}</span>
            <span class="ch-type">{ch.channelType}</span>
          </div>
          <button type="button" class="ch-remove" onclick={() => void handleRemove(ch.name)} title="Remove">
            <Trash2 class="h-3 w-3" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .channel-config {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ch-header {
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

  .ch-header-actions {
    display: flex;
    gap: 4px;
  }

  .ch-icon-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .ch-icon-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .ch-error {
    padding: 6px 10px;
    border-radius: 4px;
    background: hsl(0 70% 50% / 0.08);
    color: hsl(0 70% 50%);
    font-size: 11px;
  }

  .ch-empty {
    padding: 12px;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 12px;
  }

  .ch-add-form {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .ch-input {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--foreground);
    font-size: 12px;
    font-family: inherit;
  }

  .ch-add-btn {
    padding: 4px 10px;
    border: none;
    border-radius: 4px;
    background: var(--codaro-accent, #a78bfa);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .ch-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ch-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .ch-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .ch-name {
    font-size: 12px;
    font-weight: 500;
  }

  .ch-type {
    font-size: 10px;
    color: var(--muted-foreground);
  }

  .ch-remove {
    display: flex;
    padding: 3px;
    border: none;
    border-radius: 3px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .ch-remove:hover {
    color: hsl(0 70% 50%);
  }
</style>
