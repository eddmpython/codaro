<script>
  import { onMount } from "svelte";

  export let open = false;
  export let commands = [];
  export let onClose = () => {};
  export let onExecute = () => {};

  let query = "";
  let selectedIndex = 0;
  let inputEl = null;

  $: filteredCommands = commands.filter((command) => {
    const haystack = `${command.title} ${command.description || ""} ${(command.keywords || []).join(" ")}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  $: if (open) {
    selectedIndex = 0;
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, Math.max(filteredCommands.length - 1, 0));
      scrollSelectedIntoView();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      scrollSelectedIntoView();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = filteredCommands[selectedIndex];
      if (!command) return;
      onExecute(command.id);
      query = "";
    }
  }

  function scrollSelectedIntoView() {
    requestAnimationFrame(() => {
      const selectedEl = document.querySelector(".paletteItem.selected");
      selectedEl?.scrollIntoView({ block: "nearest" });
    });
  }

  $: if (open && inputEl) {
    queueMicrotask(() => inputEl?.focus());
  }

  onMount(() => {
    return () => {
      query = "";
    };
  });
</script>

{#if open}
  <div class="paletteBackdrop" onclick={onClose} aria-hidden="true"></div>
  <div class="paletteShell" role="dialog" aria-modal="true" aria-label="Command palette">
    <div class="paletteCard">
      <div class="paletteInputWrap">
        <span class="palettePrompt">&gt;</span>
        <input
          bind:this={inputEl}
          bind:value={query}
          class="paletteInput"
          placeholder="Type a command..."
          onkeydown={handleKeydown}
        />
      </div>

      <div class="paletteList">
        {#if filteredCommands.length === 0}
          <div class="emptyState">No matching commands</div>
        {:else}
          {#each filteredCommands as command, index}
            <button
              class="paletteItem"
              class:selected={index === selectedIndex}
              onclick={() => {
                onExecute(command.id);
                query = "";
              }}
              onmouseenter={() => (selectedIndex = index)}
            >
              <div class="itemContent">
                <strong class="itemTitle">{command.title}</strong>
                {#if command.description}
                  <span class="itemDescription">{command.description}</span>
                {/if}
              </div>
              {#if command.shortcut}
                <span class="shortcut">{command.shortcut}</span>
              {/if}
            </button>
          {/each}
        {/if}
      </div>

      <div class="paletteFooter">
        <span class="footerHint">↑↓ navigate</span>
        <span class="footerHint">↵ select</span>
        <span class="footerHint">esc close</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .paletteBackdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 70;
    animation: fadeIn 0.12s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .paletteShell {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 12vh 16px 24px;
    z-index: 71;
  }

  .paletteCard {
    width: min(560px, 100%);
    border-radius: var(--nb-radius-xl);
    border: 1px solid var(--nb-glass-border);
    background: var(--nb-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: var(--nb-shadow-lg);
    overflow: hidden;
    animation: paletteIn 0.15s ease-out;
  }

  @keyframes paletteIn {
    from {
      opacity: 0;
      transform: scale(0.97) translateY(-8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .paletteInputWrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    border-bottom: 1px solid var(--nb-border);
  }

  .palettePrompt {
    color: var(--nb-accent);
    font-family: var(--nb-font-code);
    font-size: 14px;
    font-weight: 600;
  }

  .paletteInput {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--nb-text);
    padding: 14px 0;
    outline: none;
    font-size: 14px;
  }

  .paletteInput::placeholder {
    color: var(--nb-text-muted);
  }

  .paletteList {
    max-height: min(50vh, 400px);
    overflow-y: auto;
    padding: 4px;
  }

  .paletteItem {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    text-align: left;
    padding: 10px 12px;
    border: 0;
    border-radius: var(--nb-radius-md);
    background: transparent;
    color: var(--nb-text-secondary);
    cursor: pointer;
    transition: all var(--nb-transition-fast);
  }

  .paletteItem.selected {
    background: var(--nb-accent-soft);
    color: var(--nb-text);
  }

  .itemContent {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .itemTitle {
    font-size: 13px;
  }

  .itemDescription {
    font-size: 11px;
    color: var(--nb-text-muted);
  }

  .shortcut {
    display: inline-flex;
    align-items: center;
    padding: 3px 7px;
    border-radius: var(--nb-radius-sm);
    border: 1px solid var(--nb-border);
    background: var(--nb-card);
    font-family: var(--nb-font-code);
    font-size: 10px;
    color: var(--nb-text-muted);
    white-space: nowrap;
  }

  .paletteFooter {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    border-top: 1px solid var(--nb-border);
  }

  .footerHint {
    font-size: 11px;
    color: var(--nb-text-muted);
    font-family: var(--nb-font-code);
  }

  .emptyState {
    padding: 16px 12px;
    color: var(--nb-text-muted);
    font-size: 13px;
    text-align: center;
  }
</style>
