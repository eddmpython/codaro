<script lang="ts">
  import {
    ChevronUp,
    ChevronDown,
    Sparkles,
    Plus,
    X,
  } from "lucide-svelte";
  import {
    getMessages,
    getIsLoading,
    getAiError,
    getIsChatBarOpen,
    setIsChatBarOpen,
    sendMessage,
    startConversation,
    endConversation,
    isAiReady,
    getActiveProvider,
    getActiveModel,
    getConversationId,
    clearError,
  } from "../ai/aiStore.svelte";
  import ChatMessageList from "../ai/ChatMessageList.svelte";
  import ChatInput from "../ai/ChatInput.svelte";

  let isOpen = $derived(getIsChatBarOpen());
  let msgs = $derived(getMessages());
  let loading = $derived(getIsLoading());
  let aiError = $derived(getAiError());
  let ready = $derived(isAiReady());
  let provider = $derived(getActiveProvider());
  let model = $derived(getActiveModel());

  let chatInputRef: ChatInput | undefined = $state();

  $effect(() => {
    if (isOpen && chatInputRef) {
      chatInputRef.focus();
    }
  });

  async function handleSend(text: string) {
    await sendMessage(text);
  }

  async function handleNewConversation() {
    await endConversation();
    await startConversation();
  }
</script>

<div class="chat-bar" class:open={isOpen} data-testid="chat-bar">
  <button
    class="chat-bar-toggle"
    onclick={() => setIsChatBarOpen(!isOpen)}
    aria-label={isOpen ? "Collapse chat" : "Expand chat"}
  >
    <div class="toggle-left">
      {#if isOpen}
        <ChevronDown class="h-3.5 w-3.5" />
      {:else}
        <ChevronUp class="h-3.5 w-3.5" />
      {/if}
      <Sparkles class="h-3.5 w-3.5 text-amber-500" />
      <span class="toggle-label">AI Assistant</span>
    </div>
    <div class="toggle-right">
      {#if provider && model}
        <span class="provider-badge">{provider} / {model}</span>
      {:else if !ready}
        <span class="provider-badge disconnected">No provider</span>
      {/if}
      {#if msgs.length > 0}
        <span class="msg-count">{msgs.length}</span>
      {/if}
    </div>
  </button>

  {#if isOpen}
    <div class="chat-bar-body">
      <div class="chat-toolbar">
        <button class="toolbar-btn" onclick={handleNewConversation} title="New conversation">
          <Plus class="h-3.5 w-3.5" />
        </button>
      </div>

      <div class="messages-area">
        {#if msgs.length === 0}
          <div class="empty-state">
            <p>{ready ? "Ask a question or describe what you'd like to build." : "No AI provider connected."}</p>
          </div>
        {:else}
          <ChatMessageList messages={msgs} {loading} compact />
        {/if}
      </div>

      {#if aiError}
        <div class="error-bar">
          <span>{aiError}</span>
          <button onclick={clearError} aria-label="Dismiss error">
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      {/if}

      <ChatInput
        bind:this={chatInputRef}
        {ready}
        {loading}
        placeholder={ready ? "Ask AI..." : "No AI provider configured"}
        compact
        onSend={handleSend}
      />
    </div>
  {/if}
</div>

<style>
  .chat-bar {
    border-top: 1px solid var(--border);
    background: var(--background);
    display: flex;
    flex-direction: column;
    z-index: 30;
  }

  .chat-bar-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--foreground);
    font-size: 12px;
    min-height: 32px;
  }

  .chat-bar-toggle:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .toggle-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .toggle-label {
    font-weight: 500;
  }

  .toggle-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .provider-badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    color: var(--muted-foreground);
  }

  .provider-badge.disconnected {
    color: var(--destructive);
  }

  .msg-count {
    font-size: 10px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--accent);
    color: var(--accent-foreground);
    font-weight: 600;
  }

  .chat-bar-body {
    display: flex;
    flex-direction: column;
    max-height: 400px;
    border-top: 1px solid var(--border);
  }

  .chat-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-bottom: 1px solid var(--border);
    font-size: 10px;
    color: var(--muted-foreground);
  }

  .toolbar-btn {
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

  .toolbar-btn:hover {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    color: var(--foreground);
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    min-height: 100px;
    max-height: 300px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: var(--muted-foreground);
    font-size: 12px;
    text-align: center;
  }

  .error-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: hsl(0 84% 60% / 0.1);
    color: var(--destructive);
    font-size: 12px;
  }

  .error-bar button {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    padding: 2px;
  }
</style>
