<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    Send,
    Loader2,
    Bot,
    User,
    Wrench,
    Plus,
    X,
    Code2,
    BookOpen,
    Lightbulb,
    Workflow,
    PanelRight,
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
    destroyAiStore,
  } from "../ai/aiStore.svelte";
  import { renderToolResult } from "../ai/toolRenderer";
  import type { ChatMessage } from "../ai/aiStore.svelte";
  import { setActiveSurface } from "../stores/surface.svelte";
  import { getUserConfig } from "../stores/config.svelte";

  let inputValue = $state("");
  let messagesEnd: HTMLDivElement | undefined = $state();
  let textareaEl: HTMLTextAreaElement | undefined = $state();

  let msgs = $derived(getMessages());
  let loading = $derived(getIsLoading());
  let aiError = $derived(getAiError());
  let ready = $derived(isAiReady());
  let provider = $derived(getActiveProvider());
  let model = $derived(getActiveModel());
  let convId = $derived(getConversationId());
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

  $effect(() => {
    if (msgs.length > 0 && messagesEnd) {
      requestAnimationFrame(() => {
        messagesEnd?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  function adjustTextarea() {
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + "px";
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

  function handleSuggestion(prompt: string) {
    inputValue = prompt;
    requestAnimationFrame(() => textareaEl?.focus());
  }

  function openEditor() {
    setActiveSurface("editor");
  }

  function hasEditorToolCalls(msg: ChatMessage): boolean {
    if (!msg.toolCalls) return false;
    return msg.toolCalls.some(tc =>
      ["insert-block", "update-block", "execute-reactive", "create-guide"].includes(tc.name)
    );
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
  <header class="top-bar">
    <div class="top-left">
      <span class="logo-text">Codaro</span>
    </div>
    <div class="top-center">
      {#if provider && model}
        <span class="model-badge">{model}</span>
      {:else}
        <span class="model-badge muted">No model</span>
      {/if}
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
            {#each msgs as msg (msg.id)}
              <div class="msg-row" class:user={msg.role === "user"}>
                <div class="msg-avatar" class:user={msg.role === "user"}>
                  {#if msg.role === "user"}
                    <User class="h-4 w-4" />
                  {:else}
                    <Bot class="h-4 w-4" />
                  {/if}
                </div>
                <div class="msg-content-wrap">
                  <div class="msg-text">{msg.content}</div>
                  {#if msg.toolCalls && msg.toolCalls.length > 0}
                    <div class="tool-calls">
                      {#each msg.toolCalls as tc}
                        {@const info = renderToolResult(tc)}
                        <div class="tool-chip" class:error={info.status === "error"} class:success={info.status === "success"}>
                          <Wrench class="h-3 w-3" />
                          <span class="tool-name">{info.label}</span>
                          <span class="tool-desc">{info.description}</span>
                        </div>
                      {/each}
                    </div>
                    {#if hasEditorToolCalls(msg)}
                      <button class="open-editor-btn" onclick={openEditor}>
                        <PanelRight class="h-3.5 w-3.5" />
                        Open in Editor
                      </button>
                    {/if}
                  {/if}
                </div>
              </div>
            {/each}

            {#if loading}
              <div class="msg-row">
                <div class="msg-avatar">
                  <Loader2 class="h-4 w-4 animate-spin" />
                </div>
                <div class="msg-content-wrap">
                  <div class="msg-text thinking">Thinking...</div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
        <div bind:this={messagesEnd}></div>
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

  <footer class="input-dock">
    <div class="input-container">
      <textarea
        bind:this={textareaEl}
        bind:value={inputValue}
        class="main-input"
        placeholder={ready ? "Message Codaro..." : "No AI provider configured"}
        disabled={!ready || loading}
        rows="1"
        oninput={adjustTextarea}
        onkeydown={handleKeydown}
      ></textarea>
      <button
        class="send-button"
        onclick={handleSend}
        disabled={!ready || loading || !inputValue.trim()}
        aria-label="Send message"
      >
        {#if loading}
          <Loader2 class="h-5 w-5 animate-spin" />
        {:else}
          <Send class="h-5 w-5" />
        {/if}
      </button>
    </div>
    <p class="input-hint">
      Codaro may produce inaccurate responses. Verify important information.
    </p>
  </footer>
</div>

<style>
  #chat-surface {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background);
    color: var(--foreground);
  }

  /* ── Top bar ── */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 48px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .top-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
  }

  .logo-text {
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
  }

  .top-center {
    display: flex;
    align-items: center;
  }

  .model-badge {
    font-size: 0.82rem;
    padding: 3px 10px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    font-weight: 500;
  }

  .model-badge.muted {
    opacity: 0.5;
  }

  .top-right {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 120px;
    justify-content: flex-end;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--foreground);
    cursor: pointer;
    transition: background 0.15s;
  }

  .icon-btn:hover {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .editor-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .editor-btn:hover {
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  /* ── Main chat ── */
  .chat-main {
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
    padding: 80px 20px 40px;
    text-align: center;
  }

  .hero-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
    margin-bottom: 20px;
  }

  .hero-title {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .hero-sub {
    margin: 8px 0 0;
    color: color-mix(in srgb, var(--foreground) 50%, transparent);
    font-size: 1rem;
    max-width: 400px;
  }

  .suggestion-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 32px;
    width: 100%;
    max-width: 480px;
  }

  .suggestion-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
  }

  .suggestion-card:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
    border-color: color-mix(in srgb, var(--foreground) 20%, transparent);
  }

  :global(.suggestion-icon) {
    color: var(--accent);
    flex-shrink: 0;
  }

  /* ── Messages ── */
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 16px;
  }

  .msg-row {
    display: flex;
    gap: 12px;
    padding: 16px 0;
  }

  .msg-row + .msg-row {
    border-top: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  }

  .msg-avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    color: color-mix(in srgb, var(--foreground) 60%, transparent);
  }

  .msg-avatar.user {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    color: var(--accent);
  }

  .msg-content-wrap {
    flex: 1;
    min-width: 0;
    padding-top: 4px;
  }

  .msg-text {
    font-size: 0.94rem;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .msg-text.thinking {
    color: color-mix(in srgb, var(--foreground) 40%, transparent);
    font-style: italic;
  }

  .tool-calls {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .tool-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    font-size: 0.78rem;
    color: color-mix(in srgb, var(--foreground) 60%, transparent);
  }

  .tool-chip.success {
    background: hsl(142 71% 45% / 0.1);
    color: hsl(142 71% 45%);
  }

  .tool-chip.error {
    background: hsl(0 84% 60% / 0.1);
    color: hsl(0 84% 60%);
  }

  .tool-name {
    font-weight: 600;
  }

  .open-editor-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--accent);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .open-editor-btn:hover {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  /* ── Error banner ── */
  .error-banner {
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
    flex-shrink: 0;
    padding: 12px 24px 16px;
  }

  .input-container {
    max-width: 768px;
    margin: 0 auto;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-container:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .main-input {
    flex: 1;
    padding: 6px 4px;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    font-family: inherit;
    line-height: 1.5;
    outline: none;
    color: var(--foreground);
    resize: none;
    overflow: hidden;
    max-height: 200px;
  }

  .main-input::placeholder {
    color: color-mix(in srgb, var(--foreground) 35%, transparent);
  }

  .main-input:disabled {
    opacity: 0.5;
  }

  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: var(--accent);
    color: var(--accent-foreground, #fff);
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }

  .send-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .send-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .input-hint {
    max-width: 768px;
    margin: 6px auto 0;
    text-align: center;
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--foreground) 30%, transparent);
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .chat-container {
      padding: 12px 16px;
    }

    .input-dock {
      padding: 8px 12px 12px;
    }

    .suggestion-grid {
      grid-template-columns: 1fr;
    }

    .editor-btn span {
      display: none;
    }
  }
</style>
