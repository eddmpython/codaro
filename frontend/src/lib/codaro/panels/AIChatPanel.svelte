<script lang="ts">
  import {
    Send,
    Bot,
    User,
    Loader2,
    Wrench,
    Settings,
    Plus,
    X,
    Sparkles,
  } from "lucide-svelte";
  import {
    getMessages,
    getIsLoading,
    getAiError,
    sendMessage,
    startConversation,
    endConversation,
    isAiReady,
    getActiveProvider,
    getActiveModel,
    getConversationId,
    clearError,
    initAiStore,
  } from "../ai/aiStore.svelte";
  import { renderToolResult } from "../ai/toolRenderer";

  interface Props {
    onOpenSettings?: () => void;
  }

  let { onOpenSettings }: Props = $props();

  let inputValue = $state("");
  let messagesContainer: HTMLDivElement | undefined = $state();
  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let activeTab = $state<"chat" | "agents">("chat");

  let msgs = $derived(getMessages());
  let loading = $derived(getIsLoading());
  let aiError = $derived(getAiError());
  let ready = $derived(isAiReady());
  let provider = $derived(getActiveProvider());
  let model = $derived(getActiveModel());
  let convId = $derived(getConversationId());

  $effect(() => {
    if (messagesContainer && msgs.length > 0) {
      requestAnimationFrame(() => {
        messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: "smooth" });
      });
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

<div class="ai-chat-panel" data-testid="ai-chat-panel">
  <div class="tabBar">
    <button
      class="tab"
      class:active={activeTab === "chat"}
      onclick={() => { activeTab = "chat"; }}
    >
      <Sparkles class="h-3 w-3" />
      Chat
    </button>
    <button
      class="tab"
      class:active={activeTab === "agents"}
      onclick={() => { activeTab = "agents"; }}
    >
      <Bot class="h-3 w-3" />
      Agents
    </button>
    <div class="tab-actions">
      {#if activeTab === "chat"}
        <button class="tab-btn" onclick={handleNewConversation} title="New conversation">
          <Plus class="h-3.5 w-3.5" />
        </button>
      {/if}
      {#if onOpenSettings}
        <button class="tab-btn" onclick={onOpenSettings} title="AI Settings">
          <Settings class="h-3.5 w-3.5" />
        </button>
      {/if}
    </div>
  </div>

  {#if activeTab === "chat"}
    {#if provider && model}
      <div class="provider-strip">
        <span>{provider}</span>
        <span class="model-name">{model}</span>
      </div>
    {:else if !ready}
      <div class="provider-strip disconnected">
        <span>No AI provider connected</span>
        {#if onOpenSettings}
          <button class="setup-link" onclick={onOpenSettings}>Configure</button>
        {/if}
      </div>
    {/if}

    <div class="chatBody" bind:this={messagesContainer}>
      {#if msgs.length === 0}
        <div class="empty text-muted-foreground text-sm p-4 text-center">
          {#if ready}
            <Bot class="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
            <p>Start a conversation with AI.</p>
            <p class="text-xs mt-1">Ask questions, request code, or get help with your notebook.</p>
          {:else}
            <Bot class="h-10 w-10 mx-auto mb-2 text-muted-foreground/20" />
            <p>No AI provider connected.</p>
          {/if}
        </div>
      {:else}
        {#each msgs as msg (msg.id)}
          <div class="message" class:user={msg.role === "user"} class:assistant={msg.role === "assistant"}>
            <div class="msgIcon">
              {#if msg.role === "user"}
                <User class="h-3.5 w-3.5" />
              {:else}
                <Bot class="h-3.5 w-3.5" />
              {/if}
            </div>
            <div class="msgBody">
              <div class="msgContent">{msg.content}</div>
              {#if msg.toolCalls && msg.toolCalls.length > 0}
                <div class="toolCalls">
                  {#each msg.toolCalls as tc}
                    {@const info = renderToolResult(tc)}
                    <div class="toolBadge" class:error={info.status === "error"} class:success={info.status === "success"}>
                      <Wrench class="h-3 w-3 flex-shrink-0" />
                      <span class="toolLabel">{info.label}</span>
                      <span class="toolDesc">{info.description}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
        {#if loading}
          <div class="message assistant">
            <div class="msgIcon">
              <Loader2 class="h-3.5 w-3.5 animate-spin" />
            </div>
            <div class="msgBody">
              <div class="msgContent thinking">Thinking...</div>
            </div>
          </div>
        {/if}
      {/if}
    </div>

    {#if aiError}
      <div class="errorBar">
        <span>{aiError}</span>
        <button onclick={clearError} aria-label="Dismiss">
          <X class="h-3 w-3" />
        </button>
      </div>
    {/if}

    <div class="inputBar">
      <textarea
        bind:this={textareaEl}
        bind:value={inputValue}
        class="chatInput"
        placeholder={ready ? "Ask AI..." : "No AI provider"}
        disabled={!ready || loading}
        rows="1"
        oninput={adjustTextarea}
        onkeydown={handleKeydown}
      ></textarea>
      <button
        class="sendBtn"
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
  {:else}
    <div class="agentsBody">
      <div class="empty text-muted-foreground text-sm p-4 text-center">
        <Bot class="h-10 w-10 mx-auto mb-2 text-muted-foreground/20" />
        <p>AI agents are not yet configured.</p>
        <p class="text-xs mt-1">Agents can perform automated tasks on your notebook.</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .ai-chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .tabBar {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    padding: 8px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    font-size: 12px;
    font-weight: 500;
    color: var(--muted-foreground);
    cursor: pointer;
    justify-content: center;
  }

  .tab.active {
    color: var(--foreground);
    border-bottom-color: var(--foreground);
  }

  .tab:hover {
    color: var(--foreground);
  }

  .tab-actions {
    display: flex;
    align-items: center;
    padding: 0 4px;
    gap: 2px;
  }

  .tab-btn {
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

  .tab-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .provider-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 10px;
    color: var(--muted-foreground);
    background: var(--accent);
    border-bottom: 1px solid var(--border);
  }

  .provider-strip.disconnected {
    color: var(--destructive);
  }

  .model-name {
    font-family: monospace;
    opacity: 0.8;
  }

  .setup-link {
    border: none;
    background: transparent;
    color: var(--primary);
    cursor: pointer;
    font-size: 10px;
    text-decoration: underline;
    padding: 0;
    margin-left: auto;
  }

  .chatBody,
  .agentsBody {
    flex: 1;
    overflow-y: auto;
  }

  .message {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .message.user {
    background: var(--accent);
  }

  .msgIcon {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    background: var(--background);
    color: var(--muted-foreground);
    border: 1px solid var(--border);
  }

  .message.user .msgIcon {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: transparent;
  }

  .msgBody {
    flex: 1;
    min-width: 0;
  }

  .msgContent {
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .msgContent.thinking {
    color: var(--muted-foreground);
    font-style: italic;
  }

  .toolCalls {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-top: 6px;
  }

  .toolBadge {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 7px;
    border-radius: 4px;
    background: var(--accent);
    font-size: 11px;
    color: var(--muted-foreground);
  }

  .toolBadge.success {
    background: hsl(142 71% 45% / 0.1);
    color: hsl(142 71% 45%);
  }

  .toolBadge.error {
    background: hsl(0 84% 60% / 0.1);
    color: hsl(0 84% 60%);
  }

  .toolLabel {
    font-weight: 500;
    flex-shrink: 0;
  }

  .toolDesc {
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .errorBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: hsl(0 84% 60% / 0.1);
    color: var(--destructive);
    font-size: 11px;
  }

  .errorBar button {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    padding: 2px;
  }

  .inputBar {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-top: 1px solid var(--border);
  }

  .chatInput {
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

  .chatInput:focus {
    border-color: var(--ring);
  }

  .chatInput:disabled {
    opacity: 0.5;
  }

  .sendBtn {
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

  .sendBtn:hover:not(:disabled) {
    background: var(--accent);
  }

  .sendBtn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
</style>
