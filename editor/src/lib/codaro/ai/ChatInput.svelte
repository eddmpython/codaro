<script lang="ts">
  import { Send, Loader2, Slash } from "lucide-svelte";

  interface SlashCommand {
    name: string;
    description: string;
    prefix: string;
  }

  const slashCommands: SlashCommand[] = [
    { name: "learn", description: "Start a learning session on a topic", prefix: "/learn " },
    { name: "quiz", description: "Generate a quiz on the current topic", prefix: "/quiz " },
    { name: "explain", description: "Explain a concept or code block", prefix: "/explain " },
    { name: "debug", description: "Debug the current code or error", prefix: "/debug " },
    { name: "review", description: "Review code for improvements", prefix: "/review " },
    { name: "report", description: "Generate a report from results", prefix: "/report " },
  ];

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
  let showSlashMenu = $state(false);
  let filteredCommands = $state<SlashCommand[]>([]);
  let selectedCommandIdx = $state(0);

  let maxHeight = $derived(compact ? 120 : 200);

  function adjustTextarea() {
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, maxHeight) + "px";
    }
  }

  function handleInput() {
    adjustTextarea();
    if (inputValue.startsWith("/") && !inputValue.includes(" ")) {
      const query = inputValue.slice(1).toLowerCase();
      filteredCommands = slashCommands.filter(c => c.name.startsWith(query));
      showSlashMenu = filteredCommands.length > 0;
      selectedCommandIdx = 0;
    } else {
      showSlashMenu = false;
    }
  }

  function selectCommand(cmd: SlashCommand) {
    inputValue = cmd.prefix;
    showSlashMenu = false;
    textareaEl?.focus();
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text || loading) return;
    inputValue = "";
    showSlashMenu = false;
    if (textareaEl) textareaEl.style.height = "auto";
    onSend(text);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (showSlashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedCommandIdx = Math.min(selectedCommandIdx + 1, filteredCommands.length - 1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedCommandIdx = Math.max(selectedCommandIdx - 1, 0);
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        if (filteredCommands[selectedCommandIdx]) {
          selectCommand(filteredCommands[selectedCommandIdx]);
        }
        return;
      }
      if (e.key === "Escape") {
        showSlashMenu = false;
        return;
      }
    }
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
  {#if showSlashMenu}
    <div class="slash-menu">
      {#each filteredCommands as cmd, idx}
        <button
          class="slash-item"
          class:active={idx === selectedCommandIdx}
          onclick={() => selectCommand(cmd)}
        >
          <Slash size={12} />
          <span class="slash-name">{cmd.name}</span>
          <span class="slash-desc">{cmd.description}</span>
        </button>
      {/each}
    </div>
  {/if}

  <div class="input-container">
    <textarea
      bind:this={textareaEl}
      bind:value={inputValue}
      class="input-field"
      {placeholder}
      disabled={!ready || loading}
      rows="1"
      oninput={handleInput}
      onkeydown={handleKeydown}
    ></textarea>
    <button
      class="send-btn"
      onclick={handleSend}
      disabled={!ready || loading || !inputValue.trim()}
      aria-label="Send message"
    >
      {#if loading}
        <Loader2 size={compact ? 16 : 20} class="animate-spin" />
      {:else}
        <Send size={compact ? 16 : 20} />
      {/if}
    </button>
  </div>
  {#if !compact}
    <p class="input-hint">
      Type <kbd>/</kbd> for commands. Shift+Enter for new line.
    </p>
  {/if}
</div>

<style>
  .chat-input-wrap {
    flex-shrink: 0;
    padding: 12px 24px 16px;
    position: relative;
  }

  .chat-input-wrap.compact {
    padding: 8px;
  }

  .slash-menu {
    position: absolute;
    bottom: 100%;
    left: 24px;
    right: 24px;
    max-width: 768px;
    margin: 0 auto 4px;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 4px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--foreground) 10%, transparent);
    z-index: 10;
  }

  .compact .slash-menu {
    left: 8px;
    right: 8px;
    border-radius: 8px;
  }

  .slash-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }

  .slash-item:hover,
  .slash-item.active {
    background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  .slash-name {
    font-weight: 600;
    color: var(--accent);
  }

  .slash-desc {
    color: color-mix(in srgb, var(--foreground) 50%, transparent);
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

  .input-hint kbd {
    display: inline-block;
    padding: 1px 4px;
    font-size: 0.7rem;
    font-family: inherit;
    border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    border-radius: 3px;
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }
</style>
