<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    Bot,
    Plus,
    X,
    Code2,
    BookOpen,
    Lightbulb,
    Workflow,
    PanelRight,
    Menu,
  } from "lucide-svelte";
  import {
    getMessages,
    getIsLoading,
    getAiError,
    sendMessage,
    sendMessageStreaming,
    startConversation,
    endConversation,
    isAiReady,
    getActiveProvider,
    getActiveModel,
    clearError,
    initAiStore,
    destroyAiStore,
  } from "../ai/aiStore.svelte";
  import ChatMessageList from "../ai/ChatMessageList.svelte";
  import ChatInput from "../ai/ChatInput.svelte";
  import ChatMarkdown from "../ai/ChatMarkdown.svelte";
  import ModelSelector from "../ai/ModelSelector.svelte";
  import ConversationHistory from "../ai/ConversationHistory.svelte";
  import { toggleHistory } from "../ai/conversationStore.svelte";
  import { setActiveSurface } from "../stores/surface.svelte";
  import { getUserConfig } from "../stores/config.svelte";
  import { APP_NAME } from "../theme/appBrand";

  let msgs = $derived(getMessages());
  let loading = $derived(getIsLoading());
  let aiError = $derived(getAiError());
  let ready = $derived(isAiReady());
  let provider = $derived(getActiveProvider());
  let model = $derived(getActiveModel());
  let hasMessages = $derived(msgs.length > 0);

  let prefersDark = $state(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true
  );

  let effectiveTheme = $derived.by(() => {
    const t = getUserConfig().display.theme;
    if (t === "system") return prefersDark ? "dark" : "light";
    return t;
  });

  const suggestions = [
    { icon: Code2, label: "Write Python code", prompt: "Help me write a Python script that " },
    { icon: BookOpen, label: "Explain a concept", prompt: "Explain this Python concept: " },
    { icon: Lightbulb, label: "Start a lesson", prompt: "I'd like to learn about " },
    { icon: Workflow, label: "Build automation", prompt: "Help me automate " },
  ];

  let chatInputRef: ChatInput | undefined = $state();
  let suggestionPrompt = $state("");

  async function handleSend(text: string) {
    try {
      await sendMessageStreaming(text);
    } catch {
      await sendMessage(text);
    }
  }

  async function handleNewConversation() {
    await endConversation();
    await startConversation();
  }

  function handleSuggestion(prompt: string) {
    suggestionPrompt = prompt;
    chatInputRef?.focus();
  }

  function openEditor() {
    setActiveSurface("editor");
  }

  onMount(() => {
    initAiStore();
  });

  onDestroy(() => {
    destroyAiStore();
  });
</script>

<div
  id="chat-surface"
  class="{effectiveTheme} {effectiveTheme}-theme"
  data-theme={effectiveTheme}
>
  <div class="bg-gradient"></div>

  <ConversationHistory
    onNewConversation={handleNewConversation}
  />

  <header class="top-bar">
    <div class="top-left">
      <button class="icon-btn" onclick={toggleHistory} aria-label="Conversations">
        <Menu class="h-4 w-4" />
      </button>
      <span class="logo-text">{APP_NAME}</span>
    </div>
    <div class="top-center">
      <ModelSelector />
    </div>
    <div class="top-right">
      {#if hasMessages}
        <button class="icon-btn" onclick={handleNewConversation} title="New conversation">
          <Plus class="h-4 w-4" />
        </button>
      {/if}
      <button class="editor-btn" onclick={openEditor}>
        <PanelRight class="h-4 w-4" />
        <span>Editor</span>
      </button>
    </div>
  </header>

  <main class="chat-main">
    <div class="chat-scroll">
      <div class="chat-container">
        {#if !hasMessages}
          <div class="empty-hero">
            <div class="hero-icon">
              <Bot class="h-10 w-10" />
            </div>
            <h1 class="hero-title">How can I help?</h1>
            <p class="hero-sub">
              {#if ready}
                Write code, learn Python, or build automations.
              {:else}
                Configure an AI provider in settings to get started.
              {/if}
            </p>
            {#if ready}
              <div class="suggestion-grid">
                {#each suggestions as s}
                  <button class="suggestion-card" onclick={() => handleSuggestion(s.prompt)}>
                    <s.icon class="h-5 w-5 suggestion-icon" />
                    <span>{s.label}</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <div class="message-list">
            <ChatMessageList
              messages={msgs}
              {loading}
              onOpenEditor={openEditor}
            />
          </div>
        {/if}
      </div>
    </div>
  </main>

  {#if aiError}
    <div class="error-banner">
      <span>{aiError}</span>
      <button onclick={clearError} aria-label="Dismiss error">
        <X class="h-4 w-4" />
      </button>
    </div>
  {/if}

  <div class="input-dock">
    <ChatInput
      bind:this={chatInputRef}
      {ready}
      {loading}
      placeholder={ready ? "Message Codaro..." : "No AI provider configured"}
      onSend={handleSend}
    />
  </div>
</div>

<style>
  #chat-surface {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background);
    color: var(--foreground);
    overflow: hidden;
  }

  .bg-gradient {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--accent) 4%, transparent), transparent 70%);
    z-index: 0;
  }

  /* ── Top bar ── */
  .top-bar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 52px;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    flex-shrink: 0;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--background) 80%, transparent);
  }

  .top-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 140px;
  }

  .logo-text {
    font-family: "Lora", serif;
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: -0.02em;
  }

  .top-center {
    display: flex;
    align-items: center;
  }

  .top-right {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 140px;
    justify-content: flex-end;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    border-radius: 8px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
    transition: all 0.15s;
  }

  .icon-btn:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    border-color: color-mix(in srgb, var(--foreground) 15%, transparent);
  }

  .editor-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    border-radius: 8px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .editor-btn:hover {
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    border-color: color-mix(in srgb, var(--foreground) 15%, transparent);
  }

  /* ── Main chat ── */
  .chat-main {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .chat-scroll {
    flex: 1;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .chat-container {
    max-width: 768px;
    margin: 0 auto;
    padding: 16px 24px;
    width: 100%;
  }

  /* ── Empty hero ── */
  .empty-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px 40px;
    text-align: center;
  }

  .hero-icon {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
    margin-bottom: 24px;
    box-shadow: 0 0 32px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .hero-title {
    margin: 0;
    font-family: "Lora", serif;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .hero-sub {
    margin: 10px 0 0;
    color: color-mix(in srgb, var(--foreground) 45%, transparent);
    font-size: 1rem;
    max-width: 400px;
    line-height: 1.5;
  }

  .suggestion-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 36px;
    width: 100%;
    max-width: 500px;
  }

  .suggestion-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
    border-radius: 12px;
    background: color-mix(in srgb, var(--foreground) 2%, transparent);
    color: var(--foreground);
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }

  .suggestion-card:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
    border-color: color-mix(in srgb, var(--accent) 30%, transparent);
    box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 8%, transparent);
  }

  :global(.suggestion-icon) {
    color: var(--accent);
    flex-shrink: 0;
  }

  /* ── Messages ── */
  .message-list {
    padding-top: 16px;
  }

  /* ── Error banner ── */
  .error-banner {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 24px;
    background: hsl(0 84% 60% / 0.08);
    color: var(--destructive);
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .error-banner button {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    padding: 4px;
  }

  /* ── Input dock ── */
  .input-dock {
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--background) 85%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .chat-container {
      padding: 12px 16px;
    }

    .suggestion-grid {
      grid-template-columns: 1fr;
    }

    .editor-btn span {
      display: none;
    }

    .top-left {
      min-width: auto;
    }

    .top-right {
      min-width: auto;
    }

    .hero-title {
      font-size: 1.5rem;
    }

    .empty-hero {
      padding-top: 60px;
    }
  }
</style>
