<script lang="ts">
  import {
    Loader2,
    Bot,
    User,
    Wrench,
    PanelRight,
  } from "lucide-svelte";
  import { renderToolResult } from "./toolRenderer";
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
</script>

<div class="msg-list" class:compact>
  {#each messages as msg (msg.id)}
    <div class="msg-row" class:is-user={msg.role === "user"}>
      <div class="msg-avatar" class:is-user={msg.role === "user"}>
        {#if msg.role === "user"}
          <User class="h-{compact ? '3.5' : '4'} w-{compact ? '3.5' : '4'}" />
        {:else}
          <Bot class="h-{compact ? '3.5' : '4'} w-{compact ? '3.5' : '4'}" />
        {/if}
      </div>
      <div class="msg-body">
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
          {#if onOpenEditor && hasEditorToolCalls(msg)}
            <button class="open-editor-btn" onclick={onOpenEditor}>
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
        <Loader2 class="h-{compact ? '3.5' : '4'} w-{compact ? '3.5' : '4'} animate-spin" />
      </div>
      <div class="msg-body">
        <div class="msg-text thinking">Thinking...</div>
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
    font-style: italic;
  }

  .tool-calls {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .compact .tool-calls {
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
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
</style>
