<script lang="ts">
  import { Send, Loader2 } from "lucide-svelte";

  interface Props {
    ready?: boolean;
    loading?: boolean;
    placeholder?: string;
    compact?: boolean;
    onSend: (text: string) => void;
  }

  let {
    ready = true,
    loading = false,
    placeholder = "Message Codaro...",
    compact = false,
    onSend,
  }: Props = $props();

  let inputValue = $state("");
  let textareaEl: HTMLTextAreaElement | undefined = $state();

  let maxHeight = $derived(compact ? 120 : 200);

  function adjustTextarea() {
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, maxHeight) + "px";
    }
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text || loading) return;
    inputValue = "";
    if (textareaEl) textareaEl.style.height = "auto";
    onSend(text);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  export function focus() {
    requestAnimationFrame(() => textareaEl?.focus());
  }
</script>

<div class="chat-input-wrap" class:compact>
  <div class="input-container">
    <textarea
      bind:this={textareaEl}
      bind:value={inputValue}
      class="input-field"
      {placeholder}
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
        <Loader2 class="h-{compact ? '4' : '5'} w-{compact ? '4' : '5'} animate-spin" />
      {:else}
        <Send class="h-{compact ? '4' : '5'} w-{compact ? '4' : '5'}" />
      {/if}
    </button>
  </div>
  {#if !compact}
    <p class="input-hint">
      Codaro may produce inaccurate responses. Verify important information.
    </p>
  {/if}
</div>

<style>
  .chat-input-wrap {
    flex-shrink: 0;
    padding: 12px 24px 16px;
  }

  .chat-input-wrap.compact {
    padding: 8px;
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

  .compact .input-container {
    border-radius: 8px;
    padding: 4px 8px;
    max-width: none;
  }

  .input-container:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .input-field {
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

  .compact .input-field {
    font-size: 13px;
    padding: 4px;
    max-height: 120px;
  }

  .input-field::placeholder {
    color: color-mix(in srgb, var(--foreground) 35%, transparent);
  }

  .input-field:disabled {
    opacity: 0.5;
  }

  .send-btn {
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

  .compact .send-btn {
    width: 30px;
    height: 30px;
    border-radius: 6px;
  }

  .send-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .send-btn:disabled {
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
</style>
