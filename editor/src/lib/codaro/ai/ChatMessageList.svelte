<script lang="ts">
  import {
    Loader2,
    Bot,
    User,
    Wrench,
    PanelRight,
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
  } from "lucide-svelte";
  import { renderToolResult } from "./toolRenderer";
  import ChatMarkdown from "./ChatMarkdown.svelte";
  import type { ChatMessage } from "./aiStore.svelte";

  interface Props {
    messages: ChatMessage[];
    loading?: boolean;
    compact?: boolean;
    onOpenEditor?: () => void;
  }

  let {
    messages,
    loading = false,
    compact = false,
    onOpenEditor,
  }: Props = $props();

  let messagesEnd: HTMLDivElement | undefined = $state();
  let copiedId: string | null = $state(null);
  let expandedTools: Set<string> = $state(new Set());

  $effect(() => {
    if (messages.length > 0 && messagesEnd) {
      requestAnimationFrame(() => {
        messagesEnd?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  const editorTools = ["insert-block", "update-block", "execute-reactive", "create-guide"];

  function hasEditorToolCalls(msg: ChatMessage): boolean {
    return !!msg.toolCalls?.some(tc => editorTools.includes(tc.name));
  }

  function copyMessage(msg: ChatMessage) {
    navigator.clipboard.writeText(msg.content);
    copiedId = msg.id;
    setTimeout(() => { copiedId = null; }, 1500);
  }

  function toggleToolExpand(msgId: string) {
    const next = new Set(expandedTools);
    if (next.has(msgId)) next.delete(msgId);
    else next.add(msgId);
    expandedTools = next;
  }
</script>

<div class="msg-list" class:compact>
  {#each messages as msg (msg.id)}
    <div class="msg-row" class:is-user={msg.role === "user"}>
      <div class="msg-avatar" class:is-user={msg.role === "user"}>
        {#if msg.role === "user"}
          <User size={compact ? 14 : 16} />
        {:else}
          <Bot size={compact ? 14 : 16} />
        {/if}
      </div>
      <div class="msg-body">
        {#if msg.role === "user"}
          <div class="msg-text">{msg.content}</div>
        {:else}
          <div class="msg-content-wrap">
            {#if msg.isStreaming && !msg.content}
              <div class="msg-text thinking">
                <span class="typing-dots"><span></span><span></span><span></span></span>
              </div>
            {:else}
              <ChatMarkdown content={msg.content} />
            {/if}
            {#if msg.content && !msg.isStreaming}
              <button
                class="copy-btn"
                onclick={() => copyMessage(msg)}
                aria-label="Copy message"
              >
                {#if copiedId === msg.id}
                  <Check size={14} />
                {:else}
                  <Copy size={14} />
                {/if}
              </button>
            {/if}
          </div>
        {/if}

        {#if msg.toolCalls && msg.toolCalls.length > 0}
          <button
            class="tools-toggle"
            onclick={() => toggleToolExpand(msg.id)}
            aria-label="Toggle tool details"
          >
            {#if expandedTools.has(msg.id)}
              <ChevronDown size={14} />
            {:else}
              <ChevronRight size={14} />
            {/if}
            <Wrench size={12} />
            <span>{msg.toolCalls.length} tool{msg.toolCalls.length > 1 ? "s" : ""} used</span>
          </button>

          {#if expandedTools.has(msg.id)}
            <div class="tool-calls">
              {#each msg.toolCalls as tc}
                {@const info = renderToolResult(tc)}
                <div class="tool-card" class:error={info.status === "error"} class:success={info.status === "success"}>
                  <div class="tool-header">
                    <Wrench size={12} />
                    <span class="tool-name">{info.label}</span>
                  </div>
                  <div class="tool-desc">{info.description}</div>
                </div>
              {/each}
            </div>
          {/if}

          {#if onOpenEditor && hasEditorToolCalls(msg)}
            <button class="open-editor-btn" onclick={onOpenEditor}>
              <PanelRight size={14} />
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
        <Loader2 size={compact ? 14 : 16} class="animate-spin" />
      </div>
      <div class="msg-body">
        <div class="msg-text thinking">
          <span class="typing-dots"><span></span><span></span><span></span></span>
        </div>
      </div>
    </div>
  {/if}
  <div bind:this={messagesEnd}></div>
</div>

<style>
  .msg-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .msg-row {
    display: flex;
    gap: 12px;
    padding: 16px 0;
  }

  .compact .msg-row {
    gap: 8px;
    padding: 6px 4px;
  }

  .msg-row + .msg-row {
    border-top: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
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

  .compact .msg-avatar {
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }

  .msg-avatar.is-user {
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    color: var(--accent);
  }

  .msg-body {
    flex: 1;
    min-width: 0;
    padding-top: 4px;
  }

  .compact .msg-body {
    padding-top: 0;
  }

  .msg-content-wrap {
    position: relative;
  }

  .msg-content-wrap:hover .copy-btn {
    opacity: 1;
  }

  .copy-btn {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px;
    border: none;
    border-radius: 6px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    color: color-mix(in srgb, var(--foreground) 50%, transparent);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;
  }

  .copy-btn:hover {
    background: color-mix(in srgb, var(--foreground) 14%, transparent);
    color: var(--foreground);
  }

  .msg-text {
    font-size: 0.94rem;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .compact .msg-text {
    font-size: 13px;
    line-height: 1.5;
  }

  .msg-text.thinking {
    color: color-mix(in srgb, var(--foreground) 40%, transparent);
  }

  .typing-dots {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 0;
  }

  .typing-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--foreground) 30%, transparent);
    animation: dot-pulse 1.4s infinite ease-in-out;
  }

  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot-pulse {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }

  .tools-toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    padding: 4px 10px;
    border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    border-radius: 6px;
    background: transparent;
    color: color-mix(in srgb, var(--foreground) 55%, transparent);
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .tools-toggle:hover {
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    color: var(--foreground);
  }

  .tool-calls {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  .tool-card {
    padding: 8px 12px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--foreground) 4%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
    font-size: 0.82rem;
  }

  .tool-card.success {
    border-left: 3px solid hsl(142 71% 45%);
    background: hsl(142 71% 45% / 0.06);
  }

  .tool-card.error {
    border-left: 3px solid hsl(0 84% 60%);
    background: hsl(0 84% 60% / 0.06);
  }

  .tool-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 2px;
  }

  .tool-desc {
    color: color-mix(in srgb, var(--foreground) 60%, transparent);
  }

  .open-editor-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
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
</style>
