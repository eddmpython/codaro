<script lang="ts">
  import { Send } from "lucide-svelte";

  interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: number;
  }

  interface Props {
    messages?: ChatMessage[];
    onSendMessage?: (content: string) => void;
    isConnected?: boolean;
    isLoading?: boolean;
  }

  let {
    messages = [],
    onSendMessage = () => {},
    isConnected = false,
    isLoading = false
  }: Props = $props();

  let inputValue = $state("");
  let messagesContainer: HTMLDivElement | undefined = $state();
  let activeTab = $state<"chat" | "agents">("chat");

  $effect(() => {
    if (messagesContainer && messages.length > 0) {
      requestAnimationFrame(() => {
        messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight });
      });
    }
  });

  function handleSend(): void {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      inputValue = "";
    }
  }
</script>

<div class="ai-chat-panel" data-testid="ai-chat-panel">
  <div class="tabBar">
    <button
      class="tab"
      class:active={activeTab === "chat"}
      onclick={() => { activeTab = "chat"; }}
    >
      Chat
    </button>
    <button
      class="tab"
      class:active={activeTab === "agents"}
      onclick={() => { activeTab = "agents"; }}
    >
      Agents
    </button>
  </div>

  {#if activeTab === "chat"}
    <div class="chatBody" bind:this={messagesContainer}>
      {#if messages.length === 0}
        <div class="empty text-muted-foreground text-sm p-4 text-center">
          {#if isConnected}
            Start a conversation with AI.
          {:else}
            No AI provider connected. Configure one in settings.
          {/if}
        </div>
      {:else}
        {#each messages as msg}
          <div class="message" class:user={msg.role === "user"} class:assistant={msg.role === "assistant"}>
            <div class="msgRole">{msg.role}</div>
            <div class="msgContent">{msg.content}</div>
          </div>
        {/each}
        {#if isLoading}
          <div class="message assistant">
            <div class="msgRole">assistant</div>
            <div class="msgContent typing">Thinking...</div>
          </div>
        {/if}
      {/if}
    </div>

    <div class="inputBar">
      <input
        bind:value={inputValue}
        class="chatInput"
        placeholder={isConnected ? "Ask AI..." : "No AI provider"}
        disabled={!isConnected}
        onkeydown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
      />
      <button
        class="sendBtn"
        onclick={handleSend}
        disabled={!isConnected || !inputValue.trim()}
        aria-label="Send message"
      >
        <Send class="h-4 w-4" />
      </button>
    </div>
  {:else}
    <div class="agentsBody">
      <p class="empty text-muted-foreground text-sm p-4 text-center">
        AI agents are not yet configured.
      </p>
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
    border-bottom: 1px solid var(--border);
  }

  .tab {
    flex: 1;
    padding: 8px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    font-size: 12px;
    font-weight: 500;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .tab.active {
    color: var(--foreground);
    border-bottom-color: var(--foreground);
  }

  .tab:hover {
    color: var(--foreground);
  }

  .chatBody,
  .agentsBody {
    flex: 1;
    overflow-y: auto;
  }

  .message {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .message.user {
    background: var(--accent);
  }

  .msgRole {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
    margin-bottom: 4px;
  }

  .msgContent {
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .msgContent.typing {
    color: var(--muted-foreground);
    font-style: italic;
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
    outline: none;
    color: var(--foreground);
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
  }

  .sendBtn:hover {
    background: var(--accent);
  }

  .sendBtn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
</style>
