<script lang="ts">
  import {
    ChevronUp,
    ChevronDown,
    Send,
    X,
    Loader2,
    Bot,
    User,
    Wrench,
    Sparkles,
    Plus,
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
  import { renderToolResult } from "../ai/toolRenderer";
  import type { ChatMessage } from "../ai/aiStore.svelte";

  let inputValue = $state("");
  let messagesEnd: HTMLDivElement | undefined = $state();
  let textareaEl: HTMLTextAreaElement | undefined = $state();

  let isOpen = $derived(getIsChatBarOpen());
  let msgs = $derived(getMessages());
  let loading = $derived(getIsLoading());
  let aiError = $derived(getAiError());
  let ready = $derived(isAiReady());
  let provider = $derived(getActiveProvider());
  let model = $derived(getActiveModel());
  let convId = $derived(getConversationId());

  $effect(() => {
    if (msgs.length > 0 && messagesEnd) {
      requestAnimationFrame(() => {
        messagesEnd?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  $effect(() => {
    if (isOpen && textareaEl) {
      requestAnimationFrame(() => textareaEl?.focus());
    }
  });

  function adjustTextarea() {
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, 120) + "px";
    }
  }

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || loading) return;
    inputValue = "";
    if (textareaEl) textareaEl.style.height = "auto";
    await sendMessage(text);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
        {#if convId}
          <span class="conv-id">{convId}</span>
        {/if}
      </div>

      <div class="messages-area">
        {#if msgs.length === 0}
          <div class="empty-state">
            {#if ready}
              <Bot class="h-8 w-8 text-muted-foreground/40" />
              <p>Ask a question or describe what you'd like to build.</p>
            {:else}
              <Bot class="h-8 w-8 text-muted-foreground/30" />
              <p>No AI provider connected. Configure one in settings.</p>
            {/if}
          </div>
        {:else}
          {#each msgs as msg (msg.id)}
            <div class="message" class:user={msg.role === "user"} class:assistant={msg.role === "assistant"}>
              <div class="msg-icon">
                {#if msg.role === "user"}
                  <User class="h-3.5 w-3.5" />
                {:else}
                  <Bot class="h-3.5 w-3.5" />
                {/if}
              </div>
              <div class="msg-body">
                <div class="msg-content">{msg.content}</div>
                {#if msg.toolCalls && msg.toolCalls.length > 0}
                  <div class="tool-calls">
                    {#each msg.toolCalls as tc}
                      {@const info = renderToolResult(tc)}
                      <div class="tool-badge" class:error={info.status === "error"} class:success={info.status === "success"}>
                        <Wrench class="h-3 w-3" />
                        <span class="tool-label">{info.label}</span>
                        <span class="tool-desc">{info.description}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/each}

          {#if loading}
            <div class="message assistant">
              <div class="msg-icon">
                <Loader2 class="h-3.5 w-3.5 animate-spin" />
              </div>
              <div class="msg-body">
                <div class="msg-content thinking">Thinking...</div>
              </div>
            </div>
          {/if}
        {/if}
        <div bind:this={messagesEnd}></div>
      </div>

      {#if aiError}
        <div class="error-bar">
          <span>{aiError}</span>
          <button onclick={clearError} aria-label="Dismiss error">
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      {/if}

      <div class="input-area">
        <textarea
          bind:this={textareaEl}
          bind:value={inputValue}
          class="chat-input"
          placeholder={ready ? "Ask AI..." : "No AI provider configured"}
          disabled={!ready || loading}
          rows="1"
          oninput={adjustTextarea}
          onkeydown={handleKeydown}
        ></textarea>
        <button
          class="send-btn"
          onclick={handleSend}
          disabled={!ready || loading || !inputValue.trim()}
          aria-label="Send message"
        >
          {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <Send class="h-4 w-4" />
          {/if}
        </button>
      </div>
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
    background: var(--accent);
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
    background: var(--accent);
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
    background: var(--primary);
    color: var(--primary-foreground);
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
    background: var(--accent);
    color: var(--foreground);
  }

  .conv-id {
    font-family: monospace;
    opacity: 0.6;
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
    gap: 8px;
    padding: 24px;
    color: var(--muted-foreground);
    font-size: 12px;
    text-align: center;
  }

  .message {
    display: flex;
    gap: 8px;
    padding: 6px 4px;
  }

  .message + .message {
    border-top: 1px solid var(--border);
  }

  .msg-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: var(--accent);
    color: var(--muted-foreground);
  }

  .message.user .msg-icon {
    background: var(--primary);
    color: var(--primary-foreground);
  }

  .msg-body {
    flex: 1;
    min-width: 0;
  }

  .msg-content {
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .msg-content.thinking {
    color: var(--muted-foreground);
    font-style: italic;
  }

  .tool-calls {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
  }

  .tool-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    background: var(--accent);
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .tool-badge.success {
    background: hsl(142 71% 45% / 0.1);
    color: hsl(142 71% 45%);
  }

  .tool-badge.error {
    background: hsl(0 84% 60% / 0.1);
    color: hsl(0 84% 60%);
  }

  .tool-label {
    font-weight: 500;
  }

  .tool-desc {
    opacity: 0.8;
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

  .input-area {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-top: 1px solid var(--border);
  }

  .chat-input {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    font-size: 13px;
    font-family: inherit;
    line-height: 1.4;
    outline: none;
    color: var(--foreground);
    resize: none;
    overflow: hidden;
  }

  .chat-input:focus {
    border-color: var(--ring);
  }

  .chat-input:disabled {
    opacity: 0.5;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
    align-self: flex-end;
  }

  .send-btn:hover:not(:disabled) {
    background: var(--accent);
  }

  .send-btn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
</style>
