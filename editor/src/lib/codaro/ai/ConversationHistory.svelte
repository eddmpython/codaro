<script lang="ts">
  import { onMount } from "svelte";
  import { MessageSquare, Plus, Trash2, X } from "lucide-svelte";
  import {
    getConversations,
    getIsHistoryOpen,
    setIsHistoryOpen,
    loadConversations,
    removeConversation,
    setActiveConversationId,
  } from "./conversationStore.svelte";

  interface Props {
    onNewConversation?: () => void;
    onSelectConversation?: (id: string) => void;
  }

  let { onNewConversation, onSelectConversation }: Props = $props();

  let conversations = $derived(getConversations());
  let isOpen = $derived(getIsHistoryOpen());

  onMount(() => {
    loadConversations();
  });

  function handleSelect(id: string) {
    setActiveConversationId(id);
    onSelectConversation?.(id);
    setIsHistoryOpen(false);
  }

  async function handleDelete(e: MouseEvent, id: string) {
    e.stopPropagation();
    await removeConversation(id);
  }

  function handleNew() {
    onNewConversation?.();
    setIsHistoryOpen(false);
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="history-backdrop" onclick={() => setIsHistoryOpen(false)}></div>
  <aside class="history-panel">
    <div class="history-header">
      <h2 class="history-title">Conversations</h2>
      <button class="icon-btn" onclick={() => setIsHistoryOpen(false)} aria-label="Close">
        <X class="h-4 w-4" />
      </button>
    </div>

    <button class="new-conv-btn" onclick={handleNew}>
      <Plus class="h-4 w-4" />
      <span>New conversation</span>
    </button>

    <div class="history-list">
      {#if conversations.length === 0}
        <div class="empty-state">
          <MessageSquare class="h-6 w-6" />
          <p>No conversations yet</p>
        </div>
      {:else}
        {#each conversations as conv (conv.conversationId)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="conv-item" onclick={() => handleSelect(conv.conversationId)}>
            <MessageSquare class="h-4 w-4 shrink-0" />
            <div class="conv-info">
              <span class="conv-title">{conv.title}</span>
              <span class="conv-role">{conv.role}</span>
            </div>
            <button
              class="delete-btn"
              onclick={(e) => handleDelete(e, conv.conversationId)}
              aria-label="Delete conversation"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        {/each}
      {/if}
    </div>
  </aside>
{/if}

<style>
  .history-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 49;
  }

  .history-panel {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: var(--background);
    border-right: 1px solid var(--border);
    z-index: 50;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  .history-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
  }

  .icon-btn:hover {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .new-conv-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 12px;
    padding: 10px 12px;
    border: 1px dashed var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .new-conv-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 5%, transparent);
  }

  .history-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px 16px;
    color: color-mix(in srgb, var(--foreground) 35%, transparent);
    text-align: center;
    font-size: 0.85rem;
  }

  .conv-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.1s;
    color: color-mix(in srgb, var(--foreground) 70%, transparent);
  }

  .conv-item:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    color: var(--foreground);
  }

  .conv-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .conv-title {
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conv-role {
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--foreground) 40%, transparent);
    text-transform: capitalize;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: color-mix(in srgb, var(--foreground) 30%, transparent);
    cursor: pointer;
    opacity: 0;
    transition: all 0.1s;
  }

  .conv-item:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    color: var(--destructive);
    background: hsl(0 84% 60% / 0.1);
  }
</style>
